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
import Sketch from "./pages/Sketch";
import Songs from "./pages/Songs";
import Scrapbook from "./pages/Scrapbook";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/sketches/:id" element={<Sketch />} />
          <Route element={<Layout />}>
            <Route path="/poems" element={<Poems />} />
            <Route path="/poems/:id" element={<Poems />} />
            <Route path="/drawings" element={<Drawings />} />
            <Route path="/drawings/:id" element={<Drawings />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/books" element={<Books />} />
            <Route path="/sketches" element={<Sketch />} />
            <Route path="/songs" element={<Songs />} />
            <Route path="/scrapbook" element={<Scrapbook />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
