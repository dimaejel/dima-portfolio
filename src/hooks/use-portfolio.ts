import { useQuery } from "@tanstack/react-query";
import {
  fetchSiteProfile,
  fetchProjects,
  fetchSkills,
  fetchSkillCategories,
  fetchExperience,
  fetchEducation,
  fetchCertifications,
  fetchAboutSection,
  fetchCodeCard,
  qk,
  type SiteProfile,
} from "@/lib/cms";

export function useSiteProfile() {
  const q = useQuery({ queryKey: qk.siteProfile, queryFn: fetchSiteProfile });
  return q.data as SiteProfile | null | undefined;
}

export const useProjects = () =>
  useQuery({ queryKey: qk.projects, queryFn: () => fetchProjects(false) });
export const useSkills = () =>
  useQuery({ queryKey: qk.skills, queryFn: () => fetchSkills(false) });
export const useSkillCategories = () =>
  useQuery({ queryKey: qk.skillCategories, queryFn: () => fetchSkillCategories(false) });
export const useExperienceQ = () =>
  useQuery({ queryKey: qk.experience, queryFn: () => fetchExperience(false) });
export const useEducationQ = () =>
  useQuery({ queryKey: qk.education, queryFn: () => fetchEducation(false) });
export const useCertificationsQ = () =>
  useQuery({ queryKey: qk.certifications, queryFn: () => fetchCertifications(false) });
export const useAboutSection = () =>
  useQuery({ queryKey: qk.about, queryFn: fetchAboutSection });
export const useCodeCard = () =>
  useQuery({ queryKey: qk.codeCard, queryFn: () => fetchCodeCard(false) });

export type SiteStat = { label: string; value: string };

export function profileStats(p: SiteProfile | null | undefined): SiteStat[] {
  if (!p) return [];
  const raw = p.stats;
  if (Array.isArray(raw)) return raw as SiteStat[];
  return [];
}
