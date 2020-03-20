const axios = require('axios').default;
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const sendMail = require('../config/nodemailer');
const AppError = require('../config/appError');
const bcrypt =  require('bcryptjs');
const crypto = require('crypto');
const Token = require('../models/token');


module.exports = {

    verify_User_SIM: async(req, res, next)=>{
        let phone = req.params.phone;
        const $phone = phone.replace(/0/i, '234');
        const user = await User.findOne({phone:$phone});
        if(user){
            return next(new AppError('User has already signed up with this phone number', 403));
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

    signup_User: async (req, res, next)=>{
        
        const userData = {
            firstname: req.body.firstname,
            lastname: req.body.surname,
            email: req.body.email,
            phone: req.body.phone,
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
                const url = `https://9id.now.sh/verify?token=${token.token}`;


                // Send Confirmation Email
                sendMail({
                    from: '9 ID <no-reply-9id@gmail.com>',
                    email: newUser.email,
                    replyTo: 'no-reply-9id@gmail.com',
                    subject: 'Email Confirmation',
                    message: `<p>Follow this link to confirm your email ${url}</p>`
                }).then(()=>{
                    res.status(201).json({
                        status: 'success',
                        message: 'User successfully created. Check for confirmation email',
                        data: newUser
                    })
                }).catch(err=>{
                    console.error(err.message)
                    return next(new AppError(err.message, 500))
                })
                
            })
            
        } catch(err) {
            next(err)
        }
    },



    resend_Email_Confirmation: async(req, res, next)=>{

        const user = await User.findById(req.params.id);
        if(!user.confirmed) {
            // const token = signToken(user._id);
            const token = await Token.findOne({user_ID:user._id});
            const url = `https://9id.now.sh/verify?token=${token.token}`

            sendMail({
                from: '9 ID <no-reply-9id@gmail.com>',
                email: user.email,
                replyTo: 'no-reply-9id@gmail.com',
                subject: 'Email Confirmation',
                message: `<p>Follow this link to confirm your email ${url}</p>`
            }).then(()=>res.status(200).json({status:'success',message:'confirmation mail resent'})).catch(err=>{
                console.error('Error:', err);
                return next(new AppError(err.message, 500));
            })
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
                const auto_gen_password = crypto.randomBytes(7).toString("hex");
                const password = auto_gen_password;
                const hashed_password = bcrypt.hashSync(password, 12);
                user.confirmed = true;
                user.password = hashed_password;
                user.save(err=>{
                    if(err){
                        console.error(err)
                        return next(new AppError(err.message, 500))
                    }
                    
                     // Send user password to confirmed user email address
                     sendMail({
                        from: '9 ID <no-reply-9id@gmail.com>',
                        email: user.email,
                        replyTo: 'no-reply-9id@gmail.com',
                        subject: '9-ID Login Credentials',
                        message: `<p>Your 9-ID login credentials are;</p>
                                    <ul>
                                        <li>email: ${user.email}</li>
                                        <li>password: ${password}</li>
                                    </ul>
                                    `
                    }).then(()=>{
                        
                        res.status(200).json({
                            status: 'success',
                            message: 'Email confirmed. Check your email for your login credentials.'
                        })
                    }).catch(err=>{
                        console.error('Error:', err);
                        next(new AppError('There was an error sending login credentials. Please try again.', 500));
                    })
                })
            } else {
                return next(new AppError('User has already been confirmed. Please check email for login credentials', 403));
            }
                                                                        
        } catch(err) {
            next(err)
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
                const token = jwt.sign({id}, process.env.JWT_SECRET);
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
    }
}