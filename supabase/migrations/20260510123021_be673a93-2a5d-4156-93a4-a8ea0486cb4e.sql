
DROP POLICY IF EXISTS "Content images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Team member images are publicly accessible" ON storage.objects;

CREATE POLICY "Admins can list content images"
ON storage.objects FOR SELECT
USING (bucket_id = 'content-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can list team member images"
ON storage.objects FOR SELECT
USING (bucket_id = 'team-members' AND has_role(auth.uid(), 'admin'::app_role));
