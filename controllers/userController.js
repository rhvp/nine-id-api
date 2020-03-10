const axios = require('axios').default;
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const sendMail = require('../config/nodemailer');
const AppError = require('../config/appError');

const signToken = id => {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: '2h'});
}
module.exports = {
    verify_User_SIM: (req, res, next)=>{
        let phone = req.params.phone;
        try{
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
                return next(new AppError('The requested phone number was not found', 404))
            })
        } catch(err){
            next(err)
        }
        
    },

    signup_User: async (req, res, next)=>{
        const userData = {
            firstname: req.body.firstname,
            lastname: req.body.surname,
            email: req.body.email,
            phone: req.body.phone
        }
        try {
            // Check if email is already registered
            const user = await User.find({email: req.body.email});
            if(user.email){
                return next(new AppError('Email already registered', 403))
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
    confirm_User: async(req,res,next)=>{
        try {
            const {id} = jwt.verify(req.params.token, process.env.JWT_SECRET)
            console.log(id)
            const user = await User.findByIdAndUpdate(id, {confirmed: true});
        } catch(err) {
            next(err)
        }
        res.status(204).json({
            status: 'success',
            message: 'user email successfully confirmed',
        })
    }
}