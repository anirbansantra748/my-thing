import { useEffect, useRef, useState, useCallback } from "react";
import { CanvasItem } from "@/lib/store";
import {
  Bold, Italic, AlignLeft, AlignCenter, AlignRight, Trash2,
  ChevronUp, ChevronDown, RotateCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

type Props = {
  items: CanvasItem[];
  onChange: (items: CanvasItem[]) => void;
  width: number;
  height: number;
  background: string;
};

const BG_PRESETS: Record<string, string> = {
  paper: "texture-paper",
  linen: "texture-linen",
  grid: "texture-grid",
  dots: "texture-dots",
  warm: "texture-warm",
  blush: "texture-blush",
  sage: "texture-sage",
  sky: "texture-sky",
  noise: "texture-noise",
  white: "bg-white",
  cream: "bg-[hsl(40,40%,96%)]",
  plum: "bg-plum",
};

export function CanvasStage({ items, onChange, width, height, background }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [scale, setScale] = useState(1);

  // Auto-fit width
  useEffect(() => {
    const fit = () => {
      const el = stageRef.current?.parentElement;
      if (!el) return;
      const avail = el.clientWidth - 32;
      setScale(Math.min(1, avail / width));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [width]);

  const update = (id: string, patch: Partial<CanvasItem>) => {
    onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };
  const remove = (id: string) => {
    onChange(items.filter((it) => it.id !== id));
    setSelected(null);
  };
  const bringForward = (id: string) => {
    const max = Math.max(...items.map((i) => i.zIndex), 0);
    update(id, { zIndex: max + 1 });
  };
  const sendBack = (id: string) => {
    const min = Math.min(...items.map((i) => i.zIndex), 0);
    update(id, { zIndex: min - 1 });
  };

  const startDrag = (e: React.PointerEvent, item: CanvasItem, mode: "move" | "resize" | "rotate") => {
    e.stopPropagation();
    e.preventDefault();
    setSelected(item.id);
    const startX = e.clientX;
    const startY = e.clientY;
    const sx = item.x;
    const sy = item.y;
    const sw = item.width;
    const sh = item.height;
    const sr = item.rotation || 0;
    const cx = item.x + item.width / 2;
    const cy = item.y + item.height / 2;
    const startAngle = Math.atan2(
      e.clientY / scale - cy - (stageRef.current?.getBoundingClientRect().top || 0) / scale,
      e.clientX / scale - cx - (stageRef.current?.getBoundingClientRect().left || 0) / scale
    );

    const move = (ev: PointerEvent) => {
      const dx = (ev.clientX - startX) / scale;
      const dy = (ev.clientY - startY) / scale;
      if (mode === "move") {
        update(item.id, { x: sx + dx, y: sy + dy });
      } else if (mode === "resize") {
        update(item.id, {
          width: Math.max(40, sw + dx),
          height: Math.max(30, sh + dy),
          ...(item.type === "text" ? { fontSize: Math.max(10, (item.fontSize || 18) + dy * 0.4) } : {}),
        });
      } else if (mode === "rotate") {
        const rect = stageRef.current!.getBoundingClientRect();
        const ang = Math.atan2(
          (ev.clientY - rect.top) / scale - cy,
          (ev.clientX - rect.left) / scale - cx
        );
        update(item.id, { rotation: sr + ((ang - startAngle) * 180) / Math.PI });
      }
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const sel = items.find((i) => i.id === selected) || null;
  const bgClass = BG_PRESETS[background] || BG_PRESETS.paper;

  return (
    <div className="space-y-3">
      <div
        className="relative mx-auto rounded-3xl overflow-hidden border border-sand lift-shadow"
        style={{
          width: width * scale,
          height: height * scale,
        }}
      >
        <div
          ref={stageRef}
          className={`relative ${bgClass}`}
          style={{
            width,
            height,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
          onPointerDown={() => setSelected(null)}
        >
          {items
            .slice()
            .sort((a, b) => a.zIndex - b.zIndex)
            .map((it) => {
              const isSel = it.id === selected;
              const common: React.CSSProperties = {
                position: "absolute",
                left: it.x,
                top: it.y,
                width: it.width,
                height: it.height,
                transform: `rotate(${it.rotation || 0}deg)`,
                cursor: "move",
                outline: isSel ? "2px solid hsl(var(--primary))" : "none",
                outlineOffset: 2,
                borderRadius: it.type === "image" ? 12 : 4,
              };
              return (
                <div
                  key={it.id}
                  style={common}
                  onPointerDown={(e) => startDrag(e, it, "move")}
                  onClick={(e) => { e.stopPropagation(); setSelected(it.id); }}
                >
                  {it.type === "text" && (
                    <div
                      style={{
                        fontFamily: it.fontFamily || "var(--font-display)",
                        fontSize: it.fontSize || 24,
                        fontWeight: it.fontWeight || 500,
                        color: it.color || "hsl(var(--plum))",
                        fontStyle: it.italic ? "italic" : "normal",
                        textAlign: it.align || "left",
                        width: "100%",
                        height: "100%",
                        lineHeight: 1.25,
                        outline: "none",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        userSelect: isSel ? "text" : "none",
                      }}
                      contentEditable={isSel}
                      suppressContentEditableWarning
                      onBlur={(e) => update(it.id, { text: e.currentTarget.innerText })}
                      onPointerDown={(e) => isSel && e.stopPropagation()}
                    >
                      {it.text}
                    </div>
                  )}
                  {it.type === "image" && it.src && (
                    <img
                      src={it.src}
                      alt=""
                      draggable={false}
                      className="w-full h-full object-cover rounded-xl pointer-events-none"
                    />
                  )}
                  {it.type === "sticker" && (
                    <div className="w-full h-full grid place-items-center text-[3rem] select-none pointer-events-none"
                         style={{ fontSize: Math.min(it.width, it.height) * 0.7 }}>
                      {it.emoji}
                    </div>
                  )}
                  {it.type === "shape" && (
                    <div
                      className="w-full h-full"
                      style={{
                        background: it.fill || "hsl(var(--sand))",
                        borderRadius: it.shape === "circle" ? "50%" : it.shape === "blob" ? "60% 40% 55% 45% / 50% 60% 40% 50%" : 12,
                      }}
                    />
                  )}
                  {isSel && (
                    <>
                      <div
                        className="absolute -bottom-2 -right-2 w-4 h-4 bg-primary rounded-full border-2 border-background cursor-se-resize"
                        onPointerDown={(e) => startDrag(e, it, "resize")}
                      />
                      <div
                        className="absolute -top-8 left-1/2 -translate-x-1/2 w-7 h-7 bg-background border border-sand rounded-full grid place-items-center cursor-grab pop-shadow"
                        onPointerDown={(e) => startDrag(e, it, "rotate")}
                      >
                        <RotateCw className="w-3.5 h-3.5 text-plum" />
                      </div>
                    </>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {sel && (
        <div className="mx-auto max-w-3xl bg-card rounded-2xl border border-sand p-3 flex flex-wrap items-center gap-2 lift-shadow">
          {sel.type === "text" && (
            <>
              <select
                value={sel.fontFamily || "var(--font-display)"}
                onChange={(e) => update(sel.id, { fontFamily: e.target.value })}
                className="text-sm rounded-full bg-sand border-0 px-3 py-1.5"
              >
                <option value="var(--font-display)">Playfair</option>
                <option value="var(--font-body)">Inter</option>
                <option value="var(--font-hand)">Caveat</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="Courier New, monospace">Courier</option>
              </select>
              <Input
                type="number"
                value={Math.round(sel.fontSize || 24)}
                onChange={(e) => update(sel.id, { fontSize: +e.target.value })}
                className="w-20 h-8 rounded-full text-sm"
              />
              <Button size="icon" variant={sel.fontWeight && sel.fontWeight >= 700 ? "default" : "secondary"}
                      className="rounded-full h-8 w-8"
                      onClick={() => update(sel.id, { fontWeight: sel.fontWeight && sel.fontWeight >= 700 ? 400 : 700 })}>
                <Bold className="w-4 h-4" />
              </Button>
              <Button size="icon" variant={sel.italic ? "default" : "secondary"} className="rounded-full h-8 w-8"
                      onClick={() => update(sel.id, { italic: !sel.italic })}>
                <Italic className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="secondary" className="rounded-full h-8 w-8" onClick={() => update(sel.id, { align: "left" })}><AlignLeft className="w-4 h-4" /></Button>
              <Button size="icon" variant="secondary" className="rounded-full h-8 w-8" onClick={() => update(sel.id, { align: "center" })}><AlignCenter className="w-4 h-4" /></Button>
              <Button size="icon" variant="secondary" className="rounded-full h-8 w-8" onClick={() => update(sel.id, { align: "right" })}><AlignRight className="w-4 h-4" /></Button>
              <input type="color" value={sel.color || "#211922"} onChange={(e) => update(sel.id, { color: e.target.value })}
                     className="w-8 h-8 rounded-full cursor-pointer border border-sand bg-transparent" />
            </>
          )}
          {sel.type === "shape" && (
            <input type="color" value={sel.fill || "#e5e5e0"} onChange={(e) => update(sel.id, { fill: e.target.value })}
                   className="w-8 h-8 rounded-full cursor-pointer border border-sand" />
          )}
          <div className="flex items-center gap-2 ml-auto">
            <Button size="icon" variant="secondary" className="rounded-full h-8 w-8" onClick={() => bringForward(sel.id)}><ChevronUp className="w-4 h-4" /></Button>
            <Button size="icon" variant="secondary" className="rounded-full h-8 w-8" onClick={() => sendBack(sel.id)}><ChevronDown className="w-4 h-4" /></Button>
            <Button size="icon" variant="destructive" className="rounded-full h-8 w-8" onClick={() => remove(sel.id)}><Trash2 className="w-4 h-4" /></Button>
          </div>
        </div>
      )}
    </div>
  );
}

export const BG_KEYS = Object.keys(BG_PRESETS);
export { BG_PRESETS };
