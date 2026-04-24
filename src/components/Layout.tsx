import { AppHeader } from "@/components/AppHeader";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <Outlet />
    </div>
  );
}
