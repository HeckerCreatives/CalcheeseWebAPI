const allowedChars = "ACDEFHJKLMNPRTUVXWY379";

// Helper to rotate allowedChars for each group
function getGroupChars(group) {
    return allowedChars.slice(group) + allowedChars.slice(0, group);
}

function indexToComplexCode(index, length = 9) {
    const groupLength = 3;
    let codeGroups = [];
    const base = allowedChars.length;

    for (let group = 0; group < 3; group++) {
        let groupChars = getGroupChars(group); // Rotated for each group
        let groupCode = '';
        let groupIndex = index % Math.pow(base, groupLength);
        index = Math.floor(index / Math.pow(base, groupLength));

        for (let i = 0; i < groupLength; i++) {
            groupCode = groupChars[groupIndex % base] + groupCode;
            groupIndex = Math.floor(groupIndex / base);
        }
        codeGroups.unshift(groupCode);
    }
    return codeGroups.join(''); // <-- No hyphens
}

exports.getNextCode = (lastCode, length = 9) => {
    if (!lastCode) return indexToComplexCode(0, length);

    // Convert lastCode to index
    const groupLength = 3;
    const base = allowedChars.length;
    let index = 0;
    let codeParts = [
        lastCode.slice(0, 3),
        lastCode.slice(3, 6),
        lastCode.slice(6, 9)
    ];
    for (let group = 0; group < 3; group++) {
        let groupChars = getGroupChars(group);
        let part = codeParts[group];
        let partIndex = 0;
        for (let i = 0; i < groupLength; i++) {
            partIndex *= base;
            partIndex += groupChars.indexOf(part[i]);
        }
        index = index * Math.pow(base, groupLength) + partIndex;
    }
    // Increment index for next code
    return indexToComplexCode(index + 1, length);
};