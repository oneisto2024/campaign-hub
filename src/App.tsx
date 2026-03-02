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
import CreateClient from "./pages/CreateClient";
import CreateCampaign from "./pages/CreateCampaign";
import AllProjects from "./pages/AllProjects";
import DBImport from "./pages/DBImport";
import EmailValidationAPI from "./pages/EmailValidationAPI";
import UploadEmailSettings from "./pages/UploadEmailSettings";
import WebhookConfig from "./pages/WebhookConfig";
import GDPRCompliance from "./pages/GDPRCompliance";
import AddUser from "./pages/AddUser";
import AllowedDomains from "./pages/AllowedDomains";
import ManageUsers from "./pages/ManageUsers";
import AllClients from "./pages/AllClients";
import EmailDraft from "./pages/EmailDraft";
import EmailSending from "./pages/EmailSending";
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
              
              {/* Client Management */}
              <Route path="/clients/create" element={<CreateClient />} />
              <Route path="/clients/all" element={<AllClients />} />
              
              {/* Project Initiator */}
              <Route path="/project-initiator/create-campaign" element={<CreateCampaign />} />
              <Route path="/project-initiator/all-projects" element={<AllProjects />} />
              
              {/* DB Import */}
              <Route path="/db-import/all-campaigns" element={<DBImport />} />
              
              {/* Email Data */}
              <Route path="/email-data/all-content" element={<EmailDraft />} />
              
              {/* Email Sending / Campaign */}
              <Route path="/campaign/all" element={<EmailSending />} />
              <Route path="/campaign/:type" element={<EmailSending />} />
              
              {/* Lead Discovery */}
              <Route path="/lead-discovery" element={<PlaceholderPage />} />
              
              {/* Console View */}
              <Route path="/console-view/all-console" element={<PlaceholderPage />} />
              
              {/* Metrics */}
              <Route path="/metrics/analytics" element={<PlaceholderPage />} />
              
              {/* Reconnect - removed */}
              
              {/* Administration */}
              <Route path="/administration/add-user" element={<AddUser />} />
              <Route path="/administration/manage-users" element={<ManageUsers />} />
              <Route path="/administration/access-restriction" element={<PlaceholderPage />} />
              <Route path="/administration/allowed-domains" element={<AllowedDomains />} />
              <Route path="/administration/generate-et" element={<PlaceholderPage />} />
              
              {/* Security */}
              <Route path="/security/ip-lists" element={<PlaceholderPage />} />
              
              {/* Email Config */}
              <Route path="/email-config/upload-settings" element={<UploadEmailSettings />} />
              <Route path="/email-config/validation-api" element={<EmailValidationAPI />} />
              <Route path="/email-config/webhook-api" element={<WebhookConfig />} />
              
              {/* GDPR */}
              <Route path="/gdpr/compliance" element={<GDPRCompliance />} />

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
