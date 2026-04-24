import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStore, uid } from "@/lib/store";
import { CanvasCard } from "@/components/canvas/CanvasCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

type Props = { kind: "poem" | "drawing" };

export function GalleryPage({ kind }: Props) {
  const [docs, setDocs] = useStore("canvases");
  const nav = useNavigate();
  const [quick, setQuick] = useState("");

  const items = docs.filter((d) => d.kind === kind).sort((a, b) => b.updatedAt - a.updatedAt);
  const isPoem = kind === "poem";
  const baseRoute = isPoem ? "/poems" : "/drawings";

  const createNew = () => nav(`${baseRoute}/new`);

  const quickCreate = () => {
    if (!quick.trim()) return;
    const id = uid();
    setDocs([
      ...docs,
      {
        id, kind: "poem", title: quick.split("\n")[0].slice(0, 60) || "Untitled Poem",
        background: "paper", width: 900, height: 1100,
        items: [{
          id: uid(), type: "text", x: 80, y: 100, width: 740, height: 800, zIndex: 1,
          text: quick, fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 500,
          color: "#211922", italic: true, align: "left",
        }],
        createdAt: Date.now(), updatedAt: Date.now(),
      },
    ]);
    setQuick("");
    nav(`/poems/${id}`);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-10">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
        <div>
          <p className="text-sm uppercase tracking-widest text-olive mb-2">{isPoem ? "Verses & vignettes" : "Pages from the sketchbook"}</p>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-plum">{isPoem ? "Poems" : "Drawings"}</h1>
        </div>
        <Button onClick={createNew} className="rounded-full h-11 px-5 bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-1.5" /> New {isPoem ? "poem" : "canvas"}
        </Button>
      </div>

      {isPoem && (
        <div className="mb-10 bg-card rounded-3xl border border-sand p-5 lift-shadow">
          <p className="text-xs uppercase tracking-widest text-olive mb-2">Quick verse — press ⏎ to capture</p>
          <textarea
            value={quick}
            onChange={(e) => setQuick(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); quickCreate(); }
            }}
            placeholder="A line, a thought, a feeling…"
            className="w-full bg-transparent border-0 outline-none resize-none font-display text-2xl md:text-3xl text-plum italic placeholder:text-warm-silver min-h-[80px]"
            rows={2}
          />
          <div className="flex justify-between items-center pt-2 border-t border-sand">
            <span className="text-xs text-olive">⌘/Ctrl + Enter to save</span>
            <Button onClick={quickCreate} disabled={!quick.trim()} size="sm" className="rounded-full bg-plum text-background hover:bg-plum/90">
              Capture
            </Button>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-24 rounded-3xl border-2 border-dashed border-sand">
          <p className="font-display text-3xl text-plum mb-2">A blank page awaits.</p>
          <p className="text-olive mb-6">Begin with a single word, a sketch, or a feeling.</p>
          <Button onClick={createNew} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-1.5" /> Start
          </Button>
        </div>
      ) : (
        <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4">
          {items.map((d) => (
            <CanvasCard key={d.id} doc={d} href={`${baseRoute}/${d.id}`} />
          ))}
        </div>
      )}
    </div>
  );
}
