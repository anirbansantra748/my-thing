import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Layout from "./components/Layout";
import Poems from "./pages/Poems";
import Drawings from "./pages/Drawings";
import Journal from "./pages/Journal";
import Movies from "./pages/Movies";
import Books from "./pages/Books";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route element={<Layout />}>
            <Route path="/poems" element={<Poems />} />
            <Route path="/poems/:id" element={<Poems />} />
            <Route path="/drawings" element={<Drawings />} />
            <Route path="/drawings/:id" element={<Drawings />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/books" element={<Books />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
