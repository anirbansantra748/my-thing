import { Link } from "react-router-dom";
import { useStore } from "@/lib/store";
import { CanvasCard } from "@/components/canvas/CanvasCard";
import { StarRating } from "@/components/StarRating";
import { Feather, Palette, CalendarDays, Film, BookOpen, ArrowUpRight, Pencil, Music, Play, Sparkles } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";

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
    <PageTransition>
      <div className="max-w-[1440px] mx-auto px-5 md:px-10 pt-8 md:pt-16 pb-32 overflow-x-hidden">
        {/* Hero */}
        <section className="mb-12 md:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <CalendarDays className="w-3 h-3 md:w-4 md:h-4" /> {today}
          </div>
          <h1 className="font-display text-5xl sm:text-6xl md:text-8xl font-black text-plum leading-[0.95] tracking-tighter max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
            A quiet place to <em className="text-primary not-italic relative">keep<span className="absolute -bottom-2 left-0 w-full h-1 bg-primary/20 rounded-full" /></em> what matters.
          </h1>
        </section>

        {/* Stats Row */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
          {[
            { label: "Total Music", count: songs.length, icon: Music, color: "bg-plum/5 text-plum" },
            { label: "Books Read", count: books.filter(b => b.status === 'finished').length, icon: BookOpen, color: "bg-primary/5 text-primary" },
            { label: "Movies Watched", count: movies.filter(m => m.status === 'watched').length, icon: Film, color: "bg-sky-500/5 text-sky-500" },
            { label: "Monthly Memories", count: [
              ...canvases.filter(c => new Date(c.updatedAt).getMonth() === new Date().getMonth()),
              ...movies.filter(m => new Date(m.updatedAt).getMonth() === new Date().getMonth()),
              ...books.filter(b => new Date(b.updatedAt).getMonth() === new Date().getMonth()),
              ...songs.filter(s => new Date(s.updatedAt).getMonth() === new Date().getMonth()),
            ].length, icon: Sparkles, color: "bg-amber-500/5 text-amber-500" },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col gap-2 p-6 rounded-[2rem] bg-white border border-black/5 shadow-sm">
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-2`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black text-plum tracking-tighter">{stat.count}</div>
              <div className="text-[10px] font-black text-olive/40 uppercase tracking-[0.2em]">{stat.label}</div>
            </div>
          ))}
        </section>

        {/* Studio Heatmap - Yearly Activity */}
        <section className="mb-16 md:mb-24 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-500">
           <div className="p-8 rounded-[2.5rem] bg-white border border-black/5 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                 <div>
                    <h3 className="text-sm font-black text-plum uppercase tracking-widest flex items-center gap-2">
                       <Sparkles className="w-4 h-4 text-primary" /> Studio Rhythm
                    </h3>
                    <p className="text-[10px] text-olive/40 font-bold uppercase tracking-widest mt-1">Your creative consistency this year</p>
                 </div>
                 <div className="flex items-center gap-4 text-[9px] font-black text-olive/20 uppercase tracking-widest">
                    <span>Less</span>
                    <div className="flex gap-1">
                       <div className="w-2.5 h-2.5 rounded-sm bg-sand" />
                       <div className="w-2.5 h-2.5 rounded-sm bg-primary/20" />
                       <div className="w-2.5 h-2.5 rounded-sm bg-primary/40" />
                       <div className="w-2.5 h-2.5 rounded-sm bg-primary/60" />
                       <div className="w-2.5 h-2.5 rounded-sm bg-primary" />
                    </div>
                    <span>More</span>
                 </div>
              </div>
              <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-2">
                 {[...Array(53)].map((_, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-1 shrink-0">
                       {[...Array(7)].map((_, dayIndex) => {
                          const dayOfYear = weekIndex * 7 + dayIndex;
                          const date = new Date();
                          date.setMonth(0);
                          date.setDate(dayOfYear + 1);
                          
                          // Count real items added on this day
                          const count = [
                            ...songs, ...books, ...movies, ...canvases, ...journal
                          ].filter(item => {
                            const itemDate = new Date(item.updatedAt);
                            return itemDate.toDateString() === date.toDateString();
                          }).length;

                          const activityLevel = Math.min(4, count); 
                          const colors = ['bg-sand', 'bg-primary/20', 'bg-primary/40', 'bg-primary/60', 'bg-primary'];
                          return (
                             <div 
                                key={dayIndex} 
                                className={`w-2.5 h-2.5 md:w-3.5 md:h-3.5 rounded-sm ${colors[activityLevel]} transition-colors hover:ring-2 ring-primary/20 cursor-help`}
                                title={`${date.toDateString()}: ${count} memories captured`}
                             />
                          );
                       })}
                    </div>
                 ))}
              </div>
           </div>
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

        {/* The Monthly Wrap - Premium Digest */}
        {(recentSongs.length > 0 || recentBooks.length > 0 || recentMovies.length > 0) && (
          <section className="mt-20 md:mb-32 animate-in fade-in slide-in-from-bottom-24 duration-1000 delay-800">
            <div className="relative overflow-hidden rounded-[3rem] md:rounded-[4rem] bg-plum p-8 md:p-20 text-white">
              <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
                 <Sparkles className="w-full h-full text-white" />
              </div>
              <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                 <div>
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-[10px] font-black uppercase tracking-widest mb-8">
                       <ArrowUpRight className="w-3 h-3" /> The Studio Wrap
                    </div>
                    <h2 className="font-display text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-8">
                       This month was <br/> <em className="text-primary not-italic">unforgettable.</em>
                    </h2>
                    <p className="text-lg text-white/60 max-w-md font-medium leading-relaxed mb-12">
                       You've been building a beautiful world. Here is a snapshot of your creative rhythm this month.
                    </p>
                    <div className="flex flex-wrap gap-8">
                       <div className="flex flex-col gap-1">
                          <span className="text-4xl font-black tracking-tighter">{songs.length}</span>
                          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Songs Found</span>
                       </div>
                       <div className="w-px h-12 bg-white/10" />
                       <div className="flex flex-col gap-1">
                          <span className="text-4xl font-black tracking-tighter">{books.length}</span>
                          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Books Read</span>
                       </div>
                       <div className="w-px h-12 bg-white/10" />
                       <div className="flex flex-col gap-1">
                          <span className="text-4xl font-black tracking-tighter">{movies.length}</span>
                          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Movies Watched</span>
                       </div>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4 pt-12">
                       <div className="aspect-[3/4] rounded-3xl bg-white/5 border border-white/10 overflow-hidden transform -rotate-3 hover:rotate-0 transition-transform duration-700 shadow-2xl">
                          {recentSongs[0]?.cover && <img src={recentSongs[0].cover} className="w-full h-full object-cover opacity-80" />}
                       </div>
                       <div className="aspect-square rounded-3xl bg-white/5 border border-white/10 overflow-hidden transform rotate-2 hover:rotate-0 transition-transform duration-700 shadow-2xl">
                          {recentMovies[0]?.cover && <img src={recentMovies[0].cover} className="w-full h-full object-cover opacity-80" />}
                       </div>
                    </div>
                    <div className="space-y-4">
                       <div className="aspect-square rounded-3xl bg-white/5 border border-white/10 overflow-hidden transform rotate-6 hover:rotate-0 transition-transform duration-700 shadow-2xl">
                          {recentBooks[0]?.cover && <img src={recentBooks[0].cover} className="w-full h-full object-cover opacity-80" />}
                       </div>
                       <div className="aspect-[3/4] rounded-3xl bg-white/5 border border-white/10 overflow-hidden transform -rotate-2 hover:rotate-0 transition-transform duration-700 shadow-2xl p-6 flex flex-col justify-end">
                          <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-2">Latest Thought</p>
                          <p className="text-sm font-bold line-clamp-4 text-white/80 italic">"{journal[0]?.content || "The first step is always the most beautiful."}"</p>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </section>
        )}

        {recentCanvases.length === 0 && recentMovies.length === 0 && recentBooks.length === 0 && journal.length === 0 && (
          <div className="text-center py-32 mt-4 animate-in fade-in zoom-in duration-1000">
            <p className="font-display text-5xl text-plum/20 italic mb-6">"Begin anywhere."</p>
            <p className="text-olive/40 font-bold uppercase tracking-widest text-xs">Pick a section above and make something small today.</p>
          </div>
        )}
      </div>
    </PageTransition>
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
