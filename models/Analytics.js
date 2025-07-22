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
        // #region TOTALS
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
        // #endregion

        // #region T-TY-R
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
        // #endregion

        // #region T-C/U-TY
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
        // #endregion

        
        // #region T-M
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
        // #endregion

        // #region T-M-C/U-TY
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
        // #endregion
        // #region T-M-TY 
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
        // #endregion

        // #region T-M-IG
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
        // #endregion

        // #region T-M-EX
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
        // #endregion

        // #region T-M-CHEST
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
        // #endregion

        // #region T-M-RBX
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
        // #endregion

        // #region T-M-TKT
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
        },
        // #endregion
        // manufacturer type rarity status

        // #region T-M-TY-R-C/U
        totalhbyxingamecommonclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyxingameuncommonclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyxingamerareclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyxingameepicclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyxingamelegendaryclaimed: {
            type: Number,
            default: 0,
        },
        totaldythingamecommonclaimed: {
            type: Number,
            default: 0,
        },
        totaldythingameuncommonclaimed: {
            type: Number,
            default: 0,
        },
        totaldythingamerareclaimed: {
            type: Number,
            default: 0,
        },
        totaldythingameepicclaimed: {
            type: Number,
            default: 0,
        },
        totaldythingamelegendaryclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyx2ingamecommonclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyx2ingameuncommonclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyx2ingamerareclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyx2ingameepicclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyx2ingamelegendaryclaimed: {
            type: Number,
            default: 0,
        },
        totalamxingamecommonclaimed: {
            type: Number,
            default: 0,
        },
        totalamxingameuncommonclaimed: {
            type: Number,
            default: 0,
        },
        totalamxingamerareclaimed: {
            type: Number,
            default: 0,
        },
        totalamxingameepicclaimed: {
            type: Number,
            default: 0,
        },

        totalhbyxchestcommonclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyxchestuncommonclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyxchestrareclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyxchestepicclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyxchestlegendaryclaimed: {
            type: Number,
            default: 0,
        },
        totaldythchestcommonclaimed: {
            type: Number,
            default: 0,
        },
        totaldythchestuncommonclaimed: {
            type: Number,
            default: 0,
        },
        totaldythchestrareclaimed: {
            type: Number,
            default: 0,
        },
        totaldythchestepicclaimed: {
            type: Number,
            default: 0,
        },
        totaldythchestlegendaryclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyx2chestcommonclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyx2chestuncommonclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyx2chestrareclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyx2chestepicclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyx2chestlegendaryclaimed: {
            type: Number,
            default: 0,
        },
        totalamxchestcommonclaimed: {
            type: Number,
            default: 0,
        },
        totalamxchestuncommonclaimed: {
            type: Number,
            default: 0,
        },
        totalamxchestrareclaimed: {
            type: Number,
            default: 0,
        },
        totalamxchestepicclaimed: {
            type: Number,
            default: 0,
        },

        totalhbyxexclusivecommonclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyxexclusiveuncommonclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyxexclusiverareclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyxexclusiveepicclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyxexclusivelegendaryclaimed: {
            type: Number,
            default: 0,
        },
        totaldythexclusivecommonclaimed: {
            type: Number,
            default: 0,
        },
        totaldythexclusiveuncommonclaimed: {
            type: Number,
            default: 0,
        },
        totaldythexclusiverareclaimed: {
            type: Number,
            default: 0,
        },
        totaldythexclusiveepicclaimed: {
            type: Number,
            default: 0,
        },
        totaldythexclusivelegendaryclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyx2exclusivecommonclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyx2exclusiveuncommonclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyx2exclusiverareclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyx2exclusiveepicclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyx2exclusivelegendaryclaimed: {
            type: Number,
            default: 0,
        },
        totalamxexclusivecommonclaimed: {
            type: Number,
            default: 0,
        },
        totalamxexclusiveuncommonclaimed: {
            type: Number,
            default: 0,
        },
        totalamxexclusiverareclaimed: {
            type: Number,
            default: 0,
        },
        totalamxexclusiveepicclaimed: {
            type: Number,
            default: 0,
        },

        totalhbyxrobuxcommonclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyxrobuxuncommonclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyxrobuxrareclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyxrobuxepicclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyxrobuxlegendaryclaimed: {
            type: Number,
            default: 0,
        },
        totaldythrobuxcommonclaimed: {
            type: Number,
            default: 0,
        },
        totaldythrobuxuncommonclaimed: {
            type: Number,
            default: 0,
        },
        totaldythrobuxrareclaimed: {
            type: Number,
            default: 0,
        },
        totaldythrobuxepicclaimed: {
            type: Number,
            default: 0,
        },
        totaldythrobuxlegendaryclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyx2robuxcommonclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyx2robuxuncommonclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyx2robuxrareclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyx2robuxepicclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyx2robuxlegendaryclaimed: {
            type: Number,
            default: 0,
        },
        totalamxrobuxcommonclaimed: {
            type: Number,
            default: 0,
        },
        totalamxrobuxuncommonclaimed: {
            type: Number,
            default: 0,
        },
        totalamxrobuxrareclaimed: {
            type: Number,
            default: 0,
        },
        totalamxrobuxepicclaimed: {
            type: Number,
            default: 0,
        },
        totalamxrobuxlegendaryclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyxticketcommonclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyxticketuncommonclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyxticketrareclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyxticketepicclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyxticketlegendaryclaimed: {
            type: Number,
            default: 0,
        },
        totaldythticketcommonclaimed: {
            type: Number,
            default: 0,
        },
        totaldythticketuncommonclaimed: {
            type: Number,
            default: 0,
        },
        totaldythticketrareclaimed: {
            type: Number,
            default: 0,
        },
        totaldythticketepicclaimed: {
            type: Number,
            default: 0,
        },
        totaldythticketlegendaryclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyx2ticketcommonclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyx2ticketuncommonclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyx2ticketrareclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyx2ticketepicclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyx2ticketlegendaryclaimed: {
            type: Number,
            default: 0,
        },
        totalamxticketcommonclaimed: {
            type: Number,
            default: 0,
        },
        totalamxticketuncommonclaimed: {
            type: Number,
            default: 0,
        },
        totalamxticketrareclaimed: {
            type: Number,
            default: 0,
        },
        totalamxticketepicclaimed: {
            type: Number,
            default: 0,
        },
        totalamxticketlegendaryclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyxticketcommonunclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyxticketuncommonunclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyxticketrareunclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyxticketepicunclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyxticketlegendaryunclaimed: {
            type: Number,
            default: 0,
        },
        totaldythticketcommonunclaimed: {
            type: Number,
            default: 0,
        },
        totaldythticketuncommonunclaimed: {
            type: Number,
            default: 0,
        },
        totaldythticketrareunclaimed: {
            type: Number,
            default: 0,
        },
        totaldythticketepicunclaimed: {
            type: Number,
            default: 0,
        },
        totaldythticketlegendaryunclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyx2ticketcommonunclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyx2ticketuncommonunclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyx2ticketrareunclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyx2ticketepicunclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyx2ticketlegendaryunclaimed: {
            type: Number,
            default: 0,
        },
        totalamxticketcommonunclaimed: {
            type: Number,
            default: 0,
        },
        totalamxticketuncommonunclaimed: {
            type: Number,
            default: 0,
        },
        totalamxticketrareunclaimed: {
            type: Number,
            default: 0,
        },
        totalamxticketepicunclaimed: {
            type: Number,
            default: 0,
        },
        totalamxticketlegendaryunclaimed: {
            type: Number,
            default: 0,
        },
        // #endregion

        // #region T-M-TY-R-PRECLAIMED
        totalhbyxrobuxcommonpreclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyxrobuxuncommonpreclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyxrobuxrarepreclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyxrobuxepicpreclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyxrobuxlegendarypreclaimed: {
            type: Number,
            default: 0,
        },
        totaldythrobuxcommonpreclaimed: {
            type: Number,
            default: 0,
        },

        totaldythrobuxuncommonpreclaimed: {
            type: Number,
            default: 0,
        },
        totaldythrobuxrarepreclaimed: {
            type: Number,
            default: 0,
        },
        totaldythrobuxepicpreclaimed: {
            type: Number,
            default: 0,
        },
        totaldythrobuxlegendarypreclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyx2robuxcommonpreclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyx2robuxuncommonpreclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyx2robuxrarepreclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyx2robuxepicpreclaimed: {
            type: Number,
            default: 0,
        },

        totalhbyx2robuxlegendarypreclaimed: {
            type: Number,
            default: 0,
        },
        totalamxrobuxcommonpreclaimed: {
            type: Number,
            default: 0,
        },  
        totalamxrobuxuncommonpreclaimed: {
            type: Number,
            default: 0,
        },
        totalamxrobuxrarepreclaimed: {
            type: Number,
            default: 0,
        },
        totalamxrobuxepicpreclaimed: {
            type: Number,
            default: 0,
        },
        totalamxrobuxlegendarypreclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyxticketcommonpreclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyxticketuncommonpreclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyxticketrarepreclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyxticketepicpreclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyxticketlegendarypreclaimed: {
            type: Number,
            default: 0,
        },
        totaldythticketcommonpreclaimed: {
            type: Number,
            default: 0,
        },
        totaldythticketuncommonpreclaimed: {
            type: Number,
            default: 0,
        },
        totaldythticketrarepreclaimed: {
            type: Number,
            default: 0,
        },
        totaldythticketepicpreclaimed: {
            type: Number,
            default: 0,
        },
        totaldythticketlegendarypreclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyx2ticketcommonpreclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyx2ticketuncommonpreclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyx2ticketrarepreclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyx2ticketepicpreclaimed: {
            type: Number,
            default: 0,
        },
        totalhbyx2ticketlegendarypreclaimed: {
            type: Number,
            default: 0,
        },
        totalamxticketcommonpreclaimed: {
            type: Number,
            default: 0,
        },
        totalamxticketuncommonpreclaimed: {
            type: Number,
            default: 0,
        },
        totalamxticketrarepreclaimed: {
            type: Number,
            default: 0,
        },
        totalamxticketepicpreclaimed: {
            type: Number,
            default: 0,
        },
        totalamxticketlegendarypreclaimed: {
            type: Number,
            default: 0,
        },
        totalamxticketlegendarypreclaimed: {
            type: Number,
            default: 0,
        },
        // #endregion
        
        // #region T-M-TY-R-APPROVED
        totalhbyxrobuxcommonapproved: {
            type: Number,
            default: 0,
        },
        totalhbyxrobuxuncommonapproved: {
            type: Number,
            default: 0,
        },
        totalhbyxrobuxrareapproved: {
            type: Number,
            default: 0,
        },
        totalhbyxrobuxepicapproved: {
            type: Number,
            default: 0,
        },
        totalhbyxrobuxlegendaryapproved: {
            type: Number,
            default: 0,
        },
        totaldythrobuxcommonapproved: {
            type: Number,
            default: 0,
        },
        totaldythrobuxuncommonapproved: {
            type: Number,
            default: 0,
        },
        totaldythrobuxrareapproved: {
            type: Number,
            default: 0,
        },
        totaldythrobuxepicapproved: {
            type: Number,
            default: 0,
        },
        totaldythrobuxlegendaryapproved: {
            type: Number,
            default: 0,
        },
        totalhbyx2robuxcommonapproved: {
            type: Number,
            default: 0,
        },
        totalhbyx2robuxuncommonapproved: {
            type: Number,
            default: 0,
        },
        totalhbyx2robuxrareapproved: {
            type: Number,
            default: 0,
        },
        totalhbyx2robuxepicapproved: {
            type: Number,
            default: 0,
        },
        totalhbyx2robuxlegendaryapproved: {
            type: Number,
            default: 0,
        },
        totalamxrobuxcommonapproved: {
            type: Number,
            default: 0,
        },
        totalamxrobuxuncommonapproved: {
            type: Number,
            default: 0,
        },
        totalamxrobuxrareapproved: {
            type: Number,
            default: 0,
        },
        totalamxrobuxepicapproved: {
            type: Number,
            default: 0,
        },
        totalamxrobuxlegendaryapproved: {
            type: Number,
            default: 0,
        },
        totalhbyxticketcommonapproved: {
            type: Number,
            default: 0,
        },
        totalhbyxticketuncommonapproved: {
            type: Number,
            default: 0,
        },
        totalhbyxticketrareapproved: {
            type: Number,
            default: 0,
        },
        totalhbyxticketepicapproved: {
            type: Number,
            default: 0,
        },
        totalhbyxticketlegendaryapproved: {
            type: Number,
            default: 0,
        },
        totaldythticketcommonapproved: {
            type: Number,
            default: 0,
        },
        totaldythticketuncommonapproved: {
            type: Number,
            default: 0,
        },
        totaldythticketrareapproved: {
            type: Number,
            default: 0,
        },
        totaldythticketepicapproved: {
            type: Number,
            default: 0,
        },
        totaldythticketlegendaryapproved: {
            type: Number,
            default: 0,
        },
        totalhbyx2ticketcommonapproved: {
            type: Number,
            default: 0,
        },
        totalhbyx2ticketuncommonapproved: {
            type: Number,
            default: 0,
        },
        totalhbyx2ticketrareapproved: {
            type: Number,
            default: 0,
        },
        totalhbyx2ticketepicapproved: {
            type: Number,
            default: 0,
        },
        totalhbyx2ticketlegendaryapproved: {
            type: Number,
            default: 0,
        },
        totalamxticketcommonapproved: {
            type: Number,
            default: 0,
        },
        totalamxticketuncommonapproved: {
            type: Number,
            default: 0,
        },
        totalamxticketrareapproved: {
            type: Number,
            default: 0,
        },
        totalamxticketepicapproved: {
            type: Number,
            default: 0,
        },
        totalamxticketlegendaryapproved: {
            type: Number,
            default: 0,
        },
        // #endregion
       
       
        // #region MANUFACTURER TYPE RARITY STATUS
        // #endregion MANUFACTURER TYPE RARITY STATUS


        // #endregion MANUFACTURER COUNTERS

        // #region ARCHIVED COUNTERS
        totalarchived: {
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