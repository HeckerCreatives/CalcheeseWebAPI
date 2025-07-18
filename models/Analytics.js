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
        totalclaimedingame: {
            type: Number,
            default: 0,
        },
        totalclaimedexclusive: {
            type: Number,
            default: 0,
        },
        totalclaimedchest: {
            type: Number,
            default: 0,
        },
        totalclaimedrobux: {
            type: Number,
            default: 0,
        },
        totalclaimedticket: {
            type: Number,
            default: 0,
        },
        totalunclaimedingame: {
            type: Number,
            default: 0,
        },
        totalunclaimedexclusive: {
            type: Number,
            default: 0,
        },
        totalunclaimedchest: {
            type: Number,
            default: 0,
        },
        totalunclaimedrobux: {
            type: Number,
            default: 0,
        },
        totalunclaimedticket: {
            type: Number,
            default: 0,
        },

        // #region MANUFACTURER COUNTERS
        
        // Manufacturer total counters
        totalhbyx: {
            type: Number,
            default: 0,
        },
        totaldyth: {
            type: Number,
            default: 0,
        },
        totalhbyx2: {
            type: Number,
            default: 0,
        },
        totalamx: {
            type: Number,
            default: 0,
        },
        // Manufacturer claimed/unclaimed counters
        totalhbyxclaimed: {
            type: Number,
            default: 0,
        },
        totaldythclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyx2claimed: {
            type: Number,
            default: 0,
        },
        totalamxclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyxunclaimed: {
            type: Number,
            default: 0,
        },
        totaldythunclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyx2unclaimed: {
            type: Number,
            default: 0,
        },
        totalamxunclaimed: {
            type: Number,
            default: 0,
        },
        // Manufacturer type counters
        totalhbyxingame: {
            type: Number,
            default: 0,
        },
        totaldythingame: {
            type: Number,
            default: 0,
        },
        totalhbyx2ingame: {
            type: Number,
            default: 0,
        },
        totalamxingame: {
            type: Number,
            default: 0,
        },
        totalhbyxexclusive: {
            type: Number,
            default: 0,
        },
        totaldythexclusive: {
            type: Number,
            default: 0,
        },
        totalhbyx2exclusive: {
            type: Number,
            default: 0,
        },
        totalamxexclusive: {
            type: Number,
            default: 0,
        },
        totalhbyxchest: {
            type: Number,
            default: 0,
        },
        totaldythchest: {
            type: Number,
            default: 0,
        },
        totalhbyx2chest: {
            type: Number,
            default: 0,
        },
        totalamxchest: {
            type: Number,
            default: 0,
        },
        totalhbyxrobux: {
            type: Number,
            default: 0,
        },
        totaldythrobux: {
            type: Number,
            default: 0,
        },
        totalhbyx2robux: {
            type: Number,
            default: 0,
        },
        totalamxrobux: {
            type: Number,
            default: 0,
        },
        totalhbyxticket: {
            type: Number,
            default: 0,
        },
        totaldythticket: {
            type: Number,
            default: 0,
        },
        totalhbyx2ticket: {
            type: Number,
            default: 0,
        },
        totalamxticket: {
            type: Number,
            default: 0,
        },
        // manufacturer archived counters
        totalhbyxarchived: {
            type: Number,
            default: 0,
        },
        totaldytharchived: {
            type: Number,
            default: 0,
        },
        totalhbyx2archived: {
            type: Number,
            default: 0,
        },
        totalamxarchived: {
            type: Number,
            default: 0,
        },
        // manufacturer in-game counters
        totalhbyxingamecommon: {
            type: Number,
            default: 0,
        },
        totalhbyxingameuncommon: {
            type: Number,
            default: 0,
        },
        totalhbyxingamerare: {
            type: Number,
            default: 0,
        },
        totalhbyxingameepic: {
            type: Number,
            default: 0,
        },
        totalhbyxingamelegendary: {
            type: Number,
            default: 0,
        },
        totaldythingamecommon: {
            type: Number,
            default: 0,
        },
        totaldythingameuncommon: {
            type: Number,
            default: 0,
        },
        totaldythingamerare: {
            type: Number,
            default: 0,
        },
        totaldythingameepic: {
            type: Number,
            default: 0,
        },
        totaldythingamelegendary: {
            type: Number,
            default: 0,
        },
        totalhbyx2ingamecommon: {
            type: Number,
            default: 0,
        },
        totalhbyx2ingameuncommon: {
            type: Number,
            default: 0,
        },
        totalhbyx2ingamerare: {
            type: Number,
            default: 0,
        },
        totalhbyx2ingameepic: {
            type: Number,
            default: 0,
        },
        totalhbyx2ingamelegendary: {
            type: Number,
            default: 0,
        },
        totalamxingamecommon: {
            type: Number,
            default: 0,
        },
        totalamxingameuncommon: {
            type: Number,
            default: 0,
        },
        totalamxingamerare: {
            type: Number,
            default: 0,
        },
        totalamxingameepic: {
            type: Number,
            default: 0,
        },
        totalamxingamelegendary: {
            type: Number,
            default: 0,
        },
        // manufacturer exclusive counters
        totalhbyxexclusivecommon: {
            type: Number,
            default: 0,
        },
        totalhbyxexclusiveuncommon: {
            type: Number,
            default: 0,
        },
        totalhbyxexclusiverare: {
            type: Number,
            default: 0,
        },
        totalhbyxexclusiveepic: {
            type: Number,
            default: 0,
        },
        totalhbyxexclusivelegendary: {
            type: Number,
            default: 0,
        },
        totaldythexclusivecommon: {
            type: Number,
            default: 0,
        },
        totaldythexclusiveuncommon: {
            type: Number,
            default: 0,
        },
        totaldythexclusiverare: {
            type: Number,
            default: 0,
        },
        totaldythexclusiveepic: {
            type: Number,
            default: 0,
        },
        totaldythexclusivelegendary: {
            type: Number,
            default: 0,
        },
        totalhbyx2exclusivecommon: {
            type: Number,
            default: 0,
        },
        totalhbyx2exclusiveuncommon: {
            type: Number,
            default: 0,
        },
        totalhbyx2exclusiverare: {
            type: Number,
            default: 0,
        },
        totalhbyx2exclusiveepic: {
            type: Number,
            default: 0,
        },
        totalhbyx2exclusivelegendary: {
            type: Number,
            default: 0,
        },
        totalamxexclusivecommon: {
            type: Number,
            default: 0,
        },
        totalamxexclusiveuncommon: {
            type: Number,
            default: 0,
        },
        totalamxexclusiverare: {
            type: Number,
            default: 0,
        },
        totalamxexclusiveepic: {
            type: Number,
            default: 0,
        },
        totalamxexclusivelegendary: {
            type: Number,
            default: 0,
        },
        // manufacturer chest counters
        totalhbyxchestcommon: {
            type: Number,
            default: 0,
        },
        totalhbyxchestuncommon: {
            type: Number,
            default: 0,
        },
        totalhbyxchestrare: {
            type: Number,
            default: 0,
        },
        totalhbyxchestepic: {
            type: Number,
            default: 0,
        },
        totalhbyxchestlegendary: {
            type: Number,
            default: 0,
        },
        totaldythchestcommon: {
            type: Number,
            default: 0,
        },
        totaldythchestuncommon: {
            type: Number,
            default: 0,
        },
        totaldythchestrare: {
            type: Number,
            default: 0,
        },
        totaldythchestepic: {
            type: Number,
            default: 0,
        },
        totaldythchestlegendary: {
            type: Number,
            default: 0,
        },
        totalhbyx2chestcommon: {
            type: Number,
            default: 0,
        },
        totalhbyx2chestuncommon: {
            type: Number,
            default: 0,
        },
        totalhbyx2chestrare: {
            type: Number,
            default: 0,
        },
        totalhbyx2chestepic: {
            type: Number,
            default: 0,
        },
        totalhbyx2chestlegendary: {
            type: Number,
            default: 0,
        },
        totalamxchestcommon: {
            type: Number,
            default: 0,
        },
        totalamxchestuncommon: {
            type: Number,
            default: 0,
        },
        totalamxchestrare: {
            type: Number,
            default: 0,
        },
        totalamxchestepic: {
            type: Number,
            default: 0,
        },
        totalamxchestlegendary: {
            type: Number,
            default: 0,
        },
        // manufacturer robux counters
        totalhbyxrobuxcommon: {
            type: Number,
            default: 0,
        },
        totalhbyxrobuxuncommon: {
            type: Number,
            default: 0,
        },
        totalhbyxrobuxrare: {
            type: Number,
            default: 0,
        },
        totalhbyxrobuxepic: {
            type: Number,
            default: 0,
        },
        totalhbyxrobuxlegendary: {
            type: Number,
            default: 0,
        },
        totaldythrobuxcommon: {
            type: Number,
            default: 0,
        },
        totaldythrobuxuncommon: {
            type: Number,
            default: 0,
        },
        totaldythrobuxrare: {
            type: Number,
            default: 0,
        },
        totaldythrobuxepic: {
            type: Number,
            default: 0,
        },
        totaldythrobuxlegendary: {
            type: Number,
            default: 0,
        },
        totalhbyx2robuxcommon: {
            type: Number,
            default: 0,
        },
        totalhbyx2robuxuncommon: {
            type: Number,
            default: 0,
        },
        totalhbyx2robuxrare: {
            type: Number,
            default: 0,
        },
        totalhbyx2robuxepic: {
            type: Number,
            default: 0,
        },
        totalhbyx2robuxlegendary: {
            type: Number,
            default: 0,
        },
        totalamxrobuxcommon: {
            type: Number,
            default: 0,
        },
        totalamxrobuxuncommon: {
            type: Number,
            default: 0,
        },
        totalamxrobuxrare: {
            type: Number,
            default: 0,
        },
        totalamxrobuxepic: {
            type: Number,
            default: 0,
        },
        totalamxrobuxlegendary: {
            type: Number,
            default: 0,
        },
        // manufacturer ticket counters
        totalhbyxticketcommon: {
            type: Number,
            default: 0,
        },
        totalhbyxticketuncommon: {
            type: Number,
            default: 0,
        },
        totalhbyxticketrare: {
            type: Number,
            default: 0,
        },
        totalhbyxticketepic: {
            type: Number,
            default: 0,
        },
        totalhbyxticketlegendary: {
            type: Number,
            default: 0,
        },
        totaldythticketcommon: {
            type: Number,
            default: 0,
        },
        totaldythticketuncommon: {
            type: Number,
            default: 0,
        },
        totaldythticketrare: {
            type: Number,
            default: 0,
        },
        totaldythticketepic: {
            type: Number,
            default: 0,
        },
        totaldythticketlegendary: {
            type: Number,
            default: 0,
        },
        totalhbyx2ticketcommon: {
            type: Number,
            default: 0,
        },
        totalhbyx2ticketuncommon: {
            type: Number,
            default: 0,
        },
        totalhbyx2ticketrare: {
            type: Number,
            default: 0,
        },
        totalhbyx2ticketepic: {
            type: Number,
            default: 0,
        },
        totalhbyx2ticketlegendary: {
            type: Number,
            default: 0,
        },
        totalamxticketcommon: {
            type: Number,
            default: 0,
        },
        totalamxticketuncommon: {
            type: Number,
            default: 0,
        },
        totalamxticketrare: {
            type: Number,
            default: 0,
        },
        totalamxticketepic: {
            type: Number,
            default: 0,
        },
        totalamxticketlegendary: {
            type: Number,
            default: 0,
        }
        // #endregion MANUFACTURER COUNTERS
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