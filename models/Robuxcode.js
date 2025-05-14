const { default: mongoose } = require("mongoose");



const RobuxCodeSchema = new mongoose.Schema(
    {
        item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Item',
            index: true // Automatically creates an index on 'amount'
        },
        robuxcode: {
            type: String,
            index: true // Automatically creates an index on 'amount'
        },
        name: {
            type: String,
            index: true // Automatically creates an index on 'amount'
        },
        status: {
            type: String,
            default: "to-generate",
            index: true // Automatically creates an index on 'amount'
        },
        isUsed: {
            type: Boolean,
            default: false,
            index: true 
        },

    },
    {
        timestamps: true
    }
)

const RobuxCode = mongoose.model("RobuxCode", RobuxCodeSchema)
module.exports = RobuxCode