const { Analytics } = require("../models/Analytics");
const Code = require("../models/Code");
const CodeAnalytics = require("../models/CodeAnalytics");
const { getmanufacturerbyindex } = require("./manufacturerutil");


exports.syncAllAnalyticsUtility = async () => {
            console.log("Starting full analytics sync...");
    
        try {
            
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
            
            const BATCH_SIZE = 10000; // Adjust as needed
            let lastId = null;
            let hasMore = true;
            let batchnumber = 0;

            while (hasMore) {
                const filter = lastId ? { _id: { $gt: lastId } } : {};

                const codes = await Code.find(filter, 'index _id archived isUsed type rarity expiration status')
                    .sort({ _id: 1 }) // Ascending order
                    .limit(BATCH_SIZE)
                    .lean();
                
                
                if (codes.length === 0) break;

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

            lastId = codes[codes.length - 1]._id;

            // Continue if more codes may exist
            hasMore = codes.length === BATCH_SIZE;
            batchnumber++;
            console.log(`Batch ${batchnumber} processed, last ID: ${lastId.toString()}`);
            }

    
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



exports.Zmanualeditanalytics = async (req, res) => {
    try {
  const analytics = {
                // Status counters
                totalclaimed: 0,
                totalapproved: 0,
                totaltogenerate: 0,
                totaltoclaim: 42341913,
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
                totalchestcommon: 42341913,
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
                totalunclaimedchest: 42341913,
                totalunclaimedrobux: 0,
                totalunclaimedticket: 0,

                // Manufacturer counters
                totalhbyx: 7562500,
                totaldyth: 5720000,
                totalhbyx2: 16823530,
                totalamx: 12235883,

                // Manufacturer claimed/unclaimed counters
                totalclaimedhbyx: 0,
                totalclaimeddyth: 0,
                totalclaimedhbyx2: 0,
                totalclaimedamx: 0,
                totalunclaimedhbyx: 7562500,
                totalunclaimeddyth: 5720000,
                totalunclaimedhbyx2: 16823530,
                totalunclaimedamx: 12235883,

                // Manufacturer type counters
                totalhbyxingame: 0,
                totalhbyxexclusive: 0,
                totalhbyxchest: 7562500,
                totalhbyxrobux: 0,
                totalhbyxticket: 0,
                totaldythingame: 0,
                totaldythexclusive: 0,
                totaldythchest: 5720000,
                totaldythrobux: 0,
                totaldythticket: 0,
                totalhbyx2ingame: 0,
                totalhbyx2exclusive: 0,
                totalhbyx2chest: 16823530,
                totalhbyx2robux: 0,
                totalhbyx2ticket: 0,
                totalamxingame: 0,
                totalamxexclusive: 0,
                totalamxchest: 12235883,
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
                totalhbyxchestcommon: 7562500,
                totalhbyxchestuncommon: 0,
                totalhbyxchestrare: 0,
                totalhbyxchestepic: 0,
                totalhbyxchestlegendary: 0,
                totaldythchestcommon: 5720000,
                totaldythchestuncommon: 0,
                totaldythchestrare: 0,
                totaldythchestepic: 0,
                totaldythchestlegendary: 0,
                totalhbyx2chestcommon: 16823530,
                totalhbyx2chestuncommon: 0,
                totalhbyx2chestrare: 0,
                totalhbyx2chestepic: 0,
                totalhbyx2chestlegendary: 0,
                totalamxchestcommon: 12235883,
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

        await Analytics.findOneAndUpdate({}, { $set: analytics }, { upsert: true });


        return "success"
    } catch (error) {
        console.error("Error updating analytics:", error);
        return "error";
    }
}


// ...existing code...

// Utility to increment a flat key in an object
function incrementFlat(obj, key) {
    if (!obj[key]) obj[key] = 0;
    obj[key]++;
}

// Utility to build keys for each analytics level
function buildKeys(code) {
    const keys = [];
    // Shortenings for legend

    const M = code.manufacturer
    const TY = code.type;
    const R = code.rarity;
    const S = code.status;
    const items = Array.isArray(code.items) ? code.items.map(i => i.toString()) : [];

    // LEVEL ROOT
    keys.push('T');
    // LEVEL 1
    if (M) keys.push(`M:${M}`);
    if (TY) keys.push(`TY:${TY}`);
    if (S) keys.push(`S:${S}`);
    // LEVEL 2
    if (M && TY) keys.push(`M:${M}|TY:${TY}`);
    if (S && TY) keys.push(`S:${S}|TY:${TY}`);
    if (TY && R) keys.push(`TY:${TY}|R:${R}`);
    if (TY && items.length) items.forEach(I => keys.push(`TY:${TY}|I:${I}`));
    // LEVEL 3
    if (M && TY && R) keys.push(`M:${M}|TY:${TY}|R:${R}`);
    if (TY && R && S) keys.push(`TY:${TY}|R:${R}|S:${S}`);
    if (TY && R && items.length) items.forEach(I => keys.push(`TY:${TY}|R:${R}|I:${I}`));
    // LEVEL 4
    if (M && TY && R && S) keys.push(`M:${M}|TY:${TY}|R:${R}|S:${S}`);
    if (M && TY && R && items.length) items.forEach(I => keys.push(`M:${M}|TY:${TY}|R:${R}|I:${I}`));
    // LEVEL 5
    if (M && TY && R && S && items.length) items.forEach(I => keys.push(`M:${M}|TY:${TY}|R:${R}|S:${S}|I:${I}`));
    return keys;
}

exports.syncAllCodeAnalyticsUtility = async () => {
    console.log("Starting full code analytics sync...");
    const batchSize = 100000;
    let lastId = null;
    let hasMore = true;
    let batchnumber = 0;
    const counts = {};

    let processedCount = 0;
    const totalDocs = await Code.estimatedDocumentCount(); // Your known total

    console.log(`Starting sync with total documents: ${totalDocs}`);
    while (hasMore) {
        const codes = await Code.find(
            lastId ? { _id: { $gt: lastId } } : {},
            'index _id archived isUsed type rarity expiration status items manufacturer'
        )
            .sort({ _id: 1 })
            .limit(batchSize)
            .lean();

        if (codes.length === 0) break;

        codes.forEach(code => {
            const keys = buildKeys(code);
            keys.forEach(key => incrementFlat(counts, key));
        });

        processedCount += codes.length;
        lastId = codes[codes.length - 1]._id;
        hasMore = codes.length === batchSize && processedCount < totalDocs;
        batchnumber++;
        console.log(`Batch ${batchnumber} processed, last ID: ${lastId.toString()}, processed: ${processedCount}`);
        if (batchnumber % 100 === 0) {
            console.log(counts);
        }
    }

    await CodeAnalytics.findOneAndUpdate(
        {},
        { $set: { counts } },
        { upsert: true }
    );

    console.log("Code analytics sync complete.");
    return counts;
}



exports.setAllManualCodeAnalytics = async () => {
    const manufacturers = ['hbyx', 'dyth', 'hbyx2', 'amx'];
    const types = ['chest', 'ingame', 'exclusive', 'ticket', 'robux'];
    const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    const statuses = ['to-claim', 'pre-claimed', 'approved', 'claimed'];
    const items = []; // No items for now

    // Your known counts for each manufacturer (adjust as needed)
    const manufacturerCounts = {
        hbyx: 7562500,
        dyth: 5720000,
        hbyx2: 16823530,
        amx: 12235883
    };

    // Total codes
    const total = Object.values(manufacturerCounts).reduce((a, b) => a + b, 0);

    const counts = {};

    // ROOT
    counts['T'] = total;

    // LEVEL 1
    types.forEach(ty => counts[`TY:${ty}`] = ty === 'chest' ? total : 0);
    manufacturers.forEach(m => counts[`M:${m}`] = manufacturerCounts[m] || 0);
    statuses.forEach(s => counts[`S:${s}`] = 0);

    // LEVEL 2
    manufacturers.forEach(m => {
        types.forEach(ty => counts[`M:${m}|TY:${ty}`] = ty === 'chest' ? manufacturerCounts[m] : 0);
        statuses.forEach(s => counts[`M:${m}|S:${s}`] = 0);
    });
    types.forEach(ty => {
        rarities.forEach(r => counts[`TY:${ty}|R:${r}`] = 0);
        statuses.forEach(s => counts[`TY:${ty}|S:${s}`] = 0);
    });
    statuses.forEach(s => {
        types.forEach(ty => counts[`S:${s}|TY:${ty}`] = 0);
    });

    // LEVEL 3
    manufacturers.forEach(m => {
        types.forEach(ty => {
            rarities.forEach(r => counts[`M:${m}|TY:${ty}|R:${r}`] = 0);
            statuses.forEach(s => counts[`M:${m}|TY:${ty}|S:${s}`] = 0);
        });
    });
    types.forEach(ty => {
        rarities.forEach(r => {
            statuses.forEach(s => counts[`TY:${ty}|R:${r}|S:${s}`] = 0);
        });
    });

    // LEVEL 4
    manufacturers.forEach(m => {
        types.forEach(ty => {
            rarities.forEach(r => {
                statuses.forEach(s => counts[`M:${m}|TY:${ty}|R:${r}|S:${s}`] = 0);
            });
        });
    });

    // LEVEL 5 (items, if you want to add in the future)
    // manufacturers.forEach(m => {
    //     types.forEach(ty => {
    //         rarities.forEach(r => {
    //             statuses.forEach(s => {
    //                 items.forEach(i => counts[`M:${m}|TY:${ty}|R:${r}|S:${s}|I:${i}`] = 0);
    //             });
    //         });
    //     });
    // });

    await CodeAnalytics.findOneAndUpdate(
        {},
        { $set: { counts } },
        { upsert: true }
    );

    console.log("All manual CodeAnalytics keys set!");
};