import { CanvasEditor } from "@/components/canvas/CanvasEditor";
import { GalleryPage } from "@/components/canvas/GalleryPage";
import { useParams } from "react-router-dom";

export default function Poems() {
  const { id } = useParams();
  if (id) return <CanvasEditor kind="poem" />;
  return <GalleryPage kind="poem" />;
}
