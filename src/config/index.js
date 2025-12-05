module.exports = {
    googleSheets: {
        spreadsheetId: process.env.SPREADSHEET_ID,
        roomsSheetName: process.env.ROOMS_SHEET_NAME,
        usersSheetName: process.env.USERS_SHEET_NAME,
    },
    server: {
        port: process.env.PORT || 3000,
    },
    api: {
        key: process.env.API_KEY,
    },
};