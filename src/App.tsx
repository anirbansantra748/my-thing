import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CommandPalette } from "@/components/CommandPalette";
import { getAuth } from "@/lib/store";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Layout from "./components/Layout";
import Poems from "./pages/Poems";
import Drawings from "./pages/Drawings";
import Journal from "./pages/Journal";
import Movies from "./pages/Movies";
import Books from "./pages/Books";
import Sketch from "./pages/Sketch";
import Songs from "./pages/Songs";
import Scrapbook from "./pages/Scrapbook";
import Login from "./pages/Login";
import Vault from "./pages/Vault";
import Anime from "./pages/Anime";
import Exhibition from "./pages/Exhibition";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const auth = getAuth();
  if (!auth) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
        <Route path="/sketches/:id" element={<ProtectedRoute><Sketch /></ProtectedRoute>} />
        
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/poems" element={<Poems />} />
          <Route path="/poems/:id" element={<Poems />} />
          <Route path="/drawings" element={<Drawings />} />
          <Route path="/drawings/:id" element={<Drawings />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/books" element={<Books />} />
          <Route path="/anime" element={<Anime />} />
          <Route path="/sketches" element={<Sketch />} />
          <Route path="/songs" element={<Songs />} />
          <Route path="/scrapbook" element={<Scrapbook />} />
          <Route path="/vault" element={<Vault />} />
          <Route path="/exhibition" element={<Exhibition />} />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <CommandPalette />
        <AnimatedRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
