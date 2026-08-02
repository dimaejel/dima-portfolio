import { createFileRoute, Link, Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  LayoutDashboard,
  User,
  FolderKanban,
  Sparkles,
  Tags,
  Briefcase,
  GraduationCap,
  Award,
  FileText,
  Code2,
  Mail,
  LogOut,
  Menu,
  ExternalLink,
} from "lucide-react";
import { useIsAdmin, signOut, useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { qk } from "@/lib/cms";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean };
const nav: NavItem[] = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/site-profile", label: "Site Profile", icon: User },
  { to: "/admin/about", label: "About", icon: FileText },
  { to: "/admin/about-code-card", label: "About Code Card", icon: Code2 },
  { to: "/admin/projects", label: "Projects", icon: FolderKanban },
  { to: "/admin/skills", label: "Skills", icon: Sparkles },
  { to: "/admin/skill-categories", label: "Skill Categories", icon: Tags },
  { to: "/admin/experience", label: "Experience", icon: Briefcase },
  { to: "/admin/education", label: "Education", icon: GraduationCap },
  { to: "/admin/certifications", label: "Certifications", icon: Award },
  { to: "/admin/messages", label: "Messages", icon: Mail },
];

function AdminLayout() {
  const { isAdmin, loading, signedIn } = useIsAdmin();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!signedIn) {
      navigate({ to: "/auth", replace: true });
      return;
    }
    if (!isAdmin) navigate({ to: "/", replace: true });
  }, [loading, isAdmin, signedIn, navigate]);

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-text-secondary">
        {loading
          ? "Checking permissions…"
          : !signedIn
            ? "Please sign in…"
            : "Not authorized. Redirecting…"}
      </div>
    );
  }


  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar userEmail={user?.email ?? ""} />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 border-b border-border flex items-center px-4 gap-3 bg-surface/60 backdrop-blur sticky top-0 z-30">
            <SidebarTrigger className="text-foreground">
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
            <h1 className="font-display font-semibold text-foreground">Portfolio CMS</h1>
            <div className="ml-auto flex items-center gap-3">
              <UnreadBadge />
              <Link to="/" className="text-xs text-text-secondary hover:text-primary inline-flex items-center gap-1">
                View site <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </header>
          <main className="flex-1 p-6 max-w-6xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function UnreadBadge() {
  const q = useQuery({
    queryKey: [...qk.messages, "unread-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("contact_messages")
        .select("*", { count: "exact", head: true })
        .eq("read", false);
      if (error) throw error;
      return count ?? 0;
    },
    refetchInterval: 30000,
  });
  if (!q.data) return null;
  return (
    <Link
      to="/admin/messages"
      className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 text-primary px-2.5 py-0.5 text-xs font-semibold"
    >
      <Mail className="h-3 w-3" /> {q.data} new
    </Link>
  );
}

function AdminSidebar({ userEmail }: { userEmail: string }) {
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (path: string, exact = false) =>
    exact ? currentPath === path : currentPath === path || currentPath.startsWith(path + "/");

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Manage</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton asChild isActive={isActive(item.to, item.exact)}>
                    <Link to={item.to as string} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-2 py-2 space-y-1">
          <div className="text-[11px] text-text-muted truncate">{userEmail}</div>
          <button
            onClick={() => signOut()}
            className="w-full inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-text-secondary hover:bg-elevated hover:text-foreground"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
