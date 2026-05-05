import { useEffect, useRef, useState, useCallback, useMemo, forwardRef, useImperativeHandle } from "react";
import { Stage, Layer, Text, Image as KonvaImage, Rect, Circle, Transformer } from "react-konva";
import useImage from "use-image";
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
  onSetBackground?: (src: string) => void;
};

const BG_PRESETS: Record<string, string> = {
  paper: "#fdfcf9",
  linen: "#f5f5f0",
  grid: "#f8f8f7",
  dots: "#fafafa",
  warm: "#fff9f2",
  blush: "#fff5f5",
  sage: "#f2f7f2",
  sky: "#f2f7ff",
  noise: "#fdfcf9",
  white: "#ffffff",
  cream: "#fcfaf5",
  plum: "#211922",
};

const FONT_MAP: Record<string, string> = {
  "var(--font-display)": "Playfair Display",
  "var(--font-body)": "Inter",
  "var(--font-hand)": "Caveat",
  "var(--font-bengali)": "Hind Siliguri",
  "var(--font-bengali-script)": "Atma",
};

// Sub-component for individual items to handle images and selection
const CanvasItemComponent = ({ 
  item, 
  isSelected, 
  onSelect, 
  onChange,
  onTextDblClick,
  isEditing
}: { 
  item: CanvasItem; 
  isSelected: boolean; 
  onSelect: () => void;
  onChange: (patch: Partial<CanvasItem>) => void;
  onTextDblClick: (id: string) => void;
  isEditing: boolean;
}) => {
  const shapeRef = useRef<any>(null);
  const [img] = useImage(item.src || "");

  useEffect(() => {
    if (isSelected && shapeRef.current) {
      // We'll handle transformer in the parent
    }
  }, [isSelected]);

  const commonProps = {
    id: item.id,
    x: item.x,
    y: item.y,
    width: item.width,
    height: item.height,
    rotation: item.rotation || 0,
    draggable: true,
    onClick: (e: any) => {
      // e.detail is the click count
      if (e.evt && e.evt.detail === 2 && item.type === "text") {
        onTextDblClick(item.id);
      } else {
        onSelect();
      }
    },
    onTap: (e: any) => {
      // For mobile, we can use a custom timer or check e.target.getStage()._lastClickTime
      // But let's try standard onTap first, and then add a fallback if needed.
      const now = Date.now();
      const last = (e.target as any)._lastTapTime || 0;
      (e.target as any)._lastTapTime = now;
      if (now - last < 300 && item.type === "text") {
        onTextDblClick(item.id);
      } else {
        onSelect();
      }
    },
    onDragEnd: (e: any) => {
      onChange({ x: e.target.x(), y: e.target.y() });
    },
    onTransformEnd: (e: any) => {
      const node = shapeRef.current;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      node.scaleX(1);
      node.scaleY(1);
      onChange({
        x: node.x(),
        y: node.y(),
        width: Math.max(5, node.width() * scaleX),
        height: Math.max(5, node.height() * scaleY),
        rotation: node.rotation(),
      });
    },
    ref: shapeRef,
  };

  if (item.type === "text") {
    return (
      <Text
        {...commonProps}
        visible={!isEditing}
        text={item.text}
        fontSize={item.fontSize || 24}
        fontFamily={FONT_MAP[item.fontFamily || ""] || item.fontFamily || "Playfair Display"}
        fontStyle={`${item.italic ? "italic " : ""}${item.fontWeight && item.fontWeight >= 700 ? "bold" : "normal"}`}
        fill={item.color || "#211922"}
        align={item.align || "left"}
        width={item.width}
        wrap="word"
        name="selectable-text"
      />
    );
  }

  if (item.type === "image" && img) {
    return <KonvaImage {...commonProps} image={img} cornerRadius={item.cornerRadius || 0} />;
  }


  if (item.type === "shape") {
    if (item.shape === "circle") {
      return (
        <Circle
          {...commonProps}
          radius={item.width / 2}
          x={item.x + item.width / 2}
          y={item.y + item.height / 2}
          fill={item.fill || "#e5e5e0"}
        />
      );
    }
    return <Rect {...commonProps} fill={item.fill || "#e5e5e0"} cornerRadius={item.cornerRadius || (item.shape === "blob" ? 40 : 0)} />;
  }

  return null;
};

const BackgroundImage = ({ src, width, height }: { src: string; width: number; height: number }) => {
  const [img] = useImage(src);
  return img ? <KonvaImage image={img} width={width} height={height} /> : null;
};

export const CanvasStage = forwardRef<any, Props>(({ items, onChange, width, height, background, onSetBackground }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editingTextId && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length);
    }
  }, [editingTextId]);

  // Auto-fit width
  useEffect(() => {
    const fit = () => {
      const el = containerRef.current;
      if (!el) return;
      const avail = el.clientWidth - 32;
      setScale(Math.max(0.1, Math.min(1, avail / width)));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [width]);

  // Handle selection transformer
  useEffect(() => {
    if (selectedId && trRef.current && stageRef.current) {
      const node = stageRef.current.findOne("#" + selectedId);
      if (node) {
        trRef.current.nodes([node]);
        trRef.current.getLayer().batchDraw();
      }
    }
  }, [selectedId, items]);

  const updateItem = (id: string, patch: Partial<CanvasItem>) => {
    onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };

  const selectedItem = useMemo(() => items.find((i) => i.id === selectedId) || null, [items, selectedId]);

  const handleStageClick = (e: any) => {
    if (e.target === e.target.getStage()) {
      setSelectedId(null);
      setEditingTextId(null);
    }
  };

  const handleStageDblClick = (e: any) => {
    const target = e.target;
    // Check if we clicked on a text item (either the Text node or through transformer)
    if (target.attrs.name === "selectable-text" || target.parent?.attrs.name === "selectable-text") {
      handleTextDblClick(target.id() || target.parent?.id());
    }
  };

  const handleStageTap = (e: any) => {
    handleStageClick(e);
    
    // Double tap detection
    const now = Date.now();
    const last = stageRef.current?._lastTapTime || 0;
    if (stageRef.current) stageRef.current._lastTapTime = now;
    
    if (now - last < 300) {
      handleStageDblClick(e);
    }
  };

  useImperativeHandle(ref, () => ({
    download: (filename = "canvas.png") => {
      if (!stageRef.current) return;
      
      // Deselect and hide transformer before download
      setSelectedId(null);
      setEditingTextId(null);
      
      // Small timeout to ensure transformer is hidden in the next tick
      setTimeout(() => {
        const dataURL = stageRef.current.toDataURL({ pixelRatio: 2 });
        const link = document.createElement("a");
        link.download = filename;
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, 100);
    }
  }));

  const handleTextDblClick = (id: string) => {
    setEditingTextId(id);
    setSelectedId(id);
  };

  return (
    <div className="w-full flex flex-col items-center gap-4" ref={containerRef}>
      <div 
        className="relative rounded-3xl overflow-hidden border border-sand shadow-2xl bg-white"
        style={{ width: width * scale, height: height * scale }}
      >
        <Stage
          width={width}
          height={height}
          scaleX={scale}
          scaleY={scale}
          onClick={handleStageClick}
          onDblClick={handleStageDblClick}
          onTap={handleStageTap}
          ref={stageRef}
          className="bg-white"
        >
          <Layer>
            {/* Background Layer */}
            {BG_PRESETS[background] ? (
              <Rect width={width} height={height} fill={BG_PRESETS[background]} />
            ) : (
              <BackgroundImage src={background} width={width} height={height} />
            )}
            
            {items
              .slice()
              .sort((a, b) => a.zIndex - b.zIndex)
              .map((it) => (
                <CanvasItemComponent
                  key={it.id}
                  item={it}
                  isSelected={it.id === selectedId}
                  onSelect={() => setSelectedId(it.id)}
                  onChange={(patch) => updateItem(it.id, patch)}
                  onTextDblClick={handleTextDblClick}
                  isEditing={it.id === editingTextId}
                />
              ))}
            
            {selectedId && !editingTextId && (
              <Transformer
                ref={trRef}
                boundBoxFunc={(oldBox, newBox) => {
                  if (newBox.width < 5 || newBox.height < 5) return oldBox;
                  return newBox;
                }}
              />
            )}
          </Layer>
        </Stage>

        {/* Text Area Overlay for editing */}
        {editingTextId && selectedItem && selectedItem.type === "text" && (
          <textarea
            ref={textareaRef}
            className="absolute z-50 bg-white/90 outline-none resize-none overflow-hidden"
            style={{
              left: selectedItem.x * scale,
              top: selectedItem.y * scale,
              width: selectedItem.width * scale,
              height: (selectedItem.height || 40) * scale,
              padding: 0,
              margin: 0,
              fontFamily: FONT_MAP[selectedItem.fontFamily || ""] || selectedItem.fontFamily || "Playfair Display",
              fontSize: (selectedItem.fontSize || 24) * scale,
              fontWeight: selectedItem.fontWeight || 400,
              fontStyle: selectedItem.italic ? "italic" : "normal",
              color: selectedItem.color || "#000",
              textAlign: selectedItem.align as any,
              lineHeight: 1.2,
              border: "none",
            }}
            value={selectedItem.text}
            onChange={(e) => updateItem(editingTextId, { text: e.target.value })}
            onBlur={() => setEditingTextId(null)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                setEditingTextId(null);
              }
            }}
          />
        )}
      </div>

      {/* Toolbar for selected item */}
      {selectedItem && (
        <div className="fixed bottom-20 left-4 right-4 z-40 md:relative md:bottom-0 md:left-0 md:right-0">
          <div className="mx-auto max-w-2xl bg-card/95 backdrop-blur-md rounded-2xl border border-sand p-3 flex flex-wrap items-center justify-center gap-3 shadow-xl">
             {selectedItem.type === "text" && (
                <div className="flex items-center gap-2">
                  <select 
                    value={selectedItem.fontFamily} 
                    onChange={(e) => updateItem(selectedId!, { fontFamily: e.target.value })}
                    className="text-xs bg-sand rounded-full px-3 py-1.5"
                  >
                    <option value="var(--font-display)">Playfair</option>
                    <option value="var(--font-body)">Inter</option>
                    <option value="var(--font-hand)">Caveat</option>
                    <option value="var(--font-bengali)">Bengali Modern</option>
                    <option value="var(--font-bengali-script)">Bengali Script</option>
                  </select>
                  <Button size="icon" variant="ghost" onClick={() => handleTextDblClick(selectedId!)}>
                    Edit Text
                  </Button>
                </div>
             )}
              {(selectedItem.type === "image" || selectedItem.type === "shape") && (
                <div className="flex items-center gap-2 border-l border-sand pl-3 min-w-[120px]">
                  <span className="text-[10px] uppercase font-bold text-olive">Corner</span>
                  <Slider
                    value={[selectedItem.cornerRadius || 0]}
                    max={100}
                    step={1}
                    onValueChange={([v]) => updateItem(selectedId!, { cornerRadius: v })}
                    className="w-24"
                  />
                </div>
              )}
              <div className="flex items-center gap-1 border-l border-sand pl-3">
                 <Button size="icon" variant="ghost" title="Bring to Front" onClick={() => {
                   const max = Math.max(...items.map(i => i.zIndex), 0);
                   updateItem(selectedId!, { zIndex: max + 1 });
                 }}>
                   <ChevronUp className="w-5 h-5" />
                 </Button>
                 <Button size="icon" variant="ghost" title="Send to Back" onClick={() => {
                   const min = Math.min(...items.map(i => i.zIndex), 0);
                   updateItem(selectedId!, { zIndex: min - 1 });
                 }}>
                   <ChevronDown className="w-5 h-5" />
                 </Button>
                 {selectedItem.type === "image" && (
                   <Button size="icon" variant="ghost" title="Set as Background" onClick={() => {
                     if (onSetBackground && selectedItem.src) {
                       onSetBackground(selectedItem.src);
                       onChange(items.filter(i => i.id !== selectedId));
                       setSelectedId(null);
                     }
                   }}>
                     <RotateCw className="w-5 h-5" />
                   </Button>
                 )}
                 <Button size="icon" variant="ghost" className="text-primary" onClick={() => {
                   const others = items.filter(i => i.id !== selectedId);
                   onChange(others);
                   setSelectedId(null);
                 }}>
                   <Trash2 className="w-5 h-5" />
                 </Button>
              </div>
          </div>
        </div>
      )}
    </div>
  );
});

export const BG_KEYS = Object.keys(BG_PRESETS);
export { BG_PRESETS };
