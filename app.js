const express = require('express');
const user_Routes = require('./routes/user-routes');
const AppError = require('./config/appError');

const app = express();

app.use(express.json());

app.use('/user', user_Routes);

app.use((req, res, next)=>{
    let err = new AppError(`${req.ip} tried to reach a resource at ${req.originalUrl} that is not on this server.`, 404);
    next(err);
});

app.use((err, req, res, next)=>{
    console.error(err.message, err.stack);
    if(process.env.NODE_ENV === 'development') {
        res.status(err.statusCode || 500).json({
            error: {
                message: err.message
            }
        });
    } else if (process.env.NODE_ENV === 'production') {
        res.status(err.statusCode || 500).json({
            error: {
                message: "Something went wrong in the server"
            }
        });
    }
});

module.exports = app;