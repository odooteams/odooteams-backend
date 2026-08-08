-- Create backups table to track backup history
CREATE TABLE public.backups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  backup_type text NOT NULL DEFAULT 'full', -- 'full', 'partial', 'scheduled'
  file_url text,
  file_size bigint,
  tables_included text[] DEFAULT '{}',
  records_count jsonb DEFAULT '{}', -- {"table_name": count}
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'failed'
  error_message text,
  created_by uuid REFERENCES auth.users(id),
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.backups ENABLE ROW LEVEL SECURITY;

-- Only admins can manage backups
CREATE POLICY "Admins can view all backups"
ON public.backups
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create backups"
ON public.backups
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update backups"
ON public.backups
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete backups"
ON public.backups
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_backups_updated_at
  BEFORE UPDATE ON public.backups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for backups
INSERT INTO storage.buckets (id, name, public)
VALUES ('backups', 'backups', false);

-- Storage policies for backups bucket (admin only)
CREATE POLICY "Admins can upload backups"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'backups' AND 
  has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can view backups"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'backups' AND 
  has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete backups"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'backups' AND 
  has_role(auth.uid(), 'admin')
);