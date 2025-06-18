const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema(
    {
        itemname: {
            type: String,
            index: true // Automatically creates an index on 'amount'
        },
        category: {
            type: String,
            enum: ['exclusive', 'robux', 'ticket', 'ingame', 'chest'],
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