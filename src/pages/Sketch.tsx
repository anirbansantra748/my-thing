import { ExcalidrawEditor } from "@/components/canvas/ExcalidrawEditor";
import { SketchGallery } from "@/components/canvas/SketchGallery";
import { useParams } from "react-router-dom";

export default function Sketch() {
  const { id } = useParams();
  
  if (!id) return <SketchGallery />;
  return <ExcalidrawEditor />;
}
