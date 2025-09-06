
/**
 * FIFA World Cup Finals Data Scraper
 * Extracts data from Wikipedia and prepares it for Google Sheets API
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

class FIFAWorldCupScraper {
    constructor() {
        this.url = 'https://en.wikipedia.org/wiki/List_of_FIFA_World_Cup_finals';
        this.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        };
    }

    /**
     * Fetch the Wikipedia page content
     */
    async fetchWikipediaPage() {
        try {
            console.log('Fetching FIFA World Cup finals data from Wikipedia...');
            const response = await axios.get(this.url, { headers: this.headers });
            return cheerio.load(response.data);
        } catch (error) {
            console.error('Error fetching Wikipedia page:', error.message);
            return null;
        }
    }

    /**
     * Extract FIFA World Cup finals data from the Wikipedia table
     */
    extractTableData($) {
        // Find all tables with class 'wikitable'
        const tables = $('table.wikitable');
        let targetTable = null;

        tables.each((index, table) => {
            const $table = $(table);
            const firstRow = $table.find('tr').first();
            const hasYearColumn = firstRow.find('th, td').text().toLowerCase().includes('year');
            const hasFinalColumn = firstRow.find('th, td').text().toLowerCase().includes('final');
            
            if (hasYearColumn || hasFinalColumn) {
                targetTable = $table;
                return false; // Break out of the loop
            }
        });

        if (!targetTable || targetTable.length === 0) {
            console.log('Could not find the FIFA World Cup finals table');
            return [];
        }

        // Extract table headers
        const headers = [];
        const headerRow = targetTable.find('tr').first();
        headerRow.find('th, td').each((index, cell) => {
            const headerText = $(cell).text().trim();
            headers.push(headerText);
        });

        console.log('Found headers:', headers);

        // Extract first 10 rows of data
        const dataRows = [];
        const rows = targetTable.find('tr').slice(1, 11); // Skip header, take first 10 data rows

        rows.each((rowIndex, row) => {
            const $row = $(row);
            const cells = $row.find('td, th');
            
            if (cells.length >= 4) { // Ensure we have at least 4 columns
                const rowData = {};
                
                cells.each((cellIndex, cell) => {
                    if (cellIndex < headers.length) {
                        let cellText = $(cell).text().trim();
                        // Clean up the text - remove reference numbers [1], [2], etc.
                        cellText = cellText.replace(/\[.*?\]/g, '');
                        rowData[headers[cellIndex]] = cellText;
                    }
                });

                // Map to our required columns
                if (Object.keys(rowData).length >= 4) {
                    const mappedData = {
                        year: rowData[headers[0]] || '',
                        winner: rowData[headers[1]] || '',
                        score: rowData[headers[2]] || '',
                        runners_up: rowData[headers[3]] || ''
                    };
                    dataRows.push(mappedData);
                }
            }
        });

        return dataRows;
    }

    /**
     * Format data for Google Sheets API
     */
    formatForGoogleSheets(data) {
        // Create header row
        const headers = ['Year', 'Winner', 'Score', 'Runners-up'];
        
        // Create data rows
        const values = [headers];
        data.forEach(row => {
            values.push([
                row.year || '',
                row.winner || '',
                row.score || '',
                row.runners_up || ''
            ]);
        });

        return {
            majorDimension: 'ROWS',
            values: values
        };
    }

    /**
     * Save data to JSON file for manual API testing
     */
    saveToJson(data, filename = 'fifa_data.json') {
        try {
            fs.writeFileSync(filename, JSON.stringify(data, null, 2), 'utf8');
            console.log(`Data saved to ${filename}`);
        } catch (error) {
            console.error('Error saving JSON file:', error.message);
        }
    }

    /**
     * Save data to CSV file
     */
    saveToCsv(data, filename = 'fifa_data.csv') {
        try {
            const headers = ['Year', 'Winner', 'Score', 'Runners-up'];
            let csvContent = headers.join(',') + '\n';
            
            data.forEach(row => {
                const csvRow = [
                    `"${row.year || ''}"`,
                    `"${row.winner || ''}"`,
                    `"${row.score || ''}"`,
                    `"${row.runners_up || ''}"`
                ].join(',');
                csvContent += csvRow + '\n';
            });
            
            fs.writeFileSync(filename, csvContent, 'utf8');
            console.log(`Data saved to ${filename}`);
        } catch (error) {
            console.error('Error saving CSV file:', error.message);
        }
    }

    /**
     * Display the Google Sheets API request details
     */
    displayApiDetails(data) {
        console.log('\n' + '='.repeat(60));
        console.log('GOOGLE SHEETS API REQUEST DETAILS');
        console.log('='.repeat(60));
        
        console.log('\n1. POST Request URL:');
        console.log('https://sheets.googleapis.com/v4/spreadsheets/{SPREADSHEET_ID}/values/Sheet1!A:D:append?valueInputOption=USER_ENTERED');
        console.log('   (Replace {SPREADSHEET_ID} with your actual Google Sheet ID)');
        
        console.log('\n2. Headers:');
        console.log('Authorization: Bearer {ACCESS_TOKEN}');
        console.log('Content-Type: application/json');
        
        console.log('\n3. Request Body:');
        console.log(JSON.stringify(data, null, 2));
        
        console.log('\n4. Authentication Setup:');
        console.log('- Go to Google Cloud Console');
        console.log('- Enable Google Sheets API');
        console.log('- Create OAuth 2.0 credentials');
        console.log('- Use these scopes: https://www.googleapis.com/auth/spreadsheets');
        console.log('- For Postman, use redirect URI: https://oauth.pstmn.io/v1/callback');
        
        console.log('\n5. Postman OAuth 2.0 Configuration:');
        console.log('Auth URL: https://accounts.google.com/o/oauth2/v2/auth');
        console.log('Access Token URL: https://oauth2.googleapis.com/token');
        console.log('Scope: https://www.googleapis.com/auth/spreadsheets');
        console.log('Client Authentication: Send as Basic Auth header');
    }

    /**
     * Main execution method
     */
    async run() {
        try {
            // Fetch the page
            const $ = await this.fetchWikipediaPage();
            if (!$) {
                return;
            }

            // Extract table data
            const tableData = this.extractTableData($);
            if (tableData.length === 0) {
                console.log('No data extracted from the table');
                return;
            }

            console.log(`Extracted ${tableData.length} rows of data`);

            // Display the extracted data
            console.log('\nExtracted Data:');
            tableData.forEach((row, index) => {
                console.log(`${index + 1}. ${row.year} - ${row.winner} vs ${row.runners_up} (${row.score})`);
            });

            // Format for Google Sheets
            const googleSheetsData = this.formatForGoogleSheets(tableData);

            // Save to files
            this.saveToJson(googleSheetsData);
            this.saveToCsv(tableData);

            // Display Google Sheets API request details
            this.displayApiDetails(googleSheetsData);

        } catch (error) {
            console.error('Error in main execution:', error.message);
        }
    }
}

// Run the scraper if this file is executed directly
if (require.main === module) {
    const scraper = new FIFAWorldCupScraper();
    scraper.run();
}

module.exports = FIFAWorldCupScraper;
