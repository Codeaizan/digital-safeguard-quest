
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import PasswordMaster from "./pages/levels/PasswordMaster";
import PhishingDetective from "./pages/levels/PhishingDetective";
import MalwareHunter from "./pages/levels/MalwareHunter";
import MorseCodeMaster from "./pages/levels/MorseCodeMaster";
import SocialEngineering from "./pages/levels/SocialEngineering";
import FirewallFortress from "./pages/levels/FirewallFortress";
import DataEncryption from "./pages/levels/DataEncryption";
import SocialMediaSleuth from "./pages/levels/SocialMediaSleuth";
import RansomwareRescue from "./pages/levels/RansomwareRescue";
import IncidentResponse from "./pages/levels/IncidentResponse";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/level/1" element={<PasswordMaster />} />
          <Route path="/level/2" element={<PhishingDetective />} />
          <Route path="/level/3" element={<MalwareHunter />} />
          <Route path="/level/4" element={<MorseCodeMaster />} />
          <Route path="/level/5" element={<SocialEngineering />} />
          <Route path="/level/6" element={<FirewallFortress />} />
          <Route path="/level/7" element={<DataEncryption />} />
          <Route path="/level/8" element={<SocialMediaSleuth />} />
          <Route path="/level/9" element={<RansomwareRescue />} />
          <Route path="/level/10" element={<IncidentResponse />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
