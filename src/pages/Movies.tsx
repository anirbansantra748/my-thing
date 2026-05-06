import { useState } from "react";
import { useStore, uid, MovieEntry, getAuth } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/StarRating";
import { Plus, X, Film, Image as ImageIcon, Search } from "lucide-react";

const STATUSES: MovieEntry["status"][] = ["watching", "watched", "watchlist"];

export default function Movies() {
  const [movies, setMovies] = useStore("movies");
  const [open, setOpen] = useState<MovieEntry | null>(null);
  const [filter, setFilter] = useState<"all" | MovieEntry["status"]>("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"updated" | "rating" | "year">("updated");

  const filtered = movies
    .filter((m) => {
      const matchFilter = filter === "all" || m.status === filter;
      const matchSearch = m.title.toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "year") return (b.year || "").localeCompare(a.year || "");
      return b.updatedAt - a.updatedAt;
    });

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

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 flex gap-2 overflow-x-auto scrollbar-hide pb-2 md:pb-0">
          {(["all", ...STATUSES] as const).map((s) => (
            <button key={s} onClick={() => setFilter(s)}
                    className={`px-4 py-2 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-all ${
                      filter === s ? "bg-plum text-background" : "bg-sand text-plum hover:bg-warm-light"
                    }`}>
              {s}
            </button>
          ))}
        </div>

        <div className="flex gap-2 shrink-0">
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-olive/40 group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search library..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 rounded-full bg-sand/50 border-0 w-full md:w-64 h-10 text-sm focus-visible:ring-primary/20"
            />
          </div>
          
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-sand/50 border-0 rounded-full px-4 h-10 text-xs font-bold text-plum outline-none cursor-pointer hover:bg-sand transition-colors appearance-none pr-8 relative"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '12px' }}
          >
            <option value="updated">Recent</option>
            <option value="rating">Top Rated</option>
            <option value="year">Year</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Empty onAdd={startNew} icon={<Film className="w-8 h-8 text-olive" />} label="No movies yet" />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
          {filtered.map((m) => (
            <button key={m.id} onClick={() => setOpen(m)}
                    className="group text-left rounded-2xl overflow-hidden bg-card border border-sand pin-shadow hover:lift-shadow transition-shadow">
              <div className="aspect-[2/3] bg-warm-fog grid place-items-center overflow-hidden">
                {m.cover ? (
                  <img src={m.cover} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <Film className="w-10 h-10 text-warm-silver" />
                )}
              </div>
              <div className="p-3">
                <div className="font-semibold text-plum truncate">{m.title}</div>
                <div className="text-xs text-olive mb-1.5">{m.year} · <span className="capitalize">{m.status}</span></div>
                <StarRating value={m.rating} size={14} />
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
      <div className="grid sm:grid-cols-[200px_1fr] gap-5 p-5">
        <label className="aspect-[2/3] rounded-2xl bg-warm-fog border border-sand grid place-items-center overflow-hidden cursor-pointer">
          {m.cover ? <img src={m.cover} alt="" className="w-full h-full object-cover" /> : (
            <div className="text-center text-olive text-sm"><ImageIcon className="w-6 h-6 mx-auto mb-1" />Add cover</div>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} />
        </label>
        <div className="space-y-3">
          <Input placeholder="Title" value={m.title} onChange={(e) => setM({ ...m, title: e.target.value })}
                 className="font-display text-2xl border-0 bg-warm-fog rounded-2xl h-14 px-4" />
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-olive ml-1 font-bold">Cover URL (optional)</label>
            <Input 
              placeholder="Paste image link here..." 
              value={m.cover && !m.cover.startsWith('data:') ? m.cover : ""} 
              onChange={(e) => setM({ ...m, cover: e.target.value })}
              className="rounded-full bg-warm-fog border-0 h-9 text-xs"
            />
          </div>
          <Input placeholder="Year" value={m.year || ""} onChange={(e) => setM({ ...m, year: e.target.value })}
                 className="rounded-full bg-warm-fog border-0" />
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <button key={s} onClick={() => setM({ ...m, status: s })}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize ${
                        m.status === s ? "bg-plum text-background" : "bg-sand text-plum"
                      }`}>{s}</button>
            ))}
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-olive mb-1.5">Your rating</p>
            <StarRating value={m.rating} onChange={(v) => setM({ ...m, rating: v })} size={24} />
          </div>
          <Textarea placeholder="What did you think?" value={m.notes} onChange={(e) => setM({ ...m, notes: e.target.value })}
                    className="rounded-2xl bg-warm-fog border-0 min-h-[140px] resize-none" />
          <div className="flex justify-between pt-2">
            {entry.title ? (
              <Button variant="ghost" onClick={() => onDelete(entry.id)} className="text-primary rounded-full">Delete</Button>
            ) : <span />}
            <div className="flex gap-2">
              <Button variant="secondary" onClick={onClose} className="rounded-full">Cancel</Button>
              <Button onClick={() => onSave(m)} disabled={!m.title.trim()}
                      className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">Save</Button>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export function Dialog({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-plum/40 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-background rounded-3xl border border-sand w-full max-w-2xl max-h-[90vh] overflow-y-auto lift-shadow animate-scale-in"
           onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-6 right-6 w-9 h-9 rounded-full bg-background/80 backdrop-blur grid place-items-center hover:bg-sand">
          <X className="w-4 h-4" />
        </button>
        {children}
      </div>
    </div>
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
