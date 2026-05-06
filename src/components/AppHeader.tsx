import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sparkles, Menu, X, Download, LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportStore, getAuth, setAuth, User } from "@/lib/store";

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
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(getAuth());

  useEffect(() => {
    const syncAuth = () => setUser(getAuth());
    window.addEventListener("muse:auth:update", syncAuth);
    return () => window.removeEventListener("muse:auth:update", syncAuth);
  }, []);

  const handleLogout = () => {
    setAuth(null);
    setIsOpen(false);
    navigate("/login");
  };

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
          
          <div className="w-px h-6 bg-sand mx-2" />
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={exportStore}
            className="text-olive/40 hover:text-plum hover:bg-sand rounded-full px-4 gap-2"
            title="Backup Studio Data"
          >
            <Download className="w-4 h-4" />
          </Button>

          {user && (
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-sand">
               <span className="text-[10px] font-black uppercase tracking-widest text-olive/40 hidden lg:block">{user.username}</span>
               <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-full h-9 w-9 text-olive/40 hover:text-red-500 hover:bg-red-500/5">
                  <LogOut className="w-4 h-4" />
               </Button>
            </div>
          )}
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
            {user && (
              <div className="flex flex-col items-center gap-2 mb-4">
                <div className="w-16 h-16 rounded-full bg-sand grid place-items-center">
                  <UserIcon className="w-8 h-8 text-plum/20" />
                </div>
                <span className="text-sm font-black uppercase tracking-[0.2em] text-plum">{user.username}</span>
              </div>
            )}

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
            
            <div className="flex flex-col gap-3 w-full max-w-[280px] mt-4">
              <Button 
                variant="outline" 
                onClick={() => { exportStore(); setIsOpen(false); }}
                className="gap-3 rounded-2xl border-sand text-plum font-bold h-14 px-8 w-full shadow-sm"
              >
                <Download className="w-5 h-5" /> Backup Studio
              </Button>
              {user && (
                <Button 
                  variant="ghost" 
                  onClick={handleLogout}
                  className="gap-3 rounded-2xl text-red-500 font-bold h-14 px-8 w-full hover:bg-red-500/5"
                >
                  <LogOut className="w-5 h-5" /> Sign Out
                </Button>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
