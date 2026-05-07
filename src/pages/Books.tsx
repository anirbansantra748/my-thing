import { useState } from "react";
import { useStore, uid, BookEntry, getAuth } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/StarRating";
import { Plus, X, BookOpen, Image as ImageIcon, Search, ArrowUpDown, Pin, Award, Sparkles, Star } from "lucide-react";
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

      {/* Stats Section - Premium Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-12">
        {[
          { label: "Total Library", val: insights.total, icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/5" },
          { label: "Masterpieces", val: insights.masterpieces, icon: Award, color: "text-amber-500", bg: "bg-amber-500/5" },
          { label: "Completed", val: insights.finished, icon: Sparkles, color: "text-purple-500", bg: "bg-purple-500/5" },
          { label: "Top Author", val: insights.topAuthor, icon: Star, color: "text-emerald-500", bg: "bg-emerald-500/5" }
        ].map((stat, i) => (
          <div key={i} className="group relative bg-white/40 backdrop-blur-xl border border-black/5 p-6 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-olive/40 mb-1">{stat.label}</div>
            <div className="text-2xl font-black text-plum tracking-tighter truncate">{stat.val}</div>
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
              {s.replace("-", " ")}
            </button>
          ))}
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-olive/30" />
            <Input 
              placeholder="Search library..." 
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
              <option value="progress">Completion</option>
            </select>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Empty onAdd={startNew} icon={<BookOpen className="w-8 h-8 text-olive" />} label="No books yet" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filtered.map((b) => {
            const pct = b.totalPages ? Math.min(100, (b.pagesRead / b.totalPages) * 100) : 0;
            return (
              <button key={b.id} onClick={() => setOpen(b)}
                      className="group text-left flex gap-6 p-6 rounded-[2.5rem] bg-white border border-black/5 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 relative overflow-hidden">
                <div className="w-24 aspect-[2/3] rounded-2xl bg-black/5 overflow-hidden flex-shrink-0 shadow-xl group-hover:scale-105 transition-transform duration-700">
                  {b.cover ? (
                    <img src={b.cover} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-10">
                       <BookOpen className="w-10 h-10 text-plum" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex items-center justify-between mb-1">
                     <h3 className="font-black text-plum text-xl tracking-tighter truncate group-hover:text-primary transition-colors">{b.title}</h3>
                     {b.status === 'finished' && <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20"><Sparkles className="w-3 h-3" /></div>}
                  </div>
                  <div className="text-[10px] font-black text-olive/40 uppercase tracking-widest mb-4 truncate">{b.author}</div>
                  
                  <div className="flex items-center gap-2 mb-4">
                     <StarRating value={b.rating} size={12} />
                     <div className="w-1 h-1 rounded-full bg-black/5" />
                     <span className="text-[9px] font-black text-olive/20 uppercase tracking-widest truncate">{b.category || "General"}</span>
                  </div>

                  <div className="space-y-2 mt-auto">
                    <div className="flex items-end justify-between">
                      <div className="text-[8px] font-black text-plum uppercase tracking-widest">{b.status.replace("-", " ")}</div>
                      <div className="text-[8px] font-black text-primary uppercase tracking-widest">{Math.round(pct)}%</div>
                    </div>
                    <div className="h-1.5 rounded-full bg-black/5 overflow-hidden ring-1 ring-black/[0.02]">
                      <div className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.3)] transition-all duration-1000" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>

                {b.isPinned && (
                  <div className="absolute top-4 left-4 z-10 p-2 rounded-2xl bg-white/20 backdrop-blur-xl text-white shadow-xl">
                    <Pin className="w-3 h-3 fill-current" />
                  </div>
                )}
                {b.isMasterpiece && (
                  <div className="absolute top-4 right-4 z-10 p-2 rounded-2xl bg-amber-500/80 backdrop-blur-xl text-white shadow-xl">
                    <Award className="w-3 h-3 fill-current" />
                  </div>
                )}
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
      <div className="grid md:grid-cols-[240px_1fr] gap-8 p-4 sm:p-10">
        <div className="space-y-6">
          <div className="max-w-[180px] sm:max-w-[240px] mx-auto w-full">
            <label className="group relative aspect-[2/3] rounded-[2.5rem] bg-black/5 border-2 border-dashed border-black/5 hover:border-primary/20 transition-all flex flex-col items-center justify-center overflow-hidden cursor-pointer">
              {b.cover ? (
                <>
                  <img src={b.cover} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-4 text-center">
                     <ImageIcon className="w-8 h-8 mb-2" />
                     <p className="text-[10px] font-black uppercase tracking-widest">Change Cover</p>
                  </div>
                </>
              ) : (
                <div className="text-center p-6">
                   <ImageIcon className="w-10 h-10 text-olive/20 mx-auto mb-3" />
                   <p className="text-[10px] font-black uppercase tracking-widest text-olive/40">Drop Cover Here</p>
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} />
            </label>
          </div>
          
          <div className="space-y-4">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-olive/40 ml-1">Rating</label>
                <div className="p-4 rounded-3xl bg-black/5 flex justify-center">
                   <StarRating value={b.rating} onChange={(v) => setB({ ...b, rating: v })} size={24} />
                </div>
             </div>
             <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3">
                <button 
                  onClick={() => { setB({ ...b, isPinned: !b.isPinned }); }}
                  className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] sm:text-[9px] font-black uppercase tracking-widest transition-all ${b.isPinned ? "bg-plum text-white shadow-lg" : "bg-black/5 text-plum"}`}
                >
                  <Pin className={`w-3.5 h-3.5 ${b.isPinned ? "fill-current" : ""}`} /> {b.isPinned ? "Pinned" : "Pin"}
                </button>
                <button 
                  onClick={() => { setB({ ...b, isMasterpiece: !b.isMasterpiece }); }}
                  className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] sm:text-[9px] font-black uppercase tracking-widest transition-all ${b.isMasterpiece ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" : "bg-black/5 text-plum"}`}
                >
                  <Award className={`w-3.5 h-3.5 ${b.isMasterpiece ? "fill-current" : ""}`} /> Masterpiece
                </button>
             </div>
          </div>
        </div>

        <div className="space-y-6 flex flex-col min-w-0">
          <div className="space-y-1">
            <textarea 
              placeholder="Book Title" 
              rows={1}
              value={b.title} 
              onChange={(e) => setB({ ...b, title: e.target.value })}
              className="w-full bg-transparent border-0 font-display text-4xl md:text-5xl font-black text-plum p-0 focus:ring-0 placeholder:text-plum/10 tracking-tighter resize-none overflow-hidden" 
            />
            <div className="flex gap-4 items-center mt-2">
               <input 
                 placeholder="Author" 
                 value={b.author || ""} 
                 onChange={(e) => setB({ ...b, author: e.target.value })}
                 className="flex-1 bg-black/5 border-0 rounded-xl px-4 py-1.5 text-xs font-black text-plum focus:ring-1 ring-plum/10" 
               />
               <input 
                 placeholder="Genre..." 
                 value={b.category || ""} 
                 onChange={(e) => setB({ ...b, category: e.target.value })}
                 className="flex-1 bg-black/5 border-0 rounded-xl px-4 py-1.5 text-xs font-black text-plum focus:ring-1 ring-plum/10" 
               />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <button key={s} onClick={() => {
                const update: Partial<BookEntry> = { status: s };
                if (s === "finished" && b.totalPages > 0) update.pagesRead = b.totalPages;
                setB({ ...b, ...update });
              }}
                      className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                        b.status === s ? "bg-plum text-white shadow-lg" : "bg-black/5 text-plum hover:bg-black/10"
                      }`}>{s.replace("-", " ")}</button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-6 bg-black/5 p-6 rounded-[2rem]">
             <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-olive/40 ml-1">Current Page</label>
                <input 
                  type="number" 
                  value={b.pagesRead} 
                  onChange={(e) => setB({ ...b, pagesRead: +e.target.value })}
                  className="w-full bg-white border-0 rounded-xl px-4 py-3 text-sm font-black text-plum" 
                />
             </div>
             <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-olive/40 ml-1">Total Pages</label>
                <input 
                  type="number" 
                  value={b.totalPages} 
                  onChange={(e) => setB({ ...b, totalPages: +e.target.value })}
                  className="w-full bg-white border-0 rounded-xl px-4 py-3 text-sm font-black text-plum" 
                />
             </div>
             <div className="col-span-2 space-y-3">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                   <span className="text-plum">Reading Progress</span>
                   <span className="text-primary">{Math.round(pct)}% Complete</span>
                </div>
                <div className="h-2.5 rounded-full bg-white overflow-hidden ring-1 ring-black/[0.02]">
                  <div className="h-full bg-primary shadow-[0_0_15px_rgba(var(--primary),0.4)] transition-all duration-1000" style={{ width: `${pct}%` }} />
                </div>
             </div>
          </div>

          <div className="flex-1 space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-olive/40 ml-1">Passages & Annotations</label>
            <textarea 
              placeholder="Capture the lines that moved you..." 
              value={b.notes} 
              onChange={(e) => setB({ ...b, notes: e.target.value })}
              className="w-full flex-1 rounded-[2rem] bg-black/5 border-0 p-6 text-base font-medium text-plum focus:ring-1 ring-plum/10 min-h-[180px] resize-none" 
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-black/5 mt-auto">
            {entry.title ? (
              <Button variant="ghost" onClick={() => onDelete(entry.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 font-black text-[10px] uppercase tracking-widest rounded-full h-12 px-6 w-full sm:w-auto">Archive Forever</Button>
            ) : <div className="hidden sm:block" />}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button variant="secondary" onClick={onClose} className="rounded-full h-12 px-8 font-black text-[10px] uppercase tracking-widest bg-black/5 border-0 w-full sm:w-auto">Cancel</Button>
              <Button onClick={() => onSave(b)} disabled={!b.title.trim()}
                      className="rounded-full h-12 px-10 font-black text-[10px] uppercase tracking-widest bg-plum text-white shadow-xl shadow-plum/20 w-full sm:w-auto">Update Library</Button>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
