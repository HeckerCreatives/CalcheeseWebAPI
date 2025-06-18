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

function indexToComplexCode(index, length = 9) {
    const groupLength = 3;
    const totalChars = groupLength * 3;
    if (length !== totalChars) throw new Error("Code length must be 9 (3 groups of 3)");

    // Use index as seed for PRNG
    const rand = mulberry32(index);

    // Shuffle allowedChars for this code
    const shuffledChars = shuffle(allowedChars.split(''), rand);

    // Pick 9 characters from the shuffled array
    let codeChars = [];
    for (let i = 0; i < totalChars; i++) {
        codeChars.push(shuffledChars[i]);
    }

    // Group into 3 groups of 3
    const codeGroups = [
        codeChars.slice(0, 3).join(''),
        codeChars.slice(3, 6).join(''),
        codeChars.slice(6, 9).join('')
    ];

    return codeGroups.join('-');
}

exports.getNextCode = (index, length = 9) => {
    if (typeof index !== 'number') return indexToComplexCode(0, length);
    return indexToComplexCode(index + 1, length);
};