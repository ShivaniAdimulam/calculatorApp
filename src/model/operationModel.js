const mongoose = require('mongoose')
const opModel = new mongoose.Schema({
    totalOperations: {
        type: Number
        
    },
    result: {
        type: Number,

    },
    lastResult: {
        type: [Number],
      
       
    },
   
}, { timestamps: true })

module.exports = mongoose.model('operation', opModel)