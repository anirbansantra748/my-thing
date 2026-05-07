import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CanvasDoc, CanvasItem, uid, useStore, getAuth } from "@/lib/store";
import { CanvasStage, BG_KEYS, BG_PRESETS } from "./CanvasStage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Type, Image as ImageIcon, Sticker, Square, Circle, Sparkles,
  ArrowLeft, Save, Trash2, Download,
} from "lucide-react";

const FONTS_QUICK = [
  { label: "Headline", val: "var(--font-display)", size: 48, weight: 700 },
  { label: "Body", val: "var(--font-body)", size: 18, weight: 400 },
  { label: "Handwrite", val: "var(--font-hand)", size: 36, weight: 600 },
];

type Props = { kind: "poem" | "drawing" };

export function CanvasEditor({ kind }: Props) {
  const { id } = useParams();
  const nav = useNavigate();
  const stageRef = useRef<any>(null);
  const [docs, setDocs] = useStore("canvases");
  const existing = docs.find((d) => d.id === id);

  const [doc, setDoc] = useState<CanvasDoc>(() => {
    const user = getAuth();
    if (id === "new") {
      const newId = uid();
      // We'll redirect in useEffect, but initialize with the newId
      return {
        id: newId,
        userId: user?.id || "",
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
      };
    }
    return existing || {
      id: uid(),
      userId: user?.id || "",
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
    };
  });

  // Redirect if new
  useEffect(() => {
    if (id === "new") {
      const base = kind === "poem" ? "poems" : "drawings";
      nav(`/${base}/${doc.id}`, { replace: true });
    }
  }, [id, doc.id, nav, kind]);

  const setItems = (items: CanvasItem[]) => setDoc({ ...doc, items, updatedAt: Date.now() });

  // Auto-save
  useEffect(() => {
    const t = setTimeout(() => {
      const others = docs.filter((d) => d.id !== doc.id);
      setDocs([...others, doc]);
    }, 400);

    return () => {
      clearTimeout(t);
      // Final save on unmount
      const latestDocs = docs.filter((d) => d.id !== doc.id);
      setDocs([...latestDocs, doc]);
    };
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


  const addShape = (shape: "circle" | "square" | "blob") => {
    setItems([
      ...doc.items,
      { id: uid(), type: "shape", shape, fill: "#f5d7c8", x: 250, y: 350, width: 180, height: 180, zIndex: doc.items.length + 1 },
    ]);
  };

  const addImage = async (file: File, asBackground = false) => {
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      if (asBackground) {
        setDoc({ ...doc, background: src, updatedAt: Date.now() });
        return;
      }
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
    <div className="min-h-screen bg-warm-fog">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-sand shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 h-14 md:h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1">
            <Button variant="ghost" size="icon" onClick={() => nav(-1)} className="rounded-full h-10 w-10 shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Input
              value={doc.title}
              onChange={(e) => setDoc({ ...doc, title: e.target.value })}
              className="flex-1 max-w-[200px] md:max-w-md border-0 bg-transparent focus-visible:bg-sand rounded-full font-display text-base md:text-lg px-3 h-10"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <select
              className="text-xs font-bold uppercase tracking-widest bg-sand/50 rounded-full px-4 py-2 border-0 outline-none"
              onChange={(e) => {
                const ratio = e.target.value;
                if (ratio === "1:1") setDoc({ ...doc, width: 800, height: 800 });
                else if (ratio === "4:5") setDoc({ ...doc, width: 800, height: 1000 });
                else if (ratio === "16:9") setDoc({ ...doc, width: 600, height: 1067 });
              }}
            >
              <option value="">Ratio</option>
              <option value="1:1">1:1 Square</option>
              <option value="4:5">4:5 Insta</option>
              <option value="16:9">16:9 Story</option>
            </select>

            <div className="hidden sm:flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-olive font-bold bg-sand/50 px-3 py-1.5 rounded-full">
              <Save className="w-3 h-3" /> Auto-saved
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => stageRef.current?.download(`${doc.title}.png`)}
                className="text-olive hover:bg-sand rounded-full h-10 w-10"
                title="Download as PNG"
              >
                <Download className="w-5 h-5" />
              </Button>
              {existing && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this?")) {
                      setDocs(docs.filter((d) => d.id !== doc.id));
                      nav(-1);
                    }
                  }}
                  className="text-primary hover:text-primary/80 hover:bg-primary/5 rounded-full h-10 w-10"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-4 md:py-8 grid lg:grid-cols-[280px_1fr] gap-6 md:gap-8">
        {/* Toolbox */}
        <aside className="lg:sticky lg:top-[80px] lg:self-start overflow-x-auto pb-2 lg:pb-0 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
          <Section title="Tools — scroll for more">
            <div className="flex lg:grid gap-4 lg:gap-8 min-w-max lg:min-w-0 pb-2">
              <Section title="Add text" isNested>
                <div className="flex lg:grid gap-3 lg:gap-2">
                  {FONTS_QUICK.map((f) => (
                    <button key={f.label}
                            onClick={() => addText(f)}
                            className="text-left px-4 py-2.5 md:px-5 md:py-3.5 rounded-2xl bg-card border border-sand hover:border-plum transition-all whitespace-nowrap min-w-[100px] md:min-w-0 shadow-sm active:scale-95">
                      <span style={{ fontFamily: f.val, fontWeight: f.weight }} className="text-plum text-base md:text-lg">{f.label}</span>
                    </button>
                  ))}
                </div>
              </Section>

              <Section title="Upload" isNested>
                <div className="flex lg:grid gap-3">
                  <label className="block flex-1 lg:min-w-0">
                    <div className="px-3 py-4 rounded-2xl border-2 border-dashed border-warm-silver bg-warm-wash hover:bg-sand transition-all text-center cursor-pointer shadow-sm active:scale-95">
                      <ImageIcon className="w-5 h-5 mx-auto mb-1 text-olive" />
                      <span className="text-[10px] font-bold text-olive uppercase tracking-tighter">Add Image</span>
                    </div>
                    <input type="file" accept="image/*" className="hidden"
                           onChange={(e) => e.target.files?.[0] && addImage(e.target.files[0])} />
                  </label>
                  <label className="block flex-1 lg:min-w-0">
                    <div className="px-3 py-4 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-all text-center cursor-pointer shadow-sm active:scale-95">
                      <ImageIcon className="w-5 h-5 mx-auto mb-1 text-primary" />
                      <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">Set BG</span>
                    </div>
                    <input type="file" accept="image/*" className="hidden"
                           onChange={(e) => e.target.files?.[0] && addImage(e.target.files[0], true)} />
                  </label>
                </div>
              </Section>


              <Section title="Shapes" isNested>
                <div className="flex lg:grid grid-cols-3 gap-2">
                  <ShapeBtn onClick={() => addShape("square")}><Square className="w-6 h-6" /></ShapeBtn>
                  <ShapeBtn onClick={() => addShape("circle")}><Circle className="w-6 h-6" /></ShapeBtn>
                  <ShapeBtn onClick={() => addShape("blob")}><Sparkles className="w-6 h-6" /></ShapeBtn>
                </div>
              </Section>

              <Section title="Paper" isNested>
                <div className="flex lg:grid grid-cols-4 gap-2">
                  {BG_KEYS.map((k) => (
                    <button key={k}
                            onClick={() => setDoc({ ...doc, background: k })}
                            title={k}
                            className={`w-10 h-10 lg:w-full lg:aspect-square rounded-xl border-2 transition-all ${BG_PRESETS[k]} ${
                              doc.background === k ? "border-primary scale-105" : "border-sand"
                            }`} />
                  ))}
                </div>
              </Section>
            </div>
          </Section>
        </aside>

        {/* Stage */}
        <main className="w-full overflow-hidden flex justify-center">
          <CanvasStage
            ref={stageRef}
            items={doc.items}
            onChange={setItems}
            width={doc.width}
            height={doc.height}
            background={doc.background}
            onSetBackground={(src) => setDoc({ ...doc, background: src })}
          />
        </main>
      </div>
    </div>
  );
}

function Section({ title, children, isNested }: { title: string; children: React.ReactNode; isNested?: boolean }) {
  return (
    <div className={isNested ? "space-y-2" : "space-y-4"}>
      <h3 className={`uppercase tracking-widest text-olive font-bold px-1 ${isNested ? "text-[10px]" : "text-xs mb-3"}`}>{title}</h3>
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
