
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
