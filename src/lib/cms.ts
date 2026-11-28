import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { normalizeMediaReference } from "./media-reference";

export type SiteProfile = Tables<"site_profile">;
export type Project = Tables<"projects">;
export type Skill = Tables<"skills">;
export type SkillCategory = Tables<"skill_categories">;
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
  skillCategories: ["skill_categories"] as const,
  skillCategoriesAll: ["skill_categories", "all"] as const,
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
export const fetchSkillCategories = (all = false) =>
  list<SkillCategory>("skill_categories", !all);
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

/** Returns the object path inside the site-media bucket, or null for external URLs. */
export function storagePath(value?: string | null): string | null {
  const reference = normalizeMediaReference(value);
  return !reference || /^https:\/\//i.test(reference) ? null : reference;
}

/** Turns a stored value (bucket path or URL) into a URL usable as an <img>/<a> src. */
export async function resolveMediaUrl(value?: string | null): Promise<string | null> {
  if (!value) return null;
  if (value.startsWith("#")) return value;
  const path = storagePath(value);
  if (!path) return normalizeMediaReference(value);
  const { data, error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .createSignedUrl(path, 60 * 60);
  if (error) throw error;
  return data?.signedUrl ?? null;
}

/** Uploads a file and returns its storage path (stored in the DB, resolved at render). */
export async function uploadMedia(file: File, folder: string): Promise<string> {
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${folder}/${crypto.randomUUID()}.${ext.replace(/[^a-z0-9]/gi, "") || "bin"}`;
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) throw error;
  return path;
}

/** Save the reference before reporting success; only remove this new file on failure. */
export async function uploadRecordMedia(file: File, folder: string, record?: {
  table: "site_profile" | "projects" | "certifications";
  id: string | number;
  field: "avatar_url" | "resume_url" | "image_url" | "document_url" | "gallery";
}): Promise<string | string[]> {
  const path = await uploadMedia(file, folder);
  if (!record) return path;
  try {
    let value: string | string[] = path;
    if (record.field === "gallery") {
      const { data, error } = await supabase.from("projects").select("gallery").eq("id", String(record.id)).single();
      if (error) throw error;
      value = [...data.gallery, path];
    }
    let error;
    if (record.table === "site_profile") {
      if (record.field !== "avatar_url" && record.field !== "resume_url") throw new Error("Invalid profile file field.");
      const result = await supabase.from("site_profile").update(record.field === "avatar_url" ? { avatar_url: path } : { resume_url: path })
        .eq("id", Number(record.id)).select("id").single();
      error = result.error;
    } else if (record.table === "certifications") {
      if (record.field !== "image_url" && record.field !== "document_url") throw new Error("Invalid certificate file field.");
      const result = await supabase.from("certifications").update(record.field === "image_url" ? { image_url: path } : { document_url: path })
        .eq("id", String(record.id)).select("id").single();
      error = result.error;
    } else {
      if (record.field !== "gallery" && record.field !== "image_url") throw new Error("Invalid project file field.");
      const result = await supabase.from("projects").update(Array.isArray(value) ? { gallery: value } : { image_url: value })
        .eq("id", String(record.id)).select("id").single();
      error = result.error;
    }
    if (error) throw error;
    return value;
  } catch (error) {
    await supabase.storage.from(MEDIA_BUCKET).remove([path]);
    throw error;
  }
}

