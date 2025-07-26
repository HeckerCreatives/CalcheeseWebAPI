const { default: mongoose } = require("mongoose");



// LEGEND:// #region - start of a section
// #endregion - end of a section
// T- TOTAL
// TY - TYPE
// M - MANUFACTURER
// R - RARITY
// S - STATUS
// C - CLAIMED
// U - UNCLAIMED
// IG - IN-GAME


const AnalyticsSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            default: 0,
            index: true // Automatically creates an index on 'amount'
        }
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