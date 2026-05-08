import { Link } from "react-router-dom";
import { useStore, VaultEntry, PhotoEntry } from "@/lib/store";
import { useMemo } from "react";
import { CanvasCard } from "@/components/canvas/CanvasCard";
import { StarRating } from "@/components/StarRating";
import { Feather, Palette, CalendarDays, Film, BookOpen, ArrowUpRight, Pencil, Music, Play, Sparkles, Camera, Shield, Tv } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";

const SECTIONS = [
  { to: "/poems", label: "Poems", icon: Feather, blurb: "Words, kept softly.", tex: "texture-blush" },
  { to: "/anime", label: "Anime", icon: Tv, blurb: "Episodes logged.", tex: "texture-sky" },
  { to: "/exhibition", label: "Gallery", icon: Camera, blurb: "Shots, curated.", tex: "texture-sky" },
  { to: "/sketches", label: "Sketch", icon: Pencil, blurb: "Freehand thoughts.", tex: "texture-sky" },
  { to: "/journal", label: "Journal", icon: CalendarDays, blurb: "A year, a day at a time.", tex: "texture-warm" },
  { to: "/vault", label: "Vault", icon: Shield, blurb: "Life, secured.", tex: "texture-paper" },
  { to: "/movies", label: "Movies", icon: Film, blurb: "Frames worth remembering.", tex: "texture-sky" },
  { to: "/books", label: "Books", icon: BookOpen, blurb: "Pages, slowly turned.", tex: "texture-paper" },
  { to: "/songs", label: "Music", icon: Music, blurb: "Melodies for the soul.", tex: "texture-warm" },
];

const FACTS = [
  "A bolt of lightning contains enough energy to toast 100,000 slices of bread.",
  "Honey never spoils. Archaeologists have found 3,000-year-old honey that's still edible.",
  "Octopuses have three hearts and blue blood.",
  "The Eiffel Tower can be 15 cm taller during the summer due to thermal expansion.",
  "A single cloud can weigh more than a million pounds.",
  "Wombat poop is cube-shaped to prevent it from rolling away.",
  "There are more trees on Earth than stars in the Milky Way galaxy.",
  "Bananas are berries, but strawberries aren't.",
  "The heart of a shrimp is located in its head.",
  "A day on Venus is longer than a year on Venus."
];

export default function Home() {
  const [canvases] = useStore("canvases");
  const [movies] = useStore("movies");
  const [books] = useStore("books");
  const [journal] = useStore("journal");
  const [sketches] = useStore("sketches");
  const [songs] = useStore("songs");
  const [vault] = useStore("vault");
  const [photos] = useStore("photos");
  const [anime] = useStore("anime");

  const recentCanvases = [...canvases].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 8);
  const recentSketches = [...sketches].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 4);
  const recentMovies = [...movies].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 4);
  const recentBooks = [...books].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 4);
  const recentPhotos = [...photos].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 4);
  const recentSongs = [...songs].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 4);
  const recentAnime = [...anime].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 4);
  const today = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  const dailyFact = useMemo(() => FACTS[Math.floor(Math.random() * FACTS.length)], []);

  return (
    <PageTransition>
      <div className="max-w-[1440px] mx-auto px-5 md:px-10 pt-8 md:pt-16 pb-32 overflow-x-hidden">
        {/* Hero */}
        <section className="mb-12 md:mb-20 flex flex-col lg:flex-row lg:items-end justify-between gap-12">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <CalendarDays className="w-3 h-3 md:w-4 md:h-4" /> {today}
            </div>
            <h1 className="font-display text-5xl sm:text-6xl md:text-8xl font-black text-plum leading-[0.95] tracking-tighter animate-in fade-in slide-in-from-bottom-8 duration-1000">
              Your <em className="text-primary not-italic relative underline decoration-primary/20 decoration-8 underline-offset-8">Universe</em>, <br/>Curated and Kept.
            </h1>
          </div>

          <div className="lg:w-80 group relative p-6 rounded-[2.5rem] bg-plum text-white shadow-2xl shadow-plum/20 animate-in fade-in zoom-in-95 duration-1000 delay-500 overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles className="w-12 h-12" />
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-3 flex items-center gap-2">
                <Sparkles className="w-3 h-3" /> Daily Insight
             </p>
             <p className="text-sm font-bold leading-relaxed relative z-10 italic">
                "{dailyFact}"
             </p>
             <div className="mt-4 flex justify-end">
                <div className="text-[9px] font-black uppercase tracking-widest opacity-30">Knowledge Hub</div>
             </div>
          </div>
        </section>

        {/* Stats Row */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
          {[
            { label: "Archived Shots", count: photos.length, icon: Camera, color: "bg-blue-500/5 text-blue-500" },
            { label: "Vaulted Items", count: vault.length, icon: Shield, color: "bg-emerald-500/5 text-emerald-500" },
            { label: "Captured Thoughts", count: journal.length, icon: CalendarDays, color: "bg-plum/5 text-plum" },
            { label: "Total Memories", count: [
              ...canvases, ...movies, ...books, ...songs, ...photos, ...vault, ...journal
            ].length, icon: Sparkles, color: "bg-amber-500/5 text-amber-500" },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col gap-2 p-4 md:p-6 rounded-[2rem] bg-white border border-black/5 shadow-sm hover:shadow-xl transition-all max-w-[180px] mx-auto w-full">
              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl ${stat.color} flex items-center justify-center mb-2`}>
                <stat.icon className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <div className="text-2xl md:text-3xl font-black text-plum tracking-tighter">{stat.count}</div>
              <div className="text-[9px] md:text-[10px] font-black text-olive/40 uppercase tracking-[0.2em]">{stat.label}</div>
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
                            ...songs, ...books, ...movies, ...canvases, ...journal, ...photos, ...vault
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

        {/* Recent Exhibition Shots */}
        {recentPhotos.length > 0 && (
          <section className="mb-20 md:mb-32 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
            <Header title="Latest from the Exhibition" href="/exhibition" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {recentPhotos.map((p) => (
                <Link key={p.id} to="/exhibition" className="group relative aspect-square rounded-[2.5rem] md:rounded-[3rem] overflow-hidden border border-black/5 bg-white shadow-sm hover:shadow-2xl transition-all duration-700 hover:-translate-y-3">
                  <img src={p.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                  <div className="absolute inset-0 bg-plum/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="p-3 bg-white/20 backdrop-blur-xl rounded-2xl text-white">
                      <Camera className="w-6 h-6" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Section tiles - God Tier Glassmorphism */}
        <section className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 md:gap-6 mb-16 md:mb-24">
          {SECTIONS.map((s, idx) => (
            <Link key={s.to} to={s.to}
                  style={{ animationDelay: `${idx * 50}ms` }}
                  className={`group relative rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border border-black/5 p-6 h-40 md:h-52 flex flex-col justify-between bg-white shadow-[0_20px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4`}>
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${s.tex} opacity-10`} />
              <div className="w-10 h-10 rounded-2xl bg-black/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <s.icon className="w-5 h-5 text-plum" strokeWidth={2} />
              </div>
              <div className="relative z-10">
                <div className="font-display text-lg font-black text-plum leading-tight mb-0.5">{s.label}</div>
                <div className="text-[8px] text-olive/40 font-black uppercase tracking-widest">{s.blurb}</div>
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

        <div className="grid lg:grid-cols-2 gap-12 md:gap-16 mb-20">
          {recentMovies.length > 0 && (
            <section className="animate-in fade-in slide-in-from-left-8 duration-1000 delay-500">
              <Header title="Cinema & Queue" href="/movies" />
              <div className="grid md:grid-cols-2 gap-6">
                {recentMovies.map((m) => (
                    <Link key={m.id} to="/movies" className="group relative flex items-center gap-6 p-6 rounded-[2.5rem] bg-white border border-black/5 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden max-w-[340px] mx-auto w-full">
                      <div className="w-20 sm:w-32 aspect-[2/3] rounded-2xl bg-black/5 overflow-hidden flex-shrink-0 shadow-xl group-hover:scale-105 transition-transform duration-700">
                        {m.cover ? <img src={m.cover} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Film className="w-12 h-12 text-warm-silver opacity-10" /></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-black text-plum text-lg sm:text-xl tracking-tighter truncate mb-1">{m.title}</div>
                        <div className="text-[10px] font-black text-olive/30 uppercase tracking-widest mb-4 truncate">{m.year} · {m.category || "General"}</div>
                        {m.status === 'watched' ? (
                          <div className="flex items-center justify-between">
                            <StarRating value={m.rating} size={14} />
                          </div>
                        ) : (
                          <div className="px-3 py-1.5 rounded-lg bg-plum/5 text-plum text-[8px] font-black uppercase tracking-widest inline-block">In Queue</div>
                        )}
                      </div>
                    </Link>

                ))}
              </div>
            </section>
          )}

          {recentBooks.length > 0 && (
            <section className="animate-in fade-in slide-in-from-right-8 duration-1000 delay-600">
              <Header title="Reading Progress" href="/books" />
              <div className="space-y-6">
                {recentBooks.map((b) => {
                  const pct = b.totalPages ? Math.min(100, (b.pagesRead / b.totalPages) * 100) : 0;
                  const isFinished = b.status === 'finished';
                  return (
                    <Link key={b.id} to="/books" className="group flex items-center gap-6 p-6 rounded-[2.5rem] bg-white border border-black/5 shadow-sm hover:shadow-2xl transition-all duration-500 relative overflow-hidden max-w-[340px] mx-auto w-full">
                      <div className="w-16 sm:w-24 aspect-[2/3] rounded-2xl bg-black/5 overflow-hidden flex-shrink-0 shadow-2xl group-hover:scale-105 transition-transform duration-700">
                        {b.cover ? <img src={b.cover} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-10 h-10 text-warm-silver opacity-10" /></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                           <div className="font-black text-plum text-2xl tracking-tighter truncate group-hover:text-primary transition-colors">{b.title}</div>
                           {isFinished && <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20"><Sparkles className="w-3.5 h-3.5" /></div>}
                        </div>
                        <div className="text-[10px] font-black text-olive/40 uppercase tracking-widest mb-6">{b.author}</div>
                        
                        {!isFinished && (
                          <div className="space-y-3">
                            <div className="flex items-end justify-between">
                              <div className="text-[9px] font-black text-plum uppercase tracking-widest">Progress</div>
                              <div className="text-[9px] font-black text-primary uppercase tracking-widest">{Math.round(pct)}% Done</div>
                            </div>
                            <div className="h-2 rounded-full bg-black/5 overflow-hidden ring-1 ring-black/[0.02]">
                              <div className="h-full bg-primary shadow-[0_0_15px_rgba(var(--primary),0.4)] transition-all duration-1000" style={{ width: `${pct}%` }} />
                            </div>
                            <div className="pt-2 flex justify-end">
                               <span className="text-[9px] font-black text-olive/20 uppercase tracking-widest flex items-center gap-1.5">
                                  Continue reading <ArrowUpRight className="w-2.5 h-2.5" />
                               </span>
                            </div>
                          </div>
                        )}
                        {isFinished && (
                          <div className="flex items-center gap-4">
                             <StarRating value={b.rating} size={14} />
                             <span className="text-[9px] font-black text-olive/20 uppercase tracking-widest">Completed Library</span>
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* Music Marquee */}
        {recentSongs.length > 0 && (
          <section className="mb-20 md:mb-32 animate-in fade-in slide-in-from-bottom-24 duration-1000 delay-700">
            <Header title="Recent Melodies" href="/songs" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {recentSongs.map((s) => (
                <Link key={s.id} to="/songs" className="group flex flex-col p-6 rounded-[2.5rem] bg-white border border-black/5 shadow-sm hover:shadow-2xl transition-all duration-500">
                  <div className="aspect-square rounded-[2rem] bg-black/5 overflow-hidden mb-6 shadow-xl group-hover:scale-105 transition-transform duration-700 relative">
                    {s.cover ? <img src={s.cover} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Music className="w-12 h-12 text-warm-silver opacity-10" /></div>}
                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-2xl transform scale-75 group-hover:scale-100 transition-transform duration-500">
                          <Play className="w-5 h-5 text-primary fill-current" />
                       </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-plum text-lg tracking-tighter truncate group-hover:text-primary transition-colors">{s.title}</div>
                    <div className="text-[10px] font-black text-olive/40 uppercase tracking-widest mt-1 truncate">{s.artist}</div>
                    <div className="mt-4 flex items-center gap-2">
                       <div className="h-1 flex-1 bg-black/5 rounded-full overflow-hidden">
                          <div className="h-full bg-primary/30 w-1/3 animate-pulse" />
                       </div>
                       <span className="text-[8px] font-black text-olive/20 uppercase tracking-widest">Recent</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Anime Section */}
        {recentAnime.length > 0 && (
          <section className="mb-20 md:mb-32 animate-in fade-in slide-in-from-bottom-24 duration-1000 delay-700">
            <Header title="Anime Archive" href="/anime" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {recentAnime.map((a) => (
                <Link key={a.id} to="/anime" className="group relative aspect-[2/3] rounded-[2.5rem] overflow-hidden bg-white border border-black/5 shadow-sm hover:shadow-2xl transition-all duration-700 hover:-translate-y-2">
                  {a.cover ? (
                    <img src={a.cover} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-10">
                      <Tv className="w-12 h-12 text-plum" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-plum/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex flex-col justify-end p-6">
                    <div className="text-[10px] font-black text-white uppercase tracking-widest mb-1">{a.title}</div>
                    <div className="text-[8px] font-black text-white/60 uppercase tracking-[0.2em]">
                      {a.seasonsWatched !== undefined ? `${a.seasonsWatched}/${a.totalSeasons || '?'}` : `${a.episodesWatched || 0}/${a.totalEpisodes || '?'}`} {a.seasonsWatched !== undefined ? 'Seasons' : 'Episodes'}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}


        {/* The Monthly Wrap - Premium Digest */}
        {(recentSongs.length > 0 || recentBooks.length > 0 || recentMovies.length > 0) && (
          <section className="mt-20 md:mb-32 animate-in fade-in slide-in-from-bottom-24 duration-1000 delay-800">
            <div className="relative overflow-hidden rounded-[3rem] md:rounded-[4rem] bg-[#2D2D2D] p-8 md:p-20 text-white shadow-2xl">
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
                          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Songs Saved</span>
                       </div>
                       <div className="w-px h-12 bg-white/10" />
                       <div className="flex flex-col gap-1">
                          <span className="text-4xl font-black tracking-tighter">{photos.length}</span>
                          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Shots Archived</span>
                       </div>
                       <div className="w-px h-12 bg-white/10" />
                       <div className="flex flex-col gap-1">
                          <span className="text-4xl font-black tracking-tighter">{vault.length}</span>
                          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Vault Deposits</span>
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
        Explore <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </Link>
    </div>
  );
}
