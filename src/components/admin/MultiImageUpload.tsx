import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, X, Loader2 } from 'lucide-react';

interface MultiImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
  maxFiles?: number;
}

export function MultiImageUpload({ value = [], onChange, folder = 'general', maxFiles = 5 }: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = async (files: FileList) => {
    const fileArray = Array.from(files).slice(0, maxFiles - value.length);
    if (fileArray.length === 0) {
      toast.error(`You can only upload up to ${maxFiles} images`);
      return;
    }

    setUploading(true);
    let uploadedCount = 0;
    try {
      const newUrls: string[] = [];
      for (const file of fileArray) {
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image`);
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} must be less than 5MB`);
          continue;
        }

        const ext = file.name.split('.').pop();
        const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;

        const { error } = await supabase.storage
          .from('content-images')
          .upload(fileName, file, { cacheControl: '3600', upsert: false });

        if (!error) {
          const { data: { publicUrl } } = supabase.storage
            .from('content-images')
            .getPublicUrl(fileName);
          newUrls.push(publicUrl);
          uploadedCount++;
        }
      }
      if (newUrls.length > 0) {
        onChange([...value, ...newUrls]);
        toast.success(`Successfully uploaded ${uploadedCount} image(s)`);
      }
    } catch (error: any) {
      toast.error('Failed to upload some images');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newValues = [...value];
    newValues.splice(index, 1);
    onChange(newValues);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          disabled={uploading || value.length >= maxFiles}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
          Upload Images
        </Button>
        <span className="text-sm text-muted-foreground">
          {value.length} / {maxFiles} images uploaded
        </span>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) uploadFiles(e.target.files);
          e.target.value = '';
        }}
      />
      
      {value.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {value.map((url, i) => (
            <div key={i} className="relative w-24 h-24 rounded-md overflow-hidden border bg-muted group">
              <img src={url} alt={`Preview ${i}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
