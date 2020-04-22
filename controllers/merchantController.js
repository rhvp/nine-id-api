const User = require('../models/user');
const AppError = require('../config/appError');

module.exports = {
    get_Merchants: async(req, res, next)=>{
        try {
            const merchants = await User.find({}).populate('category').select('-password');
            res.status(200).json({
                status: 'succeess',
                data: {merchants}
            })
        } catch (error) {
            next(error)
        }
    },

    get_Single_Merchant: async(req, res, next)=>{
        try {
            const merchant = await User.findById(req.params.id).populate('category').select('-password');
            if(!merchant) return next(new AppError('Merchant record not found', 404));
            res.status(200).json({
                status: 'success',
                data: {merchant}
            })
        } catch (error) {
            next(error)
        }
    },

    getMerchantsByCategory: async(req, res, next)=>{
        try {
            const merchants = await User.find({category: req.params.id}).select('-password');
            res.status(200).json({
                status: 'success',
                data: {merchants}
            })
        } catch (error) {
            next(error)
        }
    },

    searchMerchantsByQuery: async(req, res, next)=>{
        try {
            const merchants = User.find({$text:{$search:req.params.searchQuery}}).select('-password');
            res.status(200).json({
                status: 'success',
                data: {merchants}
            })
        } catch (error) {
            next(error)
        }
    }
}