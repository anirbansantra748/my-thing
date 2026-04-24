import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CanvasDoc, CanvasItem, uid, useStore } from "@/lib/store";
import { CanvasStage, BG_KEYS, BG_PRESETS } from "./CanvasStage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Type, Image as ImageIcon, Sticker, Square, Circle, Sparkles,
  ArrowLeft, Save, Trash2,
} from "lucide-react";

const STICKERS = ["✨", "🌸", "🌿", "☀️", "🌙", "⭐", "💫", "🦋", "🌷", "🍃", "❤️", "📷", "🎨", "📖", "✏️"];
const FONTS_QUICK = [
  { label: "Headline", val: "var(--font-display)", size: 48, weight: 700 },
  { label: "Body", val: "var(--font-body)", size: 18, weight: 400 },
  { label: "Handwrite", val: "var(--font-hand)", size: 36, weight: 600 },
];

type Props = { kind: "poem" | "drawing" };

export function CanvasEditor({ kind }: Props) {
  const { id } = useParams();
  const nav = useNavigate();
  const [docs, setDocs] = useStore("canvases");
  const existing = docs.find((d) => d.id === id);

  const [doc, setDoc] = useState<CanvasDoc>(() =>
    existing || {
      id: uid(),
      kind,
      title: kind === "poem" ? "Untitled Poem" : "Untitled Drawing",
      background: kind === "poem" ? "paper" : "linen",
      width: 900,
      height: 1100,
      items: kind === "poem"
        ? [{
            id: uid(), type: "text", x: 80, y: 80, width: 740, height: 100, zIndex: 1,
            text: "Write your poem…", fontFamily: "var(--font-display)", fontSize: 42, fontWeight: 600,
            color: "#211922", italic: true, align: "left",
          }]
        : [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
  );

  const setItems = (items: CanvasItem[]) => setDoc({ ...doc, items, updatedAt: Date.now() });

  // Auto-save
  useEffect(() => {
    const t = setTimeout(() => {
      const others = docs.filter((d) => d.id !== doc.id);
      setDocs([...others, doc]);
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc]);

  const addText = (preset: (typeof FONTS_QUICK)[number]) => {
    setItems([
      ...doc.items,
      {
        id: uid(), type: "text", x: 100, y: 200, width: 500, height: preset.size * 1.4,
        zIndex: doc.items.length + 1, text: "Type here", fontFamily: preset.val,
        fontSize: preset.size, fontWeight: preset.weight, color: "#211922", align: "left",
      },
    ]);
  };

  const addSticker = (emoji: string) => {
    setItems([
      ...doc.items,
      { id: uid(), type: "sticker", emoji, x: 200, y: 300, width: 100, height: 100, zIndex: doc.items.length + 1 },
    ]);
  };

  const addShape = (shape: "circle" | "square" | "blob") => {
    setItems([
      ...doc.items,
      { id: uid(), type: "shape", shape, fill: "#f5d7c8", x: 250, y: 350, width: 180, height: 180, zIndex: doc.items.length + 1 },
    ]);
  };

  const addImage = async (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      const img = new Image();
      img.onload = () => {
        const ratio = img.width / img.height;
        const w = Math.min(400, img.width);
        setItems([
          ...doc.items,
          { id: uid(), type: "image", src, x: 150, y: 250, width: w, height: w / ratio, zIndex: doc.items.length + 1 },
        ]);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-warm-fog">
      {/* Top bar */}
      <div className="sticky top-16 z-30 bg-background/95 backdrop-blur border-b border-sand">
        <div className="max-w-[1440px] mx-auto px-6 h-14 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => nav(-1)} className="rounded-full">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <Input
            value={doc.title}
            onChange={(e) => setDoc({ ...doc, title: e.target.value })}
            className="max-w-md border-0 bg-transparent focus-visible:bg-sand rounded-full font-display text-lg"
          />
          <div className="ml-auto flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-olive">
              <Save className="w-3.5 h-3.5" /> Auto-saved
            </div>
            {existing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (confirm("Are you sure you want to delete this?")) {
                    setDocs(docs.filter((d) => d.id !== doc.id));
                    nav(-1);
                  }
                }}
                className="text-primary hover:text-primary/80 hover:bg-primary/10 rounded-full h-8 px-3 gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 py-6 grid lg:grid-cols-[260px_1fr] gap-6">
        {/* Toolbox */}
        <aside className="space-y-5 lg:sticky lg:top-32 lg:self-start">
          <Section title="Add text">
            <div className="grid gap-2">
              {FONTS_QUICK.map((f) => (
                <button key={f.label}
                        onClick={() => addText(f)}
                        className="text-left px-4 py-3 rounded-2xl bg-card border border-sand hover:border-plum transition-colors">
                  <span style={{ fontFamily: f.val, fontWeight: f.weight }} className="text-plum">{f.label}</span>
                </button>
              ))}
            </div>
          </Section>

          <Section title="Upload image">
            <label className="block">
              <div className="px-4 py-6 rounded-2xl border-2 border-dashed border-warm-silver bg-warm-wash hover:bg-sand transition-colors text-center cursor-pointer">
                <ImageIcon className="w-5 h-5 mx-auto mb-1.5 text-olive" />
                <span className="text-sm text-olive">Click to add</span>
              </div>
              <input type="file" accept="image/*" className="hidden"
                     onChange={(e) => e.target.files?.[0] && addImage(e.target.files[0])} />
            </label>
          </Section>

          <Section title="Stickers">
            <div className="grid grid-cols-5 gap-1.5">
              {STICKERS.map((s) => (
                <button key={s} onClick={() => addSticker(s)}
                        className="aspect-square rounded-xl bg-card border border-sand hover:bg-sand text-xl">
                  {s}
                </button>
              ))}
            </div>
          </Section>

          <Section title="Shapes">
            <div className="grid grid-cols-3 gap-2">
              <ShapeBtn onClick={() => addShape("square")}><Square className="w-5 h-5" /></ShapeBtn>
              <ShapeBtn onClick={() => addShape("circle")}><Circle className="w-5 h-5" /></ShapeBtn>
              <ShapeBtn onClick={() => addShape("blob")}><Sparkles className="w-5 h-5" /></ShapeBtn>
            </div>
          </Section>

          <Section title="Background">
            <div className="grid grid-cols-4 gap-1.5">
              {BG_KEYS.map((k) => (
                <button key={k}
                        onClick={() => setDoc({ ...doc, background: k })}
                        title={k}
                        className={`aspect-square rounded-xl border-2 ${BG_PRESETS[k]} ${
                          doc.background === k ? "border-primary" : "border-sand"
                        }`} />
              ))}
            </div>
          </Section>
        </aside>

        {/* Stage */}
        <main>
          <CanvasStage
            items={doc.items}
            onChange={setItems}
            width={doc.width}
            height={doc.height}
            background={doc.background}
          />
        </main>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs uppercase tracking-widest text-olive font-semibold mb-2 px-1">{title}</h3>
      {children}
    </div>
  );
}
function ShapeBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick}
            className="aspect-square rounded-xl bg-card border border-sand hover:bg-sand grid place-items-center text-plum">
      {children}
    </button>
  );
}
