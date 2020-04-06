const AppError = require('./appError');
module.exports = (req, res, next)=>{
    const auth = req.headers['authorization'];
    try {
        if(!auth) return next(new AppError('Unauthorized!! Please provide access token', 403));
        if(auth === process.env.API_KEY) {
            next();
        } else {
            return next(new AppError('Invalid access token.', 403));
        }
    } catch (error) {
        next(error)
    }
}