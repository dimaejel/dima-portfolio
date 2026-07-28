ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS icon_slug text NOT NULL DEFAULT '';

UPDATE public.skills SET icon_slug = m.slug
FROM (VALUES
  ('java','openjdk'), ('c','c'), ('c++','cplusplus'), ('c#','csharp'),
  ('javascript','javascript'), ('typescript','typescript'), ('python','python'),
  ('html','html5'), ('html5','html5'), ('css','css3'), ('css3','css3'),
  ('react','react'), ('next.js','nextdotjs'), ('tailwind css','tailwindcss'),
  ('tailwindcss','tailwindcss'), ('bootstrap','bootstrap'),
  ('node.js','nodedotjs'), ('nodejs','nodedotjs'), ('express','express'),
  ('express.js','express'), ('php','php'), ('laravel','laravel'),
  ('mysql','mysql'), ('postgresql','postgresql'), ('mongodb','mongodb'),
  ('sqlite','sqlite'), ('firebase','firebase'), ('supabase','supabase'),
  ('git','git'), ('github','github'), ('gitlab','gitlab'), ('docker','docker'),
  ('linux','linux'), ('figma','figma'), ('postman','postman'),
  ('vs code','visualstudiocode'), ('visual studio code','visualstudiocode'),
  ('intellij idea','intellijidea'), ('eclipse','eclipseide'),
  ('aws','amazonwebservices'), ('azure','microsoftazure'), ('vercel','vercel'),
  ('netlify','netlify'), ('vite','vite'), ('redux','redux'), ('jquery','jquery'),
  ('kotlin','kotlin'), ('swift','swift'), ('dart','dart'), ('flutter','flutter'),
  ('r','r'), ('matlab','mathworks'), ('assembly','assemblyscript')
) AS m(name, slug)
WHERE lower(trim(public.skills.name)) = m.name AND public.skills.icon_slug = '';