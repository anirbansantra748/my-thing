import { CanvasEditor } from "@/components/canvas/CanvasEditor";
import { GalleryPage } from "@/components/canvas/GalleryPage";
import { useParams } from "react-router-dom";

export default function Drawings() {
  const { id } = useParams();
  if (id) return <CanvasEditor kind="drawing" />;
  return <GalleryPage kind="drawing" />;
}
