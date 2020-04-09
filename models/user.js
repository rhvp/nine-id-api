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
        required: [true, 'Please enter your phone number'],
        unique: true
    },
    created_by: {
        type: String,
        default: '9-id web'
    },
    business_Name: {
        type: String
    },
    business_Category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category'
    },
    business_Logo: {
        type: String
    },
    economic_ID: {
        type: String,
        unique: true,
        required: true
    },
    address: {
        type: String
    },
    website:{
        type: String
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
    },
    social_Media: {
        instagram: {
            type: String
        },
        facebook: {
            type: String
        },
        twitter: {
            type: String
        },
        linkedin: {
            type: String
        }
    }
}, {timestamps: true})

const User = mongoose.model('user', userSchema);

module.exports = User;