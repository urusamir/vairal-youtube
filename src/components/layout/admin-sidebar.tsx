import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Users, LogOut, Settings } from "lucide-react";

import { useAdminAuth } from "@/providers/auth-admin.provider";
import { cn } from "@/lib/utils";

const menuItems = [
  { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Users", url: "/admin/brands", icon: Users },
];

export function AdminSidebar() {
  const location = usePathname() || "";
  const { logout } = useAdminAuth();
  // Next.js Link handles navigation natively

  const handleLogout = async () => {
    await logout(); // logout() in auth-admin redirects to /admin-login automatically
  };

  return (
    <Sidebar className="border-r border-slate-800" variant="sidebar">
      <div className="flex flex-col h-full w-full bg-[#1c1f26]">
        <SidebarHeader className="p-6 pb-2 pt-8 pl-8">
          <Link
            href="/admin/dashboard"
            className="flex items-center"
          >
            <span className="font-bold text-xl tracking-tight text-white drop-shadow-md">Vairal</span>
          </Link>
        </SidebarHeader>

        <SidebarContent className="px-6 mt-8">
          <SidebarGroup className="p-0 mb-8">
            <div className="px-2 mb-3 text-[11px] font-bold tracking-widest text-slate-400 uppercase">
              MAIN MENU
            </div>
            <SidebarGroupContent>
              <div className="flex flex-col gap-1">
                {menuItems.map((item) => {
                  const isActive = location === item.url || location.startsWith(item.url + "/");
                  
                  return (
                    <Link
                      key={item.title}
                      href={item.url}
                      className={cn(
                        "w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-semibold transition-all text-sm",
                        isActive 
                          ? "bg-blue-600 text-white shadow-md shadow-blue-900/20" 
                          : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                      )}
                    >
                      <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400")} strokeWidth={isActive ? 2.5 : 2} />
                      <span>{item.title}</span>
                    </Link>
                  );
                })}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-6 mb-4 mt-auto">
          <div className="flex flex-col gap-1">
            <Link
              href="/admin/settings"
              className={cn(
                "w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-semibold transition-all text-sm",
                location.startsWith("/admin/settings") 
                  ? "bg-blue-600 text-white shadow-md shadow-blue-900/20" 
                  : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
              )}
            >
              <Settings className="w-5 h-5" strokeWidth={2} />
              <span>Settings</span>
            </Link>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-semibold transition-all text-sm text-slate-300 hover:bg-slate-800/50 hover:text-white"
            >
              <LogOut className="w-5 h-5" strokeWidth={2} />
              <span>Log Out</span>
            </button>
          </div>
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}
