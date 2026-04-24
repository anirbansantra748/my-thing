import { Link } from "react-router-dom";
import { useStore } from "@/lib/store";
import { CanvasCard } from "@/components/canvas/CanvasCard";
import { StarRating } from "@/components/StarRating";
import { Feather, Palette, CalendarDays, Film, BookOpen, ArrowUpRight } from "lucide-react";

const SECTIONS = [
  { to: "/poems", label: "Poems", icon: Feather, blurb: "Words, kept softly.", tex: "texture-blush" },
  { to: "/drawings", label: "Drawings", icon: Palette, blurb: "Marks made by hand.", tex: "texture-sage" },
  { to: "/journal", label: "Journal", icon: CalendarDays, blurb: "A year, a day at a time.", tex: "texture-warm" },
  { to: "/movies", label: "Movies", icon: Film, blurb: "Frames worth remembering.", tex: "texture-sky" },
  { to: "/books", label: "Books", icon: BookOpen, blurb: "Pages, slowly turned.", tex: "texture-paper" },
];

export default function Home() {
  const [canvases] = useStore("canvases");
  const [movies] = useStore("movies");
  const [books] = useStore("books");
  const [journal] = useStore("journal");

  const recentCanvases = [...canvases].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 8);
  const recentMovies = [...movies].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 4);
  const recentBooks = [...books].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 4);
  const today = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-10">
      {/* Hero */}
      <section className="mb-12">
        <p className="text-sm uppercase tracking-widest text-olive mb-3">{today}</p>
        <h1 className="font-display text-5xl md:text-7xl font-bold text-plum leading-[1.05] tracking-tight max-w-3xl">
          A quiet place to <em className="text-primary not-italic">keep</em> what matters.
        </h1>
        <p className="text-olive text-lg mt-4 max-w-xl">
          Poems, drawings, days, films, books — gathered like clippings in a beloved scrapbook.
        </p>
      </section>

      {/* Section tiles */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-14">
        {SECTIONS.map((s) => (
          <Link key={s.to} to={s.to}
                className={`group relative rounded-3xl overflow-hidden border border-sand p-5 h-44 flex flex-col justify-between ${s.tex} hover:lift-shadow transition-shadow`}>
            <s.icon className="w-6 h-6 text-plum" strokeWidth={1.6} />
            <div>
              <div className="font-display text-2xl font-semibold text-plum">{s.label}</div>
              <div className="text-xs text-olive">{s.blurb}</div>
            </div>
            <ArrowUpRight className="absolute top-4 right-4 w-5 h-5 text-plum opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </section>

      {/* Recent canvases */}
      {recentCanvases.length > 0 && (
        <section className="mb-14">
          <Header title="Recent canvases" href="/poems" />
          <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4">
            {recentCanvases.map((d) => (
              <CanvasCard key={d.id} doc={d} href={`${d.kind === "poem" ? "/poems" : "/drawings"}/${d.id}`} />
            ))}
          </div>
        </section>
      )}

      <div className="grid lg:grid-cols-2 gap-10">
        {recentMovies.length > 0 && (
          <section>
            <Header title="Latest movies" href="/movies" />
            <div className="space-y-3">
              {recentMovies.map((m) => (
                <Link key={m.id} to="/movies" className="flex items-center gap-4 p-3 rounded-2xl bg-card border border-sand pin-shadow hover:lift-shadow transition-shadow">
                  <div className="w-14 h-20 rounded-lg bg-warm-fog overflow-hidden flex-shrink-0 grid place-items-center">
                    {m.cover ? <img src={m.cover} alt="" className="w-full h-full object-cover" /> : <Film className="w-5 h-5 text-warm-silver" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-plum truncate">{m.title}</div>
                    <div className="text-xs text-olive">{m.year} · <span className="capitalize">{m.status}</span></div>
                    <div className="mt-1"><StarRating value={m.rating} size={12} /></div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {recentBooks.length > 0 && (
          <section>
            <Header title="Currently reading" href="/books" />
            <div className="space-y-3">
              {recentBooks.map((b) => {
                const pct = b.totalPages ? Math.min(100, (b.pagesRead / b.totalPages) * 100) : 0;
                return (
                  <Link key={b.id} to="/books" className="flex items-center gap-4 p-3 rounded-2xl bg-card border border-sand pin-shadow hover:lift-shadow transition-shadow">
                    <div className="w-14 h-20 rounded-lg bg-warm-fog overflow-hidden flex-shrink-0 grid place-items-center">
                      {b.cover ? <img src={b.cover} alt="" className="w-full h-full object-cover" /> : <BookOpen className="w-5 h-5 text-warm-silver" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-plum truncate">{b.title}</div>
                      <div className="text-xs text-olive truncate">{b.author}</div>
                      <div className="mt-1.5 h-1 rounded-full bg-sand overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {recentCanvases.length === 0 && recentMovies.length === 0 && recentBooks.length === 0 && journal.length === 0 && (
        <div className="text-center py-16 mt-4">
          <p className="font-display text-3xl text-plum italic mb-2">"Begin anywhere."</p>
          <p className="text-olive">Pick a section above and make something small today.</p>
        </div>
      )}
    </div>
  );
}

function Header({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-end justify-between mb-4">
      <h2 className="font-display text-3xl font-bold text-plum">{title}</h2>
      <Link to={href} className="text-sm text-olive hover:text-plum flex items-center gap-1">
        See all <ArrowUpRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
