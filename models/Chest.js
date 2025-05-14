const mongoose = require('mongoose');

const ChestSchema = new mongoose.Schema(
    {
        chestname: {
            type: String,
            index: true // Automatically creates an index on 'amount'
        },
        chestid: {
            type: String,
            index: true // Automatically creates an index on 'amount'
        },
        itemid: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Item',
                index: true // Automatically creates an index on 'amount'
            }
        ]
    },
    {
        timestamps: true
    }
)

const Chest = mongoose.model("Chest", ChestSchema)
module.exports = Chest