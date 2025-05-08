const mongoose = require('mongoose');

const CodeSchema = new mongoose.Schema(
    {
        chest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Chest',
            index: true
        },
        expiration: {
            type: Date,
            index: true // Automatically creates an index on 'amount'
        },
        type: {
            type: String,
            enum: ['robux', 'ticket'],
            index: true // Automatically creates an index on 'amount'
        },
        isUsed: {
            type: Boolean,
            default: false,
            index: true // Automatically creates an index on 'amount'
        },
        code: {
            type: String,
            unique: true,
             // Automatically creates an index on 'amount'
        },
        items: [{      
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Item',
            index: true // Automatically creates an index on 'amount'
        }],
        robuxcode: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'RobuxCode',
            index: true // Automatically creates an index
        }],
        ticket: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Ticket',
            index: true // Automatically creates an index
        }]
        
    },
    {
        timestamps: true
    }
)


const ItemSchema = new mongoose.Schema(
    {
        itemcode: {
            type: String,
            index: true // Automatically creates an index on 'amount'
        },
        itemname: {
            type: String,
            index: true // Automatically creates an index on 'amount'
        },
        itemtype: {
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
    },
    {
        timestamps: true
    }
)


const Code = mongoose.model("Code", CodeSchema)
const Item = mongoose.model("Item", ItemSchema)

module.exports =  { Code, Item };