import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import ContentDetail from "./pages/ContentDetail";
import MyLists from "./pages/MyLists";
import Auth from "./pages/Auth";
import LeavingSoon from "./pages/LeavingSoon";
import Upcoming from "./pages/Upcoming";
import TVProgram from "./pages/TVProgram";
import Stats from "./pages/Stats";
import TopRated from "./pages/TopRated";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/content/:id" element={<ContentDetail />} />
            <Route path="/lists" element={<MyLists />} />
            <Route path="/leaving-soon" element={<LeavingSoon />} />
            <Route path="/upcoming" element={<Upcoming />} />
            <Route path="/tv-program" element={<TVProgram />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/top-rated" element={<TopRated />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
