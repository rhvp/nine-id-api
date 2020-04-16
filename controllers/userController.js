const axios = require('axios').default;
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const AppError = require('../config/appError');
const bcrypt =  require('bcryptjs');
const crypto = require('crypto');
const Token = require('../models/token');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_KEY);
module.exports = {

    verify_User_SIM: async(req, res, next)=>{
        let phone = req.params.phone;
        const $phone = phone.replace(/0/i, '234');
        const user = await User.findOne({phone:phone});
        if(user){
            return next(new AppError('A user has already signed up with this phone number', 403));
        }
            axios.request({
                url: `https://telcostaging.9mobile.com.ng/1.0/subscribers/${$phone}/registration`,
                method: 'GET',
                headers: {
                    'Ocp-Apim-Subscription-Key': process.env.SIM_REG_KEY
                }
            }).then(response=>{
                const data = response.data;
                res.status(200).json({
                    status: 'success',
                    data: {
                        data
                    }
                })
            }).catch(err=>{
                console.error('Error:', err.response.statusText, err.response.status);
                if(err.response.status === 500){
                    return next(new AppError(`${err.response.statusText}. Please try again later`, err.response.status));
                }
                return next(new AppError(`No registration details were found for entered number. Please ensure to enter correct 9Mobile number`, 404));
            })
    },

    verify_User_BVN: async(req, res, next)=>{
        let expected_body = {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            phone: req.body.phone
        }
        const post_data = JSON.stringify(expected_body);

        try {
            const response = await axios.request({
                url: `https://vapi.verifyme.ng/v1/identities/bvn/${req.body.bvn}/verifications`,
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.VERIFYME_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                data: post_data
            })
                User.findByIdAndUpdate(req.params.id, {bvn_Status: true}).then(()=>{
                    res.status(200).json({
                        status: 'success',
                        message: 'BVN successfully verified',
                        data: response.data
                    })
                }).catch(next);
                
        } catch (error) {
            console.error(error.response.data);
            return next(new AppError(error.response.data.message+' Please enter correct bvn', error.response.status));
        }
    },

    signup_User: async (req, res, next)=>{
        const userData = {
            firstname: req.body.firstname,
            lastname: req.body.surname,
            email: req.body.email,
            phone: req.body.phone,
        }
        if(req.body.economic_id && req.body.created_by){
            userData.economic_ID = req.body.economic_id
            userData.created_by = req.body.created_by
        } else {
            let rand =  Date.now() + Math.floor(Math.random()*10000)
            const e_id = rand.toString().substring(3) // ***review id generator
            userData.economic_ID = e_id
        }
        try {
            // Check if email is already registered
            const user = await User.findOne({email: req.body.email});
            if(user){
                return next(new AppError('User with this email is already registerd.', 403));
            }
            
            // Create User
            const newUser = await User.create(userData);
            const str = crypto.randomBytes(16).toString("hex");
            const token = new Token({user_ID: newUser._id, token: str});
            token.save(err=>{
                if(err){
                    return next(new AppError(err.message, 500));
                }
                const url = `https://9id.com.ng/verify?token=${token.token}`;


                // Send Confirmation Email
                const msg = {
                    to: newUser.email,
                    from: 'no-reply@9id.com.ng',
                    subject: 'Email Confirmation',
                    html: `<p>Hello ${newUser.firstname},</p>
                            <p>Follow this link to confirm your email ${url}</p>`,
                  };
                  sgMail.send(msg).then(()=>{
                      res.status(201).json({
                          status: 'success',
                          message: 'User successfully created. Check for confirmation email',
                          data: newUser
                      })
                    }).catch(err=>{
                        console.error(err); 
                        next(err);
                  });
                
            })
            
        } catch(err) {
            next(err)
        }
    },



    resend_Email_Confirmation: async(req, res, next)=>{

        const user = await User.findOne({email: req.params.email});
        if(!user) return next(new AppError('User not registered', 404));
        if(!user.confirmed) {
            // const token = signToken(user._id);
            let token = await Token.findOne({user_ID:user._id});
            if(!token){
                const str = crypto.randomBytes(16).toString("hex");
                token = await Token.create({user_ID: user._id, token: str});
            }
            const url = `https://9id.com.ng/verify?token=${token.token}`

            const msg = {
                to: user.email,
                from: 'no-reply@9id.com.ng',
                subject: 'Email Confirmation',
                html: `<p>Hello ${user.firstname},</p>
                        <p>Follow this link to confirm your email ${url}</p>`,
              };
              sgMail.send(msg).then(()=>{
                  res.status(200).json({
                      status: 'success',
                      message: 'Confirmation mail resent',
                  })
                }).catch(err=>{
                    console.error(err);
                    next(err);
              });


        } else {
            return next(new AppError('User has already been confirmed', 403));
        }
    },


    confirm_User: async(req,res,next)=>{
        try {
            

            const token = await Token.findOne({token: req.params.token});
            if (!token){
                return next(new AppError('Unable to find a valid token. Token may have expired', 401));
            }
            const id = token.user_ID
            const user = await User.findById(id);
            
            if(!user.confirmed){
                // Generate random password and hash
                const auto_gen_password = crypto.randomBytes(5).toString("hex");
                const password = auto_gen_password;
                const hashed_password = bcrypt.hashSync(password, 12);
                user.confirmed = true;
                user.password = hashed_password;
                user.save(err=>{
                    if(err){
                        return next(new AppError(err.message, 500))
                    }
                    
                     // Send user password to confirmed user email address

                    const msg = {
                        to: user.email,
                        from: 'no-reply@9id.com.ng',
                        subject: 'Login Credentials',
                        html: `<p>Hello ${user.firstname},</p>
                                <p>Your 9-ID login credentials are;</p>
                                <ul>
                                    <li>Email: ${user.email}</li>
                                    <li>Password: ${password}</li>
                                </ul>`,
                      };
                      sgMail.send(msg).then(()=>{
                          res.status(200).json({
                              status: 'success',
                              message: 'Email confirmed. Check your email for your login credentials',
                          })
                        }).catch(err=>{
                            console.error(err);
                            next(err);
                      });
                })
            } else {
                return next(new AppError('User has already been confirmed. Please check email for login credentials', 403));
            }
                                                                        
        } catch(err) {
            next(err)
        }
    },

    changePassword:async(req, res, next)=>{
        try {
            const id = req.params.id;
            const oldPass = req.body.old_password;
            const newPass = req.body.new_password;
            const profile = await User.findById(id);
            if(!profile) next(new AppError('User not found', 404));
            const passwordCorrect = bcrypt.compareSync(oldPass, profile.password);
            if(passwordCorrect){
                const cryptPass = bcrypt.hashSync(newPass, 12);
                profile.password = cryptPass
                await profile.save(err=>{
                    if(err) return next(new AppError(err.message,500))
                });
                res.status(200).json({
                    status: 'success',
                    message: 'Password changed'
                })
            } else {
                return next(new AppError('Incorrect Old Password'));
            }
        } catch (error) {
            next(error);
        }
    },


    login_user: async(req, res, next)=>{
        try{
            const user = await User.findOne({email: req.body.email});
            if(!user){
                return next(new AppError('User with provided email does not exist', 404));
            } else if(!user.confirmed){
                return next(new AppError('User with entered credentials is yet to be confirmed', 403));
            }
            const correct_password = bcrypt.compareSync(req.body.password, user.password);
            if(correct_password){
                let id = user._id;
                const token = jwt.sign({user}, process.env.JWT_SECRET);
                await Token.create({user_ID: id, token: token});
                const cookie_Options = {
                    expires: new Date(
                        Date.now() + 60 * 60 * 5
                    ),
                    httpOnly: true
                };
                if(process.env.NODE_ENV === 'production') cookie_Options.secure = true;

                res.cookie('jwt', token, cookie_Options);
                user.password = undefined;

                res.status(200).json({
                    status: 'success',
                    message: 'login successful',
                    data: {
                        user
                    }
                })
            } else {
                return next(new AppError(`Wrong password for ${req.body.email}`, 401))
            }
        } catch(err){
            next(err)
        }
    },

    get_Profile: async(req, res, next)=>{
        try {
            const profile = await User.findById(req.params.id).populate('category').populate('services');
            res.status(200).json({
                status: 'success',
                data: {profile}
            })
        } catch (error) {
            next(error)
        }
    },

    update_Profile: async(req, res, next)=>{
        try {
            const update = req.body; //**modify object as needed
            const profile = await User.findByIdAndUpdate(req.params.id, update)
            res.status(200).json({
                status: 'success',
                message: 'Profile successfully updated',
                data: {profile}
            })
        } catch (error) {
            next(error)
        }
    }
    
}