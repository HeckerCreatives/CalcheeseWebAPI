const { default: mongoose } = require("mongoose");

const AnalyticsSchema = new mongoose.Schema(
    {
        totalclaimed: {
            type: Number,
            default: 0,
        },
        totalapproved: {
            type: Number,
            default: 0,
        },
        totaltogenerate: {
            type: Number,
            default: 0,
        },
        totaltoclaim: {
            type: Number,
            default: 0,
        },
        totalexpired: {
            type: Number,
            default: 0,
        },
        totalingamecommon: {
            type: Number,
            default: 0,
        },
        totalingameuncommon: {
            type: Number,
            default: 0,
        },
        totalingamerare: {
            type: Number,
            default: 0,
        },
        totalingameepic: {
            type: Number,
            default: 0,
        },
        totalingamelegendary: {
            type: Number,
            default: 0,
        },
        totalexclusivecommon: {
            type: Number,
            default: 0,
        },
        totalexclusiveuncommon: {
            type: Number,
            default: 0,
        },
        totalexclusiverare: {
            type: Number,
            default: 0,
        },
        totalexclusiveepic: {
            type: Number,
            default: 0,
        },
        totalexclusivelegendary: {
            type: Number,
            default: 0,
        },
        totalchestcommon: {
            type: Number,
            default: 0,
        },
        totalchestuncommon: {
            type: Number,
            default: 0,
        },
        totalchestrare: {
            type: Number,
            default: 0,
        },
        totalchestepic: {
            type: Number,
            default: 0,
        },
        totalchestlegendary: {
            type: Number,
            default: 0,
        },
        totalrobuxcommon: {
            type: Number,
            default: 0,
        },
        totalrobuxuncommon: {
            type: Number,
            default: 0,
        },
        totalrobuxrare: {
            type: Number,
            default: 0,
        },
        totalrobuxepic: {
            type: Number,
            default: 0,
        },
        totalrobuxlegendary: {
            type: Number,
            default: 0,
        },
        totalticketcommon: {
            type: Number,
            default: 0,
        },
        totalticketuncommon: {
            type: Number,
            default: 0,
        },
        totalticketrare: {
            type: Number,
            default: 0,
        },
        totalticketepic: {
            type: Number,
            default: 0,
        },
        totalticketlegendary: {
            type: Number,
            default: 0,
        },
        totalarchived: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
)


const RedeemedCodeAnalyticsSchema = new mongoose.Schema(
    {
        code: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Code',
            index: true // Automatically creates an index on 'amount'
        }
    },
    {
        timestamps: true
    }
)

const RedeemedCodeAnalytics = mongoose.model("RedeemedCodeAnalytics", RedeemedCodeAnalyticsSchema);
const Analytics = mongoose.model("Analytics", AnalyticsSchema);

module.exports = { Analytics, RedeemedCodeAnalytics };