import re

file_path = "src/components/layout/app-sidebar.tsx"

with open(file_path, "r") as f:
    text = f.read()

# 1. Add Dropdown imports
if "DropdownMenu" not in text:
    text = text.replace('import { Button } from "@/components/ui/button";', 
'''import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";''')

# 2. Remove Payments and Lists from sidebarItems
text = re.sub(r'\s*\{ title: "(Payments|Lists)", url: "/dashboard/(payments|lists)", icon: [A-Za-z]+ \},', '', text)

# 3. Replace Footer content
original_footer_start = "      <SidebarFooter className={`transition-all duration-300 overflow-hidden ${state === \"collapsed\" ? \"flex flex-col items-center justify-center p-2 space-y-4 pb-4\" : \"p-4 space-y-3\"}`}>"
original_footer_code = """      <SidebarFooter className={`transition-all duration-300 overflow-hidden ${state === "collapsed" ? "flex flex-col items-center justify-center p-2 space-y-4 pb-4" : "p-4 space-y-3"}`}>
        <div className={`flex items-center gap-3 ${state === "collapsed" ? "justify-center" : ""}`}>
          <Avatar className={state === "collapsed" ? "w-8 h-8" : ""}>
            <AvatarFallback className={`bg-blue-600 text-white ${state === "collapsed" ? "text-xs" : "text-sm"}`}>
              {user?.email?.slice(0, 2).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          {state !== "collapsed" && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.email}</p>
              <p className="text-xs text-muted-foreground">{profile?.company_name || "Brand"}</p>
            </div>
          )}
        </div>
        <div className={`flex items-center gap-2 ${state === "collapsed" ? "flex-col justify-center gap-3" : "justify-end"}`}>
          <Button variant="ghost" size="icon" onClick={logout} data-testid="button-logout" className="text-muted-foreground ml-auto">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </SidebarFooter>"""

new_footer_code = """      <SidebarFooter className={`transition-all duration-300 overflow-hidden ${state === "collapsed" ? "flex flex-col items-center justify-center py-4" : "p-4"}`}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className={`flex items-center gap-3 cursor-pointer hover:bg-slate-100 p-2 rounded-md transition-colors ${state === "collapsed" ? "justify-center p-0" : ""}`}>
              <Avatar className={state === "collapsed" ? "w-8 h-8" : ""}>
                <AvatarFallback className={`bg-blue-600 text-white ${state === "collapsed" ? "text-xs" : "text-sm"}`}>
                  {user?.email?.slice(0, 2).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              {state !== "collapsed" && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.email}</p>
                  <p className="text-xs text-muted-foreground">{profile?.company_name || "Brand"}</p>
                </div>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-56 mb-2">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/payments" className="w-full flex items-center cursor-pointer">
                <CreditCard className="w-4 h-4 mr-2" />
                <span>Payments</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer focus:text-red-600">
              <LogOut className="w-4 h-4 mr-2" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>"""

if "DropdownMenuTrigger" not in text:
    text = text.replace(original_footer_code, new_footer_code)

with open(file_path, "w") as f:
    f.write(text)

