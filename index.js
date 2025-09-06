#!/usr/bin/env node
/**
 * Main entry point for FIFA World Cup Data Scraper
 * Combines scraping and Google Sheets functionality
 */

const FIFAWorldCupScraper = require('./scraper');
const GoogleSheetsClient = require('./googleSheetsClient');
const fs = require('fs');
const dotenv=require('dotenv').config();


class FIFAWorldCupApp {
    constructor() {
        this.scraper = new FIFAWorldCupScraper();
        this.sheetsClient = new GoogleSheetsClient();
    }

    /**
     * Run the complete workflow: scrape data and append to Google Sheets
     */
    async runCompleteWorkflow(spreadsheetId) {
        try {
            console.log('Starting FIFA World Cup Data Extraction and Upload...\n');

            // Step 1: Scrape data from Wikipedia
            console.log('Step 1: Scraping data from Wikipedia...');
            const $ = await this.scraper.fetchWikipediaPage();
            if (!$) {
                console.log('Failed to fetch Wikipedia page');
                return;
            }

            const tableData = this.scraper.extractTableData($);
            if (tableData.length === 0) {
                console.log('No data extracted from the table');
                return;
            }

            console.log(`Successfully extracted ${tableData.length} rows of data\n`);

            // Step 2: Format data for Google Sheets
            console.log('Step 2: Formatting data for Google Sheets...');
            const googleSheetsData = this.scraper.formatForGoogleSheets(tableData);
            console.log('Data formatted successfully\n');

            // Step 3: Save data to files
            console.log('Step 3: Saving data to local files...');
            this.scraper.saveToJson(googleSheetsData);
            this.scraper.saveToCsv(tableData);
            console.log('Data saved to local files\n');

            // Step 4: Authenticate with Google Sheets
            console.log('Step 4: Authenticating with Google Sheets...');
            const authSuccess = await this.sheetsClient.authenticate();
            if (!authSuccess) {
                console.log('Authentication failed');
                return;
            }
            console.log('Authentication successful\n');

            // Step 5: Append data to Google Sheets
            if (spreadsheetId && spreadsheetId !== 'YOUR_SPREADSHEET_ID_HERE') {
                console.log('Step 5: Appending data to Google Sheets...');
                const appendSuccess = await this.sheetsClient.appendData(
                    spreadsheetId, 
                    'Sheet1!A:D', 
                    googleSheetsData.values
                );

                if (appendSuccess) {
                    console.log('Data successfully appended to Google Sheets!');
                } else {
                    console.log('Failed to append data to Google Sheets');
                }
            } else {
                console.log('Step 5: Skipping Google Sheets upload (no spreadsheet ID provided)');
                console.log('   To upload to Google Sheets, set SPREADSHEET_ID environment variable');
                console.log('   Example: SPREADSHEET_ID=your_id node index.js');
            }

            console.log('\n Workflow completed successfully!');
            console.log('\n Summary:');
            console.log(`   - Extracted ${tableData.length} FIFA World Cup finals records`);
            console.log('   - Data saved to fifa_data.json and fifa_data.csv');
            console.log('   - Ready for Google Sheets API integration');

        } catch (error) {
            console.error('Error in workflow:', error.message);
        }
    }

    /**
     * Display help information
     */
    displayHelp() {
        console.log('FIFA World Cup Data Scraper');
        console.log('================================\n');
        console.log('Usage:');
        console.log('  node index.js                    # Scrape data only');
        console.log('  node index.js <spreadsheet_id>   # Scrape and upload to Google Sheets');
        console.log('  node scraper.js                  # Scrape data only');
        console.log('  node googleSheetsClient.js       # Upload existing data to Google Sheets\n');
        console.log('Environment Variables:');
        console.log('  SPREADSHEET_ID - Your Google Sheets ID for automatic upload\n');
        console.log('Setup:');
        console.log('  1. Run: npm install');
        console.log('  2. Download Google OAuth credentials as "credentials.json"');
        console.log('  3. Run: node index.js');
    }
}

// Main execution
async function main() {
    const app = new FIFAWorldCupApp();
    const args = process.argv.slice(2);

    if (args.includes('--help') || args.includes('-h')) {
        app.displayHelp();
        return;
    }

    // Get spreadsheet ID from command line or environment
    const spreadsheetId = args[0] || process.env.SPREADSHEET_ID || 'YOUR_SPREADSHEET_ID_HERE';

    await app.runCompleteWorkflow(spreadsheetId);
}

// Run if this file is executed directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = FIFAWorldCupApp;
