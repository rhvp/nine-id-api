const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/nine-id-db', {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true, autoIndex:true}).then(()=>{
    console.log('MongoDB connected')
}).catch(err=>{
    console.error('Error:',err.name,err.message);
})

module.exports = mongoose.connection;