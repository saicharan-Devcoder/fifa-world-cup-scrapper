#!/usr/bin/env node
/**
 * Google Sheets API Client
 * Automatically appends FIFA World Cup data to Google Sheets
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

class GoogleSheetsClient {
    constructor(credentialsFile = 'credentials.json', tokenFile = 'token.json') {
        this.credentialsFile = credentialsFile;
        this.tokenFile = tokenFile;
        this.scopes = ['https://www.googleapis.com/auth/spreadsheets'];
        this.auth = null;
        this.sheets = null;
    }

    /**
     * Authenticate with Google Sheets API
     */
    async authenticate() {
        try {
            // Load existing token
            let token = null;
            if (fs.existsSync(this.tokenFile)) {
                token = JSON.parse(fs.readFileSync(this.tokenFile, 'utf8'));
            }

            // Load credentials
            if (!fs.existsSync(this.credentialsFile)) {
                console.error(`Error: ${this.credentialsFile} not found!`);
                console.log('Please download your OAuth 2.0 credentials from Google Cloud Console');
                console.log('and save them as "credentials.json"');
                return false;
            }

            const credentials = JSON.parse(fs.readFileSync(this.credentialsFile, 'utf8'));

            // Create OAuth2 client
            const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
            this.auth = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

            // Set credentials
            if (token) {
                this.auth.setCredentials(token);
            } else {
                // Get new token
                const authUrl = this.auth.generateAuthUrl({
                    access_type: 'offline',
                    scope: this.scopes,
                });

                console.log('Authorize this app by visiting this url:', authUrl);
                console.log('After authorization, you will be redirected to a URL with a code parameter.');
                console.log('Copy the code and paste it here:');

            
                const readline = require('readline');
                const rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout,
                });

                return new Promise((resolve) => {
                    rl.question('Enter the code: ', async (code) => {
                        try {
                            const { tokens } = await this.auth.getToken(code);
                            this.auth.setCredentials(tokens);
                            
                            fs.writeFileSync(this.tokenFile, JSON.stringify(tokens, null, 2));
                            console.log('Token saved to', this.tokenFile);
                            
                            rl.close();
                            resolve(true);
                        } catch (error) {
                            console.error('Error retrieving access token:', error);
                            rl.close();
                            resolve(false);
                        }
                    });
                });
            }

            this.sheets = google.sheets({ version: 'v4', auth: this.auth });
            return true;

        } catch (error) {
            console.error('Authentication error:', error.message);
            return false;
        }
    }

    /**
     * Append data to Google Sheets
     */
    async appendData(spreadsheetId, range, values) {
        if (!this.sheets) {
            console.log('Not authenticated. Please run authenticate() first.');
            return false;
        }

        try {
            const body = {
                majorDimension: 'ROWS',
                values: values
            };

            const result = await this.sheets.spreadsheets.values.append({
                spreadsheetId: spreadsheetId,
                range: range,
                valueInputOption: 'USER_ENTERED',
                resource: body
            });

            console.log(`Successfully appended ${result.data.updates.updatedRows} rows`);
            return true;

        } catch (error) {
            console.error('Error appending data:', error.message);
            return false;
        }
    }

    /**
     * Read data from Google Sheets
     */
    async readData(spreadsheetId, range) {
        if (!this.sheets) {
            console.log('Not authenticated. Please run authenticate() first.');
            return null;
        }

        try {
            const result = await this.sheets.spreadsheets.values.get({
                spreadsheetId: spreadsheetId,
                range: range
            });

            return result.data.values || [];

        } catch (error) {
            console.error('Error reading data:', error.message);
            return null;
        }
    }

    /**
     * Create a new spreadsheet
     */
    async createSpreadsheet(title) {
        if (!this.sheets) {
            console.log('Not authenticated. Please run authenticate() first.');
            return null;
        }

        try {
            const resource = {
                properties: {
                    title: title
                }
            };

            const spreadsheet = await this.sheets.spreadsheets.create({
                resource: resource,
                fields: 'spreadsheetId'
            });

            console.log(`Created spreadsheet: ${spreadsheet.data.spreadsheetId}`);
            return spreadsheet.data.spreadsheetId;

        } catch (error) {
            console.error('Error creating spreadsheet:', error.message);
            return null;
        }
    }
}

/**
 * Main function to demonstrate usage
 */
async function main() {
    const client = new GoogleSheetsClient();

    // Authenticate
    if (!(await client.authenticate())) {
        console.log('Authentication failed. Exiting...');
        return;
    }

    // Load the FIFA data
    let data;
    try {
        const fifaData = JSON.parse(fs.readFileSync('fifa_data.json', 'utf8'));
        data = fifaData;
    } catch (error) {
        console.log('fifa_data.json not found. Please run the scraper first.');
        console.log('Run: npm run scrape');
        return;
    }

    // Example usage - replace with your actual spreadsheet ID
    console.log(
        ' process.env.SPREADSHEET_ID',  process.env.SPREADSHEET_ID
    )
    const spreadsheetId = process.env.SPREADSHEET_ID || 'YOUR_SPREADSHEET_ID_HERE';
    const range = 'Sheet1!A:D';

    if (spreadsheetId === 'YOUR_SPREADSHEET_ID_HERE') {
        console.log('Please set your SPREADSHEET_ID environment variable or update the code with your actual spreadsheet ID');
        console.log('Example: SPREADSHEET_ID=your_actual_id node googleSheetsClient.js');
        return;
    }

    console.log('Appending FIFA World Cup data to Google Sheets...');
    const success = await client.appendData(spreadsheetId, range, data.values);

    if (success) {
        console.log('Data successfully appended to Google Sheets!');
    } else {
        console.log('Failed to append data to Google Sheets.');
    }
}

// Run the client if this file is executed directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = GoogleSheetsClient;
