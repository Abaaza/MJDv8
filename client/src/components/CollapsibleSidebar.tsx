
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Building2, Users, FolderOpen, DollarSign, Zap, Settings, Menu, LogOut, User, ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const navigation = [
  { name: "Dashboard", href: "/", icon: Building2 },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Matched Jobs", href: "/projects", icon: FolderOpen },
  { name: "Price List", href: "/price-list", icon: DollarSign },
  { name: "Price Matcher", href: "/matching-jobs", icon: Zap },
];

interface CollapsibleSidebarProps {
  onCollapseChange?: (isCollapsed: boolean) => void;
}

export function CollapsibleSidebar({ onCollapseChange }: CollapsibleSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { signOut, profile, isAdmin } = useAuth();

  const toggleSidebar = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    onCollapseChange?.(newCollapsedState);
  };

  // Notify parent of initial state
  useEffect(() => {
    onCollapseChange?.(isCollapsed);
  }, []);

  return (
    <div className={`flex h-screen flex-col bg-sidebar-background border-r border-sidebar-border transition-all duration-300 fixed inset-y-0 z-30 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <div className="flex h-14 items-center border-b border-sidebar-border px-4 justify-between flex-shrink-0 bg-sidebar-background">
        {!isCollapsed && (
          <Link to="/" className="flex items-center space-x-2">
            <Building2 className="h-6 w-6 text-sidebar-foreground" />
            <span className="font-bold text-sidebar-foreground">ConstructCRM</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      
      <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto bg-sidebar-background">
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
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>
      
      <div className="border-t border-sidebar-border p-2 space-y-2 flex-shrink-0 bg-sidebar-background">
        <Link
          to="/profile"
          className={`flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            location.pathname === "/profile"
              ? "bg-sidebar-primary text-sidebar-primary-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          }`}
          title={isCollapsed ? "Profile" : undefined}
        >
          <User className="h-4 w-4 flex-shrink-0" />
          {!isCollapsed && <span>Profile</span>}
        </Link>
        
        {isAdmin && (
          <Link
            to="/settings"
            className={`flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              location.pathname === "/settings"
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
            title={isCollapsed ? "Settings" : undefined}
          >
            <Settings className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && <span>Settings</span>}
          </Link>
        )}
        
        {!isCollapsed && (
          <div className="pt-2 border-t border-sidebar-border">
            <div className="px-3 py-2 text-xs text-sidebar-foreground opacity-75">
              {profile?.name || 'User'} ({profile?.role})
            </div>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          className={`${isCollapsed ? 'w-full justify-center' : 'w-full justify-start'} text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground`}
          onClick={signOut}
          title={isCollapsed ? "Sign Out" : undefined}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span className="ml-3">Sign Out</span>}
        </Button>
      </div>
    </div>
  );
}
