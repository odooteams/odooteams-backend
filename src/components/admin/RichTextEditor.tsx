import { useRef, useMemo, useCallback, useId } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  dir?: 'ltr' | 'rtl';
}

const formats = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'color', 'background', 'list', 'align',
  'blockquote', 'code-block', 'link', 'image',
];

export function RichTextEditor({ value, onChange, placeholder, dir }: RichTextEditorProps) {
  const quillRef = useRef<ReactQuill>(null);
  // Unique id per instance so each editor gets its own isolated toolbar
  const instanceId = useId().replace(/[^a-zA-Z0-9]/g, '');

  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }

      const ext = file.name.split('.').pop();
      const fileName = `editor/${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;

      try {
        const { error } = await supabase.storage
          .from('content-images')
          .upload(fileName, file, { cacheControl: '3600', upsert: false });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('content-images')
          .getPublicUrl(fileName);

        const quill = quillRef.current?.getEditor();
        if (quill) {
          const range = quill.getSelection(true);
          quill.insertEmbed(range.index, 'image', publicUrl);
          quill.setSelection(range.index + 1, 0);
        }
        toast.success('Image inserted');
      } catch (err: any) {
        toast.error(err.message || 'Failed to upload image');
      }
    };
  }, []);

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, 4, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ align: [] }],
        ['blockquote', 'code-block'],
        ['link', 'image'],
        ['clean'],
      ],
      handlers: {
        image: imageHandler,
      },
    },
    clipboard: { matchVisual: false },
    history: { userOnly: true },
  }), [imageHandler, instanceId]);

  const handleChange = useCallback(
    (html: string, _delta: unknown, source: string) => {
      // Only propagate changes originating from this editor instance
      if (source === 'api') return;
      onChange(html);
    },
    [onChange]
  );

  return (
    <div
      id={`rte-${instanceId}`}
      className={`rich-editor-wrapper ${dir === 'rtl' ? 'rtl-editor' : ''}`}
      dir={dir || 'ltr'}
    >
      <ReactQuill
        key={instanceId}
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </div>
  );
}
