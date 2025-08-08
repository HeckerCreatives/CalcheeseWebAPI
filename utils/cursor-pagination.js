



// function getPaginationWindow(currentPage, totalPages) {
//     let startPage, endPage;
//     if (currentPage <= 5) {
//         startPage = 1;
//         endPage = Math.min(10, totalPages);
//     } else {
//         startPage = currentPage - 4;
//         endPage = Math.min(currentPage + 5, totalPages);
//         if (endPage - startPage < 9) {
//             startPage = Math.max(1, endPage - 9);
//         }
//     }
//     const pageNumbers = [];
//     for (let i = startPage; i <= endPage; i++) {
//         pageNumbers.push(i);
//     }
//     return pageNumbers;
// }



const Code = require("../models/Code");

async function cursorbasedpagination(currentpage, limit, filter = {}) {
    const totalDocs = await Code.countDocuments(filter);
    const totalPages = Math.ceil(totalDocs / limit);
    
    // Calculate pagination window
    let startPage, endPage;
    if (currentpage <= 5) {
        startPage = 1;
        endPage = Math.min(10, totalPages);
    } else {
        startPage = currentpage - 4;
        endPage = Math.min(currentpage + 5, totalPages);
        if (endPage - startPage < 9) {
            startPage = Math.max(1, endPage - 9);
        }
    }
    
    // Get all _ids for the entire window in one efficient query
    const windowSize = (endPage - startPage + 1) * limit;
    const allCodes = await Code.find(filter)
        .sort({ _id: 1 })
        .limit(windowSize)
        .select('_id')
        .lean();
    
    // Build page cursors from the result
    const pageWindow = [];
    for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
        const indexInWindow = (pageNum - startPage) * limit;
        
        if (pageNum === 1) {
            // First page - no cursor needed
            pageWindow.push({ page: pageNum, cursor: null });
        } else if (allCodes[indexInWindow]) {
            // Use the _id from our batch result
            pageWindow.push({ page: pageNum, cursor: allCodes[indexInWindow]._id });
        }
    }
    
    return {
        pageWindow,
        totalPages,
        totalDocs,
        currentPage: currentpage
    };
}

module.exports = { cursorbasedpagination };