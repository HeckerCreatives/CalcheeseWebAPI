const { default: mongoose } = require("mongoose");

// LEGEND 
// T- TOTAL
// TY - TYPE
// M - MANUFACTURER
// R - RARITY
// I - ITEMS
// S - STATUS (C-U-P-A IS UNDER STATUS)
// C - CLAIMED
// U - UNCLAIMED
// P - PRECLAIMED
// A - APPROVED
// IG - IN-GAME
// EX - EXCLUSIVE
// CH - CHEST
// TKT - TICKET
// RBX - ROBUX



// COMBINATIONS
// LEVEL 1
// [T]
// LEVEL 2
// [T][M]
// [T][TY]
// [T][S]
// LEVEL 3
// [T][M][TY]
// [T][M][S]
// [T][TY][S]
// LEVEL 4
// [T][M][TY][R]
// [T][TY][S][R]
// LEVEL 5
// [T][M][TY][R][S]
// LEVEL 6
// [T][M][TY][R][S][I]



const CodeAnalyticsSchema = new mongoose.Schema(
    {
        counts: {
            type: Object,
            default: {}
        }
    },
    {
        timestamps: true
    }
)

const CodeAnalytics = mongoose.model('CodeAnalytics', CodeAnalyticsSchema);
module.exports = CodeAnalytics;