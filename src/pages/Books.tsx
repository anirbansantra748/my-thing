import { useState } from "react";
import { useStore, uid, BookEntry, getAuth } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/StarRating";
import { Plus, X, BookOpen, Image as ImageIcon, Search, ArrowUpDown, Pin, Award, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Dialog, Empty } from "./Movies";

const STATUSES: BookEntry["status"][] = ["reading", "finished", "to-read"];

export default function Books() {
  const [books, setBooks] = useStore("books");
  const [open, setOpen] = useState<BookEntry | null>(null);
  const [filter, setFilter] = useState<"all" | BookEntry["status"]>("all");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"updated" | "rating" | "progress">("updated");

  const categories = Array.from(new Set(books.map(b => b.category).filter(Boolean)));

  const filtered = books
    .filter((b) => {
      const matchFilter = filter === "all" || b.status === filter;
      const matchSearch = b.title.toLowerCase().includes(search.toLowerCase()) || 
                          (b.author || "").toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter === "all" || b.category === categoryFilter;
      return matchFilter && matchSearch && matchCategory;
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "progress") {
        const pctA = a.totalPages > 0 ? (a.pagesRead / a.totalPages) : 0;
        const pctB = b.totalPages > 0 ? (b.pagesRead / b.totalPages) : 0;
        return pctB - pctA;
      }
      return b.updatedAt - a.updatedAt;
    });

  const insights = {
    total: books.length,
    finished: books.filter(b => b.status === "finished").length,
    masterpieces: books.filter(b => b.isMasterpiece).length,
    topAuthor: Array.from(new Set(books.map(b => b.author).filter(Boolean)))
      .sort((a, b) => books.filter(x => x.author === b).length - books.filter(x => x.author === a).length)[0] || "None"
  };

  const startNew = () => {
    const user = getAuth();
    if (!user) return;
    setOpen({
      id: uid(), userId: user.id, title: "", author: "", pagesRead: 0, totalPages: 300, rating: 0,
      status: "reading", notes: "", createdAt: Date.now(), updatedAt: Date.now(),
    });
  };

  const save = (b: BookEntry) => {
    if (!b.title.trim()) return;
    const others = books.filter((x) => x.id !== b.id);
    setBooks([...others, { ...b, updatedAt: Date.now() }]);
    setOpen(null);
  };
  const remove = (id: string) => { setBooks(books.filter((b) => b.id !== id)); setOpen(null); };

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 pt-6 md:pt-10 pb-32">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6 md:mb-8">
        <div>
          <p className="text-xs md:text-sm uppercase tracking-widest text-olive mb-1 md:mb-2">Pages, slowly turned</p>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-plum">Books</h1>
        </div>
        <Button onClick={startNew} className="rounded-full h-11 px-5 bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-1.5" /> Add book
        </Button>
      </div>

      {/* Insights Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Library Size", val: insights.total, icon: <BookOpen className="w-4 h-4" /> },
          { label: "Completed", val: insights.finished, icon: <Sparkles className="w-4 h-4 text-purple-500" /> },
          { label: "Masterpieces", val: insights.masterpieces, icon: <Award className="w-4 h-4 text-yellow-500" /> },
          { label: "Top Author", val: insights.topAuthor, icon: <StarRating value={1} size={14} /> }
        ].map((stat, i) => (
          <div key={i} className="bg-card/40 backdrop-blur-sm border border-sand p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              {stat.icon}
              <span className="text-[10px] uppercase tracking-widest text-olive font-bold">{stat.label}</span>
            </div>
            <div className="text-xl font-display font-bold text-plum truncate">{stat.val}</div>
          </div>
        ))}
      </div>


      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 flex gap-2 overflow-x-auto scrollbar-hide pb-2 md:pb-0">
          {(["all", ...STATUSES] as const).map((s) => (
            <button key={s} onClick={() => setFilter(s)}
                    className={`px-4 py-2 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-all ${
                      filter === s ? "bg-plum text-background" : "bg-sand text-plum hover:bg-warm-light"
                    }`}>
              {s.replace("-", " ")}
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
              className="pl-10 pr-4 rounded-full bg-sand/50 border-0 w-full md:w-48 h-10 text-sm focus-visible:ring-primary/20"
            />
          </div>

          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-sand/50 border-0 rounded-full px-4 h-10 text-xs font-bold text-plum outline-none cursor-pointer hover:bg-sand transition-colors"
          >
            <option value="all">All Genres</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-sand/50 border-0 rounded-full px-4 h-10 text-xs font-bold text-plum outline-none cursor-pointer hover:bg-sand transition-colors"
          >
            <option value="updated">Recently Read</option>
            <option value="rating">Top Rated</option>
            <option value="progress">Completion</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Empty onAdd={startNew} icon={<BookOpen className="w-8 h-8 text-olive" />} label="No books yet" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {filtered.map((b) => {
            const pct = b.totalPages ? Math.min(100, (b.pagesRead / b.totalPages) * 100) : 0;
            return (
              <button key={b.id} onClick={() => setOpen(b)}
                      className="group text-left rounded-2xl bg-card border border-sand pin-shadow hover:lift-shadow transition-shadow flex gap-4 p-4 relative">
                {b.isPinned && (
                  <div className="absolute top-2 left-2 z-10 p-1.5 rounded-full bg-plum/80 backdrop-blur-sm text-white shadow-lg">
                    <Pin className="w-2.5 h-2.5 fill-current" />
                  </div>
                )}
                {b.isMasterpiece && (
                  <div className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-yellow-500/90 backdrop-blur-sm text-white shadow-lg animate-pulse">
                    <Award className="w-2.5 h-2.5 fill-current" />
                  </div>
                )}
                <div className="w-24 aspect-[2/3] rounded-xl bg-warm-fog grid place-items-center overflow-hidden flex-shrink-0">
                  {b.cover ? (
                    <img src={b.cover} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <BookOpen className="w-7 h-7 text-warm-silver" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display text-lg font-semibold text-plum truncate">{b.title}</div>
                  <div className="text-sm text-olive truncate">{b.author}</div>
                  <div className="text-[9px] text-olive/60 font-black uppercase tracking-wider mb-1">
                     {b.category || "Uncategorized"}
                  </div>
                  <StarRating value={b.rating} size={14} />
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-olive mb-1">
                      <span className="capitalize">{b.status.replace("-", " ")}</span>
                      <span>{b.pagesRead}/{b.totalPages}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-sand overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {open && <BookDialog entry={open} onClose={() => setOpen(null)} onSave={save} onDelete={remove} />}
    </div>
  );
}

function BookDialog({ entry, onClose, onSave, onDelete }: {
  entry: BookEntry; onClose: () => void; onSave: (b: BookEntry) => void; onDelete: (id: string) => void;
}) {
  const [b, setB] = useState(entry);
  const onUpload = (f: File) => {
    const r = new FileReader();
    r.onload = () => setB({ ...b, cover: r.result as string });
    r.readAsDataURL(f);
  };
  const pct = b.totalPages ? Math.min(100, (b.pagesRead / b.totalPages) * 100) : 0;
  return (
    <Dialog onClose={onClose}>
      <div className="grid sm:grid-cols-[180px_1fr] gap-5 p-5">
        <label className="aspect-[2/3] rounded-2xl bg-warm-fog border border-sand grid place-items-center overflow-hidden cursor-pointer">
          {b.cover ? <img src={b.cover} alt="" className="w-full h-full object-cover" /> : (
            <div className="text-center text-olive text-sm"><ImageIcon className="w-6 h-6 mx-auto mb-1" />Add cover</div>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} />
        </label>
        <div className="space-y-3">
          <Input placeholder="Title" value={b.title} onChange={(e) => setB({ ...b, title: e.target.value })}
                 className="font-display text-2xl border-0 bg-warm-fog rounded-2xl h-14 px-4" />
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-olive ml-1 font-bold">Cover URL (optional)</label>
            <Input 
              placeholder="Paste image link here..." 
              value={b.cover && !b.cover.startsWith('data:') ? b.cover : ""} 
              onChange={(e) => setB({ ...b, cover: e.target.value })}
              className="rounded-full bg-warm-fog border-0 h-9 text-xs"
            />
          </div>
          <Input placeholder="Author" value={b.author || ""} onChange={(e) => setB({ ...b, author: e.target.value })}
                 className="rounded-full bg-warm-fog border-0 h-10 text-sm" />
          
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-olive ml-1 font-bold">Category / Genre</label>
            <Input 
              placeholder="e.g. Fiction, Philosophy..." 
              value={b.category || ""} 
              onChange={(e) => setB({ ...b, category: e.target.value })}
              className="rounded-full bg-warm-fog border-0 h-10 text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <button key={s} onClick={() => {
                const update: Partial<BookEntry> = { status: s };
                if (s === "finished" && b.totalPages > 0) {
                  update.pagesRead = b.totalPages;
                }
                setB({ ...b, ...update });
              }}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${
                        b.status === s ? "bg-plum text-background" : "bg-sand text-plum hover:bg-warm-light"
                      }`}>{s.replace("-", " ")}</button>
            ))}
          </div>

          <div className="flex gap-4 items-center p-3 bg-warm-wash/50 rounded-2xl border border-sand">
            <button 
              onClick={() => { setB({ ...b, isPinned: !b.isPinned }); toast.success(b.isPinned ? "Unpinned" : "Pinned to top"); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${b.isPinned ? "bg-plum text-white" : "bg-white text-plum border border-sand"}`}
            >
              <Pin className={`w-3 h-3 ${b.isPinned ? "fill-current" : ""}`} /> {b.isPinned ? "Pinned" : "Pin Item"}
            </button>
            <button 
              onClick={() => { setB({ ...b, isMasterpiece: !b.isMasterpiece }); if (!b.isMasterpiece) toast.success("Marked as Masterpiece!"); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${b.isMasterpiece ? "bg-yellow-500 text-white shadow-lg shadow-yellow-500/20" : "bg-white text-plum border border-sand"}`}
            >
              <Award className={`w-3 h-3 ${b.isMasterpiece ? "fill-current" : ""}`} /> Masterpiece
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs uppercase tracking-widest text-olive">Pages read</label>
              <Input type="number" value={b.pagesRead} onChange={(e) => setB({ ...b, pagesRead: +e.target.value })}
                     className="rounded-full bg-warm-fog border-0" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-olive">Total</label>
              <Input type="number" value={b.totalPages} onChange={(e) => setB({ ...b, totalPages: +e.target.value })}
                     className="rounded-full bg-warm-fog border-0" />
            </div>
          </div>
          <div className="h-2 rounded-full bg-sand overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-olive mb-1.5">Rating</p>
            <StarRating value={b.rating} onChange={(v) => setB({ ...b, rating: v })} size={24} />
          </div>
          <Textarea placeholder="Favorite passages, thoughts, quotes…" value={b.notes} onChange={(e) => setB({ ...b, notes: e.target.value })}
                    className="rounded-2xl bg-warm-fog border-0 min-h-[120px] resize-none" />
          <div className="flex justify-between pt-2">
            {entry.title ? (
              <Button variant="ghost" onClick={() => onDelete(entry.id)} className="text-primary rounded-full">Delete</Button>
            ) : <span />}
            <div className="flex gap-2">
              <Button variant="secondary" onClick={onClose} className="rounded-full">Cancel</Button>
              <Button onClick={() => onSave(b)} disabled={!b.title.trim()}
                      className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">Save</Button>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
