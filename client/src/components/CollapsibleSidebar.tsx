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
  Menu,
  X,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

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
      className={`flex items-center space-x-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors touch-manipulation min-h-[44px] ${
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
  isMobileOpen?: boolean;
  onMobileOpenChange?: (isOpen: boolean) => void;
}

export const CollapsibleSidebar = React.memo(function CollapsibleSidebar({
  onCollapseChange,
  isMobileOpen = false,
  onMobileOpenChange,
}: CollapsibleSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { signOut, user, isAdmin } = useAuth();

  const toggleSidebar = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    onCollapseChange?.(newCollapsedState);
  };

  useEffect(() => {
    onCollapseChange?.(isCollapsed);
  }, []);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const sidebarContent = (
    <>
      <div className="flex h-14 items-center border-b border-sidebar-border px-4 justify-between flex-shrink-0">
        {!isCollapsed && (
          <Link to="/" className="flex items-center space-x-2">
            <Building2 className="h-6 w-6 text-sidebar-foreground" />
            <span className="font-bold text-sidebar-foreground text-lg">
              MJD Engineering
            </span>
          </Link>
        )}
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-10 w-10 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground touch-manipulation"
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        )}
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMobileOpenChange?.(false)}
            className="h-10 w-10 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground md:hidden touch-manipulation"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
        {navigation.map((item) => (
          <div key={item.name} onClick={() => isMobile && onMobileOpenChange?.(false)}>
            <NavLink
              to={item.href}
              icon={item.icon}
              name={item.name}
              isCollapsed={isCollapsed && !isMobile}
            />
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-2 space-y-2 flex-shrink-0">
        <div onClick={() => isMobile && onMobileOpenChange?.(false)}>
          <NavLink to="/profile" icon={User} name="Profile" isCollapsed={isCollapsed && !isMobile} />
        </div>
        {isAdmin && (
          <div onClick={() => isMobile && onMobileOpenChange?.(false)}>
            <NavLink to="/settings" icon={Settings} name="Settings" isCollapsed={isCollapsed && !isMobile} />
          </div>
        )}
        
        {(!isCollapsed || isMobile) && (
          <div className="pt-2 border-t border-sidebar-border">
            <div className="px-3 py-2 text-xs text-sidebar-foreground opacity-75">
              {user?.name || "User"} ({user?.role})
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          size={(isCollapsed && !isMobile) ? "icon" : "default"}
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground touch-manipulation min-h-[44px]"
          onClick={signOut}
        >
          <LogOut className="h-5 w-5" />
          {(!isCollapsed || isMobile) && <span className="ml-3">Sign Out</span>}
        </Button>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <Sheet open={isMobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent side="left" className="w-64 p-0 bg-sidebar">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
          </SheetHeader>
          <div className="flex h-full flex-col">
            {sidebarContent}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className={`hidden md:flex h-screen flex-col bg-sidebar transition-all duration-300 fixed inset-y-0 left-0 z-30 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {sidebarContent}
    </div>
  );
});
