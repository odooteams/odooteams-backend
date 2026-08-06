import { useState, useRef } from 'react';
import { RichTextEditor } from './RichTextEditor';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Upload, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TeamMemberFormDialogProps {
  member?: any;
  onSuccess: () => void;
}

export function TeamMemberFormDialog({ member, onSuccess }: TeamMemberFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name_en: member?.name_en || '',
    name_ar: member?.name_ar || '',
    position_en: member?.position_en || '',
    position_ar: member?.position_ar || '',
    bio_en: member?.bio_en || '',
    bio_ar: member?.bio_ar || '',
    email: member?.email || '',
    linkedin_url: member?.linkedin_url || '',
    twitter_url: member?.twitter_url || '',
    image: member?.image || '',
    sort_order: member?.sort_order || 0,
    is_active: member?.is_active ?? true,
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('team-members')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('team-members')
        .getPublicUrl(filePath);

      setFormData({ ...formData, image: publicUrl });
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, image: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const submitData = {
        ...formData,
        sort_order: Number(formData.sort_order),
      };
      
      if (member) {
        const { error } = await supabase
          .from('team_members')
          .update(submitData)
          .eq('id', member.id);
        if (error) throw error;
        toast.success('Team member updated successfully');
      } else {
        const { error } = await supabase
          .from('team_members')
          .insert(submitData);
        if (error) throw error;
        toast.success('Team member created successfully');
      }
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error('Error saving team member:', error);
      toast.error('Failed to save team member');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name_en: member?.name_en || '',
      name_ar: member?.name_ar || '',
      position_en: member?.position_en || '',
      position_ar: member?.position_ar || '',
      bio_en: member?.bio_en || '',
      bio_ar: member?.bio_ar || '',
      email: member?.email || '',
      linkedin_url: member?.linkedin_url || '',
      twitter_url: member?.twitter_url || '',
      image: member?.image || '',
      sort_order: member?.sort_order || 0,
      is_active: member?.is_active ?? true,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        {member ? (
          <Button variant="ghost" size="sm"><Pencil className="h-4 w-4" /></Button>
        ) : (
          <Button><Plus className="h-4 w-4 mr-2" />Add Member</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{member ? 'Edit Team Member' : 'Create Team Member'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload */}
          <div>
            <Label>Profile Photo</Label>
            <div className="mt-2">
              {formData.image ? (
                <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-border">
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-32 h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
                >
                  {uploading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground mt-1">Upload</span>
                    </>
                  )}
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name_en">Name (English)</Label>
              <Input
                id="name_en"
                value={formData.name_en}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="name_ar">Name (Arabic)</Label>
              <Input
                id="name_ar"
                value={formData.name_ar}
                onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                required
                dir="rtl"
              />
            </div>
          </div>

          {/* Position Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="position_en">Position (English)</Label>
              <Input
                id="position_en"
                value={formData.position_en}
                onChange={(e) => setFormData({ ...formData, position_en: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="position_ar">Position (Arabic)</Label>
              <Input
                id="position_ar"
                value={formData.position_ar}
                onChange={(e) => setFormData({ ...formData, position_ar: e.target.value })}
                required
                dir="rtl"
              />
            </div>
          </div>

          {/* Bio Fields */}
          <div>
            <Label htmlFor="bio_en">Bio (English)</Label>
            <RichTextEditor
              value={formData.bio_en}
              onChange={(val) => setFormData({ ...formData, bio_en: val })}
            />
          </div>

          <div>
            <Label htmlFor="bio_ar">Bio (Arabic)</Label>
            <RichTextEditor
              value={formData.bio_ar}
              onChange={(val) => setFormData({ ...formData, bio_ar: val })}
              dir="rtl"
            />
          </div>

          {/* Contact & Social */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="sort_order">Sort Order</Label>
              <Input
                id="sort_order"
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="linkedin_url">LinkedIn URL</Label>
              <Input
                id="linkedin_url"
                value={formData.linkedin_url}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            <div>
              <Label htmlFor="twitter_url">Twitter URL</Label>
              <Input
                id="twitter_url"
                value={formData.twitter_url}
                onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                placeholder="https://twitter.com/username"
              />
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || uploading}>
              {loading ? 'Saving...' : member ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
