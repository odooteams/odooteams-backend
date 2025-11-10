import { learnResourcesQueries } from './supabase/queries';

export interface LearnResource {
  id: string;
  category_en: string;
  category_ar: string;
  main_header_en: string;
  main_header_ar: string;
  title_en: string;
  title_ar: string;
  contents_en: string;
  contents_ar: string;
  image: string | null;
  author_en: string | null;
  author_ar: string | null;
  published_date: string | null;
  download_url: string | null;
}

export async function fetchLearnResources(): Promise<LearnResource[]> {
  try {
    const data = await learnResourcesQueries.getAll();
    
    // Map database fields to expected format
    return data.map((item) => ({
      id: item.id,
      category_en: item.category_en,
      category_ar: item.category_ar,
      main_header_en: item.main_header_en,
      main_header_ar: item.main_header_ar,
      title_en: item.title_en,
      title_ar: item.title_ar,
      contents_en: item.contents_en,
      contents_ar: item.contents_ar,
      image: item.image,
      author_en: item.author_en,
      author_ar: item.author_ar,
      published_date: item.published_date,
      download_url: item.download_url,
    }));
  } catch (error) {
    console.error('Error fetching learn resources:', error);
    throw error;
  }
}
