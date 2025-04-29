const mongoose = require('mongoose');

const ChestSchema = new mongoose.Schema(
    {
        chestname: {
            type: String,
            index: true // Automatically creates an index on 'amount'
        },
        chesttype: {
            type: String,
            index: true // Automatically creates an index on 'amount'
        },
    },
    {
        timestamps: true
    }
)

const Chest = mongoose.model("Chest", ChestSchema)
module.exports = Chest