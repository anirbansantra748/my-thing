import { AppHeader } from "@/components/AppHeader";
import { InteractiveMenu } from "@/components/InteractiveMenu";
import { Outlet, useLocation, useParams } from "react-router-dom";

export default function Layout() {
  const { pathname } = useLocation();
  // Simple check if we are in editor: path is /poems/:id or /drawings/:id
  const isEditor = (pathname.startsWith("/poems/") || pathname.startsWith("/drawings/")) && pathname.split("/").length > 2;
  const hideNav = isEditor || pathname.startsWith("/songs");

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/10">
      {!hideNav && <AppHeader />}
      <main className="flex-1 w-full max-w-[1440px] mx-auto overflow-x-hidden">
        <Outlet />
      </main>
      {!hideNav && <InteractiveMenu />}
    </div>
  );
}
