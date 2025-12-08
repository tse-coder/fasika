import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Children from "./pages/children/Children";
import Register from "./pages/register/Register";
import Payments from "./pages/Payments";
import NotFound from "./pages/NotFound";
import { OverlayModal } from "./components/overlay";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <OverlayModal />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/children" element={<Children />} />
          <Route path="/register" element={<Register />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
