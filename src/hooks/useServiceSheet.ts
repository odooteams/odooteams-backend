
import { useQuery } from "@tanstack/react-query";
import { GOOGLE_SHEETS_CONFIG, fetchSheetData } from "@/lib/googleSheets";
import { useLanguage } from "@/lib/LanguageContext";

export interface SheetService {
  id: number;
  category: string;
  title: string;
  details: string;
  benefits: string[];
  process: {
    step: number;
    title: string;
    description: string;
  }[];
  gallery: string[];
  cost: string;
  image: string;
  requestViaWhatsApp: string;
  keywords: string[];
  [key: string]: any;
}

/**
 * Fetches and parses services data from Google Sheets according to the current language.
 */
export function useServiceSheet() {
  const { language } = useLanguage();

  const {
    data: rawServices,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["services-sheet", language],
    queryFn: async () => {
      const services = await fetchSheetData(
        GOOGLE_SHEETS_CONFIG.API_KEY,
        GOOGLE_SHEETS_CONFIG.SPREADSHEET_ID,
        "service"
      );
      return services;
    },
  });

  // Parse columns from sheet and format as SheetService[]
  const services = (rawServices || []).map((row: any, idx: number) => {
    // Fallbacks for missing fields
    const category = row[`Category_${language}`] || row["Category_en"] || "";
    const title = row[`Title_${language}`] || row["Title_en"] || "";
    const details = row[`service-details_${language}`] || row["service-details_en"] || "";
    const benefitsRaw = row[`KeyBenefits_${language}`] || row["KeyBenefits_en"] || "";
    const processRaw = row[`Processing_steps_${language}`] || row["Processing_steps_en"] || "";
    const keywordsRaw = row["keywords"] || "";
    // Gallery images: up to 3, else fallback []
    const gallery = [
      row["Gallery-1"] || row["gallery-1"] || "",
      row["Gallery-2"] || row["gallery-2"] || "",
      row["Gallery-3"] || row["gallery-3"] || "",
    ].filter(Boolean);

    // Parse benefits as lines ("- benefit1\n- benefit2" → ["benefit1", "benefit2"])
    let benefits = benefitsRaw.split("\n").map((b: string) => b.replace(/^\s*-\s*/, "").trim()).filter(Boolean);
    // Parse process steps as "1- Title: Description" per line
    let process =
      processRaw
        .split("\n")
        .map((line: string, i: number) => {
          const match = line.match(/^(\d+)-\s*(.*?):\s*(.*?)$/);
          if (match) {
            return { step: Number(match[1]), title: match[2].trim(), description: match[3].trim() };
          }
          // fallback to just text, if no number-title-desc format
          return { step: i + 1, title: "", description: line.trim() };
        })
        .filter((s: any) => !!s.description);

    // Parse keywords comma-separated
    let keywords: string[] = [];
    if (typeof keywordsRaw === "string") keywords = keywordsRaw.split(",").map(k => k.trim()).filter(Boolean);

    return {
      id: idx + 1, // fallback, ideally use a sheet-provided unique id
      category,
      title,
      details,
      benefits,
      process,
      gallery,
      cost: row["cost"] || "",
      image: row["image"] || "",
      requestViaWhatsApp: row["request via WhatsApp"] || "",
      keywords,
      raw: row, // for debugging
    };
  });

  return {
    services,
    isLoading,
    error,
  };
}
