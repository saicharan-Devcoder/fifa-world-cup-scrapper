
/**
 * Simple FIFA World Cup Finals Data Scraper
 * Uses only built-in Node.js modules to avoid dependency issues
 */

const https = require('https');
const fs = require('fs');

class SimpleFIFAScraper {
    constructor() {
        this.url = 'https://en.wikipedia.org/wiki/List_of_FIFA_World_Cup_finals';
    }

    async fetchWikipediaPage() {
        return new Promise((resolve, reject) => {
            console.log('Fetching FIFA World Cup finals data from Wikipedia...');
            
            const options = {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            };

            https.get(this.url, options, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    resolve(data);
                });
            }).on('error', (err) => {
                console.error('Error fetching Wikipedia page:', err.message);
                reject(err);
            });
        });
    }

    /**
     * Simple HTML parser to extract table data
     */
    parseTableData(html) {
        // Find the specific table with class "sortable plainrowheaders wikitable jquery-tablesorter"
        const tableMatch = html.match(/<table[^>]*class="[^"]*sortable[^"]*plainrowheaders[^"]*wikitable[^"]*"[^>]*>[\s\S]*?<\/table>/i);
        
        if (!tableMatch) {
            console.log('Could not find the FIFA World Cup finals table');
            return [];
        }

        const tableHtml = tableMatch[0];
        console.log('Found FIFA World Cup finals table');

        // Extract rows from tbody (skip thead)
        const tbodyMatch = tableHtml.match(/<tbody>([\s\S]*?)<\/tbody>/i);
        if (!tbodyMatch) {
            console.log('Could not find tbody in table');
            return [];
        }

        const tbodyHtml = tbodyMatch[1];
        const rowMatches = tbodyHtml.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi);
        
        if (!rowMatches || rowMatches.length === 0) {
            console.log('No data rows found in table');
            return [];
        }

        console.log(`Found ${rowMatches.length} data rows`);

        // Extract first 10 data rows
        const dataRows = [];
        let processedCount = 0;
        const maxRows = 10;

        for (let i = 0; i < rowMatches.length && processedCount < maxRows; i++) {
            const rowHtml = rowMatches[i];
            
            // Extract cells from the row - look for both th and td elements
            const cellMatches = rowHtml.match(/<t[hd][^>]*>[\s\S]*?<\/t[hd]>/gi);
            
            if (cellMatches && cellMatches.length >= 4) {
                const cells = cellMatches.map(cell => {
                    let cellText = cell.replace(/<[^>]*>/g, '').trim();
                    // Remove reference numbers [1], [2], etc.
                    cellText = cellText.replace(/\[.*?\]/g, '');
                    // Clean up HTML entities
                    cellText = cellText.replace(/&#160;/g, ' '); // Non-breaking space
                    cellText = cellText.replace(/&#91;/g, '['); // Left bracket
                    cellText = cellText.replace(/&#93;/g, ']'); // Right bracket
                    // Clean up extra whitespace
                    cellText = cellText.replace(/\s+/g, ' ').trim();
                    return cellText;
                });

                // Check if this looks like a valid FIFA World Cup final row
                // Should have a year in the first cell
                if (cells[0] && cells[0].match(/\b(19|20)\d{2}\b/)) {
                    const rowData = {
                        year: cells[0] || '',
                        winner: cells[1] || '',
                        score: cells[2] || '',
                        runners_up: cells[3] || ''
                    };

                    dataRows.push(rowData);
                    processedCount++;
                    console.log(`Row ${processedCount}: ${rowData.year} - ${rowData.winner} vs ${rowData.runners_up} (${rowData.score})`);
                }
            }
        }

        return dataRows;
    }

    /**
     * Format data for Google Sheets API
     */
    formatForGoogleSheets(data) {
        const headers = ['Year', 'Winner', 'Score', 'Runners-up'];
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
     * Save data to JSON file
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
            const html = await this.fetchWikipediaPage();
            
            // Parse table data
            const tableData = this.parseTableData(html);
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
    const scraper = new SimpleFIFAScraper();
    scraper.run();
}

module.exports = SimpleFIFAScraper;
