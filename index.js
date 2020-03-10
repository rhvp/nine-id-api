require('dotenv').config();

const app = require('./app');
const mongoose = require('./config/mongoose');
process.on('uncaughtException', err => {
    console.log('Uncaught Exception!! Shutting down process..', err.name, err.message, err.stack);
    process.exit(1);
})
const port = process.env.PORT || 5000;

app.listen(port,()=>{
    console.log('App running on Port:', port)
});


process.on('unhandledRejection', err=>{
    console.log('Unhandled Rejection!!', err.name, err.message, err.stack);
})