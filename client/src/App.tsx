
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";
import { CollapsibleSidebar } from "@/components/CollapsibleSidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Auth from "@/pages/Auth";
import Index from "@/pages/Index";
import Clients from "@/pages/Clients";
import Projects from "@/pages/Projects";
import PriceList from "@/pages/PriceList";
import MatchingJobs from "@/pages/MatchingJobs";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import "./App.css";
import { useState } from "react";

const queryClient = new QueryClient();

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <TooltipProvider>
          <AuthProvider>
            <Router>
              <div className="min-h-screen flex w-full">
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route
                    path="/*"
                    element={
                      <ProtectedRoute>
                        <div className="flex w-full">
                          <CollapsibleSidebar 
                            onCollapseChange={setIsSidebarCollapsed}
                          />
                          <main className={`flex-1 overflow-auto transition-all duration-300 ${
                            isSidebarCollapsed ? 'ml-16' : 'ml-64'
                          }`}>
                            <div className="p-6">
                              <Routes>
                                <Route path="/" element={<Index />} />
                                <Route path="/clients" element={<Clients />} />
                                <Route path="/projects" element={<Projects />} />
                                <Route path="/price-list" element={<PriceList />} />
                                <Route path="/matching-jobs" element={<MatchingJobs />} />
                                <Route path="/profile" element={<Profile />} />
                                <Route path="/settings" element={<Settings />} />
                                <Route path="*" element={<NotFound />} />
                              </Routes>
                            </div>
                          </main>
                        </div>
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </div>
              <Toaster />
            </Router>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
