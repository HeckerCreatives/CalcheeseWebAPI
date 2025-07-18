// 7562500 - HBYX - 6855837ebdd1ec953592809f lte
// 13282500 - DYTH - 68558c74bdd1ec9535e9d62a lte and gt hbyx
// 30106030 - HBYX 48g - 6855a659bdd1ec9535eab284 lte and gt dyth
// 42341913 - AMX 48g - 685ce0ac6808bd1490a2cf1f lte and gt hbyx

const { default: mongoose } = require("mongoose");

const manufacturers = [
    { name: 'HBYX', type: "hbyx", index: 7562500, lte: new mongoose.Types.ObjectId('6855837ebdd1ec953592809f'), gt: null },
    { name: 'DYTH', type: "dyth", index: 13282500, lte: new mongoose.Types.ObjectId('68558c74bdd1ec9535e9d62a'), gt: new mongoose.Types.ObjectId('6855837ebdd1ec953592809f') },
    { name: 'HBYX 48g', type: "hbyx2", index: 30106030, lte: new mongoose.Types.ObjectId('6855a659bdd1ec9535eab284'), gt: new mongoose.Types.ObjectId('68558c74bdd1ec9535e9d62a') },
    { name: 'AMX 48g', type: "amx", index: 42341913, lte: new mongoose.Types.ObjectId('685ce0ac6808bd1490a2cf1f'), gt: new mongoose.Types.ObjectId('6855a659bdd1ec9535eab284') }
];

exports.getmanufacturers = async () => { return manufacturers; }

exports.getmanufacturerbyname = async (type) => {
    const manufacturer = manufacturers.find(m => m.type === type);
    return manufacturer || null;
}

