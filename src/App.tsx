
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { EmergencyProvider } from "./contexts/EmergencyContext";
import { ChatbotProvider } from "./contexts/ChatbotContext";

import Index from "./pages/Index";
import ReportAccident from "./pages/ReportAccident";
import ReportDetails from "./pages/ReportDetails";
import ChatAssistant from "./pages/ChatAssistant";
import MapScreen from "./pages/MapScreen";
import ProfileScreen from "./pages/ProfileScreen";
import EmergencyPage from "./pages/EmergencyPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <EmergencyProvider>
          <ChatbotProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/report" element={<ReportAccident />} />
                <Route path="/report/:id" element={<ReportDetails />} />
                <Route path="/chat" element={<ChatAssistant />} />
                <Route path="/map" element={<MapScreen />} />
                <Route path="/profile" element={<ProfileScreen />} />
                <Route path="/emergency" element={<EmergencyPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </ChatbotProvider>
        </EmergencyProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
