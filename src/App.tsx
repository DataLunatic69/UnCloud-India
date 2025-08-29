import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { voiceManager } from "@/lib/voiceManager";
import { useEffect } from "react";
import Index from "./pages/Index";
import AITherapist from "./pages/AITherapist";
import AIMeditations from "./pages/AIMeditations";
import AIAffirmations from "./pages/AIAffirmations";  
import MoodTracking from "./pages/MoodTracking";
import MythBuster from "./pages/MythBuster";
import LocalResources from "./pages/LocalResources";
import StigmaSupport from "./pages/StigmaSupport";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Component to handle route changes and voice cleanup
const RouteListener = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Stop any ongoing voice when route changes
    voiceManager.stopVoice();
  }, [location]);
  
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <RouteListener />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/ai-therapist" element={<AITherapist />} />
              <Route path="/ai-meditations" element={<AIMeditations />} />
              <Route path="/ai-affirmations" element={<AIAffirmations />} />
              <Route path="/mood-tracking" element={<MoodTracking />} />
              <Route path="/myth-buster" element={<MythBuster />} />
              <Route path="/local-resources" element={<LocalResources />} />
              <Route path="/stigma-support" element={<StigmaSupport />} />
              <Route path="/sign-in" element={<SignIn />} />
              <Route path="/sign-up" element={<SignUp />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AppProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
