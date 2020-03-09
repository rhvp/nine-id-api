const mongoose = require('mongoose');

mongoose.connect(`mongodb+srv://sody-boy:${process.env.MONGO_ATLAS_PASSWORD}@my-cluster-01-a0hk3.mongodb.net/nine-id-test?retryWrites=true&w=majority`, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true}).then(()=>{
    console.log('MongoDB connected')
}).catch(err=>{
    console.error('Error:',err)
})

module.exports = mongoose.connection;