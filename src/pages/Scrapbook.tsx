import { useState, useRef, useMemo } from "react";
import { useStore } from "@/lib/store";
import { CanvasCard } from "@/components/canvas/CanvasCard";
import { StarRating } from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import { 
  Download, Share2, Calendar, Pencil, 
  Music, Film, BookOpen, Feather, Sparkles,
  ChevronLeft, ChevronRight, Camera
} from "lucide-react";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import { PageTransition } from "@/components/PageTransition";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function Scrapbook() {
  const [canvases] = useStore("canvases");
  const [movies] = useStore("movies");
  const [books] = useStore("books");
  const [journal] = useStore("journal");
  const [sketches] = useStore("sketches");
  const [songs] = useStore("songs");

  // State
  const [date, setDate] = useState(new Date());
  const [isExporting, setIsExporting] = useState(false);
  const [format, setFormat] = useState<"4-5" | "1-1">("4-5");
  const [mode, setMode] = useState<"mixed" | "music" | "books" | "movies">("mixed");
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");
  const [theme, setTheme] = useState<"warm" | "midnight" | "minimalist">("warm");
  
  const scrapbookRef = useRef<HTMLDivElement>(null);
  const selectedMonth = date.getMonth();
  const selectedYear = date.getFullYear();

  const filteredData = useMemo(() => {
    const isSamePeriod = (d: number | string) => {
      const dt = new Date(d);
      if (period === 'yearly') return dt.getFullYear() === selectedYear;
      return dt.getMonth() === selectedMonth && dt.getFullYear() === selectedYear;
    };

    return {
      canvases: canvases.filter(c => isSamePeriod(c.updatedAt)),
      movies: movies.filter(m => isSamePeriod(m.updatedAt)),
      books: books.filter(b => isSamePeriod(b.updatedAt)),
      journal: journal.filter(j => {
        const [y, m] = j.date.split("-").map(Number);
        if (period === 'yearly') return y === selectedYear;
        return y === selectedYear && m === selectedMonth + 1;
      }),
      sketches: sketches.filter(s => isSamePeriod(s.updatedAt)),
      songs: songs.filter(s => isSamePeriod(s.updatedAt)),
    };
  }, [canvases, movies, books, journal, sketches, songs, selectedMonth, selectedYear, period]);

  const totalItems = Object.values(filteredData).flat().length;

  const displayItems = useMemo(() => {
    if (mode === "music") return filteredData.songs;
    if (mode === "books") return filteredData.books;
    if (mode === "movies") return filteredData.movies;

    const all = [
      ...filteredData.canvases.map(x => ({ ...x, type: 'canvas' as const })),
      ...filteredData.journal.map(x => ({ ...x, type: 'journal' as const })),
      ...filteredData.sketches.map(x => ({ ...x, type: 'sketch' as const })),
      ...filteredData.songs.map(x => ({ ...x, type: 'song' as const })),
      ...filteredData.movies.map(x => ({ ...x, type: 'movie' as const })),
      ...filteredData.books.map(x => ({ ...x, type: 'book' as const })),
    ].sort((a, b) => {
       const dateA = 'updatedAt' in a ? a.updatedAt : new Date(a.date).getTime();
       const dateB = 'updatedAt' in b ? b.updatedAt : new Date(b.date).getTime();
       return dateB - dateA;
    });

    return all.slice(0, period === 'yearly' ? 48 : 24);
  }, [filteredData, mode, period]);

  const handleExport = async () => {
    if (!scrapbookRef.current) return;
    setIsExporting(true);
    toast.loading("Crafting your memory card...");

    try {
      await new Promise(r => setTimeout(r, 800)); // More time for images
      
      const canvas = await html2canvas(scrapbookRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: theme === 'midnight' ? '#000000' : '#FFFFFF',
        logging: false,
        width: scrapbookRef.current.offsetWidth,
        height: scrapbookRef.current.scrollHeight,
        onclone: (clonedDoc) => {
           const el = clonedDoc.querySelector('.scrapbook-container') as HTMLElement;
           if (el) {
             el.style.height = 'auto';
             el.style.overflow = 'visible';
           }
        }
      });

      const link = document.createElement("a");
      link.download = `Muse-${mode}-${period}-${selectedYear}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.dismiss();
      toast.success("Memory card exported!");
    } catch (err) {
      console.error(err);
      toast.dismiss();
      toast.error("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(date);
    if (period === 'yearly') {
      newDate.setFullYear(newDate.getFullYear() + offset);
    } else {
      newDate.setMonth(newDate.getMonth() + offset);
    }
    setDate(newDate);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#F8F5F2] pb-40 overflow-x-hidden">
      {/* Controls Bar */}
      <div className="sticky top-16 z-40 bg-white/90 backdrop-blur-2xl border-b border-black/5 px-6 py-4 shadow-sm">
        <div className="max-w-[1440px] mx-auto flex flex-col xl:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap items-center justify-center gap-4">
             <div className="flex items-center bg-black/5 rounded-[2rem] p-1">
                <Button variant="ghost" size="icon" onClick={() => changeMonth(-1)} className="rounded-full h-10 w-10 hover:bg-white">
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <div className="px-6 font-display text-lg font-black text-plum min-w-[180px] text-center tracking-tight">
                  {period === 'monthly' ? `${MONTHS[selectedMonth]} ${selectedYear}` : selectedYear}
                </div>
                <Button variant="ghost" size="icon" onClick={() => changeMonth(1)} className="rounded-full h-10 w-10 hover:bg-white">
                  <ChevronRight className="w-5 h-5" />
                </Button>
             </div>

             <div className="flex items-center bg-black/5 rounded-[2rem] p-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setPeriod("monthly")}
                  className={`rounded-full px-5 h-9 text-[10px] font-black uppercase tracking-wider transition-all ${period === "monthly" ? "bg-white text-plum shadow-md" : "text-olive/40"}`}
                >Monthly</Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setPeriod("yearly")}
                  className={`rounded-full px-5 h-9 text-[10px] font-black uppercase tracking-wider transition-all ${period === "yearly" ? "bg-white text-plum shadow-md" : "text-olive/40"}`}
                >Yearly</Button>
             </div>
             
             <div className="flex items-center bg-black/5 rounded-[2rem] p-1">
                {(["mixed", "music", "books", "movies"] as const).map(m => (
                   <Button 
                    key={m}
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setMode(m)}
                    className={`rounded-full px-5 h-9 text-[10px] font-black uppercase tracking-wider transition-all capitalize ${mode === m ? "bg-white text-plum shadow-md" : "text-olive/40"}`}
                   >{m}</Button>
                ))}
             </div>

              <div className="flex items-center bg-black/5 rounded-[2rem] p-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setFormat("4-5")}
                  className={`rounded-full px-5 h-9 text-[10px] font-black uppercase tracking-wider transition-all ${format === "4-5" ? "bg-white text-plum shadow-md" : "text-olive/40"}`}
                >4:5</Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setFormat("1-1")}
                  className={`rounded-full px-5 h-9 text-[10px] font-black uppercase tracking-wider transition-all ${format === "1-1" ? "bg-white text-plum shadow-md" : "text-olive/40"}`}
                >1:1</Button>
             </div>

             <div className="flex items-center bg-black/5 rounded-[2rem] p-1">
                {(["warm", "midnight", "minimalist"] as const).map(t => (
                   <Button 
                    key={t}
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setTheme(t)}
                    className={`rounded-full px-4 h-9 text-[10px] font-black uppercase tracking-wider transition-all capitalize ${theme === t ? "bg-white text-plum shadow-md" : "text-olive/40"}`}
                   >{t}</Button>
                ))}
             </div>
          </div>

          <Button 
            onClick={handleExport} 
            disabled={totalItems === 0 || isExporting}
            className="rounded-full bg-[#2D2D2D] text-white hover:bg-plum h-12 px-12 gap-3 font-black text-sm shadow-2xl shadow-black/20 transition-all active:scale-95"
          >
            <Download className="w-5 h-5" />
            {isExporting ? "Exporting..." : `Export ${period === 'monthly' ? 'Wrap' : 'Annual'}`}
          </Button>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 pt-24 pb-12 flex justify-center animate-in fade-in slide-in-from-bottom-8 duration-700">
        {totalItems > 0 ? (
          <div 
            ref={scrapbookRef}
            className={`relative overflow-hidden shadow-[0_80px_160px_rgba(0,0,0,0.12)] rounded-[4rem] p-16 md:p-24 transition-all duration-700 scrapbook-container
              ${format === "4-5" ? "w-full max-w-[800px] min-h-[1000px]" : "w-full max-w-[800px] aspect-square"}
              ${theme === 'warm' ? 'bg-white texture-paper' : ''}
              ${theme === 'midnight' ? 'bg-black !text-white' : ''}
              ${theme === 'minimalist' ? 'bg-[#FAFAFA]' : ''}
              ${mode === 'music' && theme === 'warm' ? 'bg-[#1DB954] !text-white' : ''}
            `}
          >
            {/* Background Texture Logic */}
            <div className={`absolute inset-0 pointer-events-none ${mode === 'music' ? 'bg-gradient-to-br from-black/20 to-black/60' : 'opacity-[0.05]'}`} 
                 style={mode === 'mixed' ? { backgroundImage: "radial-gradient(#000 1.5px, transparent 1.5px)", backgroundSize: "40px 40px" } : {}} />
            
            {/* Artistic Header */}
            <div className="relative z-20 mb-20">
               <div className="flex items-end justify-between">
                  <div>
                    <p className={`text-[11px] font-black uppercase tracking-[0.5em] mb-3 ${theme === 'midnight' ? 'text-white/40' : mode === 'music' && theme === 'warm' ? 'text-white/60' : 'text-primary'}`}>
                      {period === 'monthly' ? 'Monthly Digest' : 'The Annual Review'}
                    </p>
                    <h1 className={`font-display text-6xl md:text-8xl font-black tracking-tighter leading-[0.75] ${theme === 'midnight' ? 'text-white' : mode === 'music' && theme === 'warm' ? 'text-white' : 'text-plum'}`}>
                        {period === 'monthly' ? MONTHS[selectedMonth] : selectedYear}<br/>
                        <span className={`text-[0.4em] tracking-normal ${theme === 'midnight' ? 'text-white/10' : mode === 'music' && theme === 'warm' ? 'text-white/20' : 'text-olive/10'}`}>
                           {period === 'monthly' ? selectedYear : 'Archive Edition'}
                        </span>
                    </h1>
                  </div>
                  <div className="opacity-20 transform scale-150 -translate-y-4">
                    {mode === 'music' && <Music className="w-16 h-16 text-white" />}
                    {mode === 'books' && <BookOpen className="w-16 h-16 text-plum" />}
                    {mode === 'movies' && <Film className="w-16 h-16 text-plum" />}
                    {mode === 'mixed' && <Sparkles className="w-16 h-16 text-primary" />}
                  </div>
               </div>
               
               {period === 'yearly' && (
                  <div className={`mt-8 flex flex-wrap gap-8 text-[11px] font-black uppercase tracking-widest ${mode === 'music' ? 'text-white/50' : 'text-olive/40'}`}>
                     <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-current opacity-20" /> {filteredData.canvases.length} Creations</div>
                     <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-current opacity-20" /> {filteredData.songs.length} Discoveries</div>
                     <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-current opacity-20" /> {filteredData.movies.length} Cinema</div>
                     <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-current opacity-20" /> {filteredData.books.length} Library</div>
                  </div>
               )}
            </div>

            {/* Content Rendering */}
            <div className="relative">
               {mode === 'mixed' && (
                  <div className={`grid ${period === 'yearly' ? 'grid-cols-3 md:grid-cols-4 gap-4' : 'grid-cols-2 md:grid-cols-3 gap-6'}`}>
                    {displayItems.map((item: any, idx) => {
                      const rotation = (idx % 4 === 0 ? -4 : idx % 4 === 1 ? 3 : idx % 4 === 2 ? -2 : 5);
                      return (
                        <div key={idx} style={{ transform: `rotate(${rotation}deg)` }} className="relative group transition-all hover:scale-105 hover:z-30">
                          {item.type === 'journal' && period === 'monthly' && (
                             <div className="p-5 rounded-[2rem] bg-[#FEF9E7] border border-black/5 shadow-lg transform transition-all group-hover:rotate-0">
                                <div className="text-3xl mb-3">{item.mood}</div>
                                <p className="text-plum text-[11px] font-medium italic leading-relaxed line-clamp-3">"{item.text}"</p>
                             </div>
                          )}
                          {item.type === 'canvas' && <div className="shadow-2xl rounded-[2.5rem] overflow-hidden scale-95 border-4 border-white"><CanvasCard doc={item} href="#" hideMeta /></div>}
                          {item.type === 'sketch' && <div className="p-2.5 rounded-[2.5rem] bg-white shadow-xl border border-black/5"><img src={item.cover} className="w-full h-auto rounded-[2rem]" /></div>}
                          {item.type === 'song' && (
                             <div className="p-4 rounded-[1.5rem] bg-plum/5 border border-plum/10 flex items-center gap-3">
                                <img src={item.cover} className="w-10 h-10 rounded-xl object-cover shadow-lg" />
                                <div className="min-w-0 flex-1"><div className="font-black text-[9px] text-plum truncate">{item.title}</div></div>
                             </div>
                          )}
                          {(item.type === 'movie' || item.type === 'book') && (
                             <div className="p-3 rounded-[2rem] bg-white shadow-xl border border-black/5"><img src={item.cover} className="w-full h-auto rounded-[1.5rem]" /></div>
                          )}
                        </div>
                      );
                    })}
                  </div>
               )}

               {mode === 'music' && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-8 h-full content-center">
                    {displayItems.slice(0, period === 'yearly' ? 9 : 4).map((s: any, idx) => (
                       <div key={idx} className="group relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl transition-all hover:scale-105">
                          <img src={s.cover} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-8 flex flex-col justify-end">
                             <div className="text-[11px] font-black text-[#1DB954] uppercase tracking-[0.2em] mb-2">Track {idx + 1}</div>
                             <div className="font-black text-2xl text-white truncate leading-tight mb-1">{s.title}</div>
                             <div className="text-sm text-white/50 truncate font-medium">{s.artist}</div>
                          </div>
                       </div>
                    ))}
                  </div>
               )}

               {mode === 'books' && (
                  <div className={`grid ${period === 'yearly' ? 'grid-cols-4 gap-8' : 'grid-cols-3 gap-10'} h-full items-center`}>
                    {displayItems.map((b: any, idx) => (
                       <div key={idx} className="space-y-4 group">
                          <div className="aspect-[2/3] rounded-[1.5rem] overflow-hidden shadow-2xl border-[6px] border-white transition-all group-hover:-translate-y-4 group-hover:rotate-2">
                             <img src={b.cover} className="w-full h-full object-cover" />
                          </div>
                          {period === 'monthly' && (
                            <div className="text-center">
                               <div className="font-black text-xs text-plum truncate tracking-tight">{b.title}</div>
                               <div className="text-[10px] font-bold text-olive/30 truncate mt-1">{b.author}</div>
                            </div>
                          )}
                       </div>
                    ))}
                  </div>
               )}

               {mode === 'movies' && (
                  <div className={`grid ${period === 'yearly' ? 'grid-cols-2 gap-6' : 'flex flex-col gap-6'} h-full content-center`}>
                    {displayItems.slice(0, period === 'yearly' ? 10 : 5).map((m: any, idx) => (
                       <div key={idx} className="flex items-center gap-6 p-5 rounded-[2.5rem] bg-white shadow-xl border border-black/5 hover:translate-x-2 transition-transform">
                          <img src={m.cover} className="w-20 h-24 rounded-[1.5rem] object-cover shadow-2xl" />
                          <div className="flex-1 min-w-0">
                             <div className="font-black text-xl text-plum tracking-tighter truncate mb-2">{m.title}</div>
                             <div className="flex items-center gap-4">
                                <StarRating value={m.rating} size={14} />
                                <span className="text-[11px] font-black text-olive/20 uppercase tracking-widest">{m.year}</span>
                             </div>
                          </div>
                       </div>
                    ))}
                  </div>
               )}
            </div>

            {/* Simple Date stamp instead of branding */}
            <div className="absolute bottom-10 right-10 flex items-center justify-end">
               <div className={`text-xs font-black uppercase tracking-[0.2em] tabular-nums ${mode === 'music' ? 'text-white/40' : 'text-olive/20'}`}>
                  {period === 'monthly' ? `${selectedMonth + 1}.${selectedYear}` : `${selectedYear} ANNUAL`}
               </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-40 w-full max-w-4xl bg-white/50 backdrop-blur-md rounded-[5rem] border-4 border-dashed border-sand/40">
            <div className="w-24 h-24 rounded-full bg-sand/20 flex items-center justify-center mx-auto mb-10">
              <Calendar className="w-12 h-12 text-olive/20" />
            </div>
            <h2 className="font-display text-4xl font-black text-plum mb-6 tracking-tight">No memories found</h2>
            <p className="text-olive/40 max-w-md mx-auto font-medium text-lg leading-relaxed">
              It looks like you haven't captured any memories for this period yet. <br/>
              <span className="text-primary/60">Start your journey today.</span>
            </p>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .texture-paper {
          background-image: url('https://www.transparenttextures.com/patterns/handmade-paper.png');
        }
      `}} />
    </div>
    </PageTransition>
  );
}
