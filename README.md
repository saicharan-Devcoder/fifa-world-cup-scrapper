# 🏆 FIFA World Cup Data Scraper

A Node.js application that extracts FIFA World Cup finals data from Wikipedia and appends it to Google Sheets using the Google Sheets API.

## 📋 Features

- **Web Scraping**: Extracts data from Wikipedia's "List of FIFA World Cup finals" table
- **Data Processing**: Formats data with columns: Year, Winner, Score, Runners-up
- **Google Sheets Integration**: Automatically appends data to Google Sheets
- **Multiple Output Formats**: Saves data as JSON and CSV files
- **Postman Ready**: Provides detailed API request information for manual testing

## 🚀 Quick Start

### 1. Installation

```bash
# Clone or download the project
cd fifa-world-cup-scraper

# Install dependencies
npm install
```

### 2. Google Sheets API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Sheets API
4. Create OAuth 2.0 credentials:
   - Go to "Credentials" → "Create Credentials" → "OAuth client ID"
   - Choose "Web application"
   - Add redirect URI: `http://localhost:3000` (for local development)
   - Download the credentials JSON file
   - Rename it to `credentials.json` and place in project root

### 3. Run the Application

```bash
# Scrape data only (saves to JSON and CSV)
npm run scrape

# Scrape and upload to Google Sheets (requires credentials.json)
node index.js YOUR_SPREADSHEET_ID

# Using environment variable
SPREADSHEET_ID=your_spreadsheet_id node index.js
```

## 📁 Project Structure

```
├── index.js                 # Main entry point
├── scraper.js              # Wikipedia scraping logic
├── googleSheetsClient.js   # Google Sheets API client
├── package.json            # Dependencies and scripts
├── README.md              # This file
├── credentials.json       # Google OAuth credentials (you need to add this)
└── token.json            # OAuth token (auto-generated)
```

## 🔧 Usage Examples

### Basic Data Scraping

```bash
# Extract data from Wikipedia
node scraper.js
```

This will:
- Fetch the Wikipedia page
- Extract the first 10 rows of FIFA World Cup finals
- Save data to `fifa_data.json` and `fifa_data.csv`
- Display Google Sheets API request details

### Upload to Google Sheets

```bash
# Upload existing data to Google Sheets
node googleSheetsClient.js
```

### Complete Workflow

```bash
# Scrape and upload in one command
node index.js 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
```

## 📊 Data Format

The scraper extracts data in the following format:

```json
{
  "majorDimension": "ROWS",
  "values": [
    ["Year", "Winner", "Score", "Runners-up"],
    ["1930", "Uruguay", "4–2", "Argentina"],
    ["1934", "Italy", "2–1", "Czechoslovakia"],
    // ... more rows
  ]
}
```

## 🔌 Google Sheets API Details

### Manual API Request (Postman)

**URL:**
```
POST https://sheets.googleapis.com/v4/spreadsheets/{SPREADSHEET_ID}/values/Sheet1!A:D:append?valueInputOption=USER_ENTERED
```

**Headers:**
```
Authorization: Bearer {ACCESS_TOKEN}
Content-Type: application/json
```

**Body:**
```json
{
  "majorDimension": "ROWS",
  "values": [
    ["Year", "Winner", "Score", "Runners-up"],
    ["1930", "Uruguay", "4–2", "Argentina"],
    ["1934", "Italy", "2–1", "Czechoslovakia"]
  ]
}
```

### OAuth 2.0 Setup for Postman

1. **Auth URL:** `https://accounts.google.com/o/oauth2/v2/auth`
2. **Access Token URL:** `https://oauth2.googleapis.com/token`
3. **Scope:** `https://www.googleapis.com/auth/spreadsheets`
4. **Redirect URI:** `https://oauth.pstmn.io/v1/callback`
5. **Client Authentication:** Send as Basic Auth header

## 🛠️ Dependencies

- **axios**: HTTP client for web requests
- **cheerio**: Server-side jQuery implementation for HTML parsing
- **googleapis**: Official Google APIs client library
- **fs**: File system operations
- **path**: Path utilities

## 📝 Scripts

```bash
npm start              # Run main application
npm run scrape         # Scrape data only
npm run sheets         # Upload to Google Sheets
```

## 🔍 Troubleshooting

### Common Issues

1. **"credentials.json not found"**
   - Download OAuth credentials from Google Cloud Console
   - Save as `credentials.json` in project root

2. **"Authentication failed"**
   - Check your OAuth credentials
   - Ensure Google Sheets API is enabled
   - Verify redirect URIs match

3. **"No data extracted"**
   - Wikipedia page structure may have changed
   - Check internet connection
   - Verify the URL is accessible

4. **"Spreadsheet not found"**
   - Verify the spreadsheet ID is correct
   - Ensure you have edit permissions
   - Check if the spreadsheet exists

### Debug Mode

Enable detailed logging by setting:
```bash
DEBUG=* node index.js
```

## 📈 Sample Output

```
🚀 Starting FIFA World Cup Data Extraction and Upload...

📊 Step 1: Scraping data from Wikipedia...
✅ Successfully extracted 10 rows of data

📝 Step 2: Formatting data for Google Sheets...
✅ Data formatted successfully

💾 Step 3: Saving data to local files...
Data saved to fifa_data.json
Data saved to fifa_data.csv
✅ Data saved to local files

🔐 Step 4: Authenticating with Google Sheets...
✅ Authentication successful

📤 Step 5: Appending data to Google Sheets...
Successfully appended 10 rows
✅ Data successfully appended to Google Sheets!

🎉 Workflow completed successfully!
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review Google Sheets API documentation
3. Open an issue on GitHub

---

**Note**: This tool is for educational purposes. Please respect Wikipedia's terms of service and rate limits when scraping data.
