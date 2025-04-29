const mongoose = require('mongoose');

const CodeSchema = new mongoose.Schema(
    {
        codehistory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CodeHistory',
            index: true
        },
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
            index: true // Automatically creates an index on 'amount'
        },
        items: {
            type: Map,
            of: {
                type: String,
                index: true // Automatically creates an index on 'amount'
            }
        },
        status: {
            type: String,
            default: "active",
            index: true // Automatically creates an index on 'amount'
        }
    },
    {
        timestamps: true
    }
)

const CodeHistorySchema = new mongoose.Schema(
    {
        codes: {
            type: Number,
            index: true // Automatically creates an index on 'amount'
        },
        usedCodes: {
            type: Number,
            default: 0,
            index: true // Automatically creates an index on 'amount'
        },
        type: {
            type: String,
            enum: ['robux', 'ticket'],
            index: true // Automatically creates an index on 'amount'
        },
        chest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Chest',
            index: true
        },
        expiration: {
            type: Date,
            index: true // Automatically creates an index on 'amount'
        },
        status: {
            type: String,
            default: "active",
            index: true // Automatically creates an index on 'amount'
        },
        items: {
            type: Map,
            of: {
                type: String,
                index: true // Automatically creates an index on 'amount'
            }
        },
        codeid: [
            {
                type: String,
            }
        ],
        usedCodeid: [
            {
                type: String,
            }
        ]
    },
    {
        timestamps: true
    }   
)

const RedeemCodeSchema = new mongoose.Schema(
    {
        code: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Code',
            index: true
        },
        amount: {
            type: Number,
            index: true // Automatically creates an index on 'amount'
        },
        type: {
            type: String,
            enum: ['robux', 'ticket'],
            index: true // Automatically creates an index on 'amount'
        },
        email: {
            type: String,
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
        status: {
            type: String,
            default: "pending",
            index: true // Automatically creates an index on 'amount'
        },
    },
    {
        timestamps: true
    }
)


const RedeemCode = mongoose.model("RedeemCode", RedeemCodeSchema)
const CodeHistory = mongoose.model("CodeHistory", CodeHistorySchema)
const Code = mongoose.model("Code", CodeSchema)
module.exports =  { Code, CodeHistory, RedeemCode };