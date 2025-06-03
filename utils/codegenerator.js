exports.generateRandomString = (length) => {
    let result = '';
    const chars = 'ACDEFHJKLMNPRTUVXWY379';
    const charsLength = chars.length;
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * charsLength));
    }
    return result;
}