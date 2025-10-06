
import { fetchSheetData, GOOGLE_SHEETS_CONFIG } from './googleSheets';

export interface LearnResource {
  id: string;
  Category_en: string;
  Category_ar: string;
  mainheaders_en: string;
  mainheaders_ar: string;
  Title_en: string;
  Title_ar: string;
  contents_en: string;
  contents_ar: string;
  image: string;
  Auther_en: string;
  Auther_ar: string;
  date: string;
  download: string;
}

export async function fetchLearnResources(): Promise<LearnResource[]> {
  try {
    const data = await fetchSheetData(
      GOOGLE_SHEETS_CONFIG.API_KEY,
      GOOGLE_SHEETS_CONFIG.SPREADSHEET_ID,
      GOOGLE_SHEETS_CONFIG.SHEETS.LEARN
    );
    
    // Add an ID to each resource based on its index
    return data.map((item, index) => ({
      ...item as unknown as LearnResource,
      id: (index + 1).toString()
    }));
  } catch (error) {
    console.error('Error fetching learn resources:', error);
    throw error;
  }
}
