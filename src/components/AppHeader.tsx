import { Link, useLocation } from "react-router-dom";
import { Sparkles } from "lucide-react";

const links = [
  { to: "/", label: "Home" },
  { to: "/poems", label: "Poems" },
  { to: "/drawings", label: "Drawings" },
  { to: "/journal", label: "Journal" },
  { to: "/movies", label: "Movies" },
  { to: "/books", label: "Books" },
];

export function AppHeader() {
  const { pathname } = useLocation();
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-sand">
      <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-full bg-primary grid place-items-center group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-display text-2xl font-bold text-plum tracking-tight">muse</span>
        </Link>
        <nav className="flex items-center gap-1 ml-2 overflow-x-auto scrollbar-hide">
          {links.map((l) => {
            const active = l.to === "/" ? pathname === "/" : pathname.startsWith(l.to);
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  active
                    ? "bg-plum text-background"
                    : "text-plum hover:bg-sand"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
