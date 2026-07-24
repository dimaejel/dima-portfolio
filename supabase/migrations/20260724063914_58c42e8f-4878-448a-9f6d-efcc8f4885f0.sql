
-- =========================================================
-- 1. ROLES + PROFILES FOUNDATION
-- =========================================================
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Reusable updated_at trigger
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- user_roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- has_role security definer
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- Profile policies
CREATE POLICY "profiles_own_select" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "profiles_own_update" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_admin_all" ON public.profiles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- user_roles policies
CREATE POLICY "user_roles_self_read" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "user_roles_admin_write" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Auto-create profile + first-signup-is-admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  admin_count INT;
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email,'@',1)));

  SELECT count(*) INTO admin_count FROM public.user_roles WHERE role = 'admin';
  IF admin_count = 0 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================
-- 2. CONTENT TABLES
-- =========================================================

-- site_profile (single row)
CREATE TABLE public.site_profile (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  name TEXT NOT NULL DEFAULT '',
  initials TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  roles TEXT[] NOT NULL DEFAULT '{}',
  bio TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT,
  location TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  resume_url TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  github_handle TEXT,
  linkedin_handle TEXT,
  availability_status TEXT NOT NULL DEFAULT 'Open to Work',
  stats JSONB NOT NULL DEFAULT '[]'::jsonb,
  interests TEXT[] NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_profile TO anon, authenticated;
GRANT ALL ON public.site_profile TO service_role;
GRANT UPDATE ON public.site_profile TO authenticated;
ALTER TABLE public.site_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "site_profile_public_read" ON public.site_profile FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "site_profile_admin_update" ON public.site_profile FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_site_profile_updated BEFORE UPDATE ON public.site_profile
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- projects
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  tech_stack TEXT[] NOT NULL DEFAULT '{}',
  github_url TEXT,
  demo_url TEXT,
  image_url TEXT,
  gradient TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  visible BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.projects TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "projects_public_read" ON public.projects FOR SELECT TO anon, authenticated USING (visible = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "projects_admin_write" ON public.projects FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_projects_updated BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- skills
CREATE TABLE public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  badge TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT '#3B82F6',
  visible BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.skills TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.skills TO authenticated;
GRANT ALL ON public.skills TO service_role;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "skills_public_read" ON public.skills FOR SELECT TO anon, authenticated USING (visible = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "skills_admin_write" ON public.skills FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_skills_updated BEFORE UPDATE ON public.skills
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- experience
CREATE TABLE public.experience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  company TEXT NOT NULL,
  period TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT '',
  bullets TEXT[] NOT NULL DEFAULT '{}',
  is_current BOOLEAN NOT NULL DEFAULT false,
  visible BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.experience TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.experience TO authenticated;
GRANT ALL ON public.experience TO service_role;
ALTER TABLE public.experience ENABLE ROW LEVEL SECURITY;
CREATE POLICY "experience_public_read" ON public.experience FOR SELECT TO anon, authenticated USING (visible = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "experience_admin_write" ON public.experience FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_experience_updated BEFORE UPDATE ON public.experience
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- education
CREATE TABLE public.education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  degree TEXT NOT NULL,
  institution TEXT NOT NULL,
  period TEXT NOT NULL DEFAULT '',
  gpa TEXT,
  description TEXT,
  courses TEXT[] NOT NULL DEFAULT '{}',
  visible BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.education TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.education TO authenticated;
GRANT ALL ON public.education TO service_role;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
CREATE POLICY "education_public_read" ON public.education FOR SELECT TO anon, authenticated USING (visible = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "education_admin_write" ON public.education FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_education_updated BEFORE UPDATE ON public.education
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- certifications
CREATE TABLE public.certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  issuer TEXT NOT NULL DEFAULT '',
  date TEXT NOT NULL DEFAULT '',
  link TEXT,
  gradient TEXT,
  visible BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.certifications TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.certifications TO authenticated;
GRANT ALL ON public.certifications TO service_role;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "certifications_public_read" ON public.certifications FOR SELECT TO anon, authenticated USING (visible = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "certifications_admin_write" ON public.certifications FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_certifications_updated BEFORE UPDATE ON public.certifications
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- achievements
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Star',
  items TEXT[] NOT NULL DEFAULT '{}',
  visible BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.achievements TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.achievements TO authenticated;
GRANT ALL ON public.achievements TO service_role;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "achievements_public_read" ON public.achievements FOR SELECT TO anon, authenticated USING (visible = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "achievements_admin_write" ON public.achievements FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_achievements_updated BEFORE UPDATE ON public.achievements
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- contact_messages
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contact_public_insert" ON public.contact_messages FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(name) BETWEEN 1 AND 200
    AND char_length(email) BETWEEN 3 AND 320
    AND char_length(subject) BETWEEN 1 AND 300
    AND char_length(message) BETWEEN 1 AND 5000
  );
CREATE POLICY "contact_admin_read" ON public.contact_messages FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "contact_admin_update" ON public.contact_messages FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "contact_admin_delete" ON public.contact_messages FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- =========================================================
-- 3. SEED CURRENT PORTFOLIO CONTENT
-- =========================================================
INSERT INTO public.site_profile (id, name, initials, title, roles, bio, email, location, github_url, linkedin_url, github_handle, linkedin_handle, availability_status, stats, interests)
VALUES (
  1,
  'Alex Morgan', 'AM', 'Computer Science Graduate',
  ARRAY['Software Engineer','Web Developer','Problem Solver'],
  'Passionate about building elegant, scalable software solutions. I thrive at the intersection of clean code, intuitive design, and real-world impact. Currently seeking opportunities in Software Engineering and Web Development.',
  'your.email@example.com',
  '[City, Country] · Open to Remote',
  'https://github.com/yourusername', 'https://linkedin.com/in/yourprofile',
  'github.com/yourusername','linkedin.com/in/yourprofile',
  'Open to Work',
  '[{"label":"Projects","value":"4+"},{"label":"Technologies","value":"10+"},{"label":"Degree","value":"1"},{"label":"Status","value":"Open to Work"}]'::jsonb,
  ARRAY['Web Development','Software Engineering','Databases','Open Source','Clean Code','Problem Solving']
);

-- Skills
INSERT INTO public.skills (category, name, badge, color, display_order) VALUES
('Programming Languages','Java','Jv','#F89820',1),
('Programming Languages','C','C','#5C6BC0',2),
('Programming Languages','C++','C++','#00599C',3),
('Programming Languages','JavaScript','JS','#F7DF1E',4),
('Programming Languages','HTML5','<>','#E34F26',5),
('Programming Languages','CSS3','{ }','#1572B6',6),
('Frameworks & Libraries','React','⚛','#61DAFB',1),
('Frameworks & Libraries','Node.js','N','#3C873A',2),
('Frameworks & Libraries','Git','⎇','#F05032',3),
('Databases','MySQL','DB','#00758F',1),
('Developer Tools','VS Code','VS','#007ACC',1),
('Developer Tools','Eclipse','Ec','#2C2255',2),
('Developer Tools','IntelliJ IDEA','IJ','#FE315D',3);

-- Projects
INSERT INTO public.projects (title, category, description, tech_stack, github_url, demo_url, gradient, featured, display_order) VALUES
('Hospital Management Website','Web','A full-featured web application for managing hospital operations including patient registration, appointment scheduling, doctor management, and medical record tracking. Built with a focus on clean UI and reliable data management.',ARRAY['HTML5','CSS3','JavaScript','MySQL'],'#','#','from-teal-500 to-blue-600',true,1),
('Online Shopping System (Java)','Desktop','A desktop-based e-commerce simulation built in Java featuring product catalog management, user authentication, shopping cart, order processing, and a simple inventory management system.',ARRAY['Java','OOP','File I/O','Swing'],'#','N/A — Desktop App','from-purple-500 to-pink-600',true,2),
('OpenGL 3D Ball Simulation','Desktop','An interactive 3D graphics simulation using OpenGL featuring real-time rendering of a 3D ball with lighting, textures, physics-based bouncing, and keyboard controls for camera movement.',ARRAY['C++','OpenGL','GLUT','3D Graphics'],'#','N/A — Desktop App','from-orange-500 to-red-600',false,3),
('Portfolio Website','Web','This very portfolio — a modern, fully responsive personal website built with React and TypeScript showcasing projects, skills, and professional background. Features smooth animations and a clean, dark design system.',ARRAY['React','TypeScript','Tailwind CSS','Motion'],'#','#','from-blue-500 to-violet-600',false,4),
('Database Management Project','Database','A comprehensive database design and implementation project featuring entity-relationship modeling, normalized schema design, complex SQL queries, stored procedures, and data integrity enforcement.',ARRAY['MySQL','SQL','ERD','Database Design'],'#','N/A','from-emerald-500 to-teal-600',false,5);

-- Experience
INSERT INTO public.experience (role, company, period, type, bullets, display_order) VALUES
('Software Development Intern','[Company Name] · Internship','[Month Year] – [Month Year]','Internship',ARRAY['Assisted in developing and maintaining web application features','Collaborated with senior developers on code reviews and debugging','Contributed to database design and optimization tasks','Documented technical specifications and code comments'],1),
('Academic Project Lead','University · Academic','[Year]','Academic',ARRAY['Led a team of [N] students to design and deliver [Project Name]','Applied software engineering lifecycle (planning, design, implementation, testing)','Presented final deliverable to faculty evaluators'],2),
('Freelance Web Developer','Self-Employed · Freelance','[Year] – Present','Freelance',ARRAY['Designed and built static and dynamic websites for small local clients','Handled full project lifecycle from requirement gathering to deployment','Maintained ongoing client relationships and post-launch support'],3),
('Tech Community Volunteer','[Organization Name] · Volunteer','[Year]','Volunteer',ARRAY['Assisted in organizing tech workshops and coding bootcamps','Mentored junior students in programming fundamentals','Contributed to club social media and website content'],4);

-- Education
INSERT INTO public.education (degree, institution, period, gpa, courses, display_order) VALUES
('Bachelor of Science in Computer Science','[University Name]','[Start Year] – [Graduation Year]','3.80 / 4.00',
ARRAY['Data Structures & Algorithms','Object-Oriented Programming','Database Systems','Computer Networks','Operating Systems','Software Engineering','Web Development','Computer Graphics','Discrete Mathematics','Linear Algebra'],1);

-- Certifications
INSERT INTO public.certifications (title, issuer, date, link, gradient, display_order) VALUES
('Introduction to Web Development','Coursera','2024','#','from-blue-500 to-cyan-500',1),
('Java Programming Masterclass','Udemy','2023','#','from-orange-500 to-red-500',2),
('SQL and Database Design','edX','2023','#','from-emerald-500 to-teal-500',3),
('React - The Complete Guide','Udemy','2024','#','from-sky-500 to-indigo-500',4),
('Git & GitHub Essentials','LinkedIn Learning','2023','#','from-violet-500 to-purple-500',5),
('CS50: Introduction to Computer Science','Harvard/edX','2022','#','from-rose-500 to-pink-500',6);

-- Achievements
INSERT INTO public.achievements (category, icon, items, display_order) VALUES
('Academic Excellence','GraduationCap',ARRAY['Dean''s List / Academic Honor (Year)','Highest GPA in [Subject] course','Top [N]% in graduating class','[Competition / Project Award]'],1),
('Technical Accomplishments','Code2',ARRAY['Completed 5+ self-directed projects','Contributed to open-source repository','Solved 50+ algorithmic problems on LeetCode/HackerRank','Built full-stack application independently'],2),
('Personal Milestones','Star',ARRAY['Delivered freelance project under deadline','Self-taught React and Node.js in [X] months','Organized campus coding workshop','Mentored [N] junior students'],3);
