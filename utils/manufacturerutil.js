// 7562500 - HBYX - 6855837ebdd1ec953592809f lte
// 13282500 - DYTH - 68558c74bdd1ec9535e9d62a lte and gt hbyx
// 30106030 - HBYX 48g - 6855a659bdd1ec9535eab284 lte and gt dyth
// 42341913 - AMX 48g - 685ce0ac6808bd1490a2cf1f lte and gt hbyx

const { default: mongoose } = require("mongoose");

const manufacturers = [
    { name: 'HBYX', type: "hbyx", index: 7562521, gtindex: null, lte: new mongoose.Types.ObjectId('6855837ebdd1ec953592809f'), gt: null },
    { name: 'DYTH', type: "dyth", index: 13282579, gtindex: 7562521,  lte: new mongoose.Types.ObjectId('68558c74bdd1ec9535e9d62a'), gt: new mongoose.Types.ObjectId('6855837ebdd1ec953592809f') },
    { name: 'HBYX 48g', type: "hbyx2", index: 30106405, gtindex: 13282579, lte: new mongoose.Types.ObjectId('6855a659bdd1ec9535eab284'), gt: new mongoose.Types.ObjectId('68558c74bdd1ec9535e9d62a') },
    { name: 'AMX 48g', type: "amx", index: 42342679, gtindex: 30106405, lte: new mongoose.Types.ObjectId('685ce0ac6808bd1490a2cf1f'), gt: new mongoose.Types.ObjectId('6855a659bdd1ec9535eab284') }
];

exports.getmanufacturers = async () => { return manufacturers; }

exports.getmanufacturerbyname = (type) => {
    const manufacturer = manufacturers.find(m => m.type === type);
    return manufacturer || null;
}


exports.getmanufacturerindex = (type) => {
    const manufacturer = manufacturers.find(m => m.type === type);
    return manufacturer ? manufacturer.index : null;
}


exports.getmanufacturerbylte = (lte) => {
    const manufacturer = manufacturers.find(m => m.lte.equals(lte));
    return manufacturer || null;
}


exports.getmanufacturerbyindex = (index) => {
    if (!index) return null;
    // if the index is below 7562500, return HBYX
    if (index <= 7562500) return { name: 'HBYX', type: 'hbyx', index: 7562500, gtindex: null, lte: new mongoose.Types.ObjectId('6855837ebdd1ec953592809f'), gt: null };
    else if (index <= 13282500 && index >= 7562500) return { name: 'DYTH', type: 'dyth', index: 13282500, gtindex: 7562500, lte: new mongoose.Types.ObjectId('68558c74bdd1ec9535e9d62a'), gt: new mongoose.Types.ObjectId('6855837ebdd1ec953592809f') };
    else if (index <= 30106030 && index >= 13282500) return { name: 'HBYX 48g', type: 'hbyx2', index: 30106030, gtindex: 13282500, lte: new mongoose.Types.ObjectId('6855a659bdd1ec9535eab284'), gt: new mongoose.Types.ObjectId('68558c74bdd1ec9535e9d62a') };
    else if (index <= 42341913 && index >= 30106030) return { name: 'AMX 48g', type: 'amx', index: 42341913, gtindex: 30106030, lte: new mongoose.Types.ObjectId('685ce0ac6808bd1490a2cf1f'), gt: new mongoose.Types.ObjectId('6855a659bdd1ec9535eab284') };
}