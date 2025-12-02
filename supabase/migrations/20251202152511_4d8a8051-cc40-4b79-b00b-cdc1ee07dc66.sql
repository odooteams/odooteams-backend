-- Create storage bucket for team member images
INSERT INTO storage.buckets (id, name, public)
VALUES ('team-members', 'team-members', true);

-- Create policies for the bucket
CREATE POLICY "Team member images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'team-members');

CREATE POLICY "Admins can upload team member images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'team-members' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update team member images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'team-members' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete team member images"
ON storage.objects FOR DELETE
USING (bucket_id = 'team-members' AND has_role(auth.uid(), 'admin'));