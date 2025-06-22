import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  Building2,
  Users,
  FolderOpen,
  DollarSign,
  Zap,
  Settings,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const navigation = [
  { name: "Dashboard", href: "/", icon: Building2 },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Projects", href: "/projects", icon: FolderOpen },
  { name: "Price List", href: "/price-list", icon: DollarSign },
  { name: "Price Matching", href: "/price-match", icon: Zap },
];

const NavLink = ({ to, icon: Icon, name, isCollapsed }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  const linkContent = (
    <div
      className={`flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        isActive
          ? "bg-sidebar-primary text-sidebar-primary-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      }`}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      {!isCollapsed && <span>{name}</span>}
    </div>
  );

  return (
    <Link to={to} className="block">
      {isCollapsed ? (
        <Tooltip>
          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
          <TooltipContent side="right">
            <p>{name}</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        linkContent
      )}
    </Link>
  );
};

interface CollapsibleSidebarProps {
  onCollapseChange?: (isCollapsed: boolean) => void;
}

export const CollapsibleSidebar = React.memo(function CollapsibleSidebar({
  onCollapseChange,
}: CollapsibleSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { signOut, user, isAdmin } = useAuth();

  const toggleSidebar = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    onCollapseChange?.(newCollapsedState);
  };

  useEffect(() => {
    onCollapseChange?.(isCollapsed);
  }, []);

  return (
    <div
      className={`flex h-screen flex-col bg-sidebar transition-all duration-300 fixed inset-y-0 left-0 z-30 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex h-14 items-center border-b border-sidebar-border px-4 justify-between flex-shrink-0">
        {!isCollapsed && (
          <Link to="/" className="flex items-center space-x-2">
            <Building2 className="h-6 w-6 text-sidebar-foreground" />
            <span className="font-bold text-sidebar-foreground text-lg">
              MJD Engineering
            </span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            icon={item.icon}
            name={item.name}
            isCollapsed={isCollapsed}
          />
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-2 space-y-2 flex-shrink-0">
        <NavLink to="/profile" icon={User} name="Profile" isCollapsed={isCollapsed} />
        {isAdmin && <NavLink to="/settings" icon={Settings} name="Settings" isCollapsed={isCollapsed} />}
        
        {!isCollapsed && (
          <div className="pt-2 border-t border-sidebar-border">
            <div className="px-3 py-2 text-xs text-sidebar-foreground opacity-75">
              {user?.name || "User"} ({user?.role})
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          size={isCollapsed ? "icon" : "default"}
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={signOut}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span className="ml-3">Sign Out</span>}
        </Button>
      </div>
    </div>
  );
});
