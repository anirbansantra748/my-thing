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
  id: string; userId: string; kind: "poem" | "drawing"; title: string; cover?: string; background: string; width: number; height: number; items: CanvasItem[]; 
  category?: string; isPinned?: boolean;
  createdAt: number; updatedAt: number;
};

export type JournalEntry = {
  date: string; userId: string; text: string; mood?: string; images?: string[]; updatedAt: number;
};

export type MovieEntry = {
  id: string; userId: string; title: string; year?: string; rating: number; status: "watching" | "watched" | "watchlist"; cover?: string; notes: string; 
  category?: string; isMasterpiece?: boolean; isPinned?: boolean;
  createdAt: number; updatedAt: number;
};

export type SketchDoc = {
  id: string; userId: string; title: string; elements: any[]; appState: any; files?: any; cover?: string; 
  category?: string; isPinned?: boolean;
  createdAt: number; updatedAt: number;
};

export type BookEntry = {
  id: string; userId: string; title: string; author?: string; pagesRead: number; totalPages: number; rating: number; status: "reading" | "finished" | "to-read"; cover?: string; notes: string; 
  category?: string; isMasterpiece?: boolean; isPinned?: boolean;
  createdAt: number; updatedAt: number;
};

export type SongEntry = {
  id: string; userId: string; title: string; artist: string; url: string; cover?: string; notes?: string; rating?: number; albumId?: string; genre?: string; mood?: string; 
  isMasterpiece?: boolean; isPinned?: boolean;
  createdAt: number; updatedAt: number;
};

export type AlbumEntry = {
  id: string; userId: string; title: string; description?: string; cover?: string; createdAt: number; updatedAt: number;
};

export type VaultEntry = {
  id: string; userId: string; title: string; category: string; image: string; notes?: string; isPinned?: boolean; createdAt: number; updatedAt: number;
};

export type PhotoEntry = {
  id: string; userId: string; title?: string; image: string; moment?: string; location?: string; createdAt: number; updatedAt: number;
};

export type AnimeEntry = {
  id: string; userId: string; title: string; status: "watching" | "completed" | "planned" | "dropped"; 
  seasonsWatched: number; totalSeasons: number; 
  episodesWatched?: number; totalEpisodes?: number; // Added for compatibility
  rating: number; cover?: string; notes: string; 
  season?: string; year?: string; isMasterpiece?: boolean; isPinned?: boolean;
  themeSongUrl?: string; createdAt: number; updatedAt: number;
};

const KEY = "muse:store:v2";
const AUTH_KEY = "muse:auth:v1";
export const API_BASE = import.meta.env.VITE_API_URL || "/api";

type Store = {
  canvases: CanvasDoc[]; journal: JournalEntry[]; movies: MovieEntry[]; books: BookEntry[]; sketches: SketchDoc[]; songs: SongEntry[]; albums: AlbumEntry[];
  vault: VaultEntry[]; photos: PhotoEntry[]; anime: AnimeEntry[];
};

const empty: Store = { canvases: [], journal: [], movies: [], books: [], sketches: [], songs: [], albums: [], vault: [], photos: [], anime: [] };

// Memory cache for synchronous access
let memoryStore: Store = empty;
let isInitialized = false;
let hasSynced = new Set<string>();

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
    // Only save essential metadata to LS to prevent quota errors
    const light: any = { ...s };
    if (light.canvases) light.canvases = s.canvases.map(c => ({ id: c.id, title: c.title, kind: c.kind, updatedAt: c.updatedAt, isPinned: c.isPinned })); 
    if (light.sketches) light.sketches = s.sketches.map(sk => ({ id: sk.id, title: sk.title, updatedAt: sk.updatedAt, isPinned: sk.isPinned }));
    if (light.movies) light.movies = s.movies.map(m => ({ id: m.id, title: m.title, updatedAt: m.updatedAt, status: m.status, isPinned: m.isPinned }));
    if (light.books) light.books = s.books.map(b => ({ id: b.id, title: b.title, updatedAt: b.updatedAt, status: b.status, isPinned: b.isPinned }));
    if (light.songs) light.songs = s.songs.map(so => ({ id: so.id, title: so.title, updatedAt: so.updatedAt, isPinned: so.isPinned }));
    if (light.journal) light.journal = s.journal.map(j => ({ date: j.date, mood: j.mood, updatedAt: j.updatedAt }));
    if (light.vault) light.vault = s.vault.map(v => ({ id: v.id, title: v.title, category: v.category, updatedAt: v.updatedAt, isPinned: v.isPinned }));
    if (light.photos) light.photos = s.photos.map(p => ({ id: p.id, moment: p.moment, updatedAt: p.updatedAt }));
    if (light.anime) light.anime = s.anime.map(a => ({ id: a.id, title: a.title, status: a.status, updatedAt: a.updatedAt, isPinned: a.isPinned }));
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
      // Ensure item has an ID and UserID before syncing
      const id = item.id || item.date || uid();
      const updatedItem = { ...item, id: item.id || id, userId: user.id };
      
      const idSearch = item.id || item.date;
      const prevItem = prev.find(p => (p.id || p.date) === idSearch);
      
      if (!prevItem || JSON.stringify(prevItem) !== JSON.stringify(updatedItem)) {
        console.log(`[Store] Syncing ${key}/${id} to cloud...`);
        await fetch(`${API_BASE}/${key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
          body: JSON.stringify(updatedItem)
        });
      }
    }
    for (const item of prev) {
      const id = item.id || item.date;
      if (id && !next.find(n => (n.id || n.date) === id)) {
        console.log(`[Store] Deleting ${key}/${id} from cloud...`);
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
    const syncAuth = () => {
       const newUser = getAuth();
       setUser(newUser);
       if (newUser) hasSynced.clear(); // Reset sync state on user change
    };
    window.addEventListener("muse:update", sync);
    window.addEventListener("muse:auth:update", syncAuth);
    window.addEventListener("storage", sync);

    if (user && !hasSynced.has(key)) {
      hasSynced.add(key);
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
                  // Only migrate if cloud is empty (first sync) OR if item is very new (offline edit)
                  // This prevents deleted items on other devices from being resurrected
                  const isVeryNew = Date.now() - (l.updatedAt || 0) < 1000 * 60 * 60 * 24; // 24 hours
                  if (data.length === 0 || isVeryNew) {
                    merged.push(l);
                    syncWithAPI(key, [l], []);
                    migratedCount++;
                  }
               }
            });

            if (migratedCount > 0) {
               import('sonner').then(({ toast }) => {
                  toast.success(`Cloud Sync: ${migratedCount} ${key} merged with database`);
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
