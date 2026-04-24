import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MOODS = ["✨","🌸","☀️","🌧️","🌙","🔥","💭","🍃","❤️","☕"];

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
    <div className="max-w-[1440px] mx-auto px-6 py-10">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
        <div>
          <p className="text-sm uppercase tracking-widest text-olive mb-2">A year, day by day</p>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-plum">Journal</h1>
        </div>
        <div className="flex items-center gap-2 bg-card rounded-full border border-sand p-1.5">
          <Button variant="ghost" size="icon" className="rounded-full h-9 w-9" onClick={() => setYear(year - 1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="font-display text-xl font-semibold text-plum w-20 text-center">{year}</span>
          <Button variant="ghost" size="icon" className="rounded-full h-9 w-9" onClick={() => setYear(year + 1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {MONTHS.map((name, mi) => {
          const first = new Date(year, mi, 1).getDay();
          const days = new Date(year, mi + 1, 0).getDate();
          const cells = Array.from({ length: first + days }, (_, i) =>
            i < first ? null : i - first + 1
          );
          return (
            <div key={mi} className="bg-card rounded-3xl border border-sand p-5 pin-shadow">
              <h3 className="font-display text-xl font-semibold text-plum mb-3">{name}</h3>
              <div className="grid grid-cols-7 gap-1 text-[10px] text-olive mb-1">
                {["S","M","T","W","T","F","S"].map((d, i) => (
                  <div key={i} className="text-center font-semibold">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {cells.map((d, i) => {
                  if (!d) return <div key={i} />;
                  const dateStr = fmt(year, mi, d);
                  const e = entryMap.get(dateStr);
                  const isToday = today.getFullYear() === year && today.getMonth() === mi && today.getDate() === d;
                  return (
                    <button
                      key={i}
                      onClick={() => setOpenDate(dateStr)}
                      className={`aspect-square rounded-lg text-xs font-medium relative transition-all
                        ${e ? "bg-primary text-primary-foreground" : "hover:bg-sand text-plum"}
                        ${isToday && !e ? "ring-2 ring-plum ring-inset" : ""}
                      `}
                      title={e ? e.text.slice(0, 80) : ""}
                    >
                      {e?.mood ? <span className="text-sm">{e.mood}</span> : d}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {openDate && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-plum/40 backdrop-blur-sm p-4 animate-fade-in"
             onClick={() => setOpenDate(null)}>
          <div className="bg-background rounded-3xl border border-sand w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col lift-shadow animate-scale-in"
               onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-sand">
              <div>
                <p className="text-xs uppercase tracking-widest text-olive">Entry</p>
                <h2 className="font-display text-2xl font-semibold text-plum">
                  {new Date(openDate).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                </h2>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setOpenDate(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="px-5 pt-4 flex gap-1.5 flex-wrap">
              {MOODS.map((m) => (
                <button key={m}
                        onClick={() => saveEntry(openDate, open?.text || "", open?.mood === m ? undefined : m)}
                        className={`w-9 h-9 rounded-full text-lg ${open?.mood === m ? "bg-sand ring-2 ring-primary" : "hover:bg-sand"}`}>
                  {m}
                </button>
              ))}
            </div>
            <textarea
              key={openDate}
              defaultValue={open?.text || ""}
              onBlur={(e) => saveEntry(openDate, e.target.value, open?.mood)}
              autoFocus
              placeholder="What happened today? How did it feel?"
              className="flex-1 w-full p-5 bg-transparent border-0 outline-none resize-none font-body text-lg text-plum leading-relaxed placeholder:text-warm-silver min-h-[300px]"
            />
            <div className="px-5 py-3 border-t border-sand text-xs text-olive flex justify-between">
              <span>Auto-saves on blur</span>
              {open && <button onClick={() => { setEntries(entries.filter((e) => e.date !== openDate)); setOpenDate(null); }}
                               className="text-primary hover:underline">Delete entry</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
