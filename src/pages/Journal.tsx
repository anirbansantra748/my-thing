import { useMemo, useState } from "react";
import { useStore, getAuth } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Image as ImageIcon, Plus, Sparkles } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MOODS = ["✨","🌸","☀️","🌧️","🌙","🔥","💭","🍃","❤️","☕"];

const MONTH_STYLES = [
  "texture-blush", "texture-warm", "texture-sage", "texture-sky",
  "texture-paper", "texture-linen", "texture-grid", "texture-noise",
  "texture-blush", "texture-warm", "texture-sage", "texture-sky"
];

const fmt = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

export default function Journal() {
  const [entries, setEntries] = useStore("journal");
  const [year, setYear] = useState(new Date().getFullYear());
  const [openDate, setOpenDate] = useState<string | null>(null);

  const entryMap = useMemo(() => {
    const m = new Map<string, (typeof entries)[number]>();
    entries.forEach((e) => m.set(e.date, e));
    return m;
  }, [entries]);

  const moodCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    entries.forEach(e => {
      if (e.mood && e.date.startsWith(year.toString())) {
        counts[e.mood] = (counts[e.mood] || 0) + 1;
      }
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [entries, year]);

  const totalJournaled = entries.filter(e => e.date.startsWith(year.toString())).length;

  const open = openDate ? entryMap.get(openDate) : null;
  const today = new Date();

  const saveEntry = (date: string, text: string, mood?: string, images?: string[]) => {
    const user = getAuth();
    if (!user) return;
    
    const others = entries.filter((e) => e.date !== date);
    if (!text.trim() && !mood && (!images || images.length === 0)) {
      setEntries(others);
      return;
    }
    setEntries([...others, { date, userId: user.id, text, mood, images, updatedAt: Date.now() }]);
  };

  return (
    <PageTransition>
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 pt-6 md:pt-10 pb-32">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-8 md:mb-12">
        <div className="animate-in fade-in slide-in-from-left duration-700">
          <p className="text-xs md:text-sm uppercase tracking-widest text-olive mb-1 md:mb-2 font-bold">A year, day by day</p>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-plum tracking-tighter">Journal</h1>
        </div>
        <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-2xl border border-sand p-1.5 md:p-2 w-full sm:w-auto justify-center sm:justify-start shadow-sm animate-in fade-in slide-in-from-right duration-700">
          <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9 md:h-10 md:w-10 hover:bg-sand" onClick={() => setYear(year - 1)}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <span className="font-display text-xl md:text-2xl font-bold text-plum w-20 md:w-24 text-center tracking-tight">{year}</span>
          <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9 md:h-10 md:w-10 hover:bg-sand" onClick={() => setYear(year + 1)}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Mood Analytics Dashboard - Premium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="group relative bg-white/40 backdrop-blur-xl border border-black/5 p-8 rounded-[3rem] shadow-sm hover:shadow-xl transition-all duration-500">
          <div className="flex items-center gap-2 mb-6">
             <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-olive/40">Yearly Reflection</p>
          </div>
          <div className="flex items-end gap-3 mb-6">
             <span className="text-6xl font-display font-black text-plum tracking-tighter">{totalJournaled}</span>
             <span className="text-xs font-black text-olive/40 uppercase tracking-widest mb-2.5">Days Documented</span>
          </div>
          <div className="space-y-2">
             <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1">
                <span className="text-plum/40">Consistency</span>
                <span className="text-primary">{Math.round((totalJournaled / 365) * 100)}%</span>
             </div>
             <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden ring-1 ring-black/[0.02]">
                <div className="h-full bg-primary shadow-[0_0_15px_rgba(var(--primary),0.4)] transition-all duration-1000" style={{ width: `${Math.min(100, (totalJournaled / 365) * 100)}%` }} />
             </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-white/40 backdrop-blur-xl border border-black/5 rounded-[3rem] p-8 shadow-sm flex flex-col md:flex-row gap-12">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-8">
               <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                  <span className="text-lg">✨</span>
               </div>
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-olive/40">Mood Spectrum</p>
            </div>
            <div className="flex gap-6 items-center">
              {moodCounts.slice(0, 4).map(([mood, count]) => (
                <div key={mood} className="flex flex-col items-center gap-3 group/mood">
                  <div className="w-16 h-16 rounded-[2rem] bg-white border border-black/5 flex items-center justify-center text-3xl shadow-sm group-hover/mood:shadow-xl group-hover/mood:-translate-y-2 transition-all duration-500">
                    {mood}
                  </div>
                  <span className="text-[10px] font-black text-plum/30 uppercase tracking-widest">{count} Days</span>
                </div>
              ))}
              {moodCounts.length === 0 && (
                 <div className="flex flex-col gap-2 py-4">
                    <p className="text-sm font-medium text-plum/40 italic">Waiting for your first emotion...</p>
                    <div className="h-1 w-24 bg-black/5 rounded-full overflow-hidden" />
                 </div>
              )}
            </div>
          </div>
          <div className="flex-1 border-t md:border-t-0 md:border-l border-black/5 pt-8 md:pt-0 md:pl-12">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-olive/40 mb-8">Quick Insights</p>
            <div className="space-y-5">
               {[
                 { label: "Primary Vibe", val: moodCounts[0]?.[0] || "None", sub: "Most recurring" },
                 { label: "Creative Streak", val: `${Math.min(7, totalJournaled)} Days`, sub: "Max this week" },
                 { label: "Last Pulse", val: entries[entries.length-1]?.date.split('-').slice(1).join('/') || "Never", sub: "Latest entry" }
               ].map((item, i) => (
                 <div key={i} className="flex justify-between items-center group/item">
                    <div>
                       <div className="text-[10px] font-black text-plum uppercase tracking-widest group-hover/item:text-primary transition-colors">{item.label}</div>
                       <div className="text-[8px] font-black text-olive/20 uppercase tracking-widest mt-0.5">{item.sub}</div>
                    </div>
                    <span className="text-sm font-black text-plum bg-black/5 px-4 py-1.5 rounded-xl">{item.val}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10">
        {MONTHS.map((name, mi) => {
          const first = new Date(year, mi, 1).getDay();
          const days = new Date(year, mi + 1, 0).getDate();
          const cells = Array.from({ length: first + days }, (_, i) =>
            i < first ? null : i - first + 1
          );
          return (
            <div key={mi} className={`relative rounded-[3rem] border border-black/5 p-8 shadow-sm hover:shadow-2xl transition-all duration-700 ${MONTH_STYLES[mi]} group`}>
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-display text-3xl font-black text-plum tracking-tighter group-hover:scale-105 transition-transform origin-left">{name}</h3>
                <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center">
                   <span className="text-[9px] font-black text-plum/30">{year}</span>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2 text-[8px] font-black text-plum/20 mb-4 uppercase tracking-[0.2em]">
                {["S","M","T","W","T","F","S"].map((d, i) => (
                  <div key={i} className="text-center">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {cells.map((d, i) => {
                  if (!d) return <div key={i} />;
                  const dateStr = fmt(year, mi, d);
                  const e = entryMap.get(dateStr);
                  const isToday = today.getFullYear() === year && today.getMonth() === mi && today.getDate() === d;
                  
                  return (
                    <button
                      key={i}
                      onClick={() => setOpenDate(dateStr)}
                      className={`aspect-square rounded-2xl text-xs font-black relative transition-all duration-500 flex flex-col items-center justify-center overflow-hidden group/day
                        ${e ? "bg-plum text-white shadow-xl shadow-plum/20 scale-110 z-10" : "hover:bg-white hover:scale-125 text-plum bg-white/20"}
                        ${isToday && !e ? "ring-2 ring-primary ring-inset bg-white/60" : ""}
                      `}
                    >
                      {e?.images && e.images.length > 0 && (
                        <div className="absolute inset-0 opacity-10 group-hover/day:opacity-30 transition-opacity">
                           <img src={e.images[0]} className="w-full h-full object-cover" alt="" />
                        </div>
                      )}
                      {e?.mood ? <span className="text-sm relative z-10 drop-shadow-sm">{e.mood}</span> : <span className="relative z-10 opacity-40 group-hover/day:opacity-100">{d}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {openDate && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-plum/60 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-500"
             onClick={() => setOpenDate(null)}>
          <div className="bg-background sm:rounded-[3rem] border-t sm:border border-black/5 w-full max-w-2xl h-full sm:h-auto sm:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-500"
               onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 md:p-8 border-b border-black/5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-olive/40 mb-1">Creative Pulse</p>
                <h2 className="font-display text-2xl md:text-3xl font-black text-plum tracking-tighter">
                  {new Date(openDate).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
                </h2>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 bg-black/5" onClick={() => setOpenDate(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto scrollbar-hide pb-12">
               <div className="p-8 space-y-10">
                  {/* Mood Selector - Premium */}
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-olive/40 mb-6 block">Today's Vibe</label>
                    <div className="flex gap-3 flex-wrap items-center">
                      {MOODS.map((m) => (
                        <button key={m}
                                onClick={() => saveEntry(openDate, open?.text || "", open?.mood === m ? undefined : m, open?.images)}
                                className={`w-12 h-12 rounded-[1.25rem] text-2xl flex items-center justify-center transition-all duration-500 hover:scale-110 ${open?.mood === m ? "bg-plum text-white shadow-2xl shadow-plum/40 scale-110" : "bg-black/5 hover:bg-black/10"}`}>
                          {m}
                        </button>
                      ))}
                      <div className="h-8 w-px bg-black/5 mx-2" />
                      <input 
                        type="text"
                        placeholder="Other..."
                        value={!MOODS.includes(open?.mood || "") ? open?.mood || "" : ""}
                        onChange={(e) => saveEntry(openDate, open?.text || "", e.target.value, open?.images)}
                        className="w-28 h-12 bg-black/5 border-0 rounded-[1.25rem] px-4 text-[10px] font-black uppercase tracking-widest placeholder:text-olive/20 focus:ring-1 ring-plum/10 transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Memories / Images */}
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-olive/40 mb-6 block">Visual Memories</label>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                      <label className="shrink-0 w-32 h-32 rounded-[2rem] border-2 border-dashed border-black/5 bg-black/5 hover:bg-black/10 transition-all flex flex-col items-center justify-center cursor-pointer group">
                        <Plus className="w-8 h-8 text-olive/20 group-hover:scale-125 transition-transform duration-500" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-olive/20 mt-2">Add Fragment</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          multiple 
                          className="hidden" 
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            files.forEach(file => {
                              const reader = new FileReader();
                              reader.onload = () => {
                                const currentImages = open?.images || [];
                                saveEntry(openDate, open?.text || "", open?.mood, [...currentImages, reader.result as string]);
                              };
                              reader.readAsDataURL(file);
                            });
                          }}
                        />
                      </label>
                      {open?.images?.map((img, idx) => (
                        <div key={idx} className="shrink-0 w-32 h-32 rounded-[2rem] overflow-hidden relative group">
                          <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
                          <button 
                            onClick={() => {
                              const updated = (open?.images || []).filter((_, i) => i !== idx);
                              saveEntry(openDate, open?.text || "", open?.mood, updated);
                            }}
                            className="absolute top-2 right-2 p-2 rounded-xl bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Text Editor - Tactile Feel */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-olive/40 block">The Narrative</label>
                    <div className="relative p-8 rounded-[2.5rem] bg-black/5 min-h-[300px] ring-1 ring-black/[0.02]">
                       <div className="absolute top-8 left-8 bottom-8 w-px bg-primary/10 border-r border-dashed border-primary/20 pointer-events-none" />
                       <textarea
                         key={openDate}
                         defaultValue={open?.text || ""}
                         onBlur={(e) => saveEntry(openDate, e.target.value, open?.mood, open?.images)}
                         placeholder="Start typing your story..."
                         className="w-full h-full bg-transparent border-0 outline-none resize-none font-medium text-lg md:text-xl text-plum leading-relaxed placeholder:text-plum/10 pl-12"
                       />
                    </div>
                  </div>

                  {/* On This Day - Nostalgia Feature */}
                  {entries.some(e => e.date !== openDate && (e.date.endsWith(openDate.slice(5)) || e.date.endsWith(openDate.slice(5)))) && (
                    <div className="p-8 rounded-[2.5rem] bg-primary/5 border border-primary/10">
                       <div className="flex items-center gap-2 mb-4">
                          <Sparkles className="w-4 h-4 text-primary" />
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">On this day, previously...</span>
                       </div>
                       <div className="space-y-4">
                          {entries.filter(e => e.date !== openDate && e.date.endsWith(openDate.slice(5))).map(prev => (
                             <div key={prev.date} className="flex gap-4 items-center p-4 rounded-2xl bg-white/50 border border-black/5">
                                <span className="text-lg">{prev.mood || "💭"}</span>
                                <div className="flex-1 min-w-0">
                                   <p className="text-[10px] font-black text-plum/40 uppercase tracking-widest">{prev.date.split('-')[0]}</p>
                                   <p className="text-xs text-plum font-medium truncate italic">"{prev.text.slice(0, 80)}..."</p>
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                  )}
               </div>
            </div>

            <div className="px-8 py-6 border-t border-black/5 text-[10px] font-black uppercase tracking-widest text-olive/40 flex justify-between items-center bg-white/50 backdrop-blur-sm">
              <span className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                 Securely Documented
              </span>
              {open && <button onClick={() => { if(confirm("Discard this pulse?")) { setEntries(entries.filter((e) => e.date !== openDate)); setOpenDate(null); } }}
                               className="text-red-500 hover:text-red-600 transition-colors uppercase tracking-widest p-2 -m-2">Delete Entry</button>}
            </div>
          </div>
        </div>
      )}

    </div>
    </PageTransition>
  );
}
