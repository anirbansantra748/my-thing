import { useStore, uid } from "@/lib/store";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";

export function SketchGallery() {
  const [sketches, setSketches] = useStore("sketches");
  const nav = useNavigate();

  const createNew = () => {
    const id = uid();
    nav(`/sketches/${id}`);
  };

  const deleteSketch = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Delete this sketch?")) {
      setSketches(sketches.filter((s) => s.id !== id));
    }
  };

  const sorted = [...sketches].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-6 md:py-10">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6 md:mb-8">
        <div>
          <p className="text-xs md:text-sm uppercase tracking-widest text-olive mb-1 md:mb-2">Freehand thoughts & doodles</p>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-plum">Sketches</h1>
        </div>
        <Button onClick={createNew} className="rounded-full h-11 px-5 bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-1.5" /> New Sketch
        </Button>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-16 md:py-24 rounded-2xl md:rounded-3xl border-2 border-dashed border-sand bg-warm-wash/30">
          <p className="font-display text-2xl md:text-3xl text-plum mb-2">No sketches yet.</p>
          <p className="text-sm md:text-olive mb-6 px-4">Grab a digital pencil and let your thoughts flow.</p>
          <Button onClick={createNew} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-6">
            <Plus className="w-4 h-4 mr-1.5" /> Start Sketching
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {sorted.map((s) => (
            <Link 
              key={s.id} 
              to={`/sketches/${s.id}`} 
              className="group relative aspect-video rounded-2xl overflow-hidden border border-sand bg-white shadow-sm hover:lift-shadow hover:-translate-y-1 transition-all duration-300"
            >
              {s.cover ? (
                <img src={s.cover} alt="" className="w-full h-full object-contain p-2" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-warm-wash text-warm-silver">
                  <Pencil className="w-8 h-8 mb-2 opacity-20 group-hover:scale-110 transition-transform" />
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 p-3 bg-white/90 backdrop-blur-sm border-t border-sand translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                <div className="flex justify-between items-center gap-2">
                  <div className="text-plum text-xs font-semibold truncate flex-1">{s.title || "Untitled Sketch"}</div>
                  <button 
                    onClick={(e) => deleteSketch(e, s.id)}
                    className="text-primary hover:text-primary/80 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <div className="text-olive text-[9px] uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                  {new Date(s.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
