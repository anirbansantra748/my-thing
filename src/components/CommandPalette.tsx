import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
  Search,
  Book,
  Film,
  Music,
  BookOpen,
  Feather,
  Palette
} from "lucide-react";
import { Command } from "cmdk";
import { useStore } from "@/lib/store";

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  const [books] = useStore("books");
  const [movies] = useStore("movies");
  const [songs] = useStore("songs");
  const [canvases] = useStore("canvases");
  const [journal] = useStore("journal");
  const [search, setSearch] = React.useState("");

  const filteredBooks = books.filter(b => b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase()));
  const filteredMovies = movies.filter(m => m.title.toLowerCase().includes(search.toLowerCase()));
  const filteredSongs = songs.filter(s => s.title.toLowerCase().includes(search.toLowerCase()) || s.artist.toLowerCase().includes(search.toLowerCase()));
  const filteredCanvases = canvases.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));
  const filteredJournal = journal.filter(j => j.title?.toLowerCase().includes(search.toLowerCase()) || j.content?.toLowerCase().includes(search.toLowerCase()));

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Global Search"
      className="fixed inset-0 z-[100] grid place-items-center bg-plum/40 backdrop-blur-sm p-4"
    >
      <div className="bg-background w-full max-w-[640px] rounded-3xl border border-sand shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center border-b border-sand px-4">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Command.Input
            placeholder="Search everything..."
            value={search}
            onValueChange={setSearch}
            className="flex h-14 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-olive/40 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <Command.List className="max-h-[400px] overflow-y-auto overflow-x-hidden p-2 scrollbar-hide">
          <Command.Empty className="py-12 text-center text-sm text-olive/40">
            No results found.
          </Command.Empty>
          
          <Command.Group heading="Navigation" className="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-olive/40">
            <Command.Item onSelect={() => runCommand(() => navigate("/"))} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-sand cursor-pointer transition-colors text-plum font-bold">
              <Calculator className="h-4 w-4" />
              <span>Home Dashboard</span>
            </Command.Item>
            <Command.Item onSelect={() => runCommand(() => navigate("/scrapbook"))} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-sand cursor-pointer transition-colors text-plum font-bold">
              <Palette className="h-4 w-4" />
              <span>Scrapbook Creator</span>
            </Command.Item>
          </Command.Group>

          {filteredBooks.length > 0 && (
            <Command.Group heading="Books" className="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-olive/40">
              {filteredBooks.slice(0, 5).map(book => (
                <Command.Item key={book.id} onSelect={() => runCommand(() => navigate("/books"))} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-sand cursor-pointer transition-colors text-plum font-bold group">
                  <div className="w-8 h-10 rounded-md bg-warm-fog overflow-hidden flex-shrink-0 shadow-sm border border-black/5">
                    {book.cover ? <img src={book.cover} className="w-full h-full object-cover" /> : <Book className="w-full h-full p-2 opacity-20" />}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="truncate group-hover:text-primary transition-colors">{book.title}</span>
                    <span className="text-[10px] text-olive/40 font-medium truncate">{book.author}</span>
                  </div>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {filteredMovies.length > 0 && (
            <Command.Group heading="Movies" className="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-olive/40">
              {filteredMovies.slice(0, 5).map(movie => (
                <Command.Item key={movie.id} onSelect={() => runCommand(() => navigate("/movies"))} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-sand cursor-pointer transition-colors text-plum font-bold group">
                  <div className="w-8 h-12 rounded-md bg-warm-fog overflow-hidden flex-shrink-0 shadow-sm border border-black/5">
                    {movie.cover ? <img src={movie.cover} className="w-full h-full object-cover" /> : <Film className="w-full h-full p-2 opacity-20" />}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="truncate group-hover:text-sky-500 transition-colors">{movie.title}</span>
                    <span className="text-[10px] text-olive/40 font-medium truncate">{movie.year} · ★{movie.rating}</span>
                  </div>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {filteredSongs.length > 0 && (
            <Command.Group heading="Music" className="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-olive/40">
              {filteredSongs.slice(0, 5).map(song => (
                <Command.Item key={song.id} onSelect={() => runCommand(() => navigate("/songs"))} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-sand cursor-pointer transition-colors text-plum font-bold group">
                  <div className="w-10 h-10 rounded-lg bg-warm-fog overflow-hidden flex-shrink-0 shadow-sm border border-black/5">
                    {song.cover ? <img src={song.cover} className="w-full h-full object-cover" /> : <Music className="w-full h-full p-2 opacity-20" />}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="truncate group-hover:text-red-500 transition-colors">{song.title}</span>
                    <span className="text-[10px] text-olive/40 font-medium truncate">{song.artist}</span>
                  </div>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {filteredCanvases.length > 0 && (
            <Command.Group heading="Canvases" className="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-olive/40">
              {filteredCanvases.slice(0, 5).map(canvas => (
                <Command.Item key={canvas.id} onSelect={() => runCommand(() => navigate(canvas.kind === 'poem' ? '/poems' : '/drawings'))} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-sand cursor-pointer transition-colors text-plum font-bold group">
                  <div className="w-10 h-10 rounded-lg bg-warm-fog overflow-hidden flex-shrink-0 shadow-sm border border-black/5">
                    {canvas.cover ? <img src={canvas.cover} className="w-full h-full object-cover" /> : <Feather className="w-full h-full p-2 opacity-20" />}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="truncate group-hover:text-amber-500 transition-colors">{canvas.title}</span>
                    <span className="text-[10px] text-olive/40 font-medium truncate capitalize">{canvas.kind} · {new Date(canvas.updatedAt).toLocaleDateString()}</span>
                  </div>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          <Command.Separator className="h-px bg-sand my-2" />
          
          <Command.Group heading="Settings" className="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-olive/40">
            <Command.Item className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-sand cursor-pointer transition-colors text-plum font-bold">
              <Settings className="h-4 w-4" />
              <span>Theme & Preferences</span>
            </Command.Item>
          </Command.Group>
        </Command.List>
      </div>
    </Command.Dialog>
  );
}
