import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';

// Template structures for each content type
export const serviceTemplate = [
  {
    title_en: 'Example Service',
    title_ar: 'خدمة مثال',
    category_en: 'Category',
    category_ar: 'التصنيف',
    details_en: 'Service details...',
    details_ar: 'تفاصيل الخدمة...',
    processing_steps_en: 'Step 1\nStep 2',
    processing_steps_ar: 'الخطوة 1\nالخطوة 2',
    price: 1000,
    duration: '2 weeks',
    keywords: 'keyword1,keyword2',
    image: 'https://example.com/image.jpg',
    is_featured: 'false',
    is_active: 'true'
  }
];

export const projectTemplate = [
  {
    title_en: 'Example Project',
    title_ar: 'مشروع مثال',
    category_en: 'Category',
    category_ar: 'التصنيف',
    description_en: 'Project description...',
    description_ar: 'وصف المشروع...',
    processing_steps_en: 'Step 1\nStep 2',
    processing_steps_ar: 'الخطوة 1\nالخطوة 2',
    client_name: 'Client Name',
    completion_date: '2024-01-01',
    cost: '10000',
    project_url: 'https://example.com',
    technologies: 'React,TypeScript',
    images: 'https://example.com/img1.jpg,https://example.com/img2.jpg',
    is_featured: 'false',
    is_active: 'true'
  }
];

export const blogTemplate = [
  {
    title_en: 'Example Blog Post',
    title_ar: 'مقالة مثال',
    category_en: 'Category',
    category_ar: 'التصنيف',
    excerpt_en: 'Short excerpt...',
    excerpt_ar: 'مقتطف قصير...',
    content_en: 'Full blog content...',
    content_ar: 'محتوى المقالة الكامل...',
    slug: 'example-blog-post',
    tags: 'tag1,tag2',
    image: 'https://example.com/image.jpg',
    is_published: 'false',
    is_featured: 'false'
  }
];

export const faqTemplate = [
  {
    category_en: 'General',
    category_ar: 'عام',
    question_en: 'What is this?',
    question_ar: 'ما هذا؟',
    answer_en: 'This is an answer...',
    answer_ar: 'هذا جواب...',
    sort_order: 1,
    is_active: 'true'
  }
];

export const resourceTemplate = [
  {
    category_en: 'Category',
    category_ar: 'التصنيف',
    main_header_en: 'Main Header',
    main_header_ar: 'العنوان الرئيسي',
    title_en: 'Resource Title',
    title_ar: 'عنوان المورد',
    contents_en: 'Resource contents...',
    contents_ar: 'محتوى المورد...',
    author_en: 'Author Name',
    author_ar: 'اسم المؤلف',
    published_date: '2024-01-01',
    image: 'https://example.com/image.jpg',
    download_url: 'https://example.com/file.pdf',
    is_active: 'true'
  }
];

// Export template
export const downloadTemplate = (templateData: any[], fileName: string) => {
  const ws = XLSX.utils.json_to_sheet(templateData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template');
  XLSX.writeFile(wb, `${fileName}_template.xlsx`);
};

// Export data
export const exportToExcel = (data: any[], fileName: string) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  XLSX.writeFile(wb, `${fileName}_export_${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Import data
export const importFromExcel = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        resolve(json);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsBinaryString(file);
  });
};

// Process imported data for services
export const processServiceImport = (data: any[]) => {
  return data.map((row: any) => ({
    title_en: row.title_en,
    title_ar: row.title_ar,
    category_en: row.category_en,
    category_ar: row.category_ar,
    details_en: row.details_en,
    details_ar: row.details_ar,
    processing_steps_en: row.processing_steps_en || null,
    processing_steps_ar: row.processing_steps_ar || null,
    price: row.price ? parseFloat(row.price) : null,
    duration: row.duration || null,
    keywords: row.keywords ? row.keywords.split(',').map((k: string) => k.trim()) : null,
    image: row.image || null,
    is_featured: row.is_featured === 'true',
    is_active: row.is_active === 'true'
  }));
};

// Process imported data for projects
export const processProjectImport = (data: any[]) => {
  return data.map((row: any, index: number) => {
    // Validate required fields
    if (!row.title_en || !row.title_ar || !row.category_en || !row.category_ar || !row.description_en || !row.description_ar) {
      throw new Error(`Row ${index + 2}: Missing required fields. Please ensure title_en, title_ar, category_en, category_ar, description_en, and description_ar are filled.`);
    }

    // Normalize completion_date to YYYY-MM-DD if provided (supports Excel serials and common strings)
    let completionDate: string | null = null;
    const rawDate = row.completion_date;
    if (rawDate !== undefined && rawDate !== null && String(rawDate).trim() !== '') {
      if (typeof rawDate === 'number') {
        // Excel serial date to JS Date
        const jsDate = new Date(Math.round((rawDate - 25569) * 86400 * 1000));
        if (!isNaN(jsDate.getTime())) completionDate = jsDate.toISOString().split('T')[0];
      } else {
        const jsDate = new Date(String(rawDate));
        if (!isNaN(jsDate.getTime())) {
          completionDate = jsDate.toISOString().split('T')[0];
        } else {
          // Fallback: keep as string (Supabase may accept if valid)
          completionDate = String(rawDate);
        }
      }
    }

    return {
      title_en: String(row.title_en).trim(),
      title_ar: String(row.title_ar).trim(),
      category_en: String(row.category_en).trim(),
      category_ar: String(row.category_ar).trim(),
      description_en: String(row.description_en).trim(),
      description_ar: String(row.description_ar).trim(),
      processing_steps_en: row.processing_steps_en ? String(row.processing_steps_en).trim() : null,
      processing_steps_ar: row.processing_steps_ar ? String(row.processing_steps_ar).trim() : null,
      client_name: row.client_name ? String(row.client_name).trim() : null,
      completion_date: completionDate,
      cost: row.cost ? String(row.cost).trim() : null,
      project_url: row.project_url ? String(row.project_url).trim() : null,
      technologies: row.technologies ? String(row.technologies).split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      images: row.images ? String(row.images).split(',').map((i: string) => i.trim()).filter(Boolean) : [],
      is_featured: String(row.is_featured).toLowerCase() === 'true',
      is_active: String(row.is_active).toLowerCase() === 'true'
    };
  });
};

// Process imported data for blogs
export const processBlogImport = (data: any[]) => {
  return data.map((row: any) => ({
    title_en: row.title_en,
    title_ar: row.title_ar,
    category_en: row.category_en || null,
    category_ar: row.category_ar || null,
    excerpt_en: row.excerpt_en || null,
    excerpt_ar: row.excerpt_ar || null,
    content_en: row.content_en,
    content_ar: row.content_ar,
    slug: row.slug,
    tags: row.tags ? row.tags.split(',').map((t: string) => t.trim()) : null,
    image: row.image || null,
    is_published: row.is_published === 'true',
    is_featured: row.is_featured === 'true'
  }));
};

// Process imported data for FAQs
export const processFaqImport = (data: any[]) => {
  return data.map((row: any) => ({
    category_en: row.category_en,
    category_ar: row.category_ar,
    question_en: row.question_en,
    question_ar: row.question_ar,
    answer_en: row.answer_en,
    answer_ar: row.answer_ar,
    sort_order: row.sort_order ? parseInt(row.sort_order) : 0,
    is_active: row.is_active === 'true'
  }));
};

// Process imported data for resources
export const processResourceImport = (data: any[]) => {
  return data.map((row: any) => ({
    category_en: row.category_en,
    category_ar: row.category_ar,
    main_header_en: row.main_header_en,
    main_header_ar: row.main_header_ar,
    title_en: row.title_en,
    title_ar: row.title_ar,
    contents_en: row.contents_en,
    contents_ar: row.contents_ar,
    author_en: row.author_en || null,
    author_ar: row.author_ar || null,
    published_date: row.published_date || null,
    image: row.image || null,
    download_url: row.download_url || null,
    is_active: row.is_active === 'true'
  }));
};

// Bulk insert data
export const bulkInsert = async (table: 'services' | 'projects' | 'blogs' | 'faqs' | 'learn_resources', data: any[]) => {
  const { data: result, error } = await supabase
    .from(table)
    .insert(data as any);
  
  if (error) throw error;
  return result;
};
