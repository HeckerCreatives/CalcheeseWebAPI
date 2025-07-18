const { Analytics } = require("../models/Analytics");
const Code = require("../models/Code");
const { getmanufacturerbyindex } = require("./manufacturerutil");


exports.syncAllAnalyticsUtility = async () => {
            console.log("Starting full analytics sync...");
    
        try {
            
            // Get all non-archived codes
            const codes = await Code.find({ }).lean();
            
            // Initialize analytics object
            const analytics = {
                // Status counters
                totalclaimed: 0,
                totalapproved: 0,
                totaltogenerate: 0,
                totaltoclaim: 0,
                totalexpired: 0,
                totalarchived: 0,
                
                // Type/rarity counters
                totalingamecommon: 0,
                totalingameuncommon: 0,
                totalingamerare: 0,
                totalingameepic: 0,
                totalingamelegendary: 0,
                totalexclusivecommon: 0,
                totalexclusiveuncommon: 0,
                totalexclusiverare: 0,
                totalexclusiveepic: 0,
                totalexclusivelegendary: 0,
                totalchestcommon: 0,
                totalchestuncommon: 0,
                totalchestrare: 0,
                totalchestepic: 0,
                totalchestlegendary: 0,
                totalrobuxcommon: 0,
                totalrobuxuncommon: 0,
                totalrobuxrare: 0,
                totalrobuxepic: 0,
                totalrobuxlegendary: 0,
                totalticketcommon: 0,
                totalticketuncommon: 0,
                totalticketrare: 0,
                totalticketepic: 0,
                totalticketlegendary: 0,
                
                // Type claimed/unclaimed counters
                totalclaimedingame: 0,
                totalclaimedexclusive: 0,
                totalclaimedchest: 0,
                totalclaimedrobux: 0,
                totalclaimedticket: 0,
                totalunclaimedingame: 0,
                totalunclaimedexclusive: 0,
                totalunclaimedchest: 0,
                totalunclaimedrobux: 0,
                totalunclaimedticket: 0,

                // Manufacturer counters
                totalhbyx: 0,
                totaldyth: 0,
                totalhbyx2: 0,
                totalamx: 0,

                // Manufacturer claimed/unclaimed counters
                totalclaimedhbyx: 0,
                totalclaimeddyth: 0,
                totalclaimedhbyx2: 0,
                totalclaimedamx: 0,
                totalunclaimedhbyx: 0,
                totalunclaimeddyth: 0,
                totalunclaimedhbyx2: 0,
                totalunclaimedamx: 0,

                // Manufacturer type counters
                totalhbyxingame: 0,
                totalhbyxexclusive: 0,
                totalhbyxchest: 0,
                totalhbyxrobux: 0,
                totalhbyxticket: 0,
                totaldythingame: 0,
                totaldythexclusive: 0,
                totaldythchest: 0,
                totaldythrobux: 0,
                totaldythticket: 0,
                totalhbyx2ingame: 0,
                totalhbyx2exclusive: 0,
                totalhbyx2chest: 0,
                totalhbyx2robux: 0,
                totalhbyx2ticket: 0,
                totalamxingame: 0,
                totalamxexclusive: 0,
                totalamxchest: 0,
                totalamxrobux: 0,
                totalamxticket: 0,   

                // Manufacturer Archived count
                totalarchivedhbyx: 0,
                totalarchiveddyth: 0,
                totalarchivedhbyx2: 0,
                totalarchivedamx: 0,

                // Manufacturer ingame/rarity counters
                totalhbyxingamecommon: 0,
                totalhbyxingameuncommon: 0,
                totalhbyxingamerare: 0,
                totalhbyxingameepic: 0,
                totalhbyxingamelegendary: 0,
                totaldythingamecommon: 0,
                totaldythingameuncommon: 0,
                totaldythingamerare: 0,
                totaldythingameepic: 0,
                totaldythingamelegendary: 0,
                totalhbyx2ingamecommon: 0,
                totalhbyx2ingameuncommon: 0,
                totalhbyx2ingamerare: 0,
                totalhbyx2ingameepic: 0,
                totalhbyx2ingamelegendary: 0,
                totalamxingamecommon: 0,
                totalamxingameuncommon: 0,
                totalamxingamerare: 0,
                totalamxingameepic: 0,
                totalamxingamelegendary: 0,
                // Manufacturer exclusive/rarity counters
                totalhbyxexclusivecommon: 0,
                totalhbyxexclusiveuncommon: 0,
                totalhbyxexclusiverare: 0,
                totalhbyxexclusiveepic: 0,
                totalhbyxexclusivelegendary: 0,
                totaldythexclusivecommon: 0,
                totaldythexclusiveuncommon: 0,
                totaldythexclusiverare: 0,
                totaldythexclusiveepic: 0,
                totaldythexclusivelegendary: 0,
                totalhbyx2exclusivecommon: 0,
                totalhbyx2exclusiveuncommon: 0,
                totalhbyx2exclusiverare: 0,
                totalhbyx2exclusiveepic: 0,
                totalhbyx2exclusivelegendary: 0,
                totalamxexclusivecommon: 0,
                totalamxexclusiveuncommon: 0,
                totalamxexclusiverare: 0,
                totalamxexclusiveepic: 0,
                totalamxexclusivelegendary: 0,
                // Manufacturer chest/rarity counters
                totalhbyxchestcommon: 0,
                totalhbyxchestuncommon: 0,
                totalhbyxchestrare: 0,
                totalhbyxchestepic: 0,
                totalhbyxchestlegendary: 0,
                totaldythchestcommon: 0,
                totaldythchestuncommon: 0,
                totaldythchestrare: 0,
                totaldythchestepic: 0,
                totaldythchestlegendary: 0,
                totalhbyx2chestcommon: 0,
                totalhbyx2chestuncommon: 0,
                totalhbyx2chestrare: 0,
                totalhbyx2chestepic: 0,
                totalhbyx2chestlegendary: 0,
                totalamxchestcommon: 0,
                totalamxchestuncommon: 0,
                totalamxchestrare: 0,
                totalamxchestepic: 0,
                totalamxchestlegendary: 0,
                // Manufacturer robux/rarity counters
                totalhbyxrobuxcommon: 0,
                totalhbyxrobuxuncommon: 0,
                totalhbyxrobuxrare: 0,
                totalhbyxrobuxepic: 0,
                totalhbyxrobuxlegendary: 0,
                totaldythrobuxcommon: 0,
                totaldythrobuxuncommon: 0,
                totaldythrobuxrare: 0,
                totaldythrobuxepic: 0,
                totaldythrobuxlegendary: 0,
                totalhbyx2robuxcommon: 0,
                totalhbyx2robuxuncommon: 0,
                totalhbyx2robuxrare: 0,
                totalhbyx2robuxepic: 0,
                totalhbyx2robuxlegendary: 0,
                totalamxrobuxcommon: 0,
                totalamxrobuxuncommon: 0,
                totalamxrobuxrare: 0,
                totalamxrobuxepic: 0,
                totalamxrobuxlegendary: 0,
                // Manufacturer ticket/rarity counters
                totalhbyxticketcommon: 0,
                totalhbyxticketuncommon: 0,
                totalhbyxticketrare: 0,
                totalhbyxticketepic: 0,
                totalhbyxticketlegendary: 0,
                totaldythticketcommon: 0,
                totaldythticketuncommon: 0,
                totaldythticketrare: 0,
                totaldythticketepic: 0,
                totaldythticketlegendary: 0,
                totalhbyx2ticketcommon: 0,
                totalhbyx2ticketuncommon: 0,
                totalhbyx2ticketrare: 0,
                totalhbyx2ticketepic: 0,
                totalhbyx2ticketlegendary: 0,
                totalamxticketcommon: 0,
                totalamxticketuncommon: 0,
                totalamxticketrare: 0,
                totalamxticketepic: 0,
                totalamxticketlegendary: 0,

            };

    
            const currentDate = new Date();
            
            // Process each code
            codes.forEach(code => {
                // Status counters
                if (code.status === "claimed") analytics.totalclaimed++;
                if (code.status === "approved") analytics.totalapproved++;
                if (code.status === "to-generate") analytics.totaltogenerate++;
                if (code.status === "to-claim") analytics.totaltoclaim++;
                if (code.status === "rejected") analytics.totalrejected++;
                
                // Expired counter
                if (code.expiration && code.expiration < currentDate && !code.isUsed) {
                    analytics.totalexpired++;
                }
                
                // Type/rarity counters
                if (code.type && code.rarity) {
                    const typeRarityField = `total${code.type}${code.rarity}`;
                    if (analytics.hasOwnProperty(typeRarityField)) {
                        analytics[typeRarityField]++;
                    }
                }
                
                // Type claimed/unclaimed counters
                if (code.type) {
                    if (code.status === "claimed" || code.isUsed === true) {
                        const claimedField = `totalclaimed${code.type}`;
                        if (analytics.hasOwnProperty(claimedField)) {
                            analytics[claimedField]++;
                        }
                    } else {
                        const unclaimedField = `totalunclaimed${code.type}`;
                        if (analytics.hasOwnProperty(unclaimedField)) {
                            analytics[unclaimedField]++;
                        }
                    }
                }
                // Manufacturer counters
                const manufacturer = getmanufacturerbyindex(code.index)

                if (manufacturer) {
                    analytics[`total${manufacturer.type}`] = (analytics[`total${manufacturer.type}`] || 0) + 1;

                    if (code.status === "claimed" || code.isUsed === true) {
                        analytics[`totalclaimed${manufacturer.type}`] = (analytics[`totalclaimed${manufacturer.type}`] || 0) + 1;
                    } else {
                        analytics[`totalunclaimed${manufacturer.type}`] = (analytics[`totalunclaimed${manufacturer.type}`] || 0) + 1;
                    }

                    analytics[`total${manufacturer.type}${code.type}`] = (analytics[`total${manufacturer.type}${code.type}`] || 0) + 1;
                    
                    if(code.archived) {
                        analytics[`totalarchived${manufacturer.type}`] = (analytics[`totalarchived${manufacturer.type}`] || 0) + 1;
                    }
                    if (code.rarity) {
                        analytics[`total${manufacturer.type}${code.type}${code.rarity}`] = (analytics[`total${manufacturer.type}${code.type}${code.rarity}`] || 0) + 1;
                    }

                }
            });
    
            // Get archived count separately
            const archivedCount = await Code.countDocuments({ archived: true });
            analytics.totalarchived = archivedCount;


    
            // Update the Analytics document
            await Analytics.findOneAndUpdate({}, { $set: analytics }, { upsert: true });

            console.log("Analytics sync complete.");
            return analytics;

        } catch (error) {
            console.error("Error during analytics sync:", error);

            return {
                error: "Failed to sync analytics",
                details: error.message
            };
        }
}

