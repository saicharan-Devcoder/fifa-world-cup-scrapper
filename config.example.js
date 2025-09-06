/**
 * Configuration example for FIFA World Cup Scraper
 * Copy this file to config.js and update with your values
 */

module.exports = {
    // Google Sheets Configuration
    spreadsheetId: 'your_google_sheets_id_here',
    sheetRange: 'Sheet1!A:D',
    
    // Output file names
    outputJson: 'fifa_data.json',
    outputCsv: 'fifa_data.csv',
    
    // Wikipedia URL (usually no need to change)
    wikipediaUrl: 'https://en.wikipedia.org/wiki/List_of_FIFA_World_Cup_finals',
    
    // Number of rows to extract (default: 10)
    maxRows: 10,
    
    // Google Sheets API scopes
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    
    // Credentials file names
    credentialsFile: 'credentials.json',
    tokenFile: 'token.json'
};
