import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

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

  const open = openDate ? entryMap.get(openDate) : null;
  const today = new Date();

  const saveEntry = (date: string, text: string, mood?: string) => {
    const others = entries.filter((e) => e.date !== date);
    if (!text.trim() && !mood) {
      setEntries(others);
      return;
    }
    setEntries([...others, { date, text, mood, updatedAt: Date.now() }]);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-6 md:py-10">
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

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
        {MONTHS.map((name, mi) => {
          const first = new Date(year, mi, 1).getDay();
          const days = new Date(year, mi + 1, 0).getDate();
          const cells = Array.from({ length: first + days }, (_, i) =>
            i < first ? null : i - first + 1
          );
          return (
            <div key={mi} className={`relative rounded-3xl border border-sand p-5 md:p-6 shadow-sm hover:shadow-md transition-all duration-300 ${MONTH_STYLES[mi]} group`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-2xl font-bold text-plum group-hover:scale-105 transition-transform origin-left">{name}</h3>
                <span className="text-[10px] font-bold text-olive/40 uppercase tracking-widest">{year}</span>
              </div>
              <div className="grid grid-cols-7 gap-1.5 text-[9px] font-black text-plum/30 mb-2 uppercase tracking-tighter">
                {["S","M","T","W","T","F","S"].map((d, i) => (
                  <div key={i} className="text-center">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {cells.map((d, i) => {
                  if (!d) return <div key={i} />;
                  const dateStr = fmt(year, mi, d);
                  const e = entryMap.get(dateStr);
                  const isToday = today.getFullYear() === year && today.getMonth() === mi && today.getDate() === d;
                  
                  return (
                    <button
                      key={i}
                      onClick={() => setOpenDate(dateStr)}
                      className={`aspect-square rounded-xl text-[11px] font-bold relative transition-all duration-200 flex items-center justify-center
                        ${e ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 scale-105 z-10" : "hover:bg-white/80 hover:scale-110 text-plum bg-white/30"}
                        ${isToday && !e ? "ring-2 ring-plum ring-inset bg-white/60" : ""}
                      `}
                    >
                      {e?.mood ? <span className="text-sm transform group-hover:animate-bounce">{e.mood}</span> : d}
                      {e && !e.mood && (
                         <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-plum/20 ring-2 ring-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {openDate && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-plum/40 backdrop-blur-sm p-0 sm:p-4 animate-fade-in"
             onClick={() => setOpenDate(null)}>
          <div className="bg-background sm:rounded-3xl border-t sm:border border-sand w-full max-w-2xl h-full sm:h-auto sm:max-h-[85vh] overflow-hidden flex flex-col lift-shadow animate-scale-in"
               onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 md:p-5 border-b border-sand">
              <div>
                <p className="text-[10px] md:text-xs uppercase tracking-widest text-olive">Entry</p>
                <h2 className="font-display text-lg md:text-2xl font-semibold text-plum">
                  {new Date(openDate).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                </h2>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full h-11 w-11" onClick={() => setOpenDate(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="px-5 md:px-6 pt-6">
              <label className="text-[10px] font-black uppercase tracking-widest text-olive/40 mb-3 block">Daily Mood</label>
              <div className="flex gap-2 flex-wrap items-center">
                {MOODS.map((m) => (
                  <button key={m}
                          onClick={() => saveEntry(openDate, open?.text || "", open?.mood === m ? undefined : m)}
                          className={`w-10 h-10 rounded-full text-xl flex items-center justify-center transition-all duration-300 ${open?.mood === m ? "bg-primary text-white shadow-lg shadow-primary/20" : "hover:bg-black/5"}`}>
                    {m}
                  </button>
                ))}
                <div className="h-6 w-px bg-black/5 mx-2" />
                <div className="relative group">
                  <input 
                    type="text"
                    placeholder="Other..."
                    value={!MOODS.includes(open?.mood || "") ? open?.mood || "" : ""}
                    onChange={(e) => saveEntry(openDate, open?.text || "", e.target.value)}
                    className="w-24 h-10 bg-black/5 border-0 rounded-full px-4 text-xs font-black placeholder:text-olive/20 focus:ring-2 ring-primary/20 transition-all outline-none"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary opacity-0 group-focus-within:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
            <textarea
              key={openDate}
              defaultValue={open?.text || ""}
              onBlur={(e) => saveEntry(openDate, e.target.value, open?.mood)}
              autoFocus
              placeholder="What happened today? How did it feel?"
              className="flex-1 w-full p-4 md:p-5 bg-transparent border-0 outline-none resize-none font-body text-base md:text-lg text-plum leading-relaxed placeholder:text-warm-silver min-h-[200px]"
            />
            <div className="px-4 md:px-5 py-3 border-t border-sand text-xs text-olive flex justify-between items-center bg-warm-wash/50">
              <span>Auto-saves on blur</span>
              {open && <button onClick={() => { setEntries(entries.filter((e) => e.date !== openDate)); setOpenDate(null); }}
                               className="text-primary hover:underline font-medium p-2 -m-2">Delete entry</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
