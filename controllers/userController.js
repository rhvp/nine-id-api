const axios = require('axios').default;
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const sendMail = require('../config/nodemailer');
const AppError = require('../config/appError');
const bcrypt =  require('bcrypt');
const crypto = require('crypto-random-string');


let password;
const signToken = id => {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: '2h'});
}
module.exports = {

    verify_User_SIM: (req, res, next)=>{
        let phone = req.params.phone;
        
            axios.request({
                url: `https://telcostaging.9mobile.com.ng/1.0/subscribers/${phone}/registration`,
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
                console.error('Error:', err);
                return next(new AppError('The requested phone number was not found. Please enter a correct 9-mobile number', 404))
            })
    },

    signup_User: async (req, res, next)=>{
        const auto_gen_password = crypto({length: 10, type: 'base64'});
        password = auto_gen_password
        const hashed_password = bcrypt.hashSync(password, 12);
        const userData = {
            firstname: req.body.firstname,
            lastname: req.body.surname,
            email: req.body.email,
            phone: req.body.phone,
            password: hashed_password
        }
        try {
            // Check if email is already registered
            const user = await User.findOne({email: req.body.email});
            if(user){
                return next(new AppError('User already registered with this Email.', 403));
            }
            
            // Create User
            const newUser = await User.create(userData);
            const token = signToken(newUser._id);
            const url = `${req.protocol}://${req.get(
                "host"
            )}/user/confirm/${token}`;

            // Send Confirmation Email
            sendMail({
                from: '9 ID <no-reply-9id@gmail.com>',
                email: newUser.email,
                replyTo: 'no-reply-9id@gmail.com',
                subject: 'Email Confirmation',
                message: `<p>Please follow the <a href="${url}">link</a> to verify your email.</p>`
            })
            res.status(201).json({
                status: 'success',
                message: 'User successfully created. Check for confirmation email',
                data: newUser
            })
        } catch(err) {
            next(err)
        }
    },
    resend_Email_Confirmation: async(req, res, next)=>{

        const user = await User.findById(req.params.id);
        const token = signToken(user._id);
        const url = `${req.protocol}://${req.get(
            "host"
        )}/user/confirm/${token}`


        sendMail({
            from: '9 ID <no-reply-9id@gmail.com>',
            email: user.email,
            replyTo: 'no-reply-9id@gmail.com',
            subject: 'Email Confirmation',
            message: `<p>Please follow the <a href="${url}">link</a> to verify your email.</p>`
        }).then(()=>res.status(200).json({status:'success',message:'confirmation mail resent'})).catch(err=>{
            console.error('Error:', err);
            return next(new AppError('Error sending confirmation email', 500));
        })


    },
    confirm_User: async(req,res,next)=>{
        try {
            // Verify user and change confirmation status
            const {id} = jwt.verify(req.params.token, process.env.JWT_SECRET)
            const user = await User.findByIdAndUpdate(id, {confirmed: true});

            // Send user password to confirmed user email address
            sendMail({
                from: '9 ID <no-reply-9id@gmail.com>',
                email: user.email,
                replyTo: 'no-reply-9id@gmail.com',
                subject: '9-ID Login Credentials',
                message: `<p>Your 9-ID login password is ${password}</p>`
            }).then(()=>{
                res.status(200).json({
                    status: 'success',
                    message: 'Email confirmed. Check your email for your login credentials.'
                })
            }).catch(err=>{
                console.error('Error:', err);
                next(new AppError('There was an error sending login credentials. Please try again.', 500));
            })
                                                                        
        } catch(err) {
            next(err)
        }
    },
    login_user: async(req, res, next)=>{
        try{
            const user = await User.findOne({email: req.body.email});
            if(!user){
                return next(new AppError('User with provided email does not exist', 404))
            }
            const correct_password = bcrypt.compareSync(req.body.password, user.password);
            if(correct_password){
                let id = user._id
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