import { useState } from "react";
import { useStore, uid, MovieEntry } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/StarRating";
import { Plus, X, Film, Image as ImageIcon } from "lucide-react";

const STATUSES: MovieEntry["status"][] = ["watching", "watched", "watchlist"];

export default function Movies() {
  const [movies, setMovies] = useStore("movies");
  const [open, setOpen] = useState<MovieEntry | null>(null);
  const [filter, setFilter] = useState<"all" | MovieEntry["status"]>("all");

  const filtered = movies
    .filter((m) => filter === "all" || m.status === filter)
    .sort((a, b) => b.updatedAt - a.updatedAt);

  const startNew = () => setOpen({
    id: uid(), title: "", year: "", rating: 0, status: "watched", notes: "",
    createdAt: Date.now(), updatedAt: Date.now(),
  });

  const save = (m: MovieEntry) => {
    if (!m.title.trim()) return;
    const others = movies.filter((x) => x.id !== m.id);
    setMovies([...others, { ...m, updatedAt: Date.now() }]);
    setOpen(null);
  };

  const remove = (id: string) => { setMovies(movies.filter((m) => m.id !== id)); setOpen(null); };

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-10">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
        <div>
          <p className="text-sm uppercase tracking-widest text-olive mb-2">Reels & ratings</p>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-plum">Movies</h1>
        </div>
        <Button onClick={startNew} className="rounded-full h-11 px-5 bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-1.5" /> Add movie
        </Button>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide">
        {(["all", ...STATUSES] as const).map((s) => (
          <button key={s} onClick={() => setFilter(s)}
                  className={`px-4 py-2 rounded-full text-sm font-medium capitalize whitespace-nowrap ${
                    filter === s ? "bg-plum text-background" : "bg-sand text-plum hover:bg-warm-light"
                  }`}>
            {s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Empty onAdd={startNew} icon={<Film className="w-8 h-8 text-olive" />} label="No movies yet" />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
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
