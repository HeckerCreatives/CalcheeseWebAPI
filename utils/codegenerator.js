const allowedChars = "ACDEFHJKLMNPRTUVXWY379";
const crypto = require('crypto');

function getNextCode(index, length = 9) {
    if (length < 7 || length > 12) throw new Error("Code length must be between 7 and 12");

    // Create a hash from the index
    const hash = crypto.createHash('sha256').update(index.toString()).digest('hex');

    let code = '';
    for (let i = 0; i < length; i++) {
        // Use two hex digits at a time to get a number
        const hexPair = hash.substr(i * 2, 2);
        const num = parseInt(hexPair, 16);
        code += allowedChars[num % allowedChars.length];
    }
    return code;
}

module.exports = { getNextCode };