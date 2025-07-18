const { Analytics } = require("../models/Analytics");
const Code = require("../models/Code");

exports.syncAllAnalyticsUtility = async () => {
            console.log("Starting full analytics sync...");
    
        try {
            
            // Get all non-archived codes
            const codes = await Code.find({ archived: { $ne: true } }).lean();
            
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
                totalunclaimedticket: 0
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