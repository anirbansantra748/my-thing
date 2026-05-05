import { Link } from "react-router-dom";
import { useStore } from "@/lib/store";
import { CanvasCard } from "@/components/canvas/CanvasCard";
import { StarRating } from "@/components/StarRating";
import { Feather, Palette, CalendarDays, Film, BookOpen, ArrowUpRight, Pencil, Music, Play } from "lucide-react";

const SECTIONS = [
  { to: "/poems", label: "Poems", icon: Feather, blurb: "Words, kept softly.", tex: "texture-blush" },
  { to: "/sketches", label: "Sketch", icon: Pencil, blurb: "Freehand thoughts.", tex: "texture-sky" },
  { to: "/journal", label: "Journal", icon: CalendarDays, blurb: "A year, a day at a time.", tex: "texture-warm" },
  { to: "/movies", label: "Movies", icon: Film, blurb: "Frames worth remembering.", tex: "texture-sky" },
  { to: "/books", label: "Books", icon: BookOpen, blurb: "Pages, slowly turned.", tex: "texture-paper" },
  { to: "/songs", label: "Music", icon: Music, blurb: "Melodies for the soul.", tex: "texture-warm" },
];

export default function Home() {
  const [canvases] = useStore("canvases");
  const [movies] = useStore("movies");
  const [books] = useStore("books");
  const [journal] = useStore("journal");
  const [sketches] = useStore("sketches");
  const [songs] = useStore("songs");

  const recentCanvases = [...canvases].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 8);
  const recentSketches = [...sketches].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 4);
  const recentMovies = [...movies].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 4);
  const recentBooks = [...books].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 4);
  const recentSongs = [...songs].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 4);
  const today = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="max-w-[1440px] mx-auto px-5 md:px-10 py-8 md:py-16 overflow-x-hidden">
      {/* Hero */}
      <section className="mb-12 md:mb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <CalendarDays className="w-3 h-3 md:w-4 md:h-4" /> {today}
        </div>
        <h1 className="font-display text-5xl sm:text-6xl md:text-8xl font-black text-plum leading-[0.95] tracking-tighter max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
          A quiet place to <em className="text-primary not-italic relative">keep<span className="absolute -bottom-2 left-0 w-full h-1 bg-primary/20 rounded-full" /></em> what matters.
        </h1>
        <p className="text-olive/60 text-lg md:text-xl mt-8 max-w-2xl font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
          Poems, drawings, days, films, books — gathered like clippings in a beloved scrapbook.
        </p>
      </section>

      {/* Section tiles - God Tier Glassmorphism */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 mb-16 md:mb-24">
        {SECTIONS.map((s, idx) => (
          <Link key={s.to} to={s.to}
                style={{ animationDelay: `${idx * 100}ms` }}
                className={`group relative rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border border-black/5 p-6 h-40 md:h-56 flex flex-col justify-between bg-white shadow-[0_20px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4`}>
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${s.tex} opacity-10`} />
            <div className="w-12 h-12 rounded-2xl bg-black/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
              <s.icon className="w-6 h-6 text-plum" strokeWidth={2} />
            </div>
            <div className="relative z-10">
              <div className="font-display text-xl md:text-2xl font-black text-plum leading-tight mb-1">{s.label}</div>
              <div className="text-[10px] text-olive/40 font-black uppercase tracking-widest">{s.blurb}</div>
            </div>
            <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-plum/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform rotate-45 group-hover:rotate-0">
               <ArrowUpRight className="w-4 h-4 text-plum" />
            </div>
          </Link>
        ))}
      </section>

      {/* Recent sketches - God Tier Grid */}
      {recentSketches.length > 0 && (
        <section className="mb-20 md:mb-32 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
          <Header title="Recent sketches" href="/sketches" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {recentSketches.map((s) => (
              <Link key={s.id} to={`/sketches/${s.id}`} className="group relative aspect-square rounded-[2.5rem] md:rounded-[3rem] overflow-hidden border border-black/5 bg-white shadow-[0_20px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.1)] transition-all duration-700 hover:-translate-y-3">
                {s.cover ? (
                  <img src={s.cover} alt="" className="w-full h-full object-cover p-6 group-hover:scale-110 transition-transform duration-1000" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-black/[0.02] text-warm-silver">
                    <Pencil className="w-12 h-12 mb-2 opacity-10 group-hover:scale-110 transition-transform duration-700" />
                  </div>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recent canvases - Masonry Grid */}
      {recentCanvases.length > 0 && (
        <section className="mb-20 md:mb-32 animate-in fade-in slide-in-from-bottom-20 duration-1000 delay-400">
          <Header title="Latest captures" href="/poems" />
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-8 space-y-8">
            {recentCanvases.map((d) => (
              <div key={d.id} className="break-inside-avoid">
                <CanvasCard doc={d} href={`${d.kind === "poem" ? "/poems" : "/drawings"}/${d.id}`} hideMeta />
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid lg:grid-cols-3 gap-12 md:gap-16 mb-20">
        {recentMovies.length > 0 && (
          <section className="animate-in fade-in slide-in-from-left-8 duration-1000 delay-500">
            <Header title="Latest movies" href="/movies" />
            <div className="space-y-4">
              {recentMovies.map((m) => (
                <Link key={m.id} to="/movies" className="group flex items-center gap-6 p-4 rounded-[2rem] bg-white border border-black/5 shadow-[0_10px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.06)] hover:-translate-x-2 transition-all duration-500">
                  <div className="w-16 h-24 rounded-2xl bg-black/5 overflow-hidden flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-500">
                    {m.cover ? <img src={m.cover} alt="" className="w-full h-full object-cover" /> : <Film className="w-6 h-6 text-warm-silver" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-plum text-lg tracking-tight truncate group-hover:text-primary transition-colors">{m.title}</div>
                    <div className="text-[10px] font-black text-olive/40 uppercase tracking-widest mt-1">{m.year} · {m.status}</div>
                    <div className="mt-3 opacity-60 group-hover:opacity-100 transition-opacity"><StarRating value={m.rating} size={14} /></div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {recentBooks.length > 0 && (
          <section className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-600">
            <Header title="Currently reading" href="/books" />
            <div className="space-y-4">
              {recentBooks.map((b) => {
                const pct = b.totalPages ? Math.min(100, (b.pagesRead / b.totalPages) * 100) : 0;
                return (
                  <Link key={b.id} to="/books" className="group flex items-center gap-6 p-4 rounded-[2rem] bg-white border border-black/5 shadow-[0_10px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-500">
                    <div className="w-16 h-24 rounded-2xl bg-black/5 overflow-hidden flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-500">
                      {b.cover ? <img src={b.cover} alt="" className="w-full h-full object-cover" /> : <BookOpen className="w-6 h-6 text-warm-silver" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-plum text-lg tracking-tight truncate group-hover:text-primary transition-colors">{b.title}</div>
                      <div className="text-[10px] font-black text-olive/40 uppercase tracking-widest mt-1">{b.author}</div>
                      <div className="mt-4 h-1.5 rounded-full bg-black/5 overflow-hidden">
                        <div className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {recentSongs.length > 0 && (
          <section className="animate-in fade-in slide-in-from-right-8 duration-1000 delay-700">
            <Header title="Latest music" href="/songs" />
            <div className="space-y-4">
              {recentSongs.map((s) => (
                <Link key={s.id} to="/songs" className="group flex items-center gap-6 p-4 rounded-[2rem] bg-white border border-black/5 shadow-[0_10px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.06)] hover:translate-x-2 transition-all duration-500">
                  <div className="w-20 h-20 rounded-[1.5rem] bg-black/5 overflow-hidden flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-700">
                    {s.cover ? <img src={s.cover} alt="" className="w-full h-full object-cover" /> : <Music className="w-8 h-8 text-warm-silver" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-plum text-lg tracking-tight group-hover:text-primary transition-colors line-clamp-2 leading-tight">{s.title}</div>
                    <div className="text-[10px] font-black text-olive/40 uppercase tracking-widest mt-1 line-clamp-1">{s.artist}</div>
                    <div className="mt-3 flex items-center gap-2">
                       <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors duration-500">
                          <Play className="w-3 h-3 text-primary group-hover:text-white transition-colors" fill="currentColor" />
                       </div>
                       <span className="text-[9px] font-black text-olive/20 uppercase tracking-widest">{new Date(s.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {recentCanvases.length === 0 && recentMovies.length === 0 && recentBooks.length === 0 && journal.length === 0 && (
        <div className="text-center py-32 mt-4 animate-in fade-in zoom-in duration-1000">
          <p className="font-display text-5xl text-plum/20 italic mb-6">"Begin anywhere."</p>
          <p className="text-olive/40 font-bold uppercase tracking-widest text-xs">Pick a section above and make something small today.</p>
        </div>
      )}
    </div>
  );
}

function Header({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-end justify-between mb-8 md:mb-10">
      <div>
        <h2 className="font-display text-3xl md:text-5xl font-black text-plum tracking-tighter leading-none">{title}</h2>
        <div className="w-12 h-1 bg-primary/10 rounded-full mt-4" />
      </div>
      <Link to={href} className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-olive/40 hover:text-plum transition-all bg-black/5 px-4 py-2 rounded-full hover:bg-plum/10">
        See all <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </Link>
    </div>
  );
}
