import { useEffect, useState, useCallback } from "react";

export type User = {
  id: string;
  username: string;
};

export type CanvasItem = {
  id: string;
  type: "text" | "image" | "sticker" | "shape";
  x: number; y: number; width: number; height: number; rotation?: number; zIndex: number;
  text?: string; fontFamily?: string; fontSize?: number; fontWeight?: number; color?: string; italic?: boolean; align?: "left" | "center" | "right";
  src?: string; emoji?: string; shape?: "circle" | "square" | "blob"; fill?: string; cornerRadius?: number;
};

export type CanvasDoc = {
  id: string; userId: string; kind: "poem" | "drawing"; title: string; cover?: string; background: string; width: number; height: number; items: CanvasItem[]; createdAt: number; updatedAt: number;
};

export type JournalEntry = {
  date: string; userId: string; text: string; mood?: string; updatedAt: number;
};

export type MovieEntry = {
  id: string; userId: string; title: string; year?: string; rating: number; status: "watching" | "watched" | "watchlist"; cover?: string; notes: string; createdAt: number; updatedAt: number;
};

export type SketchDoc = {
  id: string; userId: string; title: string; elements: any[]; appState: any; files?: any; cover?: string; createdAt: number; updatedAt: number;
};

export type BookEntry = {
  id: string; userId: string; title: string; author?: string; pagesRead: number; totalPages: number; rating: number; status: "reading" | "finished" | "to-read"; cover?: string; notes: string; createdAt: number; updatedAt: number;
};

export type SongEntry = {
  id: string; userId: string; title: string; artist: string; url: string; cover?: string; notes?: string; rating?: number; albumId?: string; genre?: string; mood?: string; createdAt: number; updatedAt: number;
};

export type AlbumEntry = {
  id: string; userId: string; title: string; description?: string; cover?: string; createdAt: number; updatedAt: number;
};

const KEY = "muse:store:v2";
const AUTH_KEY = "muse:auth:v1";
export const API_BASE = import.meta.env.VITE_API_URL || "/api";

type Store = {
  canvases: CanvasDoc[]; journal: JournalEntry[]; movies: MovieEntry[]; books: BookEntry[]; sketches: SketchDoc[]; songs: SongEntry[]; albums: AlbumEntry[];
};

const empty: Store = { canvases: [], journal: [], movies: [], books: [], sketches: [], songs: [], albums: [] };

function read(): Store {
  if (typeof window === "undefined") return empty;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...empty, ...JSON.parse(raw) } : empty;
  } catch { return empty; }
}

function write(s: Store) {
  localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(new CustomEvent("muse:update"));
}

export function getAuth(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(AUTH_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function setAuth(u: User | null) {
  if (u) localStorage.setItem(AUTH_KEY, JSON.stringify(u));
  else localStorage.removeItem(AUTH_KEY);
  window.dispatchEvent(new CustomEvent("muse:auth:update"));
}

async function syncWithAPI(key: string, next: any[], prev: any[]) {
  const user = getAuth();
  if (!user) return;

  try {
    for (const item of next) {
      const id = item.id || item.date;
      const prevItem = prev.find(p => (p.id || p.date) === id);
      if (!prevItem || JSON.stringify(prevItem) !== JSON.stringify(item)) {
        await fetch(`${API_BASE}/${key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
          body: JSON.stringify({ ...item, userId: user.id })
        });
      }
    }
    for (const item of prev) {
      const id = item.id || item.date;
      if (!next.find(n => (n.id || n.date) === id)) {
        await fetch(`${API_BASE}/${key}/${id}`, {
          method: 'DELETE',
          headers: { 'x-user-id': user.id }
        });
      }
    }
  } catch (err) { console.error("API Sync error:", err); }
}

export function useStore<K extends keyof Store>(key: K): [Store[K], (v: Store[K]) => void] {
  const [val, setVal] = useState<Store[K]>(() => read()[key]);
  const [user, setUser] = useState<User | null>(getAuth());

  useEffect(() => {
    const sync = () => setVal(read()[key]);
    const syncAuth = () => setUser(getAuth());
    window.addEventListener("muse:update", sync);
    window.addEventListener("muse:auth:update", syncAuth);
    window.addEventListener("storage", sync);

    if (user) {
      fetch(`${API_BASE}/${key}`, { headers: { 'x-user-id': user.id } })
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) {
            const local = read()[key];
            const merged = [...data];
            local.forEach((l: any) => {
               const id = l.id || l.date;
               if (!merged.find((m: any) => (m.id || m.date) === id)) {
                  merged.push(l);
                  syncWithAPI(key, [l], []);
               }
            });
            const s = read();
            s[key] = merged as Store[K];
            write(s);
            setVal(merged as Store[K]);
          }
        })
        .catch(err => console.error("Initial fetch error:", err));
    }

    return () => {
      window.removeEventListener("muse:update", sync);
      window.removeEventListener("muse:auth:update", syncAuth);
      window.removeEventListener("storage", sync);
    };
  }, [key, user]);

  const set = useCallback((v: Store[K]) => {
    const prev = read()[key];
    const s = read();
    s[key] = v;
    write(s);
    setVal(v);
    syncWithAPI(key, v as any[], prev as any[]);
  }, [key]);

  return [val, set];
}

export function exportStore() {
  const data = read();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `warm-canvas-studio-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
