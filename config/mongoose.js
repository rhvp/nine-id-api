const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_ATLAS_URL, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true, autoIndex:true}).then(()=>{
    console.log('MongoDB connected')
}).catch(err=>{
    console.error('Error:',err.name,err.message);
})

module.exports = mongoose.connection;

