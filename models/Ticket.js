const { default: mongoose } = require("mongoose");


const TicketSchema = new mongoose.Schema(
    {
        tickettype: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'TicketType',
            index: true // Automatically creates an index on 'amount'
        },
        ticketcode: {
            type: String,
            index: true // Automatically creates an index on 'amount'
        },
        name: {
            type: String,
            index: true // Automatically creates an index on 'amount'
        },
        email: {
            type: String,
            index: true // Automatically creates an index on 'amount'
        },
        picture: {
            type: String,
            index: true // Automatically creates an index on 'amount'
        },
        status: {
            type: String,
            default: "to-generate",
            index: true // Automatically creates an index on 'amount'
        },
        code: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Code',
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

const TicketTypeSchema = new mongoose.Schema(
    {
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
        }
    },
    {
        timestamps: true
    }
)

const Ticket = mongoose.model("Ticket", TicketSchema)
const TicketType = mongoose.model("TicketType", TicketTypeSchema)

module.exports = { Ticket, TicketType }