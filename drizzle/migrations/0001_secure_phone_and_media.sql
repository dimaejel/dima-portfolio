CREATE TABLE public.site_profile_private (id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1), phone text, updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT, INSERT, UPDATE ON public.site_profile_private TO authenticated;
GRANT ALL ON public.site_profile_private TO service_role;
ALTER TABLE public.site_profile_private ENABLE ROW LEVEL SECURITY;
CREATE POLICY site_profile_private_admin ON public.site_profile_private FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
INSERT INTO public.site_profile_private (id, phone) SELECT 1, phone FROM public.site_profile WHERE id = 1 ON CONFLICT DO NOTHING;
UPDATE public.site_profile SET phone = NULL;
COMMENT ON COLUMN public.site_profile.phone IS 'DEPRECATED: moved to site_profile_private.phone';

CREATE OR REPLACE FUNCTION public.is_public_media(_name text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.site_profile s WHERE s.id = 1 AND (
      s.avatar_url = _name OR s.resume_url = _name OR s.avatar_url LIKE '%/site-media/' || _name || '%' OR s.resume_url LIKE '%/site-media/' || _name || '%'))
  OR EXISTS (SELECT 1 FROM public.projects p WHERE p.visible AND p.published AND (
      p.image_url = _name OR p.image_url LIKE '%/site-media/' || _name || '%' OR _name = ANY(p.gallery)
      OR EXISTS (SELECT 1 FROM unnest(p.gallery) g WHERE g LIKE '%/site-media/' || _name || '%')));
$$;

DROP POLICY site_media_public_read ON storage.objects;
CREATE POLICY site_media_read ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'site-media' AND (public.is_public_media(name) OR public.has_role(auth.uid(), 'admin')));