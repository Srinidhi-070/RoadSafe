
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { EmergencyProvider } from "./contexts/EmergencyContext";
import { ChatbotProvider } from "./contexts/ChatbotContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";

import LandingPage from "./pages/LandingPage";
import Index from "./pages/Index";
import ReportAccident from "./pages/ReportAccident";
import ReportDetails from "./pages/ReportDetails";
import ChatAssistant from "./pages/ChatAssistant";
import MapScreen from "./pages/MapScreen";
import ProfileScreen from "./pages/ProfileScreen";
import EmergencyPage from "./pages/EmergencyPage";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";
import MainLayout from "./layouts/MainLayout";

// Create a new QueryClient instance outside of the component
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 1000, // 10 seconds
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      
      {/* Root path redirection */}
      <Route path="/" element={<Navigate to="/landing" replace />} />
      
      {/* Protected routes with MainLayout */}
      <Route element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route path="/home" element={<Index />} />
        <Route path="/report" element={<ReportAccident />} />
        <Route path="/map" element={<MapScreen />} />
        <Route path="/chat" element={<ChatAssistant />} />
        <Route path="/profile" element={<ProfileScreen />} />
      </Route>
      
      {/* Protected routes without bottom navigation */}
      <Route path="/report/:id" element={
        <ProtectedRoute>
          <ReportDetails />
        </ProtectedRoute>
      } />
      <Route path="/emergency" element={
        <ProtectedRoute>
          <EmergencyPage />
        </ProtectedRoute>
      } />
      
      {/* Catch all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <ThemeProvider>
            <AuthProvider>
              <EmergencyProvider>
                <ChatbotProvider>
                  <Toaster />
                  <Sonner position="top-center" />
                  <AppRoutes />
                </ChatbotProvider>
              </EmergencyProvider>
            </AuthProvider>
          </ThemeProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
