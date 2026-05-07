import { useState, useMemo } from "react";
import { useStore, uid, getAuth, PhotoEntry } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, Camera, Image as ImageIcon, MapPin, Calendar, 
  Trash2, X, Maximize2, Share2, Filter, LayoutGrid, List,
  Heart, Sparkles, ChevronLeft, ChevronRight, Search
} from "lucide-react";
import { Dialog, Empty } from "./Movies";
import { toast } from "sonner";
import { PageTransition } from "@/components/PageTransition";

export default function Exhibition() {
  const [photos, setPhotos] = useStore("photos");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [viewing, setViewing] = useState<PhotoEntry | null>(null);
  const [viewMode, setViewMode] = useState<"masonry" | "moments">("masonry");

  const filtered = photos.filter(p => 
    p.title?.toLowerCase().includes(search.toLowerCase()) || 
    p.moment?.toLowerCase().includes(search.toLowerCase()) ||
    p.location?.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => b.createdAt - a.createdAt);

  const moments = useMemo(() => {
    const groups: Record<string, PhotoEntry[]> = {};
    filtered.forEach(p => {
      const m = p.moment || "Uncategorized";
      if (!groups[m]) groups[m] = [];
      groups[m].push(p);
    });
    return groups;
  }, [filtered]);

  const deletePhoto = (id: string) => {
    if (confirm("Delete this photo from exhibition?")) {
      setPhotos(photos.filter(p => p.id !== id));
      setViewing(null);
      toast.success("Photo removed");
    }
  };

  const navigateViewing = (dir: 'next' | 'prev') => {
    if (!viewing) return;
    const idx = filtered.findIndex(p => p.id === viewing.id);
    if (idx === -1) return;
    
    let nextIdx = dir === 'next' ? idx + 1 : idx - 1;
    if (nextIdx < 0) nextIdx = filtered.length - 1;
    if (nextIdx >= filtered.length) nextIdx = 0;
    
    setViewing(filtered[nextIdx]);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#FDFCFB]">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div>
              <div className="flex items-center gap-3 text-plum mb-4">
                <div className="p-3 bg-plum/5 rounded-2xl">
                  <Camera className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Photography & Moments</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-display font-black text-plum tracking-tighter leading-none">
                Exhibition
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-white rounded-3xl p-1.5 border border-black/5 shadow-sm flex">
                <button 
                  onClick={() => setViewMode("masonry")}
                  className={`px-6 py-3 rounded-2xl flex items-center gap-2 transition-all ${viewMode === 'masonry' ? 'bg-plum text-white shadow-lg' : 'text-olive/40 hover:bg-black/5'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Masonry</span>
                </button>
                <button 
                  onClick={() => setViewMode("moments")}
                  className={`px-6 py-3 rounded-2xl flex items-center gap-2 transition-all ${viewMode === 'moments' ? 'bg-plum text-white shadow-lg' : 'text-olive/40 hover:bg-black/5'}`}
                >
                  <List className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Moments</span>
                </button>
              </div>
              <Button onClick={() => setShowAdd(true)} className="rounded-[2rem] h-16 px-10 bg-plum text-white hover:bg-plum/90 shadow-2xl shadow-plum/20 gap-4 group transition-all">
                <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" />
                <span className="text-xs font-black uppercase tracking-widest">Add Masterpiece</span>
              </Button>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row gap-6 mb-16">
            <div className="relative flex-1 group">
              <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-olive/20 group-focus-within:text-plum transition-colors" />
              <Input 
                placeholder="Search by title, moment, or location..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="h-20 pl-20 pr-8 bg-white border-black/5 rounded-[2.5rem] text-xl font-medium focus-visible:ring-plum/10 shadow-sm"
              />
            </div>
          </div>

          {/* Gallery Content */}
          {filtered.length === 0 ? (
            <Empty onAdd={() => setShowAdd(true)} icon={<ImageIcon className="w-16 h-16 text-olive/10" />} label="Your exhibition gallery is empty" />
          ) : viewMode === "masonry" ? (
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-8 space-y-8">
              {filtered.map((p) => (
                <PhotoCard key={p.id} photo={p} onClick={() => setViewing(p)} />
              ))}
            </div>
          ) : (
            <div className="space-y-24">
              {Object.entries(moments).map(([moment, items]) => (
                <div key={moment}>
                  <div className="flex items-end gap-6 mb-10">
                    <h2 className="text-4xl font-display font-black text-plum tracking-tighter">{moment}</h2>
                    <span className="text-sm font-black text-olive/30 mb-1.5 uppercase tracking-widest">{items.length} SHOTS</span>
                    <div className="h-px flex-1 bg-black/5 mb-3" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {items.map(p => (
                      <PhotoCard key={p.id} photo={p} onClick={() => setViewing(p)} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {viewing && (
        <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-3xl animate-in fade-in duration-500 overflow-y-auto">
          <div className="min-h-screen flex flex-col p-6 md:p-12 relative">
            
            {/* Close & Actions */}
            <div className="flex items-center justify-between mb-8 md:mb-12 relative z-10">
              <Button variant="ghost" onClick={() => setViewing(null)} className="rounded-2xl gap-3 text-plum hover:bg-plum/5 px-6">
                <ChevronLeft className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-widest">Gallery</span>
              </Button>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => deletePhoto(viewing.id)} className="rounded-2xl text-red-500 hover:bg-red-50">
                  <Trash2 className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setViewing(null)} className="rounded-2xl bg-black/5">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Main Carousel View */}
            <div className="flex-1 grid lg:grid-cols-[1fr_400px] gap-12 items-center relative">
              
              {/* Navigation Arrows */}
              <button 
                onClick={() => navigateViewing('prev')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-black/5 flex items-center justify-center text-plum hover:bg-plum hover:text-white transition-all -translate-x-4 md:-translate-x-8 shadow-xl"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button 
                onClick={() => navigateViewing('next')}
                className="absolute right-0 lg:right-[448px] top-1/2 -translate-y-1/2 z-10 w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-black/5 flex items-center justify-center text-plum hover:bg-plum hover:text-white transition-all translate-x-4 md:translate-x-8 shadow-xl"
              >
                <ChevronRight className="w-8 h-8" />
              </button>

              <div className="relative group flex items-center justify-center h-full max-h-[85vh]">
                <img 
                  key={viewing.id}
                  src={viewing.image} 
                  alt={viewing.title} 
                  className="max-w-full max-h-full object-contain rounded-[3rem] shadow-[0_80px_120px_rgba(0,0,0,0.15)] animate-in zoom-in-95 fade-in duration-500"
                />
              </div>

              <div className="space-y-10 animate-in slide-in-from-right-8 duration-700">
                <div>
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-plum/40 mb-4">
                    <Sparkles className="w-4 h-4 text-plum" /> Studio Selection
                  </div>
                  <h2 className="text-5xl font-display font-black text-plum tracking-tighter leading-tight mb-4">
                    {viewing.title || "Untitled Moment"}
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {viewing.moment && (
                      <span className="px-4 py-1.5 rounded-full bg-plum/5 text-[10px] font-black text-plum uppercase tracking-widest">
                        {viewing.moment}
                      </span>
                    )}
                    <span className="px-4 py-1.5 rounded-full bg-black/5 text-[10px] font-black text-olive uppercase tracking-widest">
                      {new Date(viewing.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                <div className="space-y-6">
                  {viewing.location && (
                    <div className="flex items-center gap-5 p-6 rounded-[2rem] bg-warm-wash/50 border border-black/5 hover:bg-white transition-colors">
                      <div className="p-3 bg-white rounded-2xl shadow-sm text-plum">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-olive/30 mb-0.5">Captured at</p>
                        <p className="font-bold text-plum">{viewing.location}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-5 p-6 rounded-[2rem] bg-warm-wash/50 border border-black/5 hover:bg-white transition-colors">
                    <div className="p-3 bg-white rounded-2xl shadow-sm text-plum">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-olive/30 mb-0.5">Date Archived</p>
                      <p className="font-bold text-plum">{new Date(viewing.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 space-y-4">
                  <Button className="w-full h-16 rounded-[2rem] bg-plum text-white hover:bg-plum/90 shadow-xl shadow-plum/20 gap-3 font-black uppercase tracking-widest">
                    <Share2 className="w-5 h-5" />
                    Share Masterpiece
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAdd && (
        <Dialog onClose={() => setShowAdd(false)}>
          <PhotoDialog 
            onClose={() => setShowAdd(false)} 
            onSave={(val) => {
              const items = Array.isArray(val) ? val : [val];
              setPhotos([...items, ...photos]);
              setShowAdd(false);
              toast.success(`Successfully added ${items.length} shots to exhibition`);
            }} 
          />
        </Dialog>
      )}
    </PageTransition>
  );
}

function PhotoCard({ photo, onClick }: { photo: PhotoEntry; onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="group break-inside-avoid bg-white rounded-[2.5rem] border border-black/5 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 hover:-translate-y-2 cursor-pointer relative"
    >
      <img src={photo.image} alt={photo.title} className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
      
      <div className="absolute bottom-0 left-0 right-0 p-8 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
        <h3 className="text-white font-display font-black text-2xl tracking-tight mb-2 truncate">{photo.title || "Untitled"}</h3>
        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/60">
          <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {photo.location || "Earth"}</span>
          <span className="w-1 h-1 rounded-full bg-white/30" />
          <span>{photo.moment || "Moment"}</span>
        </div>
      </div>

      <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all">
        <div className="p-3 bg-white/20 backdrop-blur-xl rounded-2xl text-white">
          <Maximize2 className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

function PhotoDialog({ onClose, onSave }: { onClose: () => void; onSave: (p: PhotoEntry[]) => void }) {
  const [common, setCommon] = useState({ moment: "", location: "" });
  const [previews, setPreviews] = useState<{ id: string; data: string; title: string }[]>([]);

  const handleFiles = (files: FileList) => {
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const id = uid();
        setPreviews(prev => [...prev, { 
          id, 
          data: reader.result as string, 
          title: file.name.split('.')[0] 
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePreview = (id: string) => {
    setPreviews(prev => prev.filter(p => p.id !== id));
  };

  const updateTitle = (id: string, title: string) => {
    setPreviews(prev => prev.map(p => p.id === id ? { ...p, title } : p));
  };

  return (
    <div className="p-10 space-y-10">
      <div>
        <h2 className="text-4xl font-display font-black text-plum tracking-tighter">New Masterpieces</h2>
        <p className="text-xs font-bold text-olive/40 uppercase tracking-widest mt-2">Add your shots in bulk to the exhibition</p>
      </div>

      <div className="space-y-10">
        {/* Bulk Dropzone */}
        <label className="w-full h-40 rounded-[2.5rem] border-2 border-dashed border-sand bg-warm-wash hover:bg-sand transition-all cursor-pointer flex flex-col items-center justify-center p-8 text-center group overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
              <Camera className="w-6 h-6 text-plum" />
            </div>
            <div className="text-left">
              <p className="text-sm font-black uppercase tracking-widest text-plum">Select Multiple Shots</p>
              <p className="text-[10px] font-bold text-olive/40 uppercase tracking-widest">JPG, PNG or HEIC accepted</p>
            </div>
          </div>
          <input type="file" multiple accept="image/*" className="hidden" onChange={e => e.target.files && handleFiles(e.target.files)} />
        </label>

        {/* Common Settings */}
        <div className="grid grid-cols-2 gap-6 p-8 bg-black/5 rounded-[2.5rem]">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-olive/40 ml-2">Moment / Album (Bulk)</label>
            <Input 
              placeholder="Apply to all selected..." 
              value={common.moment}
              onChange={e => setCommon({ ...common, moment: e.target.value })}
              className="bg-white border-0 h-14 px-6 rounded-2xl font-bold"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-olive/40 ml-2">Location (Bulk)</label>
            <Input 
              placeholder="Apply to all selected..." 
              value={common.location}
              onChange={e => setCommon({ ...common, location: e.target.value })}
              className="bg-white border-0 h-14 px-6 rounded-2xl font-bold"
            />
          </div>
        </div>

        {/* Previews Grid */}
        {previews.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {previews.map((p) => (
              <div key={p.id} className="relative group bg-white p-2 rounded-2xl border border-black/5">
                <div className="aspect-square rounded-xl overflow-hidden mb-2">
                  <img src={p.data} alt="" className="w-full h-full object-cover" />
                </div>
                <Input 
                  value={p.title}
                  onChange={e => updateTitle(p.id, e.target.value)}
                  className="h-8 px-2 text-[10px] font-bold border-0 bg-black/5 rounded-lg"
                />
                <button 
                  onClick={() => removePreview(p.id)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-4 pt-8 border-t border-black/5">
        <Button variant="ghost" onClick={onClose} className="rounded-3xl px-10 h-16 font-bold hover:bg-black/5">Cancel</Button>
        <Button 
          disabled={previews.length === 0} 
          onClick={() => {
            const user = getAuth();
            if (!user) return;
            const entries: PhotoEntry[] = previews.map(p => ({
              id: p.id,
              userId: user.id,
              title: p.title,
              image: p.data,
              moment: common.moment,
              location: common.location,
              createdAt: Date.now(),
              updatedAt: Date.now()
            }));
            onSave(entries);
          }}
          className="bg-plum text-white rounded-[2.5rem] px-14 h-16 font-black shadow-2xl shadow-plum/20 active:scale-95 transition-all"
        >
          Publish {previews.length} Masterpieces
        </Button>
      </div>
    </div>
  );
}

