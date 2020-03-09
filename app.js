const express = require('express');
const user_Routes = require('./routes/user-routes');

const app = express();

app.use(express.json());

app.use('/user', user_Routes);

module.exports = app;