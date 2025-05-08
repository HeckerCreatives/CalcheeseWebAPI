const SocialLink = require("../models/Sociallinks");

// Get Social Links
exports.getsociallinks = async (req, res) => {
    await SocialLink.find()
        .then(data => res.json({ message: "success", data }))
        .catch(err => {
            console.log(`There's a problem fetching social links. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });
};

// Update Social Link
exports.updatesociallink = async (req, res) => {
    const { title, link } = req.body;

    if (!title) {
        return res.status(400).json({ message: "bad-request", data: "Please provide the ID!" });
    }

    const updateData = {};
    if (link) updateData.link = link;

    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "bad-request", data: "Please provide at least one field to update!" });
    }

    await SocialLink.findOneAndUpdate({ title: title }, updateData, { new: true })
        .then(data => res.json({ message: "success", data }))
        .catch(err => {
            console.log(`There's a problem updating the social link. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });
};
