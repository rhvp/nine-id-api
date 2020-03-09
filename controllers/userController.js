const axios = require('axios').default;
const User = require('../models/user');
module.exports = {
    verify_User: (req, res, next)=>{
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
                console.error(err)
            })
        } catch(err){
            next(err)
        }
        
    },

    signup_User: async (req, res, next)=>{
        const user = {
            firstname: req.body.firstname,
            lastname: req.body.surname,
            email: req.body.email,
            phone: req.body.phone
        }
        try {
            const newUser = await User.create(user);
            res.status(201).json({
                status: 'success',
                data: newUser
            })
        } catch(err) {
            next(err)
        }
    }
}