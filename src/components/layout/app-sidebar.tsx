import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Search, CreditCard, Calendar, Megaphone, LogOut, BarChart3, KanbanSquare, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/providers/auth.provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const sidebarItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Discover", url: "/dashboard/discover", icon: Search },
  { title: "Campaigns", url: "/dashboard/campaigns", icon: Megaphone },
  { title: "Reporting", url: "/dashboard/reporting", icon: BarChart3 },
];

export function AppSidebar() {
  const location = usePathname() || "";
  const { user, logout } = useAuth();

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 flex w-24 flex-col items-center border-r border-[#eceefa] bg-gradient-to-b from-[#fbfcff] via-[#f8faff] to-[#f7f6ff] shadow-[10px_0_34px_rgba(31,41,55,0.035)] print:hidden">
        <Link
          href="/dashboard"
          className="mt-5 flex h-12 w-full items-center justify-center text-[15px] font-black tracking-[0.12em] text-[#111827] transition-colors hover:text-[#4f46e5]"
          data-testid="link-sidebar-logo"
          aria-label="Go to dashboard"
        >
          VAIRAL<span className="ml-1 text-[#7c5cff]">✦</span>
        </Link>

        <nav className="mt-9 flex w-full flex-1 flex-col items-center gap-3 px-3" aria-label="Primary navigation">
          {sidebarItems.map((item) => {
            const isDashboardActive = item.url === "/dashboard" && location === "/dashboard";
            const isActive = item.url !== "/dashboard" && location.startsWith(item.url);
            const active = isDashboardActive || isActive;

            return (
              <Link
                key={item.title}
                href={item.url}
                data-testid={`link-sidebar-${item.title.toLowerCase()}`}
                aria-current={active ? "page" : undefined}
                className={`flex h-16 w-full flex-col items-center justify-center rounded-2xl text-center transition-all duration-200 ease-out ${
                  active
                    ? "bg-[#f0edff] text-[#4f46e5] shadow-[0_12px_30px_rgba(79,70,229,0.10)]"
                    : "text-[#6b7280] hover:bg-[#f4f6fb] hover:text-[#4f46e5]"
                }`}
              >
                <item.icon className="h-[21px] w-[21px]" strokeWidth={active ? 2.2 : 2} />
                <span className={`mt-1.5 text-[11.5px] font-medium leading-none ${active ? "text-[#111827]" : "text-[#9ca3af]"}`}>
                  {item.title}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="mb-5 flex w-full justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="rounded-full outline-none ring-offset-2 transition-transform hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-[#7c5cff]"
                aria-label="Open account menu"
              >
                <Avatar className="h-10 w-10 shadow-[0_10px_24px_rgba(79,70,229,0.18)]">
                  <AvatarFallback className="bg-[#4f46e5] text-sm font-semibold text-white">
                    {user?.email?.slice(0, 2).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" side="right" className="ml-3 w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/payments" className="w-full flex items-center cursor-pointer">
                  <CreditCard className="w-4 h-4 mr-2" />
                  <span>Payments</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings?tab=manual" className="w-full flex items-center cursor-pointer">
                  <Settings className="w-4 h-4 mr-2" />
                  <span>Data Import</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer focus:text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
      <div className="w-24 shrink-0 print:hidden" aria-hidden="true" />
    </>
  );
}
