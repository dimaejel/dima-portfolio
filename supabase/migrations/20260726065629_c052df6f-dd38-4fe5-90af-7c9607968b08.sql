-- projects
DROP POLICY IF EXISTS projects_public_read ON public.projects;
CREATE POLICY projects_anon_read ON public.projects FOR SELECT TO anon USING (visible = true AND published = true);
CREATE POLICY projects_auth_read ON public.projects FOR SELECT TO authenticated USING ((visible = true AND published = true) OR public.has_role(auth.uid(), 'admin'::app_role));

-- skills
DROP POLICY IF EXISTS skills_public_read ON public.skills;
CREATE POLICY skills_anon_read ON public.skills FOR SELECT TO anon USING (visible = true);
CREATE POLICY skills_auth_read ON public.skills FOR SELECT TO authenticated USING (visible = true OR public.has_role(auth.uid(), 'admin'::app_role));

-- experience
DROP POLICY IF EXISTS experience_public_read ON public.experience;
CREATE POLICY experience_anon_read ON public.experience FOR SELECT TO anon USING (visible = true);
CREATE POLICY experience_auth_read ON public.experience FOR SELECT TO authenticated USING (visible = true OR public.has_role(auth.uid(), 'admin'::app_role));

-- education
DROP POLICY IF EXISTS education_public_read ON public.education;
CREATE POLICY education_anon_read ON public.education FOR SELECT TO anon USING (visible = true);
CREATE POLICY education_auth_read ON public.education FOR SELECT TO authenticated USING (visible = true OR public.has_role(auth.uid(), 'admin'::app_role));

-- certifications
DROP POLICY IF EXISTS certifications_public_read ON public.certifications;
CREATE POLICY certifications_anon_read ON public.certifications FOR SELECT TO anon USING (visible = true);
CREATE POLICY certifications_auth_read ON public.certifications FOR SELECT TO authenticated USING (visible = true OR public.has_role(auth.uid(), 'admin'::app_role));

-- achievements
DROP POLICY IF EXISTS achievements_public_read ON public.achievements;
CREATE POLICY achievements_anon_read ON public.achievements FOR SELECT TO anon USING (visible = true);
CREATE POLICY achievements_auth_read ON public.achievements FOR SELECT TO authenticated USING (visible = true OR public.has_role(auth.uid(), 'admin'::app_role));