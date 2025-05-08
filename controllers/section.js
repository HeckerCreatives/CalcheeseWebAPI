const { ImageSection, WhatsNewSection, PromoCodeSection } = require("../models/Section");

// Create Image Section
exports.createimagesection = async (req, res) => {
    const { section } = req.body;
    const { image } = req.file ? req.file : "";
    
    if (!section || !image) {
        return res.status(400).json({ message: "bad-request", data: "Please provide all the required fields!" });
    }

    if (section !== "welcome" && section !== "minigame") {
        return res.status(400).json({ message: "bad-request", data: "Section must be either 'welcome' or 'minigame'!" });
    }

    await ImageSection.create({ section, image })
        .then(data => res.json({ message: "success", data }))
        .catch(err => {
            console.log(`There's a problem creating the image section. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });
};

// Read Image Sections
exports.getimagesections = async (req, res) => {
    const { page, limit, filter } = req.query;

    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10,
    };

    const filterOptions = filter ? { section: filter } : {};

    const data = await ImageSection.find(filterOptions)
        .skip(pageOptions.page * pageOptions.limit)
        .limit(pageOptions.limit)
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem fetching image sections. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    const totaldocuments = await ImageSection.countDocuments(filterOptions)
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem counting image sections. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });
    
    const totalpages = Math.ceil(totaldocuments / pageOptions.limit);

    const finalData = data.map(item => ({
        id: item._id,
        section: item.section,
        image: item.image,
    }));

    return res.json({ message: "success", data: finalData, totalpages });
    
};

// Update Image Section
exports.updateimagesection = async (req, res) => {
    const { id, section } = req.body;
    const { image } = req.file ? req.file : "";

    if (!id) {
        return res.status(400).json({ message: "bad-request", data: "Please provide the ID!" });
    }

    const updateData = { };
    if (section) updateData.section = section;
    if (image) updateData.image = image;
    if (section && section !== "welcome" && section !== "minigame") {
        return res.status(400).json({ message: "bad-request", data: "Section must be either 'welcome' or 'minigame'!" });
    }
    if (updateData.length === 0) {
        return res.status(400).json({ message: "bad-request", data: "Please provide at least one field to update!" });
    }

    await ImageSection.findByIdAndUpdate(id, { section, image }, { new: true })
        .then(data => res.json({ message: "success", data }))
        .catch(err => {
            console.log(`There's a problem updating the image section. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });
};

// Delete Image Section
exports.deleteimagesection = async (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ message: "bad-request", data: "Please provide the ID!" });
    }

    await ImageSection.findByIdAndDelete(id)
        .then(() => res.json({ message: "success" }))
        .catch(err => {
            console.log(`There's a problem deleting the image section. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });
};

// CRUD for WhatsNewSection
exports.createwhatsnewsection = async (req, res) => {
    const { tab, description } = req.body;
    const { image } = req.file ? req.file : "";

    if (!tab || !description || !image) {
        return res.status(400).json({ message: "bad-request", data: "Please provide all the required fields!" });
    }

    await WhatsNewSection.create({ tab, description, image })
        .then(data => res.json({ message: "success", data }))
        .catch(err => {
            console.log(`There's a problem creating the what's new section. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });
};

exports.getwhatsnewsections = async (req, res) => {
    await WhatsNewSection.find()
        .then(data => res.json({ message: "success", data }))
        .catch(err => {
            console.log(`There's a problem fetching what's new sections. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });
};

exports.updatewhatsnewsection = async (req, res) => {
    const { id, tab, description} = req.body;

    const { image } = req.file ? req.file : "";

    const updateData = { };
    if (!id) {
        return res.status(400).json({ message: "bad-request", data: "Please provide the ID!" });
    }

    if (tab) updateData.tab = tab;
    if (description) updateData.description = description;
    if (image) updateData.image = image;
    if (updateData.length === 0) {
        return res.status(400).json({ message: "bad-request", data: "Please provide at least one field to update!" });
    }

    await WhatsNewSection.findByIdAndUpdate(id, updateData, { new: true })
        .then(data => res.json({ message: "success", data }))
        .catch(err => {
            console.log(`There's a problem updating the what's new section. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });
};

exports.deletewhatsnewsection = async (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ message: "bad-request", data: "Please provide the ID!" });
    }

    await WhatsNewSection.findByIdAndDelete(id)
        .then(() => res.json({ message: "success" }))
        .catch(err => {
            console.log(`There's a problem deleting the what's new section. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });
};

// CRUD for PromoCodeSection
exports.createpromocodesection = async (req, res) => {
    const { title, description } = req.body;

    if (!title || !description) {
        return res.status(400).json({ message: "bad-request", data: "Please provide all the required fields!" });
    }

    await PromoCodeSection.create({ title, description })
        .then(data => res.json({ message: "success", data }))
        .catch(err => {
            console.log(`There's a problem creating the promo code section. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });
};

exports.getpromocodesections = async (req, res) => {
    await PromoCodeSection.find()
        .then(data => res.json({ message: "success", data }))
        .catch(err => {
            console.log(`There's a problem fetching promo code sections. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });
};

exports.updatepromocodesection = async (req, res) => {
    const { id, title, description } = req.body;

    if (!id) {
        return res.status(400).json({ message: "bad-request", data: "Please provide the ID!" });
    }

    await PromoCodeSection.findByIdAndUpdate(id, { title, description }, { new: true })
        .then(data => res.json({ message: "success", data }))
        .catch(err => {
            console.log(`There's a problem updating the promo code section. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });
};

exports.deletepromocodesection = async (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ message: "bad-request", data: "Please provide the ID!" });
    }

    await PromoCodeSection.findByIdAndDelete(id)
        .then(() => res.json({ message: "success" }))
        .catch(err => {
            console.log(`There's a problem deleting the promo code section. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });
};