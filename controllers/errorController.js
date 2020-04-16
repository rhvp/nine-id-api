const AppError = require('../config/appError');
module.exports = (err, req, res, next)=>{
    
    console.error(err.name, err.message, err.stack);
    if(process.env.NODE_ENV === 'development') {
        res.status(err.statusCode || 500).json({
            error: {
                message: err.message
            }
        });
    } else if (process.env.NODE_ENV === 'production') {
        if(err.isOperational) {
            res.status(err.statusCode).json({
                error: {
                    message: err.message
                }
            })
        }

        if(err.name === 'ValidationError'){
            res.status(403).json({
                error: {
                    title: 'Validation Error',
                    message: err.message
                }
            })
        }

        if(err.name === 'JsonWebTokenError'){
            res.status(401).json({
                error: {
                    title: 'Token Invalid',
                    message: err.message
                }
            })
        }

        if(err.name === 'TokenExpiredError'){
            res.status(401).json({
                error: {
                    title: 'Token Expired',
                    message: err.message
                }
            })
        }

        if(err.code === 11000){
            const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
            res.status(403).json({
                error: {
                    title: 'Duplicate Field Error',
                    message: `Duplicate field value:${value}. Please use another value and Try again`
                }
            })
        }


        res.status(err.statusCode || 500).json({
            error: {
                message: "Something went wrong in the server"
            }
        });
    }
}