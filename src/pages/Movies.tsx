import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useStore, uid, MovieEntry, getAuth } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/StarRating";
import { Plus, X, Film, Image as ImageIcon, Search, Pin, Award, Sparkles, Filter, ArrowUpRight, Star } from "lucide-react";
import { toast } from "sonner";

const STATUSES: MovieEntry["status"][] = ["watching", "watched", "watchlist"];

export default function Movies() {
  const [movies, setMovies] = useStore("movies");
  const [open, setOpen] = useState<MovieEntry | null>(null);
  const [filter, setFilter] = useState<"all" | MovieEntry["status"]>("all");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"updated" | "rating" | "year">("updated");

  const categories = Array.from(new Set(movies.map(m => m.category).filter(Boolean)));

  const filtered = movies
    .filter((m) => {
      const matchFilter = filter === "all" || m.status === filter;
      const matchSearch = m.title.toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter === "all" || m.category === categoryFilter;
      return matchFilter && matchSearch && matchCategory;
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "year") return (b.year || "").localeCompare(a.year || "");
      return b.updatedAt - a.updatedAt;
    });

  const insights = {
    total: movies.length,
    masterpieces: movies.filter(m => m.isMasterpiece).length,
    topCategory: categories.sort((a, b) => 
      movies.filter(m => m.category === b).length - movies.filter(m => m.category === a).length
    )[0] || "None",
    avgRating: (movies.reduce((acc, m) => acc + m.rating, 0) / movies.length || 0).toFixed(1)
  };

  const startNew = () => {
    const user = getAuth();
    if (!user) return;
    setOpen({
      id: uid(), userId: user.id, title: "", year: "", rating: 0, status: "watched", notes: "",
      createdAt: Date.now(), updatedAt: Date.now(),
    });
  };

  const save = (m: MovieEntry) => {
    if (!m.title.trim()) return;
    const others = movies.filter((x) => x.id !== m.id);
    setMovies([...others, { ...m, updatedAt: Date.now() }]);
    setOpen(null);
  };

  const remove = (id: string) => { setMovies(movies.filter((m) => m.id !== id)); setOpen(null); };

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 pt-6 md:pt-10 pb-32">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6 md:mb-8">
        <div>
          <p className="text-xs md:text-sm uppercase tracking-widest text-olive mb-1 md:mb-2">Reels & ratings</p>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-plum">Movies</h1>
        </div>
        <Button onClick={startNew} className="rounded-full h-11 px-5 bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-1.5" /> Add movie
        </Button>
      </div>

      {/* Stats Section - Premium Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-12">
        {[
          { label: "Collection", val: insights.total, icon: Film, color: "text-blue-500", bg: "bg-blue-500/5" },
          { label: "Masterpieces", val: insights.masterpieces, icon: Award, color: "text-amber-500", bg: "bg-amber-500/5" },
          { label: "Genre Reach", val: insights.topCategory, icon: Sparkles, color: "text-purple-500", bg: "bg-purple-500/5" },
          { label: "Avg Rating", val: `${insights.avgRating} ★`, icon: Star, color: "text-emerald-500", bg: "bg-emerald-500/5" }
        ].map((stat, i) => (
          <div key={i} className="group relative bg-white/40 backdrop-blur-xl border border-black/5 p-6 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-olive/40 mb-1">{stat.label}</div>
            <div className="text-2xl font-black text-plum tracking-tighter">{stat.val}</div>
            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
               <ArrowUpRight className="w-4 h-4 text-plum/20" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-12 items-center">
        <div className="flex-1 flex gap-3 overflow-x-auto scrollbar-hide w-full pb-2 md:pb-0">
          {(["all", ...STATUSES] as const).map((s) => (
            <button key={s} onClick={() => setFilter(s)}
                    className={`px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-300 border ${
                      filter === s ? "bg-plum text-white border-plum shadow-lg shadow-plum/20" : "bg-white text-plum border-black/5 hover:border-plum/20"
                    }`}>
              {s}
            </button>
          ))}
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-olive/30" />
            <Input 
              placeholder="Search..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 pr-4 rounded-full bg-white border-black/5 w-full md:w-64 h-11 text-sm focus-visible:ring-plum/10 transition-all"
            />
          </div>
          
          <div className="flex gap-2 shrink-0">
            <select 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-white border border-black/5 rounded-full px-4 h-11 text-[10px] font-black uppercase tracking-widest text-plum outline-none cursor-pointer hover:bg-black/5 transition-all"
            >
              <option value="all">Genres</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-black/5 rounded-full px-4 h-11 text-[10px] font-black uppercase tracking-widest text-plum outline-none cursor-pointer hover:bg-black/5 transition-all"
            >
              <option value="updated">Recent</option>
              <option value="rating">Top Rated</option>
              <option value="year">Year</option>
            </select>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Empty onAdd={startNew} icon={<Film className="w-8 h-8 text-olive" />} label="No movies yet" />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-8">
          {filtered.map((m) => (
            <button key={m.id} onClick={() => setOpen(m)}
                    className="group text-left flex flex-col h-full animate-in fade-in zoom-in-95 duration-500">
              <div className="relative aspect-[2/3] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden bg-black/5 shadow-sm group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-700">
                {m.cover ? (
                  <img src={m.cover} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-10">
                     <Film className="w-12 h-12 text-plum" />
                  </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-plum/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex flex-col justify-end p-6">
                   <div className="flex items-center gap-2 mb-2">
                      <StarRating value={m.rating} size={10} />
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">{m.rating}/5</span>
                   </div>
                   <div className="text-[9px] font-black text-white/60 uppercase tracking-[0.2em]">{m.status}</div>
                </div>

                {m.isPinned && (
                  <div className="absolute top-4 left-4 z-10 p-2.5 rounded-2xl bg-white/20 backdrop-blur-xl text-white shadow-xl">
                    <Pin className="w-3.5 h-3.5 fill-current" />
                  </div>
                )}
                {m.isMasterpiece && (
                  <div className="absolute top-4 right-4 z-10 p-2.5 rounded-2xl bg-amber-500/80 backdrop-blur-xl text-white shadow-xl">
                    <Award className="w-3.5 h-3.5 fill-current" />
                  </div>
                )}
              </div>
              <div className="pt-5 px-1">
                <h3 className="font-black text-plum text-lg tracking-tighter truncate group-hover:text-primary transition-colors">{m.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                   <span className="text-[10px] font-black text-olive/30 uppercase tracking-widest">{m.year}</span>
                   <div className="w-1 h-1 rounded-full bg-black/5" />
                   <span className="text-[10px] font-black text-olive/30 uppercase tracking-widest truncate">{m.category || "General"}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {open && <MovieDialog entry={open} onClose={() => setOpen(null)} onSave={save} onDelete={remove} />}
    </div>
  );
}

function MovieDialog({ entry, onClose, onSave, onDelete }: {
  entry: MovieEntry; onClose: () => void; onSave: (m: MovieEntry) => void; onDelete: (id: string) => void;
}) {
  const [m, setM] = useState(entry);
  const onUpload = (f: File) => {
    const r = new FileReader();
    r.onload = () => setM({ ...m, cover: r.result as string });
    r.readAsDataURL(f);
  };
  return (
    <Dialog onClose={onClose}>
      <div className="grid md:grid-cols-[260px_1fr] gap-8 p-4 sm:p-10">
        <div className="space-y-6">
          <div className="max-w-[200px] sm:max-w-[260px] mx-auto w-full">
            <label className="group relative aspect-[2/3] rounded-[2.5rem] bg-black/5 border-2 border-dashed border-black/5 hover:border-primary/20 transition-all flex flex-col items-center justify-center overflow-hidden cursor-pointer">
              {m.cover ? (
                <>
                  <img src={m.cover} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-4 text-center">
                     <ImageIcon className="w-8 h-8 mb-2" />
                     <p className="text-[10px] font-black uppercase tracking-widest">Change Cover</p>
                  </div>
                </>
              ) : (
                <div className="text-center p-6">
                   <ImageIcon className="w-10 h-10 text-olive/20 mx-auto mb-3" />
                   <p className="text-[10px] font-black uppercase tracking-widest text-olive/40">Drop Poster Here</p>
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} />
            </label>
          </div>
          
          <div className="space-y-4">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-olive/40 ml-1">Rating</label>
                <div className="p-4 rounded-3xl bg-black/5 flex justify-center">
                   <StarRating value={m.rating} onChange={(v) => setM({ ...m, rating: v })} size={24} />
                </div>
             </div>
             <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3">
                <button 
                  onClick={() => { setM({ ...m, isPinned: !m.isPinned }); }}
                  className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] sm:text-[9px] font-black uppercase tracking-widest transition-all ${m.isPinned ? "bg-plum text-white shadow-lg" : "bg-black/5 text-plum"}`}
                >
                  <Pin className={`w-3.5 h-3.5 ${m.isPinned ? "fill-current" : ""}`} /> {m.isPinned ? "Pinned" : "Pin"}
                </button>
                <button 
                  onClick={() => { setM({ ...m, isMasterpiece: !m.isMasterpiece }); }}
                  className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] sm:text-[9px] font-black uppercase tracking-widest transition-all ${m.isMasterpiece ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" : "bg-black/5 text-plum"}`}
                >
                  <Award className={`w-3.5 h-3.5 ${m.isMasterpiece ? "fill-current" : ""}`} /> Masterpiece
                </button>
             </div>
          </div>
        </div>

        <div className="space-y-6 flex flex-col min-w-0">
          <div className="space-y-1">
            <textarea 
              placeholder="Movie Title" 
              rows={1}
              value={m.title} 
              onChange={(e) => setM({ ...m, title: e.target.value })}
              className="w-full bg-transparent border-0 font-display text-4xl md:text-5xl font-black text-plum p-0 focus:ring-0 placeholder:text-plum/10 tracking-tighter resize-none overflow-hidden" 
            />
            <div className="flex gap-4 items-center mt-2">
               <input 
                 placeholder="Year" 
                 value={m.year || ""} 
                 onChange={(e) => setM({ ...m, year: e.target.value })}
                 className="bg-black/5 border-0 rounded-xl px-4 py-1.5 text-xs font-black text-plum w-24 focus:ring-1 ring-plum/10" 
               />
               <input 
                 placeholder="Genre..." 
                 value={m.category || ""} 
                 onChange={(e) => setM({ ...m, category: e.target.value })}
                 className="flex-1 bg-black/5 border-0 rounded-xl px-4 py-1.5 text-xs font-black text-plum focus:ring-1 ring-plum/10" 
               />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <button key={s} onClick={() => setM({ ...m, status: s })}
                      className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                        m.status === s ? "bg-plum text-white shadow-lg" : "bg-black/5 text-plum hover:bg-black/10"
                      }`}>{s}</button>
            ))}
          </div>

          <div className="flex-1 space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-olive/40 ml-1">Notes & Critique</label>
            <textarea 
              placeholder="What made this special?" 
              value={m.notes} 
              onChange={(e) => setM({ ...m, notes: e.target.value })}
              className="w-full flex-1 rounded-[2rem] bg-black/5 border-0 p-6 text-base font-medium text-plum focus:ring-1 ring-plum/10 min-h-[180px] resize-none" 
            />
          </div>

          <div className="space-y-2">
             <label className="text-[10px] font-black uppercase tracking-widest text-olive/40 ml-1">Cover Link</label>
             <input 
               placeholder="https://..." 
               value={(m.cover && typeof m.cover === 'string' && !m.cover.startsWith('data:')) ? m.cover : ""} 
               onChange={(e) => setM({ ...m, cover: e.target.value })}
               className="w-full rounded-xl bg-black/5 border-0 px-4 py-2.5 text-xs text-olive" 
             />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-black/5 mt-auto">
            {entry.title ? (
              <Button variant="ghost" onClick={() => onDelete(entry.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 font-black text-[10px] uppercase tracking-widest rounded-full h-12 px-6 w-full sm:w-auto">Delete Forever</Button>
            ) : <div className="hidden sm:block" />}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button variant="secondary" onClick={onClose} className="rounded-full h-12 px-8 font-black text-[10px] uppercase tracking-widest bg-black/5 border-0 w-full sm:w-auto">Cancel</Button>
              <Button onClick={() => onSave(m)} disabled={!m.title.trim()}
                      className="rounded-full h-12 px-10 font-black text-[10px] uppercase tracking-widest bg-plum text-white shadow-xl shadow-plum/20 w-full sm:w-auto">Save Entry</Button>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export function Dialog({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-plum/40 backdrop-blur-sm p-4 animate-in fade-in duration-300" onClick={onClose}>
      <div className="relative bg-background rounded-[2.5rem] border border-black/5 w-full max-w-2xl max-w-[calc(100vw-2rem)] max-h-[95vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-300"
           onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-black/5 flex items-center justify-center hover:bg-white transition-all shadow-sm">
          <X className="w-4 h-4 text-plum" />
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
}

export function Empty({ onAdd, icon, label }: { onAdd: () => void; icon: React.ReactNode; label: string }) {
  return (
    <div className="text-center py-24 rounded-3xl border-2 border-dashed border-sand bg-warm-wash">
      <div className="w-16 h-16 rounded-full bg-card grid place-items-center mx-auto mb-4 pin-shadow">{icon}</div>
      <p className="font-display text-3xl text-plum mb-2">{label}</p>
      <p className="text-olive mb-6">Start tracking what moves you.</p>
      <Button onClick={onAdd} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
        <Plus className="w-4 h-4 mr-1.5" /> Add the first one
      </Button>
    </div>
  );
}
