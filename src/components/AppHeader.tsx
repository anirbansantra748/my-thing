import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Sparkles, Menu, X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportStore } from "@/lib/store";

const links = [
  { to: "/", label: "Home" },
  { to: "/poems", label: "Poems" },
  { to: "/sketches", label: "Sketch" },
  { to: "/journal", label: "Journal" },
  { to: "/movies", label: "Movies" },
  { to: "/books", label: "Books" },
  { to: "/songs", label: "Music" },
  { to: "/scrapbook", label: "Scrapbook" },
];

export function AppHeader() {
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className={`sticky top-0 z-50 border-b border-sand transition-all duration-300 ${
      isOpen ? "bg-background" : "backdrop-blur-md bg-background/80"
    }`}>
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4 relative z-50">
        <Link to="/" className="flex items-center gap-2 group" onClick={() => setIsOpen(false)}>
          <div className="w-9 h-9 rounded-full bg-primary grid place-items-center group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-display text-2xl font-bold text-plum tracking-tight">muse</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => {
            const active = l.to === "/" ? pathname === "/" : pathname.startsWith(l.to);
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  active
                    ? "bg-plum text-background"
                    : "text-plum hover:bg-sand"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={exportStore}
            className="ml-2 gap-2 text-olive/40 hover:text-plum hover:bg-sand rounded-full px-4"
            title="Backup Studio Data"
          >
            <Download className="w-4 h-4" />
            <span className="hidden lg:inline">Backup</span>
          </Button>
        </nav>

        {/* Mobile Menu Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden z-50 text-plum h-11 w-11"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>

        {/* Mobile Nav Overlay */}
        <div
          className={`fixed inset-0 bg-background z-40 transition-all duration-300 md:hidden ${
            isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        >
          <nav className="flex flex-col items-center justify-center h-full gap-8 px-6 pt-20">
            {links.map((l, i) => {
              const active = l.to === "/" ? pathname === "/" : pathname.startsWith(l.to);
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setIsOpen(false)}
                  className={`text-3xl font-display font-bold transition-all duration-500 transform ${
                    isOpen ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                  } ${active ? "text-primary" : "text-plum hover:text-primary"}`}
                  style={{ transitionDelay: `${isOpen ? i * 50 + 150 : 0}ms` }}
                >
                  {l.label}
                </Link>
              );
            })}
            <Button 
              variant="outline" 
              onClick={() => { exportStore(); setIsOpen(false); }}
              className="mt-4 gap-3 rounded-2xl border-sand text-plum font-bold h-14 px-8 w-full max-w-[280px]"
            >
              <Download className="w-5 h-5" /> Backup Studio
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
