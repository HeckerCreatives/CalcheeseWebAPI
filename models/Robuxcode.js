const { default: mongoose } = require("mongoose");



const RobuxCodeSchema = new mongoose.Schema(
    {
        robuxcode: {
            type: String,
            index: true // Automatically creates an index on 'amount'
        },
        amount: {
            type: Number,
            index: true // Automatically creates an index on 'amount'
        },
        name: {
            type: String,
            index: true // Automatically creates an index on 'amount'
        },
        picture: {
            type: String,
            index: true // Automatically creates an index on 'amount'
        },
        email: {
            type: String,
            index: true // Automatically creates an index on 'amount'
        },
        code: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Code',
            index: true // Automatically creates an index on 'amount'
        },
        status: {
            type: String,
            default: "to-generate",
            index: true // Automatically creates an index on 'amount'
        },
        isUsed: {
            type: Boolean,
            default: true,
            index: true 
        },

    },
    {
        timestamps: true
    }
)

const RobuxCode = mongoose.model("RobuxCode", RobuxCodeSchema)
module.exports = RobuxCode