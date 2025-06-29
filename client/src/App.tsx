import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";
import { CollapsibleSidebar } from "@/components/CollapsibleSidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { MobileHeader } from "@/components/MobileHeader";
import { ConnectionMonitor } from "@/components/ConnectionMonitor";
import React, { Suspense, lazy } from 'react';
import "./App.css";
import { useState, useEffect } from "react";

// Force Amplify rebuild for ngrok API URL - Build #2 (2025-06-21)

const queryClient = new QueryClient();

const Auth = lazy(() => import('./pages/Auth'));
const Index = lazy(() => import('./pages/Index'));
const Clients = lazy(() => import('./pages/Clients'));
const Projects = lazy(() => import('./pages/Projects'));
const PriceList = lazy(() => import('./pages/PriceList'));
const MatchingJobs = lazy(() => import('./pages/MatchingJobs'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Lazy load images
const LazyImage = ({ src, alt, ...props }) => (
  <Suspense fallback={<div>Loading image...</div>}>
    <img src={src} alt={alt} loading="lazy" {...props} />
  </Suspense>
);

function AppContent() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const isAuthPage = location.pathname === '/auth';

  // Debug logging for API URL
  useEffect(() => {
    console.log('=== API Configuration Debug ===');
    // API URL is now handled automatically by config/api.ts
    console.log('All env vars:', import.meta.env);
    console.log('==============================');
  }, []);

  return (
    <div className={isAuthPage ? '' : "min-h-screen flex w-full"}>
      <Routes>
        <Route path="/auth" element={<Suspense fallback={<div>Loading...</div>}><Auth /></Suspense>} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="flex flex-col w-full h-screen">
                <MobileHeader onMenuClick={() => setIsMobileSidebarOpen(true)} />
                <div className="flex flex-1 overflow-hidden">
                  <CollapsibleSidebar 
                    onCollapseChange={setIsSidebarCollapsed}
                    isMobileOpen={isMobileSidebarOpen}
                    onMobileOpenChange={setIsMobileSidebarOpen}
                  />
                  <main className={`flex-1 overflow-auto transition-all duration-300 ${
                    isSidebarCollapsed ? 'md:ml-16' : 'md:ml-64'
                  }`}>
                    <div>
                      <Routes>
                      <Route path="/" element={<Suspense fallback={<div>Loading...</div>}><Index /></Suspense>} />
                      <Route path="/clients" element={<Suspense fallback={<div>Loading...</div>}><Clients /></Suspense>} />
                      <Route path="/projects" element={<Suspense fallback={<div>Loading...</div>}><Projects /></Suspense>} />
                      <Route path="/price-list" element={<Suspense fallback={<div>Loading...</div>}><PriceList /></Suspense>} />
                      <Route path="/price-match" element={<Suspense fallback={<div>Loading...</div>}><MatchingJobs /></Suspense>} />
                      <Route path="/matching-jobs" element={<Suspense fallback={<div>Loading...</div>}><MatchingJobs /></Suspense>} />
                      <Route path="/profile" element={<Suspense fallback={<div>Loading...</div>}><Profile /></Suspense>} />
                      <Route path="/settings" element={<Suspense fallback={<div>Loading...</div>}><Settings /></Suspense>} />
                      <Route path="*" element={<Suspense fallback={<div>Loading...</div>}><NotFound /></Suspense>} />
                    </Routes>
                  </div>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        }
      />
    </Routes>
  </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <TooltipProvider>
          <AuthProvider>
            <Router
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
              <AppContent />
              <ConnectionMonitor />
              <Toaster />
            </Router>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
