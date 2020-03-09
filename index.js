require('dotenv').config();

const app = require('./app');
const mongoose = require('./config/mongoose');

const port = process.env.PORT || 5000;

app.listen(port,()=>{
    console.log('App running on Port:', port)
});
