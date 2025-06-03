const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema(
    {
        itemid: {
            type: String,
            index: true // Automatically creates an index on 'amount'
        },
        itemname: {
            type: String,
            index: true // Automatically creates an index on 'amount'
        },
        quantity: {
            type: Number,
            default: 0,
            index: true // Automatically creates an index on 'amount'
        },
    },
    {
        timestamps: true
    }
)

const Item = mongoose.model("Item", ItemSchema)
module.exports = Item