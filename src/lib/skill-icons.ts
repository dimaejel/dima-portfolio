/**
 * Official technology logos, served as SVG from the Simple Icons CDN.
 * Each skill row stores an `icon_slug`; when empty we derive one from the name.
 */

const NAME_TO_SLUG: Record<string, string> = {
  java: "openjdk",
  c: "c",
  "c++": "cplusplus",
  "c#": "csharp",
  javascript: "javascript",
  js: "javascript",
  typescript: "typescript",
  python: "python",
  html: "html5",
  html5: "html5",
  css: "css3",
  css3: "css3",
  sass: "sass",
  react: "react",
  "react.js": "react",
  "next.js": "nextdotjs",
  nextjs: "nextdotjs",
  "tailwind css": "tailwindcss",
  tailwindcss: "tailwindcss",
  tailwind: "tailwindcss",
  bootstrap: "bootstrap",
  "node.js": "nodedotjs",
  nodejs: "nodedotjs",
  node: "nodedotjs",
  express: "express",
  "express.js": "express",
  php: "php",
  laravel: "laravel",
  mysql: "mysql",
  postgresql: "postgresql",
  postgres: "postgresql",
  mongodb: "mongodb",
  sqlite: "sqlite",
  firebase: "firebase",
  supabase: "supabase",
  git: "git",
  github: "github",
  gitlab: "gitlab",
  docker: "docker",
  linux: "linux",
  figma: "figma",
  postman: "postman",
  "vs code": "visualstudiocode",
  "visual studio code": "visualstudiocode",
  "intellij idea": "intellijidea",
  eclipse: "eclipseide",
  aws: "amazonwebservices",
  azure: "microsoftazure",
  vercel: "vercel",
  netlify: "netlify",
  vite: "vite",
  redux: "redux",
  jquery: "jquery",
  kotlin: "kotlin",
  swift: "swift",
  dart: "dart",
  flutter: "flutter",
  r: "r",
  matlab: "mathworks",
};

/** Best-effort Simple Icons slug for a technology name. */
export function slugForSkill(name: string, explicit?: string | null): string | null {
  const given = (explicit ?? "").trim().toLowerCase();
  if (given) return given;
  const key = name.trim().toLowerCase();
  if (NAME_TO_SLUG[key]) return NAME_TO_SLUG[key];
  const compact = key.replace(/[\s._-]/g, "");
  const match = Object.entries(NAME_TO_SLUG).find(
    ([k]) => k.replace(/[\s._-]/g, "") === compact,
  );
  return match ? match[1] : null;
}

/** CDN URL for the official logo, tinted with the skill's brand color. */
export function skillIconUrl(slug: string, color?: string | null): string {
  const hex = (color ?? "").replace("#", "").trim();
  return `https://cdn.simpleicons.org/${encodeURIComponent(slug)}${hex ? `/${hex}` : ""}`;
}
