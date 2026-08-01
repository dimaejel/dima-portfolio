import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type SiteProfile = Tables<"site_profile">;
export type Project = Tables<"projects">;
export type Skill = Tables<"skills">;
export type Experience = Tables<"experience">;
export type Education = Tables<"education">;
export type Certification = Tables<"certifications">;
export type AboutSection = Tables<"about_section">;
export type CodeCardProp = Tables<"about_code_card">;
export type ContactMessage = Tables<"contact_messages">;

export const qk = {
  siteProfile: ["site_profile"] as const,
  projects: ["projects"] as const,
  projectsAll: ["projects", "all"] as const,
  skills: ["skills"] as const,
  skillsAll: ["skills", "all"] as const,
  experience: ["experience"] as const,
  experienceAll: ["experience", "all"] as const,
  education: ["education"] as const,
  educationAll: ["education", "all"] as const,
  certifications: ["certifications"] as const,
  certificationsAll: ["certifications", "all"] as const,
  about: ["about_section"] as const,
  codeCard: ["about_code_card"] as const,
  codeCardAll: ["about_code_card", "all"] as const,
  messages: ["contact_messages"] as const,
  stats: ["admin", "stats"] as const,
};

export async function fetchSiteProfile(): Promise<SiteProfile | null> {
  const { data, error } = await supabase.from("site_profile").select("*").eq("id", 1).maybeSingle();
  if (error) throw error;
  return data;
}

async function list<T>(table: string, visibleOnly = true): Promise<T[]> {
  let q = supabase.from(table as never).select("*").order("display_order", { ascending: true });
  if (visibleOnly) q = q.eq("visible", true);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as T[];
}

export const fetchProjects = (all = false) => list<Project>("projects", !all);

export async function fetchProject(id: string): Promise<Project | null> {
  const { data, error } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}
export const fetchSkills = (all = false) => list<Skill>("skills", !all);
export const fetchExperience = (all = false) => list<Experience>("experience", !all);
export const fetchEducation = (all = false) => list<Education>("education", !all);
export const fetchCertifications = (all = false) => list<Certification>("certifications", !all);
export const fetchCodeCard = (all = false) => list<CodeCardProp>("about_code_card", !all);

export async function fetchAboutSection(): Promise<AboutSection | null> {
  const { data, error } = await supabase.from("about_section").select("*").eq("id", 1).maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchMessages(): Promise<ContactMessage[]> {
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export const MEDIA_BUCKET = "site-media";
const PUBLIC_PREFIX = `/storage/v1/object/public/${MEDIA_BUCKET}/`;
const SIGN_PREFIX = `/storage/v1/object/sign/${MEDIA_BUCKET}/`;

/** Returns the object path inside the site-media bucket, or null for external URLs. */
export function storagePath(value?: string | null): string | null {
  if (!value) return null;
  for (const prefix of [PUBLIC_PREFIX, SIGN_PREFIX]) {
    const i = value.indexOf(prefix);
    if (i >= 0) return decodeURIComponent(value.slice(i + prefix.length).split("?")[0]);
  }
  if (/^https?:\/\//i.test(value) || value.startsWith("data:")) return null;
  return value.replace(/^\/+/, "");
}

/** Turns a stored value (bucket path or URL) into a URL usable as an <img>/<a> src. */
export async function resolveMediaUrl(value?: string | null): Promise<string | null> {
  if (!value) return null;
  const path = storagePath(value);
  if (!path) return value;
  const { data, error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .createSignedUrl(path, 60 * 60 * 24 * 7);
  if (error) return null;
  return data?.signedUrl ?? null;
}

/** Uploads a file and returns its storage path (stored in the DB, resolved at render). */
export async function uploadMedia(file: File, folder: string): Promise<string> {
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) throw error;
  return path;
}

