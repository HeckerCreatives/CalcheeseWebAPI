const { ImageSection, WhatsNewSection, PromoCodeSection } = require("../models/Section");

// Create Image Section
exports.createimagesection = async (req, res) => {
    const { section } = req.body;
    const image = req.file ? req.file.filename : null;

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
            return res.status(500).json({ message: "server-error", data: "There's a problem with the server! Please contact customer support for more details." });
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

exports.getimagewelcomesections = async (req, res) => {
    const { filter } = req.query;
  
    try {
      // Build aggregation pipeline
      const pipeline = [];
  
      if (filter) {
        pipeline.push({ $match: { section: filter } });
      }
  
      pipeline.push({ $sample: { size: 3 } });
  
      const data = await ImageSection.aggregate(pipeline);
  
      const finalData = data.map(item => ({
        id: item._id,
        section: item.section,
        image: item.image,
      }));
  
      return res.json({ message: "success", data: finalData, totalpages: 1 });
    } catch (err) {
      console.error("Error fetching random images:", err);
      return res.status(500).json({
        message: "server-error",
        data: "There's a problem with the server! Please contact support.",
      });
    }
  };
  

// Update Image Section
exports.updateimagesection = async (req, res) => {
    const { id, section } = req.body;
    const image = req.file ? req.file.filename : null;
  
    if (!id) {
      return res.status(400).json({
        message: "bad-request",
        data: "Please provide the ID!",
      });
    }
  
    if (section && section !== "welcome" && section !== "minigame") {
      return res.status(400).json({
        message: "bad-request",
        data: "Section must be either 'welcome' or 'minigame'!",
      });
    }
  
    const updateData = {};
    if (section) updateData.section = section;
    if (image) updateData.image = image;
  
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        message: "bad-request",
        data: "Please provide at least one field to update!",
      });
    }
  
    try {
      const updated = await ImageSection.findByIdAndUpdate(id, updateData, {
        new: true,
      });
  
      if (!updated) {
        return res.status(404).json({
          message: "not-found",
          data: "Image section not found.",
        });
      }
  
      return res.json({ message: "success", data: updated });
    } catch (err) {
      console.error("Update error:", err);
      return res.status(500).json({
        message: "server-error",
        data: "There's a problem with the server! Please contact support.",
      });
    }
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
    const image = req.file ? req.file.filename : null;
  
    if (!tab || !description || !image) {
      return res.status(400).json({
        message: "bad-request",
        data: "Please provide all the required fields!",
      });
    }
  
    try {
      const data = await WhatsNewSection.create({ tab, description, image });
      return res.json({ message: "success", data });
    } catch (err) {
      console.error(`Error creating the What's New section: ${err}`);
      return res.status(500).json({
        message: "server-error",
        data: "There's a problem with the server! Please contact customer support for more details.",
      });
    }
  };
  

exports.getwhatsnewsections = async (req, res) => {
    const { page, limit } = req.query;
    
    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10,
    };

    const data = await WhatsNewSection.find()
        .skip(pageOptions.page * pageOptions.limit)
        .limit(pageOptions.limit)
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem fetching what's new sections. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    const totaldocuments = await WhatsNewSection.countDocuments()
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem counting what's new sections. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });
    
    const totalpages = Math.ceil(totaldocuments / pageOptions.limit);

    const finalData = data.map(item => ({
        id: item._id,
        tab: item.tab,
        description: item.description,
        image: item.image,
    }));

    return res.json({ message: "success", data: finalData, totalpages });
};

exports.updatewhatsnewsection = async (req, res) => {
    const { id, tab, description } = req.body;
    const image = req.file ? req.file.filename : null;
  
    if (!id) {
      return res.status(400).json({
        message: "bad-request",
        data: "Please provide the ID!",
      });
    }
  
    const updateData = {};
    if (tab) updateData.tab = tab;
    if (description) updateData.description = description;
    if (image) updateData.image = image;
  
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        message: "bad-request",
        data: "Please provide at least one field to update!",
      });
    }
  
    try {
      const updated = await WhatsNewSection.findByIdAndUpdate(id, updateData, {
        new: true,
      });
  
      if (!updated) {
        return res.status(404).json({
          message: "not-found",
          data: "What's New section not found.",
        });
      }
  
      return res.json({ message: "success", data: updated });
    } catch (err) {
      console.error(`Error updating What's New section: ${err}`);
      return res.status(500).json({
        message: "server-error",
        data: "There's a problem with the server! Please contact customer support for more details.",
      });
    }
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
    const { page, limit } = req.query;

    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10,
    };

    await PromoCodeSection.find()
        .skip(pageOptions.page * pageOptions.limit)
        .limit(pageOptions.limit)
        .then(async data => {
            const totaldocuments = data.length;
            const totalpages = Math.ceil(totaldocuments / pageOptions.limit);

            const rewardItem = [
              {title:'In-Game Rewards', description:' Lorem ipsum dolor sit amet consectetur, adipisicing elit'},
              {title:'Ticket', description:' Lorem ipsum dolor sit amet consectetur, adipisicing elit'},
              {title:'Robux', description:' Lorem ipsum dolor sit amet consectetur, adipisicing elit'},
              {title:'Title', description:' Lorem ipsum dolor sit amet consectetur, adipisicing elit'},
            ]

            if (data.length === 0) {
              data = await PromoCodeSection.insertMany(rewardItem)
            }
            const finalData = data.map(item => ({
                id: item._id,
                title: item.title,
                description: item.description,
            }));

            // FIND PROMOCODE TITLE
            
            const titledata = finalData.find(item => item.title === 'Title')

            // FILTER OUT TITLE FROM FINAL DATA
            const filteredData = finalData.filter(item => item.title !== 'Title');
            return res.json({ message: "success", data: filteredData, totalpages, titledata });
        })
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

    const updateData = { };

    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (updateData.length === 0) {
        return res.status(400).json({ message: "bad-request", data: "Please provide at least one field to update!" });
    }

    await PromoCodeSection.findByIdAndUpdate(id, updateData, { new: true })
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

