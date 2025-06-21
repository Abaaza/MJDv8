import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { Building2, Users, FolderOpen, DollarSign, Zap, Settings, Menu, LogOut, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navigation = [
  { name: "Dashboard", href: "/", icon: Building2 },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Matched Jobs", href: "/projects", icon: FolderOpen },
  { name: "Price List", href: "/price-list", icon: DollarSign },
  { name: "Price Matcher", href: "/price-match", icon: Zap },
];

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { signOut, profile, isAdmin } = useAuth();

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-sidebar-background">
      <div className="flex h-14 items-center border-b border-sidebar-border px-4 flex-shrink-0 bg-sidebar-background">
        <Link to="/" className="flex items-center space-x-2">
          <Building2 className="h-6 w-6 text-sidebar-foreground" />
          <span className="font-bold text-sidebar-foreground">ConstructCRM</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto bg-sidebar-background">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
              onClick={() => setOpen(false)}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-4 space-y-2 flex-shrink-0 bg-sidebar-background">
        <Link
          to="/profile"
          className={`flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            location.pathname === "/profile"
              ? "bg-sidebar-primary text-sidebar-primary-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          }`}
          onClick={() => setOpen(false)}
        >
          <User className="h-4 w-4" />
          <span>Profile</span>
        </Link>
        {isAdmin && (
          <Link
            to="/settings"
            className={`flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              location.pathname === "/settings"
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
            onClick={() => setOpen(false)}
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>
        )}
        <div className="pt-2 border-t border-sidebar-border">
          <div className="px-3 py-2 text-xs text-sidebar-foreground opacity-75">
            {profile?.name || 'User'} ({profile?.role})
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4 mr-3" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden fixed top-4 left-4 z-40">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 bg-sidebar-background">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:z-30">
        <div className="flex flex-col flex-grow bg-sidebar-background border-r border-sidebar-border h-screen overflow-hidden">
          <SidebarContent />
        </div>
      </div>
    </>
  );
}
