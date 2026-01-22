import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LayoutProvider } from "./contexts/LayoutContext";
import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import MyCalendar from "./pages/MyCalendar";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import PlaceholderPage from "./pages/PlaceholderPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LayoutProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/my-calendar" element={<MyCalendar />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              
              {/* Project Initiator */}
              <Route path="/project-initiator/create-campaign" element={<PlaceholderPage />} />
              <Route path="/project-initiator/all-projects" element={<PlaceholderPage />} />
              
              {/* DB Import */}
              <Route path="/db-import/all-campaigns" element={<PlaceholderPage />} />
              
              {/* Email Data */}
              <Route path="/email-data/all-content" element={<PlaceholderPage />} />
              
              {/* Email Sending / Campaign */}
              <Route path="/campaign/abm-campaign" element={<PlaceholderPage />} />
              <Route path="/campaign/webinar" element={<PlaceholderPage />} />
              <Route path="/campaign/click-campaign" element={<PlaceholderPage />} />
              <Route path="/campaign/mql-campaign" element={<PlaceholderPage />} />
              <Route path="/campaign/lead-generation" element={<PlaceholderPage />} />
              <Route path="/campaign/funnel-set" element={<PlaceholderPage />} />
              
              {/* Lead Discovery */}
              <Route path="/lead-discovery" element={<PlaceholderPage />} />
              
              {/* Console View */}
              <Route path="/console-view/all-console" element={<PlaceholderPage />} />
              
              {/* Metrics */}
              <Route path="/metrics/analytics" element={<PlaceholderPage />} />
              
              {/* Reconnect */}
              <Route path="/reconnect/upload-campaign" element={<PlaceholderPage />} />
              <Route path="/reconnect/all-campaigns" element={<PlaceholderPage />} />
              
              {/* Administration */}
              <Route path="/administration/add-user" element={<PlaceholderPage />} />
              <Route path="/administration/manage-users" element={<PlaceholderPage />} />
              <Route path="/administration/access-restriction" element={<PlaceholderPage />} />
              <Route path="/administration/allowed-domains" element={<PlaceholderPage />} />
              <Route path="/administration/generate-et" element={<PlaceholderPage />} />
              
              {/* Security */}
              <Route path="/security/ip-lists" element={<PlaceholderPage />} />
              
              {/* Email Config */}
              <Route path="/email-config/upload-settings" element={<PlaceholderPage />} />
              
              {/* GDPR */}
              <Route path="/gdpr/search" element={<PlaceholderPage />} />
              
              {/* Ask AI */}
              <Route path="/ask-ai/search-email" element={<PlaceholderPage />} />
              <Route path="/ask-ai/search-assets" element={<PlaceholderPage />} />
              <Route path="/ask-ai/unsubscribe-lists" element={<PlaceholderPage />} />
            </Route>
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </LayoutProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
