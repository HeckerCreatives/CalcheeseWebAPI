const { default: mongoose } = require("mongoose");


const TicketSchema = new mongoose.Schema(
    {
        item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Item',
            index: true // Automatically creates an index on 'amount'
        },
        ticketid: {
            type: String,
            index: true // Automatically creates an index on 'amount'
        },
        category: {
            type: String,
            index: true // Automatically creates an index on 'amount'
        },
        tickettype: {
            type: String,
            index: true // Automatically creates an index on 'amount'
        },
        ticketname: {
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

const Ticket = mongoose.model("Ticket", TicketSchema)


module.exports = Ticket