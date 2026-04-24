// Local-storage powered persistence for all entities.
import { useEffect, useState, useCallback } from "react";

export type CanvasItem = {
  id: string;
  type: "text" | "image" | "sticker" | "shape";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  zIndex: number;
  // text
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  italic?: boolean;
  align?: "left" | "center" | "right";
  // image
  src?: string;
  // sticker
  emoji?: string;
  // shape
  shape?: "circle" | "square" | "blob";
  fill?: string;
};

export type CanvasDoc = {
  id: string;
  kind: "poem" | "drawing";
  title: string;
  cover?: string; // dataURL preview
  background: string; // texture key OR css color
  width: number;
  height: number;
  items: CanvasItem[];
  createdAt: number;
  updatedAt: number;
};

export type JournalEntry = {
  date: string; // YYYY-MM-DD
  text: string;
  mood?: string;
  updatedAt: number;
};

export type MovieEntry = {
  id: string;
  title: string;
  year?: string;
  rating: number; // 0-5
  status: "watching" | "watched" | "watchlist";
  cover?: string;
  notes: string;
  createdAt: number;
  updatedAt: number;
};

export type BookEntry = {
  id: string;
  title: string;
  author?: string;
  pagesRead: number;
  totalPages: number;
  rating: number;
  status: "reading" | "finished" | "to-read";
  cover?: string;
  notes: string;
  createdAt: number;
  updatedAt: number;
};

const KEY = "muse:store:v1";
const API_BASE = "http://localhost:5000/api";

type Store = {
  canvases: CanvasDoc[];
  journal: JournalEntry[];
  movies: MovieEntry[];
  books: BookEntry[];
};

const empty: Store = { canvases: [], journal: [], movies: [], books: [] };

function read(): Store {
  if (typeof window === "undefined") return empty;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty;
    return { ...empty, ...JSON.parse(raw) };
  } catch {
    return empty;
  }
}

function write(s: Store) {
  localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(new CustomEvent("muse:update"));
}

async function syncWithAPI(key: string, next: any[], prev: any[]) {
  try {
    // Find added or updated
    for (const item of next) {
      const id = item.id || item.date;
      const prevItem = prev.find(p => (p.id || p.date) === id);
      if (!prevItem || JSON.stringify(prevItem) !== JSON.stringify(item)) {
        await fetch(`${API_BASE}/${key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item)
        });
      }
    }
    // Find deleted
    for (const item of prev) {
      const id = item.id || item.date;
      const stillExists = next.find(n => (n.id || n.date) === id);
      if (!stillExists) {
        await fetch(`${API_BASE}/${key}/${id}`, {
          method: 'DELETE'
        });
      }
    }
  } catch (err) {
    console.error("API Sync error:", err);
  }
}

export function useStore<K extends keyof Store>(key: K): [Store[K], (v: Store[K]) => void] {
  const [val, setVal] = useState<Store[K]>(() => read()[key]);

  useEffect(() => {
    const sync = () => setVal(read()[key]);
    window.addEventListener("muse:update", sync);
    window.addEventListener("storage", sync);

    // Initial fetch from API
    fetch(`${API_BASE}/${key}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          const s = read();
          s[key] = data as Store[K];
          write(s);
          setVal(data as Store[K]);
        }
      })
      .catch(err => console.error("Initial fetch error:", err));

    return () => {
      window.removeEventListener("muse:update", sync);
      window.removeEventListener("storage", sync);
    };
  }, [key]);

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

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
