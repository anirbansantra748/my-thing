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

// Memory cache for synchronous access
let memoryStore: Store = empty;
let isInitialized = false;

// IndexedDB Helper
const DB_NAME = "muse_studio_db";
const STORE_NAME = "store";

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function idbGet(key: string): Promise<any> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const request = tx.objectStore(STORE_NAME).get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    });
  } catch { return null; }
}

async function idbSet(key: string, val: any): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const request = tx.objectStore(STORE_NAME).put(val, key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) { console.error("IDB Write Error:", err); }
}

// Migration and Init
if (typeof window !== "undefined") {
  // Try to load initial data from localStorage for immediate first paint
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) memoryStore = { ...empty, ...JSON.parse(raw) };
  } catch {}

  // Async load from IDB (The real source of truth)
  idbGet(KEY).then(async (cached) => {
    if (cached) {
      memoryStore = { ...empty, ...cached };
    } else if (localStorage.getItem(KEY)) {
      // Migrate from LS to IDB if IDB is empty
      await idbSet(KEY, memoryStore);
    }
    isInitialized = true;
    window.dispatchEvent(new CustomEvent("muse:update"));
  });
}

function read(): Store {
  return memoryStore;
}

function write(s: Store) {
  memoryStore = s;
  // Background save to IDB
  idbSet(KEY, s);
  
  // Still try to save small metadata to localStorage for instant boot, but catch quota errors
  try {
    // @ts-ignore - cleaning heavy fields for LS to prevent quota errors
    const light = { ...s };
    if (light.canvases) light.canvases = s.canvases.map(c => ({ ...c, items: [] })); 
    if (light.sketches) light.sketches = s.sketches.map(sk => ({ ...sk, elements: [] }));
    if (light.movies) light.movies = s.movies.map(m => ({ ...m, cover: "" }));
    if (light.books) light.books = s.books.map(b => ({ ...b, cover: "" }));
    if (light.songs) light.songs = s.songs.map(so => ({ ...so, cover: "" }));
    localStorage.setItem(KEY, JSON.stringify(light));
  } catch (e) {
    // If it fails, we don't care, IDB has it.
  }
  
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
            let migratedCount = 0;
            
            local.forEach((l: any) => {
               const id = l.id || l.date;
               if (!merged.find((m: any) => (m.id || m.date) === id)) {
                  merged.push(l);
                  syncWithAPI(key, [l], []);
                  migratedCount++;
               }
            });

            if (migratedCount > 0) {
               import('sonner').then(({ toast }) => {
                  toast.success(`Cloud Sync: ${migratedCount} ${key} migrated to database`);
               });
            }

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
