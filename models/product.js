
const mongoose = require('mongoose')

const Schema = mongoose.Schema

const productSchema = new Schema({

    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    price: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }

})

module.exports = mongoose.model( 'Product', productSchema )