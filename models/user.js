const mongoose = require('mongoose');
const validator = require('validator')
const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: [true, 'Please enter your first name']
    },
    lastname: {
        type: String,
        required: [true, 'Please enter your surname']
    },
    email: {
        type: String,
        unique: true,
        required: true,
        validate: [validator.isEmail, 'Please enter a valid email']
    },
    phone: {
        type: String,
        required: [true, 'Please enter your surname'],
        unique: true
    },
    password: {
        type: String
    },
    confirmed: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['inactive', 'active', 'level A', 'level B', 'level C'],
        default: 'inactive'
    }
}, {timestamps: true})

const User = mongoose.model('user', userSchema);

module.exports = User;