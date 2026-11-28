ALTER TABLE public.certifications ADD COLUMN IF NOT EXISTS image_url text, ADD COLUMN IF NOT EXISTS document_url text;
CREATE OR REPLACE FUNCTION public.portfolio_media_path(value text) RETURNS text LANGUAGE sql IMMUTABLE SET search_path = public AS $$
 SELECT CASE WHEN value ~ '^https?://' THEN CASE WHEN value ~ '/storage/v1/object/(public|sign|authenticated)/site-media/' THEN split_part(regexp_replace(value, '^.*/storage/v1/object/(public|sign|authenticated)/site-media/', ''), '?', 1) ELSE NULL END WHEN value ~ '^(blob:|data:|file:)' THEN NULL ELSE regexp_replace(regexp_replace(split_part(value, '?', 1), '^/+', ''), '^site-media/', '') END;
$$;
REVOKE ALL ON FUNCTION public.portfolio_media_path(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.portfolio_media_path(text) TO anon, authenticated, service_role;
CREATE OR REPLACE FUNCTION public.is_public_media(_name text) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
 SELECT EXISTS (SELECT 1 FROM public.site_profile s WHERE s.id=1 AND (_name=public.portfolio_media_path(s.avatar_url) OR _name=public.portfolio_media_path(s.resume_url)))
 OR EXISTS (SELECT 1 FROM public.projects p WHERE p.visible AND p.published AND (_name=public.portfolio_media_path(p.image_url) OR EXISTS (SELECT 1 FROM unnest(p.gallery) g WHERE _name=public.portfolio_media_path(g))))
 OR EXISTS (SELECT 1 FROM public.certifications c WHERE c.visible AND (_name=public.portfolio_media_path(c.image_url) OR _name=public.portfolio_media_path(c.document_url) OR _name=public.portfolio_media_path(c.link)));
$$;
REVOKE ALL ON FUNCTION public.is_public_media(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_public_media(text) TO anon, authenticated, service_role;
DROP POLICY IF EXISTS site_media_read ON storage.objects;
CREATE POLICY site_media_visitor_read ON storage.objects FOR SELECT TO anon USING (bucket_id='site-media' AND public.is_public_media(name));
CREATE POLICY site_media_authenticated_read ON storage.objects FOR SELECT TO authenticated USING (bucket_id='site-media' AND (public.is_public_media(name) OR public.has_role(auth.uid(), 'admin')));