
INSERT INTO storage.buckets (id, name, public)
VALUES ('content-images', 'content-images', true);

CREATE POLICY "Content images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'content-images');

CREATE POLICY "Admins can upload content images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'content-images'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins can update content images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'content-images'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins can delete content images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'content-images'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);
