import { Button } from "@/components/ui/button";
import { Download, Upload, FileSpreadsheet } from "lucide-react";
import { useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  downloadTemplate,
  exportToExcel,
  importFromExcel,
  processServiceImport,
  processProjectImport,
  processBlogImport,
  processFaqImport,
  processResourceImport,
  bulkInsert,
  serviceTemplate,
  projectTemplate,
  blogTemplate,
  faqTemplate,
  resourceTemplate
} from "@/lib/excelUtils";

interface ExcelImportExportProps {
  type: 'services' | 'projects' | 'blogs' | 'faqs' | 'resources';
  data: any[];
  onImportComplete: () => void;
}

const typeConfig = {
  services: {
    template: serviceTemplate,
    processor: processServiceImport,
    table: 'services',
    label: 'Services'
  },
  projects: {
    template: projectTemplate,
    processor: processProjectImport,
    table: 'projects',
    label: 'Projects'
  },
  blogs: {
    template: blogTemplate,
    processor: processBlogImport,
    table: 'blogs',
    label: 'Blogs'
  },
  faqs: {
    template: faqTemplate,
    processor: processFaqImport,
    table: 'faqs',
    label: 'FAQs'
  },
  resources: {
    template: resourceTemplate,
    processor: processResourceImport,
    table: 'learn_resources',
    label: 'Resources'
  }
};

export const ExcelImportExport = ({ type, data, onImportComplete }: ExcelImportExportProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const config = typeConfig[type];

  const handleDownloadTemplate = () => {
    downloadTemplate(config.template, type);
    toast({
      title: "Template Downloaded",
      description: `${config.label} template has been downloaded successfully.`
    });
  };

  const handleExport = () => {
    if (data.length === 0) {
      toast({
        title: "No Data",
        description: "There is no data to export.",
        variant: "destructive"
      });
      return;
    }
    exportToExcel(data, type);
    toast({
      title: "Data Exported",
      description: `${data.length} ${config.label.toLowerCase()} exported successfully.`
    });
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const importedData = await importFromExcel(file);
      
      if (importedData.length === 0) {
        toast({
          title: "Empty File",
          description: "The Excel file contains no data.",
          variant: "destructive"
        });
        return;
      }

      const processedData = config.processor(importedData);
      await bulkInsert(config.table as 'services' | 'projects' | 'blogs' | 'faqs' | 'learn_resources', processedData);

      toast({
        title: "Import Successful",
        description: `${processedData.length} ${config.label.toLowerCase()} imported successfully.`
      });

      onImportComplete();
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import data. Please check the file format.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex gap-2 flex-wrap">
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownloadTemplate}
        className="gap-2"
      >
        <FileSpreadsheet className="h-4 w-4" />
        Download Template
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        className="gap-2"
      >
        <Download className="h-4 w-4" />
        Export to Excel
      </Button>

      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleImport}
          className="hidden"
          id={`excel-import-${type}`}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          Import from Excel
        </Button>
      </div>
    </div>
  );
};
