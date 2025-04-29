const moment = require("moment");
const Chest = require("../models/Chest")
const { Code, CodeHistory, RedeemCode, } = require("../models/Code")



exports.generatecode = async (req, res) => {
    const { id } = req.user;

    const { chest, expiration, codeamount, items, type } = req.body;

    if (!chest || !expiration || !codeamount || !items) {
        return res.status(400).json({ message: "failed", data: "Please fill in all the required fields!" });
    }

    if (codeamount <= 0) {
        return res.status(400).json({ message: "failed", data: "Please enter a valid code amount!" });
    }

    if (items.length <= 0) {
        return res.status(400).json({ message: "failed", data: "Please enter a valid item!" });
    }

    const chesttype = await Chest.findById(chest)
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem getting the chest type data. Error ${err}`);

            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    // Generate many codes based on the code amount
    const codes = [];

    for (let i = 0; i < codeamount; i++) {
        const code = Math.random().toString(36).substring(2, 14).toUpperCase();

        codes.push(code);
    }
    const history = await CodeHistory.create({ codeid: codes, codes: codeamount, chest: chesttype._id, expiration: expiration, items: items, usedCodes: 0, type: type, usedCodeid: [] })
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem creating the code history. Error ${err}`);

            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });
    
    const codeData = codes.map(code => {
        return {
            codehistory: history._id,
            chest: chesttype._id,
            expiration: expiration,
            code: code,
            items: items,
            isUsed: false
        };
    });

    await Code.insertMany(codeData)
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem creating the codes. Error ${err}`);

            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    return res.json({ message: "success" });
};


exports.getcodehistory = async (req, res) => {

    const { id } = req.user;

    const { page, limit, filter, type } = req.query;

    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10,
    };


    const filterOptions = {
        status: filter || "active",
    };

    // types are robux and ticket

    if (type) {
        if (type == "robux" || type == "ticket") {
            filterOptions.type = type;
        } else {
            return res.status(400).json({ message: "failed", data: "Please enter a valid type!" });
        }
    }

    const history = await CodeHistory.find(filterOptions)
        .populate("chest")
        .sort({ createdAt: -1 })
        .skip(pageOptions.page * pageOptions.limit)
        .limit(pageOptions.limit)
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem getting the code history. Error ${err}`);

            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    const totaldocs = await CodeHistory.countDocuments(filterOptions)
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem getting the code history. Error ${err}`);

            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });
    
    const totalpages = Math.ceil(totaldocs / pageOptions.limit);

    const finaldata = {
        totalpages: totalpages,
        data: []
    }

    history.forEach((item) => {
        finaldata.data.push({
            id: item._id,
            codeamount: item.codes,
            usedCodes: item.usedCodes,
            type: item.type,
            usedCodeid: item.usedCodeid,
            chesttype: item.chest.chesttype,
            chestname: item.chest.chestname,
            items: item.items,
            status: item.status,
            expiration: moment(item.expiration).format('YYYY-MM-DD'),
            createdAt: moment(item.createdAt).format('YYYY-MM-DD'),
        });
    });

    return res.json({ message: "success", data: finaldata });
}


exports.redeemcode = async (req, res) => {
     
    const { code, email, name  } = req.body;

    if (!code || !email || !name) {
        return res.status(400).json({ message: "failed", data: "Please fill in all the required fields!" });
    }

    const picture = req.file ? req.file.filename : null;
    if (!picture) {
        return res.status(400).json({ message: "failed", data: "Please upload a picture!" });
    }

    // check code

    const codeData = await Code.findOne({ code: code })
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem getting the code data. Error ${err}`);

            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    if (!codeData) {
         return res.status(400).json({ message: "failed", data: "Please enter a valid code!" });
    }
    if(codeData.isUsed == true) {
        return res.status(400).json({ message: "failed", data: "This code has already been used!" });
    }

    if (codeData.expiration < new Date()) {
        return res.status(400).json({ message: "failed", data: "Please enter a valid code!" });
    }

    const Codehistory = await CodeHistory.findById(codeData.codehistory)
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem getting the code history data. Error ${err}`);

            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    
    // update code to used
    codeData.isUsed = true;
    codeData.status = "used";
    Codehistory.usedCodes += 1;
    Codehistory.usedCodeid.push(codeData._id);

    await Codehistory.save()
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem updating the code history data. Error ${err}`);

            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });
    await codeData.save()
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem updating the code data. Error ${err}`);

            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });


    let amount = 0;
    if (Codehistory.type === "robux") {
        amount = codeData.items.get('robux');
    }


    await RedeemCode.create({ code: codeData._id, amount: amount, type: Codehistory.type, email: email, name: name, picture: picture })
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem creating the redeem code data. Error ${err}`);

            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    // Respond with success
    return res.json({ message: "success" });
};


exports.getRedeemCodeHistory = async (req, res) => {
    const { page, limit, type } = req.query;

    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10,
    };

    const filterOptions = {};
    if (type) {
        if (type === "robux" || type === "ticket") {
            filterOptions.type = type;
        } else {
            return res.status(400).json({ message: "failed", data: "Please enter a valid type!" });
        }
    }

    const history = await RedeemCode.find(filterOptions)
        .sort({ createdAt: -1 })
        .skip(pageOptions.page * pageOptions.limit)
        .limit(pageOptions.limit)
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem getting the redeem code history. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    const totaldocs = await RedeemCode.countDocuments(filterOptions)
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem counting the redeem code history. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    const totalpages = Math.ceil(totaldocs / pageOptions.limit);

    const finaldata = {
        totalpages: totalpages,
        data: history.map(item => ({
            id: item._id,
            code: item.code,
            amount: item.amount,
            type: item.type,
            email: item.email,
            name: item.name,
            picture: item.picture,
            createdAt: moment(item.createdAt).format('YYYY-MM-DD'),
        })),
    };

    return res.json({ message: "success", data: finaldata });
};


