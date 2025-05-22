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