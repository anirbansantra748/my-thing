import { Link } from "react-router-dom";
import { CanvasDoc } from "@/lib/store";
import { BG_PRESETS } from "./CanvasStage";

type Props = { doc: CanvasDoc; href: string };

export function CanvasCard({ doc, href }: Props) {
  // Render a tiny scaled-down preview using actual items
  const previewW = 240;
  const scale = previewW / doc.width;
  const previewH = doc.height * scale;
  const bg = BG_PRESETS[doc.background] || BG_PRESETS.paper;

  return (
    <Link to={href} className="group block break-inside-avoid mb-4">
      <div className="relative rounded-2xl overflow-hidden border border-sand bg-card pin-shadow group-hover:lift-shadow transition-shadow">
        <div className={`relative ${bg}`} style={{ width: previewW, height: previewH }}>
          {doc.items
            .slice()
            .sort((a, b) => a.zIndex - b.zIndex)
            .map((it) => (
              <div
                key={it.id}
                style={{
                  position: "absolute",
                  left: it.x * scale,
                  top: it.y * scale,
                  width: it.width * scale,
                  height: it.height * scale,
                  transform: `rotate(${it.rotation || 0}deg)`,
                  overflow: "hidden",
                }}
              >
                {it.type === "text" && (
                  <div style={{
                    fontFamily: it.fontFamily,
                    fontSize: (it.fontSize || 18) * scale,
                    fontWeight: it.fontWeight,
                    color: it.color,
                    fontStyle: it.italic ? "italic" : "normal",
                    textAlign: it.align,
                    lineHeight: 1.2,
                  }}>{it.text}</div>
                )}
                {it.type === "image" && it.src && (
                  <img src={it.src} className="w-full h-full object-cover" alt="" />
                )}
                {it.type === "sticker" && (
                  <div className="grid place-items-center w-full h-full"
                       style={{ fontSize: Math.min(it.width, it.height) * scale * 0.7 }}>
                    {it.emoji}
                  </div>
                )}
                {it.type === "shape" && (
                  <div className="w-full h-full" style={{
                    background: it.fill,
                    borderRadius: it.shape === "circle" ? "50%" : it.shape === "blob" ? "60% 40% 55% 45% / 50% 60% 40% 50%" : 6,
                  }} />
                )}
              </div>
            ))}
        </div>
      </div>
      <div className="px-1 pt-2">
        <div className="text-sm font-semibold text-plum truncate">{doc.title}</div>
        <div className="text-xs text-olive">{new Date(doc.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</div>
      </div>
    </Link>
  );
}
