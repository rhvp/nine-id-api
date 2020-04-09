const User = require('../models/user');
const AppError = require('../config/appError');

module.exports = {
    get_Merchants: async(req, res, next)=>{
        try {
            const merchants = await User.find({}).populate('category');
            const response = await merchants.map(merchant=>{
                 merchant.password = undefined
                 return merchant;
                })
            res.status(200).json({
                status: 'succeess',
                data: {response}
            })
        } catch (error) {
            next(error)
        }
    },

    get_Single_Merchant: async(req, res, next)=>{
        try {
            const merchant = await User.findById(req.params.id).populate('category');
            if(!merchant) return next(new AppError('Merchant record not found', 404));
            merchant.password = undefined;
            res.status(200).json({
                status: 'success',
                data: {merchant}
            })
        } catch (error) {
            next(error)
        }
    }
}