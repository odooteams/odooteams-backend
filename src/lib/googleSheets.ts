
/**
 * Utility functions for fetching data from Google Sheets
 */

/**
 * Fetch data from Google Sheets using the Google Sheets API
 * 
 * @param apiKey - Google API Key
 * @param spreadsheetId - ID of the Google Spreadsheet
 * @param sheetName - Name of the sheet to fetch data from
 * @returns - Promise that resolves to the sheet data
 */
export async function fetchSheetData(apiKey: string, spreadsheetId: string, sheetName: string) {
  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}?key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return processSheetData(data.values);
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    throw error;
  }
}

/**
 * Process the raw sheet data by converting rows to objects with column headers as keys
 * 
 * @param values - Raw values from the sheet
 * @returns - Processed sheet data as an array of objects
 */
function processSheetData(values: string[][]) {
  if (!values || values.length === 0) {
    return [];
  }

  const headers = values[0];
  const rows = values.slice(1);

  return rows.map(row => {
    const obj: Record<string, string> = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] || '';
    });
    return obj;
  });
}

// Google Sheets configuration
export const GOOGLE_SHEETS_CONFIG = {
  API_KEY: 'AIzaSyAXjI2Rt9WIZCY6FJeyV3IMRecFB6SOjRk',
  SPREADSHEET_ID: '1TRUeWEKBY7L-htPsD7T3-VETj_i2ARPL25ixkrJtA98',
  SHEETS: {
    TEAM: 'team',
    CONTACT: 'contact',
    LEARN: 'learn',
    REVIEWS: 'reviews',
    FAQ: 'faq',
    TIMELINE: 'timeline',
    SLIDER: 'slider',
    CHATBOT: 'chatbot'
  }
};
