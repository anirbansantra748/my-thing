import { useState, useMemo, useRef } from "react";
import { useStore, uid, AnimeEntry, getAuth } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/StarRating";
import { Plus, Tv, Search, Pin, Award, Star, Image as ImageIcon, ChevronRight, Music, Info, Edit3, Heart, Share2, PlayCircle, X, Volume2, Maximize2, Play, Pause } from "lucide-react";
import { Dialog, Empty } from "./Movies";
import { motion, AnimatePresence } from "framer-motion";

const STATUSES: AnimeEntry["status"][] = ["watching", "completed", "planned", "dropped"];

// Helper to extract YouTube ID
const getYTId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export default function Anime() {
  const [anime, setAnime] = useStore("anime");
  const [editing, setEditing] = useState<AnimeEntry | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(anime[0]?.id || null);
  const [search, setSearch] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);

  const selected = useMemo(() => 
    anime.find(a => a.id === selectedId) || anime[0]
  , [anime, selectedId]);

  const ytId = useMemo(() => selected?.themeSongUrl ? getYTId(selected.themeSongUrl) : null, [selected]);

  const filteredCollection = anime.filter(a => 
    a.title.toLowerCase().includes(search.toLowerCase())
  );

  const startNew = () => {
    const user = getAuth();
    if (!user) return;
    setEditing({
      id: uid(), userId: user.id, title: "", status: "watching", seasonsWatched: 0, totalSeasons: 1,
      rating: 0, notes: "", createdAt: Date.now(), updatedAt: Date.now(),
    });
  };

  const save = (a: AnimeEntry) => {
    if (!a.title.trim()) {
      import('sonner').then(({ toast }) => toast.error("Please enter a title"));
      return;
    }
    const others = anime.filter((x) => x.id !== a.id);
    setAnime([...others, { ...a, updatedAt: Date.now() }]);
    setEditing(null);
    setSelectedId(a.id);
  };

  const toggleSeason = (num: number) => {
    if (!selected) return;
    const newWatched = num === selected.seasonsWatched ? num - 1 : num;
    const updated = { ...selected, seasonsWatched: newWatched, updatedAt: Date.now() };
    const others = anime.filter(x => x.id !== selected.id);
    setAnime([...others, updated]);
  };

  if (anime.length === 0) {
    return (
      <div className="max-w-[1440px] mx-auto px-6 pt-20">
        <Empty onAdd={startNew} icon={<Tv className="w-12 h-12 text-olive" />} label="Archive ready for input." />
        {editing && <AnimeDialog entry={editing} onClose={() => setEditing(null)} onSave={save} onDelete={() => {}} />}
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto pb-32">
      {/* 1. Cinematic Hero with Embedded Theme Player */}
      <section className="relative w-full min-h-[550px] lg:rounded-[3rem] overflow-hidden mt-6 shadow-2xl bg-plum group">
         {/* Background Layer */}
         <div className="absolute inset-0 z-0">
            {selected?.cover ? (
               <img src={selected.cover} alt="" className="w-full h-full object-cover blur-[80px] opacity-30 scale-110" />
            ) : (
               <div className="w-full h-full bg-plum-dark" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-plum via-plum/70 to-transparent" />
         </div>

         {/* Content Layer */}
         <div className="relative z-10 h-full flex flex-col">
            <div className="px-10 py-6 flex items-center justify-between">
               <div className="flex items-center gap-4 text-white/30 text-[9px] font-black uppercase tracking-widest">
                  <span>Vault</span> <ChevronRight className="w-2 h-2" />
                  <span className="text-white">{selected?.title}</span>
               </div>
               <div className="flex items-center gap-3">
                  <button onClick={() => setEditing(selected)} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-all border border-white/5">
                     <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={startNew} className="h-10 px-5 rounded-full bg-primary text-white text-[9px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all">
                     Add New
                  </button>
               </div>
            </div>

            <div className="flex-1 grid lg:grid-cols-[auto_1fr_320px] gap-12 px-10 pb-12 items-end">
               <div className="hidden md:block w-[260px] aspect-[2/3] rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 group-hover:-translate-y-2 transition-all duration-700 relative">
                  {selected?.cover ? (
                     <img src={selected.cover} alt="" className="w-full h-full object-cover" />
                  ) : (
                     <div className="w-full h-full bg-white/5 flex items-center justify-center text-white/10"><Tv className="w-16 h-16" /></div>
                  )}
                  {/* Now Playing Pulse */}
                  {isPlaying && (
                     <div className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-primary flex items-center justify-center animate-pulse shadow-xl">
                        <Volume2 className="w-4 h-4 text-white" />
                     </div>
                  )}
               </div>

               <div className="space-y-8 pb-4">
                  <div className="space-y-4">
                     <div className="flex items-center gap-3">
                        <div className="px-3 py-1 rounded-lg bg-white/10 text-[9px] font-black text-white uppercase tracking-widest border border-white/10">
                           {selected?.year || "2024"}
                        </div>
                        <StarRating value={selected?.rating || 0} size={10} />
                        {selected?.isPinned && <div className="px-3 py-1 rounded-lg bg-primary/20 text-[9px] font-black text-primary uppercase tracking-widest border border-primary/20">Featured</div>}
                     </div>
                     <h2 className="font-display text-5xl md:text-8xl font-black text-white tracking-tighter leading-none drop-shadow-2xl">
                        {selected?.title}
                     </h2>
                  </div>

                  <div className="flex items-center gap-3">
                     {ytId ? (
                        <button 
                           onClick={() => setIsPlaying(!isPlaying)}
                           className={`h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center gap-3 shadow-2xl transition-all ${
                              isPlaying ? "bg-primary text-white scale-95" : "bg-white text-plum hover:scale-105"
                           }`}
                        >
                           {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                           {isPlaying ? "Stop Theme" : "Play Theme"}
                        </button>
                     ) : (
                        <button onClick={() => setEditing(selected)} className="h-14 px-10 rounded-2xl bg-white/5 border border-white/10 text-white/40 font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all">
                           No Theme Song Set
                        </button>
                     )}
                     <button className="h-14 w-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all">
                        <Heart className={`w-5 h-5 ${selected?.isMasterpiece ? "text-primary fill-current" : ""}`} />
                     </button>
                  </div>

                  {/* Hidden Player Embed */}
                  <div className="absolute opacity-0 pointer-events-none">
                     {isPlaying && ytId && (
                        <iframe 
                          width="100" height="100" 
                          src={`https://www.youtube.com/embed/${ytId}?autoplay=1`} 
                          allow="autoplay; encrypted-media"
                        />
                     )}
                  </div>
                  
                  {/* Sound Wave Animation */}
                  <AnimatePresence>
                    {isPlaying && (
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className="flex items-end gap-1 h-8 px-4 py-2 rounded-full bg-white/5 border border-white/10 w-fit"
                      >
                         {[...Array(6)].map((_, i) => (
                           <div key={i} className="w-1 bg-primary rounded-full animate-visualizer" style={{ animationDelay: `${i * 0.1}s`, height: '100%' }} />
                         ))}
                         <span className="text-[9px] font-black uppercase tracking-widest text-white/60 ml-2">Atmosphere Active</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>

               {/* Seasons Sidebar */}
               <div className="bg-black/30 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 p-8 flex flex-col h-full max-h-[450px] shadow-2xl">
                  <div className="flex items-center justify-between mb-8">
                     <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Seasons Log</span>
                     <span className="text-[10px] font-black text-primary uppercase tracking-widest">{selected?.seasonsWatched}/{selected?.totalSeasons}</span>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-3 overflow-y-auto pr-1 scrollbar-hide">
                     {[...Array(selected?.totalSeasons || 1)].map((_, i) => {
                        const num = i + 1;
                        const isWatched = num <= (selected?.seasonsWatched || 0);
                        return (
                           <button 
                              key={num} onClick={() => toggleSeason(num)}
                              className={`aspect-square rounded-xl text-[11px] font-bold transition-all duration-300 border ${
                                 isWatched ? "bg-primary border-primary text-white shadow-lg scale-95" : "bg-white/5 border-white/5 text-white/20 hover:text-white hover:bg-white/10"
                              }`}
                           >
                              {num}
                           </button>
                        );
                     })}
                  </div>

                  <div className="mt-auto pt-10">
                     <div className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-3 text-center">Archive Progress</div>
                     <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-primary shadow-[0_0_15px_rgba(255,0,0,0.8)] transition-all duration-1000" style={{ width: `${((selected?.seasonsWatched || 0) / (selected?.totalSeasons || 1)) * 100}%` }} />
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 2. Compact Grid */}
      <section className="px-10 mt-20">
         <div className="flex items-center justify-between mb-12">
            <h3 className="font-display text-4xl font-bold text-plum tracking-tight">The Library</h3>
            <div className="relative w-72">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-olive/20" />
               <input placeholder="Find series..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full h-12 pl-12 pr-6 rounded-full bg-black/5 border-0 text-xs outline-none" />
            </div>
         </div>

         <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-8">
            {filteredCollection.map((a) => (
               <button key={a.id} onClick={() => setSelectedId(a.id)} className={`group flex flex-col text-left transition-all duration-500 ${selectedId === a.id ? "scale-105" : ""}`}>
                  <div className={`relative aspect-[2/3] rounded-[2rem] overflow-hidden bg-black/5 transition-all shadow-sm group-hover:shadow-2xl ${selectedId === a.id ? "ring-[6px] ring-primary ring-offset-8" : ""}`}>
                     {a.cover ? <img src={a.cover} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" /> : <div className="w-full h-full flex items-center justify-center opacity-10"><Tv className="w-12 h-12" /></div>}
                  </div>
                  <div className="mt-6 px-1">
                     <h4 className={`font-black text-xs truncate transition-colors ${selectedId === a.id ? "text-primary" : "text-plum group-hover:text-primary"}`}>{a.title}</h4>
                     <p className="text-[9px] font-black text-olive/30 uppercase tracking-widest mt-1">{a.year} · {a.seasonsWatched}/{a.totalSeasons}S</p>
                  </div>
               </button>
            ))}
         </div>
      </section>

      {editing && <AnimeDialog entry={editing} onClose={() => setEditing(null)} onSave={save} onDelete={(id) => { setAnime(anime.filter(x => x.id !== id)); setEditing(null); }} />}
    </div>
  );
}

function AnimeDialog({ entry, onClose, onSave, onDelete }: {
  entry: AnimeEntry; onClose: () => void; onSave: (a: AnimeEntry) => void; onDelete: (id: string) => void;
}) {
  const [a, setA] = useState(entry);
  const onUpload = (f: File) => {
    const r = new FileReader();
    r.onload = () => setA({ ...a, cover: r.result as string });
    r.readAsDataURL(f);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-plum/40 backdrop-blur-md p-4" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[4rem] w-full max-w-5xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-1 overflow-y-auto p-10 md:p-14 scrollbar-hide">
          <div className="grid lg:grid-cols-[320px_1fr] gap-12">
            <div className="space-y-6">
              <div className="relative aspect-[2/3] rounded-[2.5rem] bg-black/5 border-2 border-dashed border-black/10 flex flex-col items-center justify-center overflow-hidden group cursor-pointer shadow-xl">
                {a.cover ? <img src={a.cover} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-12 h-12 text-olive/10" />}
                <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} />
              </div>
              <div className="space-y-4">
                 <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-olive/30 ml-1">Cover Link</label>
                    <input placeholder="https://..." value={a.cover && !a.cover.startsWith('data:') ? a.cover : ""} onChange={(e) => setA({ ...a, cover: e.target.value })} className="w-full bg-black/5 border-0 rounded-xl p-4 text-xs outline-none" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-olive/30 ml-1">Theme (YouTube)</label>
                    <input placeholder="https://youtube.com/..." value={a.themeSongUrl || ""} onChange={(e) => setA({ ...a, themeSongUrl: e.target.value })} className="w-full bg-black/5 border-0 rounded-xl p-4 text-xs outline-none" />
                 </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-olive/30 ml-1">Series Title</label>
                <input placeholder="Enter name..." value={a.title} onChange={(e) => setA({ ...a, title: e.target.value })} className="w-full bg-transparent border-0 font-display text-4xl md:text-6xl font-black text-plum p-0 focus:ring-0 placeholder:text-plum/10 tracking-tighter outline-none" />
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-olive/40">Seasons</span>
                    <div className="flex items-center gap-1.5">
                       <button onClick={() => setA({ ...a, totalSeasons: Math.max(1, a.totalSeasons - 1) })} className="w-6 h-6 rounded-lg bg-black/5 flex items-center justify-center text-plum">-</button>
                       <button onClick={() => setA({ ...a, totalSeasons: a.totalSeasons + 1 })} className="w-6 h-6 rounded-lg bg-black/5 flex items-center justify-center text-plum">+</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-2.5 p-3.5 rounded-3xl bg-black/5">
                    {[...Array(a.totalSeasons)].map((_, i) => {
                      const num = i + 1;
                      const isWatched = num <= a.seasonsWatched;
                      return (
                        <button key={num} onClick={() => setA({ ...a, seasonsWatched: isWatched ? num - 1 : num })} className={`aspect-square rounded-xl text-[11px] font-bold transition-all ${isWatched ? "bg-primary text-white shadow-lg" : "bg-white text-plum/20"}`}>{num}</button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-8">
                   <div className="space-y-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-olive/40 ml-1">Status</span>
                      <div className="grid grid-cols-2 gap-2">
                         {STATUSES.map(s => (
                           <button key={s} onClick={() => setA({ ...a, status: s })} className={`py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${a.status === s ? "bg-plum text-white shadow-lg" : "bg-black/5 text-plum"}`}>{s}</button>
                         ))}
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-3">
                      <input placeholder="Year" value={a.year} onChange={(e) => setA({ ...a, year: e.target.value })} className="bg-black/5 border-0 rounded-2xl p-4 text-xs font-black text-plum outline-none" />
                      <div className="flex items-center justify-center bg-black/5 rounded-2xl p-2"><StarRating value={a.rating} onChange={(v) => setA({ ...a, rating: v })} size={22} /></div>
                   </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-olive/40 ml-1">Archive Notes</label>
                <textarea placeholder="Your critique..." value={a.notes} onChange={(e) => setA({ ...a, notes: e.target.value })} className="w-full bg-white border border-black/5 rounded-[3rem] p-10 text-lg font-medium text-plum min-h-[250px] outline-none shadow-sm" />
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-12 border-t border-black/5 flex items-center justify-between bg-white/80 backdrop-blur-xl">
           <button onClick={() => onDelete(a.id)} className="text-red-400 hover:text-red-500 text-[9px] font-black uppercase tracking-widest px-4 transition-colors font-bold">Remove From Vault</button>
           <div className="flex gap-4">
              <Button variant="secondary" onClick={onClose} className="rounded-full h-14 px-10 text-[9px] font-black uppercase tracking-widest bg-black/5 border-0">Cancel</Button>
              <Button onClick={() => onSave(a)} className="rounded-2xl h-14 px-14 text-[9px] font-black uppercase tracking-widest bg-primary text-white shadow-2xl hover:scale-105 transition-all">Confirm Entry</Button>
           </div>
        </div>

        <button onClick={onClose} className="absolute top-8 right-8 p-2 text-plum/20 hover:text-plum transition-colors"><X className="w-6 h-6" /></button>
      </motion.div>
    </div>
  );
}
