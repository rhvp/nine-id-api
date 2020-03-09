const mongoose = require('mongoose');
const validator = require('validator')
const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        validate: [validator.isEmail, 'Please enter a valid email']
    },
    phone: {
        type: String,
        required: true,
        unique: true,
    },
    status: {
        type: String,
        enum: ['inactive', 'active', 'level A', 'level B', 'level C'],
        default: 'inactive'
    }
})

const User = mongoose.model('user', userSchema);

module.exports = User;