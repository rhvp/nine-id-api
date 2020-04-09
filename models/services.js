const mongoose = require('mongoose');

const serviceSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },

    provider: {
        type: String,
        required: true
    },

    level: {
        type: String,
        enum: ['a', 'b', 'c']
    }
})