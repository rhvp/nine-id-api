const express = require('express');
const user_Routes = require('./routes/user-routes');
const merchant_Routes = require('./routes/merchantRoutes');
const AppError = require('./config/appError');
const cors = require('cors');
const errorHandler = require('./controllers/errorController');

const app = express();

app.use(cors());
app.options('*', cors());

app.use(express.json());

app.use('/user', user_Routes);
app.use(merchant_Routes);

app.use((req, res, next)=>{
    let err = new AppError(`${req.ip} tried to reach a resource at ${req.originalUrl} that is not on this server.`, 404);
    next(err);
});

app.use(errorHandler);

module.exports = app;