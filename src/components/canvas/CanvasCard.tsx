import { Link } from "react-router-dom";
import { CanvasDoc, useStore } from "@/lib/store";
import { BG_PRESETS } from "./CanvasStage";
import { Trash2, Pin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Props = { doc: CanvasDoc; href: string; hideMeta?: boolean };

export function CanvasCard({ doc, href, hideMeta }: Props) {
  const [docs, setDocs] = useStore("canvases");
  const bg = BG_PRESETS[doc.background] || BG_PRESETS.paper;

  const togglePin = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = docs.map(d => d.id === doc.id ? { ...d, isPinned: !d.isPinned } : d);
    setDocs(updated);
    toast.success(doc.isPinned ? "Unpinned" : "Pinned to top");
  };

  const remove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this?")) {
      setDocs(docs.filter(d => d.id !== doc.id));
      toast.success("Deleted successfully");
    }
  };

  return (
    <Link to={href} className="group block break-inside-avoid mb-6 relative" style={{ containerType: 'inline-size' }}>
      <div className="relative rounded-3xl overflow-hidden border border-black/5 bg-white shadow-[0_15px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.1)] group-hover:-translate-y-1 transition-all duration-500 w-full">
        {/* Actions Overlay */}
        <div className="absolute top-3 right-3 z-30 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
           <button 
             onClick={togglePin}
             className={`p-2 rounded-full backdrop-blur-md border border-white/20 transition-all ${doc.isPinned ? "bg-plum text-white" : "bg-white/60 text-plum hover:bg-white/80"}`}
           >
             <Pin className={`w-3.5 h-3.5 ${doc.isPinned ? "fill-current" : ""}`} />
           </button>
           <button 
             onClick={remove}
             className="p-2 rounded-full bg-white/60 text-primary backdrop-blur-md border border-white/20 hover:bg-red-500 hover:text-white transition-all"
           >
             <Trash2 className="w-3.5 h-3.5" />
           </button>
        </div>

        {doc.isPinned && !hideMeta && (
          <div className="absolute top-3 left-3 z-30 px-2 py-1 rounded-full bg-plum/80 backdrop-blur-sm text-[8px] font-black uppercase tracking-widest text-white flex items-center gap-1">
            <Pin className="w-2 h-2 fill-current" /> Pinned
          </div>
        )}
        {/* Washi Tape decorative element */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-6 bg-primary/20 backdrop-blur-sm z-20 rotate-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" 
             style={{ maskImage: "radial-gradient(circle at 0 50%, transparent 4px, black 5px), radial-gradient(circle at 100% 50%, transparent 4px, black 5px)" }} />
        
        <div className={`relative ${bg} overflow-hidden w-full`} style={{ aspectRatio: `${doc.width}/${doc.height}` }}>
          {/* Subtle paper grid/dots */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
               style={{ backgroundImage: "radial-gradient(#000 0.5px, transparent 0.5px)", backgroundSize: "12px 12px" }} />
          
          {doc.items
            .slice()
            .sort((a, b) => a.zIndex - b.zIndex)
            .map((it) => (
              <div
                key={it.id}
                style={{
                  position: "absolute",
                  left: `${(it.x / doc.width) * 100}cqw`,
                  top: `${(it.y / doc.width) * 100}cqw`,
                  width: `${(it.width / doc.width) * 100}cqw`,
                  height: `${(it.height / doc.width) * 100}cqw`,
                  transform: `rotate(${it.rotation || 0}deg)`,
                  overflow: "hidden",
                }}
              >
                {it.type === "text" && (
                  <div style={{
                    fontFamily: it.fontFamily,
                    fontSize: `${((it.fontSize || 18) / doc.width) * 100}cqw`,
                    fontWeight: it.fontWeight,
                    color: it.color,
                    fontStyle: it.italic ? "italic" : "normal",
                    textAlign: it.align,
                    lineHeight: 1.2,
                  }}>{it.text}</div>
                )}
                {it.type === "image" && it.src && (
                  <img src={it.src} className="w-full h-full object-cover rounded-sm shadow-sm" alt="" />
                )}
                {it.type === "sticker" && (
                  <div className="grid place-items-center w-full h-full drop-shadow-sm"
                       style={{ fontSize: `${(Math.min(it.width, it.height) * 0.7 / doc.width) * 100}cqw` }}>
                    {it.emoji}
                  </div>
                )}
                {it.type === "shape" && (
                  <div className="w-full h-full shadow-sm" style={{
                    background: it.fill,
                    borderRadius: it.shape === "circle" ? "50%" : it.shape === "blob" ? "60% 40% 55% 45% / 50% 60% 40% 50%" : 6,
                  }} />
                )}
              </div>
            ))}
        </div>
      </div>
      {!hideMeta && (
        <div className="px-1 pt-2">
          <div className="text-sm font-semibold text-plum truncate">{doc.title}</div>
          <div className="text-xs text-olive">{new Date(doc.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</div>
        </div>
      )}
    </Link>
  );
}
