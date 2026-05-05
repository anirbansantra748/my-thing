import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStore, uid, SketchDoc } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Trash2, Download } from "lucide-react";
import { toast } from "sonner";

// Import Excalidraw CSS
import "@excalidraw/excalidraw/index.css";

// Lazy load Excalidraw to improve performance
const Excalidraw = React.lazy(() => import("@excalidraw/excalidraw").then(m => ({ default: m.Excalidraw })));

export function ExcalidrawEditor() {
  const { id } = useParams();
  const nav = useNavigate();
  const [sketches, setSketches] = useStore("sketches");
  const existing = sketches.find((s) => s.id === id);

  const [doc, setDoc] = useState<SketchDoc>(() =>
    existing || {
      id: uid(),
      title: "Untitled Sketch",
      elements: [],
      appState: { viewBackgroundColor: "#ffffff" },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
  );

  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);

  // Auto-save & Initial Thumbnail generation
  useEffect(() => {
    if (!excalidrawAPI) return;

    const generateAndSave = async (force = false) => {
      const elements = excalidrawAPI.getSceneElements();
      if (elements.length === 0 && !doc.cover) return;

      const appState = excalidrawAPI.getAppState();
      let cover = doc.cover;

      try {
        const { exportToCanvas } = await import("@excalidraw/excalidraw");
        const canvas = await exportToCanvas({
          elements,
          appState: { ...appState, viewBackgroundColor: "#ffffff" },
          files: excalidrawAPI.getFiles(),
          maxWidthOrHeight: 400,
        });
        cover = canvas.toDataURL();
      } catch (e) {
        console.error("Thumbnail error:", e);
      }

      const updatedDoc = { ...doc, elements, appState, cover, updatedAt: Date.now() };
      const others = sketches.filter((s) => s.id !== doc.id);
      setSketches([...others, updatedDoc]);
    };

    // If no cover exists, generate one immediately
    if (!doc.cover) {
      generateAndSave();
    }

    const t = setTimeout(() => generateAndSave(), 1500);
    return () => clearTimeout(t);
  }, [doc, excalidrawAPI, sketches, setSketches]);

  const handleExport = async () => {
    if (!excalidrawAPI) return;
    const { exportToBlob } = await import("@excalidraw/excalidraw");
    const blob = await exportToBlob({
      elements: excalidrawAPI.getSceneElements(),
      mimeType: "image/png",
      appState: excalidrawAPI.getAppState(),
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc.title}.png`;
    a.click();
    toast.success("Sketch exported as PNG");
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Top Bar */}
      <div className="h-14 md:h-16 border-b border-sand bg-background/95 backdrop-blur flex items-center px-4 gap-3 z-50">
        <Button variant="ghost" size="sm" onClick={() => nav(-1)} className="rounded-full">
          <ArrowLeft className="w-4 h-4 mr-1" /> <span className="hidden sm:inline">Back</span>
        </Button>
        <Input
          value={doc.title}
          onChange={(e) => setDoc({ ...doc, title: e.target.value })}
          className="flex-1 max-w-md border-0 bg-transparent focus-visible:bg-sand rounded-full font-display text-lg px-4"
        />
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} className="rounded-full hidden sm:flex">
            <Download className="w-4 h-4 mr-1.5" /> Export
          </Button>
          {existing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (confirm("Delete this sketch?")) {
                  setSketches(sketches.filter((s) => s.id !== doc.id));
                  nav("/drawings");
                }
              }}
              className="text-primary hover:text-primary/80 rounded-full"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 relative overflow-hidden">
        <React.Suspense fallback={<div className="h-full grid place-items-center font-display text-xl text-olive">Loading Sketchbook...</div>}>
          <Excalidraw
            initialData={{
              elements: doc.elements,
              appState: (({ collaborators, ...rest }) => rest)(doc.appState || {}),
              scrollToContent: true,
            }}
            excalidrawAPI={(api) => setExcalidrawAPI(api)}
          />
        </React.Suspense>
      </div>
    </div>
  );
}
