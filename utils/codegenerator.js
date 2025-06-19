// const allowedChars = "ACDEFHJKLMNPRTUVXWY379";
// const crypto = require('crypto');

// function getNextCode(index, length = 9) {
//     if (length < 7 || length > 12) throw new Error("Code length must be between 7 and 12");

//     // Create a hash from the index
//     const hash = crypto.createHash('sha256').update(index.toString()).digest('hex');

//     let code = '';
//     for (let i = 0; i < length; i++) {
//         // Use two hex digits at a time to get a number
//         const hexPair = hash.substr(i * 2, 2);
//         const num = parseInt(hexPair, 16);
//         code += allowedChars[num % allowedChars.length];
//     }
//     return code;
// }

// module.exports = { getNextCode };

const allowedChars = "ACDEFHJKLMNPRTUVXWY379";

// Simple seeded pseudo-random generator (Mulberry32)
function mulberry32(seed) {
    return function() {
        let t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

// Shuffle an array using a seeded PRNG
function shuffle(array, rand) {
    let arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function indexToComplexCode(index, length) {
    if (length < 7 || length > 12) throw new Error("Code length must be between 7 and 12");

    // Use index as seed for PRNG
    const rand = mulberry32(index);

    // Shuffle allowedChars for this code
    const shuffledChars = shuffle(allowedChars.split(''), rand);

    // Pick the required number of characters from the shuffled array
    let code = '';
    for (let i = 0; i < length; i++) {
        code += shuffledChars[i];
    }

    return code;
}

exports.getNextCode = (index, length ) => {

    if (typeof index !== 'number') return indexToComplexCode(0, length);
    return indexToComplexCode(index + 1, length);
};