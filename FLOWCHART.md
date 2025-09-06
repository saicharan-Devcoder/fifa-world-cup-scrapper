# FIFA World Cup Data Extraction and Google Sheets Integration Flowchart

## Process Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           FIFA World Cup Data Extraction Process                │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 1. START: Initialize FIFA World Cup Scraper                                     │
│    - Set Wikipedia URL: https://en.wikipedia.org/wiki/List_of_FIFA_World_Cup_finals │
│    - Configure User-Agent headers for web scraping                             │
│    - Set target: Extract first 10 rows with Year, Winner, Score, Runners-up    │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 2. FETCH: Request Wikipedia Page                                                │
│    - Use HTTPS GET request to Wikipedia                                        │
│    - Handle response and error cases                                           │
│    - Return HTML content                                                       │
│    - Input: Wikipedia URL                                                      │
│    - Output: Raw HTML content                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 3. PARSE: Extract Table Data                                                   │
│    - Find table with class "sortable plainrowheaders wikitable jquery-tablesorter" │
│    - Extract tbody section (skip thead)                                       │
│    - Process each row in tbody                                                │
│    - Input: HTML content                                                       │
│    - Output: Array of table rows                                              │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 4. CLEAN: Process Cell Data                                                    │
│    - Remove HTML tags from each cell                                          │
│    - Clean HTML entities (&#160;, &#91;, &#93;)                              │
│    - Remove reference numbers [1], [2], etc.                                  │
│    - Normalize whitespace                                                     │
│    - Input: Raw cell content                                                  │
│    - Output: Cleaned text content                                             │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 5. VALIDATE: Check Row Validity                                                │
│    - Verify first cell contains 4-digit year (1930-2022)                      │
│    - Ensure row has at least 4 columns                                        │
│    - Count valid rows (stop at 10)                                            │
│    - Input: Processed row data                                                │
│    - Output: Validated row data                                               │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 6. MAP: Structure Data                                                          │
│    - Map to required columns: Year, Winner, Score, Runners-up                  │
│    - Create structured data objects                                           │
│    - Input: Validated cell data                                               │
│    - Output: Structured data objects                                          │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 7. FORMAT: Prepare for Google Sheets                                           │
│    - Create header row: ["Year", "Winner", "Score", "Runners-up"]             │
│    - Format data rows as arrays                                               │
│    - Set majorDimension to "ROWS"                                             │
│    - Input: Structured data objects                                           │
│    - Output: Google Sheets API format                                         │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 8. SAVE: Export Data Files                                                     │
│    - Save to fifa_data.json (Google Sheets format)                            │
│    - Save to fifa_data.csv (human-readable format)                            │
│    - Display extracted data summary                                           │
│    - Input: Formatted data                                                    │
│    - Output: JSON and CSV files                                               │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 9. AUTHENTICATE: Google Sheets API Setup                                       │
│    - Load OAuth 2.0 credentials from credentials.json                         │
│    - Check for existing token in token.json                                   │
│    - If no token, initiate OAuth flow                                         │
│    - Save token for future use                                                │
│    - Input: OAuth credentials                                                 │
│    - Output: Authenticated API client                                         │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 10. UPLOAD: Append to Google Sheets                                            │
│     - Use Google Sheets API v4                                                 │
│     - POST to: /v4/spreadsheets/{ID}/values/{range}:append                     │
│     - Set valueInputOption to "USER_ENTERED"                                   │
│     - Include Authorization header with Bearer token                          │
│     - Input: Formatted data + Spreadsheet ID                                  │
│     - Output: Success confirmation + row count                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 11. COMPLETE: Verify Success                                                   │
│     - Check API response for success                                           │
│     - Display number of rows appended                                          │
│     - Show completion status                                                   │
│     - Input: API response                                                      │
│     - Output: Success/failure status                                           │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Google Sheets API Request Details

### Authentication Setup
1. **Google Cloud Console Setup:**
   - Go to https://console.cloud.google.com/
   - Create new project or select existing
   - Enable Google Sheets API
   - Create OAuth 2.0 credentials
   - Download credentials as `credentials.json`

2. **OAuth 2.0 Configuration:**
   - **Auth URL:** `https://accounts.google.com/o/oauth2/v2/auth`
   - **Access Token URL:** `https://oauth2.googleapis.com/token`
   - **Scope:** `https://www.googleapis.com/auth/spreadsheets`
   - **Redirect URI:** `https://oauth.pstmn.io/v1/callback` (for Postman)
   - **Client Authentication:** Send as Basic Auth header

### API Request Format

**Method:** POST

**URL:**
```
https://sheets.googleapis.com/v4/spreadsheets/{SPREADSHEET_ID}/values/Sheet1!A:D:append?valueInputOption=USER_ENTERED
```

**Headers:**
```
Authorization: Bearer {ACCESS_TOKEN}
Content-Type: application/json
```

**Request Body:**
```json
{
  "majorDimension": "ROWS",
  "values": [
    ["Year", "Winner", "Score", "Runners-up"],
    ["1930", "Uruguay", "4–2", "Argentina"],
    ["1934", "Italy", "2–1 (a.e.t.)", "Czechoslovakia"],
    ["1938", "Italy", "4–2", "Hungary"],
    ["1950", "Uruguay", "2–1[n 3]", "Brazil"],
    ["1954", "West Germany", "3–2", "Hungary"],
    ["1958", "Brazil", "5–2", "Sweden"],
    ["1962", "Brazil", "3–1", "Czechoslovakia"],
    ["1966", "England", "4–2 (a.e.t.)", "West Germany"],
    ["1970", "Brazil", "4–1", "Italy"],
    ["1974", "West Germany", "2–1", "Netherlands"]
  ]
}
```

## Error Handling

- **Network Errors:** Retry mechanism for failed requests
- **Parsing Errors:** Fallback to alternative table detection
- **Authentication Errors:** Clear instructions for OAuth setup
- **API Errors:** Detailed error messages with troubleshooting steps

## Output Files

1. **fifa_data.json:** Google Sheets API ready format
2. **fifa_data.csv:** Human-readable CSV format
3. **Console Output:** Step-by-step progress and API details

## Sample Extracted Data

| Year | Winner | Score | Runners-up |
|------|--------|-------|------------|
| 1930 | Uruguay | 4–2 | Argentina |
| 1934 | Italy | 2–1 (a.e.t.) | Czechoslovakia |
| 1938 | Italy | 4–2 | Hungary |
| 1950 | Uruguay | 2–1[n 3] | Brazil |
| 1954 | West Germany | 3–2 | Hungary |
| 1958 | Brazil | 5–2 | Sweden |
| 1962 | Brazil | 3–1 | Czechoslovakia |
| 1966 | England | 4–2 (a.e.t.) | West Germany |
| 1970 | Brazil | 4–1 | Italy |
| 1974 | West Germany | 2–1 | Netherlands |

## Implementation Notes

- **Table Structure:** The Wikipedia table uses `th` elements for the year column and `td` elements for other columns
- **Data Cleaning:** HTML entities and reference numbers are removed for clean data
- **Validation:** Only rows with valid 4-digit years are processed
- **Limitation:** Extracts exactly 10 rows as specified in requirements
