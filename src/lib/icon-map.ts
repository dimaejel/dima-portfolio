import {
  Award,
  BookOpen,
  Briefcase,
  Code2,
  Database,
  GraduationCap,
  Globe,
  Rocket,
  Sparkles,
  Star,
  Target,
  Trophy,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Award, BookOpen, Briefcase, Code2, Database, GraduationCap, Globe,
  Rocket, Sparkles, Star, Target, Trophy, Users, Zap,
};

export function iconFor(name: string | null | undefined, fallback: LucideIcon = Trophy): LucideIcon {
  if (!name) return fallback;
  return iconMap[name] ?? fallback;
}

export function categoryIcon(category: string): LucideIcon {
  const k = category.toLowerCase();
  if (k.includes("web")) return Globe;
  if (k.includes("data")) return Database;
  if (k.includes("mobile")) return Rocket;
  return Code2;
}
