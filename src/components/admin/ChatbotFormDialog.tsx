import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ChatbotResponse {
  id?: string;
  question_en: string;
  question_ar: string;
  answer_en: string;
  answer_ar: string;
  keywords: string[];
  is_active: boolean;
}

interface ChatbotFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  response: ChatbotResponse | null;
  onSuccess: () => void;
}

export function ChatbotFormDialog({ open, onOpenChange, response, onSuccess }: ChatbotFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');
  const [formData, setFormData] = useState<ChatbotResponse>({
    question_en: '',
    question_ar: '',
    answer_en: '',
    answer_ar: '',
    keywords: [],
    is_active: true,
  });

  useEffect(() => {
    if (response) {
      setFormData({
        id: response.id,
        question_en: response.question_en || '',
        question_ar: response.question_ar || '',
        answer_en: response.answer_en || '',
        answer_ar: response.answer_ar || '',
        keywords: response.keywords || [],
        is_active: response.is_active ?? true,
      });
    } else {
      setFormData({
        question_en: '',
        question_ar: '',
        answer_en: '',
        answer_ar: '',
        keywords: [],
        is_active: true,
      });
    }
    setKeywordInput('');
  }, [response, open]);

  const handleAddKeyword = () => {
    const keyword = keywordInput.trim().toLowerCase();
    if (keyword && !formData.keywords.includes(keyword)) {
      setFormData(prev => ({ ...prev, keywords: [...prev.keywords, keyword] }));
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setFormData(prev => ({ ...prev, keywords: prev.keywords.filter(k => k !== keyword) }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.question_en || !formData.question_ar || !formData.answer_en || !formData.answer_ar) {
      toast.error('Please fill in all required fields (questions and answers in both languages)');
      return;
    }

    setLoading(true);
    try {
      const dataToSave = {
        question_en: formData.question_en,
        question_ar: formData.question_ar,
        answer_en: formData.answer_en,
        answer_ar: formData.answer_ar,
        keywords: formData.keywords,
        is_active: formData.is_active,
      };

      if (formData.id) {
        const { error } = await supabase
          .from('chatbot_responses')
          .update(dataToSave)
          .eq('id', formData.id);
        if (error) throw error;
        toast.success('Chatbot response updated successfully');
      } else {
        const { error } = await supabase
          .from('chatbot_responses')
          .insert(dataToSave);
        if (error) throw error;
        toast.success('Chatbot response created successfully');
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving chatbot response:', error);
      toast.error('Failed to save chatbot response');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{formData.id ? 'Edit' : 'Add'} Chatbot Response</DialogTitle>
          <DialogDescription>
            Create or edit automated chatbot responses with bilingual support
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Questions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="question_en">Question (English) *</Label>
              <Input
                id="question_en"
                value={formData.question_en}
                onChange={(e) => setFormData(prev => ({ ...prev, question_en: e.target.value }))}
                placeholder="e.g., What services do you offer?"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="question_ar">Question (Arabic) *</Label>
              <Input
                id="question_ar"
                dir="rtl"
                value={formData.question_ar}
                onChange={(e) => setFormData(prev => ({ ...prev, question_ar: e.target.value }))}
                placeholder="مثال: ما هي الخدمات التي تقدمونها؟"
              />
            </div>
          </div>

          {/* Answers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="answer_en">Answer (English) *</Label>
              <Textarea
                id="answer_en"
                rows={4}
                value={formData.answer_en}
                onChange={(e) => setFormData(prev => ({ ...prev, answer_en: e.target.value }))}
                placeholder="Enter the response in English..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="answer_ar">Answer (Arabic) *</Label>
              <Textarea
                id="answer_ar"
                dir="rtl"
                rows={4}
                value={formData.answer_ar}
                onChange={(e) => setFormData(prev => ({ ...prev, answer_ar: e.target.value }))}
                placeholder="أدخل الرد بالعربية..."
              />
            </div>
          </div>

          {/* Keywords */}
          <div className="space-y-2">
            <Label htmlFor="keywords">Keywords (for matching)</Label>
            <div className="flex gap-2">
              <Input
                id="keywords"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a keyword and press Enter"
              />
              <Button type="button" variant="outline" onClick={handleAddKeyword}>
                Add
              </Button>
            </div>
            {formData.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.keywords.map((keyword, idx) => (
                  <Badge key={idx} variant="secondary" className="gap-1">
                    {keyword}
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-destructive" 
                      onClick={() => handleRemoveKeyword(keyword)}
                    />
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Add keywords that users might use when asking this question
            </p>
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="is_active">Active</Label>
              <p className="text-xs text-muted-foreground">
                Only active responses will be used by the chatbot
              </p>
            </div>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : formData.id ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
