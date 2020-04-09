const AppError = require('./appError');
const jwt = require('jsonwebtoken');
module.exports = {
    apiAccess: (req, res, next)=>{
        const auth = req.headers['authorization'];
        try {
            if(!auth) return next(new AppError('Unauthorized!! Please provide access token', 401));
            if(auth === process.env.API_KEY) {
                next();
            } else {
                return next(new AppError('Invalid access token.', 401));
            }
        } catch (error) {
            next(error)
        }
    },
    userAuth: (req, res, next)=>{
        const auth = req.headers['authorization'];
        try {
            if(!auth) return next(new AppError('Unauthorized Request. Please login to access this resource', 401));
            const authorized = jwt.verify(auth, process.env.JWT_SECRET);
            if(authorized.user._id === req.params.id) {
                next()
            } else {
                return next(new AppError('User is unauthorized. Invalid or expired token.', 401));
            }
        } catch (error) {
            next(error)
        }
    }
}