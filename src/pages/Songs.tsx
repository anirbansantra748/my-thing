import { useState, useEffect, useRef, useMemo } from "react";
import { useStore, uid, SongEntry, AlbumEntry } from "@/lib/store";
import { useNavigate } from "react-router-dom";
import {
  Plus, Search, Play, Pause, X, Music,
  MoreHorizontal, ChevronLeft, LayoutGrid, List as ListIcon,
  Heart, Clock, Disc, Eye, EyeOff, FolderPlus, Trash2, Edit2, Check,
  ExternalLink, Layers, Shuffle, SkipForward, SkipBack, Repeat,
  Volume2, Maximize2, ListMusic, Home, Settings, Minimize2, Mic2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, Empty } from "./Movies";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function Songs() {
  const navigate = useNavigate();
  const [songs, setSongs] = useStore("songs");
  const [albums, setAlbums] = useStore("albums");
  const [search, setSearch] = useState("");
  const [currentAlbumId, setCurrentAlbumId] = useState<string | null>(null);
  const [editingAlbum, setEditingAlbum] = useState<AlbumEntry | null>(null);
  const [playing, setPlaying] = useState<SongEntry | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [isLyricsLoading, setIsLyricsLoading] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [addSongToAlbum, setAddSongToAlbum] = useState<string | null>(null);
  const [isShuffle, setIsShuffle] = useState(false);
  const [likedAlbums, setLikedAlbums] = useState<string[]>([]);

  const toggleLikeAlbum = (id: string) => {
    setLikedAlbums(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };
  const [isSeeking, setIsSeeking] = useState(false);
  const [volume, setVolume] = useState(100);
  const [isExpanded, setIsExpanded] = useState(false);
  const [quality, setQuality] = useState<string>('tiny');

  const playerRef = useRef<any>(null);
  const progressInterval = useRef<any>(null);

  const albumSongs = useMemo(() =>
    songs.filter(s => s.albumId === currentAlbumId),
    [songs, currentAlbumId]
  );

  // Playback Progress Tracker
  useEffect(() => {
    if (isPlaying && !isSeeking) {
      progressInterval.current = setInterval(() => {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
          setCurrentTime(playerRef.current.getCurrentTime());
          const dur = playerRef.current.getDuration();
          if (dur > 0) setDuration(dur);
        }
      }, 200);
    } else {
      if (progressInterval.current) clearInterval(progressInterval.current);
    }
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [isPlaying, isSeeking]);

  const playNext = () => {
    if (albumSongs.length === 0) return;
    let nextIndex = 0;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * albumSongs.length);
    } else {
      const currentIndex = albumSongs.findIndex(s => s.id === playing?.id);
      nextIndex = (currentIndex + 1) % albumSongs.length;
    }
    setPlaying(albumSongs[nextIndex]);
  };

  // Fetch Lyrics
  useEffect(() => {
    if (playing && showLyrics) {
      const fetchLyrics = async () => {
        setIsLyricsLoading(true);
        setLyrics(null);
        try {
          const res = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(playing.artist)}/${encodeURIComponent(playing.title)}`);
          const data = await res.json();
          if (data.lyrics) {
            setLyrics(data.lyrics);
          } else {
            setLyrics("Lyrics not found for this track.");
          }
        } catch (err) {
          setLyrics("Could not connect to lyrics server.");
        } finally {
          setIsLyricsLoading(false);
        }
      };
      fetchLyrics();
    }
  }, [playing?.id, showLyrics]);

  const playPrev = () => {
    if (albumSongs.length === 0) return;
    const currentIndex = albumSongs.findIndex(s => s.id === playing?.id);
    const prevIndex = (currentIndex - 1 + albumSongs.length) % albumSongs.length;
    setPlaying(albumSongs[prevIndex]);
  };

  // YouTube API initialization
  useEffect(() => {
    if (!playing) return;

    const getYouTubeId = (url: string) => {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
    };

    const ytId = getYouTubeId(playing.url);
    if (!ytId) return;

    // Reset progress for the new song
    setCurrentTime(0);
    setDuration(0);

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) return;

      const targetId = isExpanded ? 'yt-player-expanded' : 'yt-player';
      const container = document.getElementById(targetId);
      if (!container) return;

      // REUSE PLAYER: If player exists and is in the correct container, just load new video
      // This is CRITICAL for background play on mobile
      if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
        const iframe = playerRef.current.getIframe();
        if (iframe && (iframe.id === targetId || iframe.parentElement?.id === targetId)) {
          playerRef.current.loadVideoById({
            videoId: ytId,
            startSeconds: 0,
            suggestedQuality: quality
          });
          return;
        }
      }

      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch (e) { }
      }

      playerRef.current = new window.YT.Player(targetId, {
        width: isExpanded ? '100%' : '200',
        height: isExpanded ? '100%' : '112',
        videoId: ytId,
        playerVars: {
          autoplay: 1,
          controls: 1,
          rel: 0,
          iv_load_policy: 3,
          vq: 'tiny',
          origin: window.location.origin,
          modestbranding: 1
        },
        events: {
          onReady: (event: any) => {
            const target = event.target;
            if (!target) return;
            try {
              target.setPlaybackQuality(quality);
              target.setVolume(volume);
              if (isPlaying) target.playVideo();
              if (currentTime > 0) target.seekTo(currentTime, true);
              setDuration(target.getDuration());
            } catch (err) {
              console.error("YT Ready Error:", err);
            }
          },
          onStateChange: (event: any) => {
            const target = event.target;
            if (!target || !window.YT) return;

            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              setTimeout(() => {
                try { target.setPlaybackQuality(quality); } catch { }
              }, 500);
            }
            if (event.data === window.YT.PlayerState.PAUSED) setIsPlaying(false);
            if (event.data === window.YT.PlayerState.ENDED) {
              setIsPlaying(false);
              playNext();
            }
          },
          onPlaybackQualityChange: (event: any) => {
            if (event.data !== quality) {
              try { event.target.setPlaybackQuality(quality); } catch { }
            }
          },
          onError: () => {
            toast.error("Video unavailable, skipping...");
            playNext();
          }
        }
      });
    };

    if (window.YT && window.YT.Player) {
      // Small delay to ensure DOM is ready, especially for the expanded modal
      const timer = setTimeout(initPlayer, 100);
      return () => clearTimeout(timer);
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    // Media Session API for Background Play & OS Controls
    if ('mediaSession' in navigator && playing) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: playing.title,
        artist: playing.artist,
        artwork: [
          { src: playing.cover || '', sizes: '512x512', type: 'image/jpeg' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => {
        if (playerRef.current) playerRef.current.playVideo();
        setIsPlaying(true);
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        if (playerRef.current) playerRef.current.pauseVideo();
        setIsPlaying(false);
      });
      navigator.mediaSession.setActionHandler('previoustrack', playPrev);
      navigator.mediaSession.setActionHandler('nexttrack', playNext);
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined && playerRef.current) {
          playerRef.current.seekTo(details.seekTime, true);
        }
      });
    }
  }, [playing, isExpanded]);

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) playerRef.current.pauseVideo();
    else playerRef.current.playVideo();
  };

  const handleSeek = (val: number[]) => {
    setCurrentTime(val[0]);
    setIsSeeking(true);
  };

  const commitSeek = (val: number[]) => {
    if (playerRef.current) {
      playerRef.current.seekTo(val[0], true);
    }
    setIsSeeking(false);
  };

  const handleVolumeChange = (val: number[]) => {
    setVolume(val[0]);
    if (playerRef.current) playerRef.current.setVolume(val[0]);
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const changeQuality = (q: string) => {
    setQuality(q);
    if (playerRef.current) {
      try {
        playerRef.current.setPlaybackQuality(q);
      } catch (e) { }
    }
  };

  const createAlbum = () => {
    const newAlbum: AlbumEntry = {
      id: uid(),
      title: "New Album",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=800&q=80"
    };
    setAlbums([newAlbum, ...albums]);
    setEditingAlbum(newAlbum);
  };

  const deleteAlbum = (id: string) => {
    if (confirm("Delete this album and all its songs?")) {
      setAlbums(albums.filter(a => a.id !== id));
      setSongs(songs.filter(s => s.albumId !== id));
      if (currentAlbumId === id) setCurrentAlbumId(null);
    }
  };

  const saveAlbum = (a: AlbumEntry) => {
    setAlbums(albums.map(item => item.id === a.id ? { ...a, updatedAt: Date.now() } : item));
    setEditingAlbum(null);
  };

  const filteredAlbums = useMemo(() =>
    albums.filter(a => a.title.toLowerCase().includes(search.toLowerCase())),
    [albums, search]
  );

  const currentAlbum = albums.find(a => a.id === currentAlbumId);

  return (
    <div className="min-h-screen bg-[#FCFAF7] text-[#2D2D2D] pb-52 font-sans selection:bg-plum/10 selection:text-plum">
      {/* Immersive Header Navigation */}
      <nav className="sticky top-0 z-[60] bg-white/60 backdrop-blur-3xl border-b border-black/5 px-8 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            {currentAlbumId ? (
              <Button variant="ghost" size="icon" onClick={() => setCurrentAlbumId(null)} className="rounded-2xl bg-black/5 hover:bg-black/10 transition-all">
                <ChevronLeft className="w-5 h-5" />
              </Button>
            ) : (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate("/")}
                className="w-10 h-10 rounded-2xl bg-plum/10 flex items-center justify-center hover:bg-plum/20 transition-all"
              >
                <Home className="w-5 h-5 text-plum" />
              </Button>
            )}
            <div>
              <h1 className="text-xl font-display font-black tracking-tight text-plum leading-none">
                {currentAlbumId ? currentAlbum?.title : "Music Haven"}
              </h1>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-olive/30 mt-1">
                {currentAlbumId ? "Collection" : "Studio Library"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group hidden sm:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-olive/20 group-focus-within:text-plum transition-colors" />
              <Input
                placeholder="Search collection..."
                className="pl-12 w-72 bg-black/5 border-0 focus-visible:ring-2 ring-plum/20 rounded-2xl h-11 transition-all"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Button onClick={createAlbum} className="rounded-2xl bg-[#2D2D2D] text-white hover:bg-plum h-11 px-6 gap-2 shadow-xl shadow-black/5 transition-all active:scale-95">
              <FolderPlus className="w-4 h-4" />
              <span className="font-bold text-sm"></span>
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-12">
        {!currentAlbumId ? (
          /* "Spotify God Tier" Album Grid */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-10">
            {filteredAlbums.map(a => (
              <div key={a.id} className="group relative">
                <div
                  onClick={() => setCurrentAlbumId(a.id)}
                  className="aspect-square rounded-[3.5rem] overflow-hidden bg-white shadow-[0_30px_60px_rgba(0,0,0,0.06)] border border-black/5 cursor-pointer transition-all duration-700 group-hover:-translate-y-4 group-hover:shadow-[0_50px_100px_rgba(0,0,0,0.12)] group-hover:border-plum/20"
                >
                  <img src={a.cover} alt="" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-plum/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center backdrop-blur-[2px]">
                    <div className="w-20 h-20 rounded-[2.5rem] bg-white text-plum flex items-center justify-center transform translate-y-8 group-hover:translate-y-0 transition-all duration-700 shadow-2xl">
                      <Play className="w-10 h-10 fill-current ml-1" />
                    </div>
                  </div>
                </div>
                <div className="mt-8 flex items-start justify-between px-2">
                  <div>
                    <h3 className="font-display font-black text-2xl text-[#2D2D2D] leading-tight tracking-tight group-hover:text-plum transition-colors">{a.title}</h3>
                    <p className="text-[10px] font-black text-olive/30 mt-1 uppercase tracking-widest flex items-center gap-2">
                      <Layers className="w-3 h-3" /> {songs.filter(s => s.albumId === a.id).length} Tracks
                    </p>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <Button variant="ghost" size="icon" onClick={() => setEditingAlbum(a)} className="rounded-2xl bg-black/5 hover:text-plum transition-all">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); deleteAlbum(a.id); }} className="rounded-2xl bg-black/5 hover:text-red-500 hover:bg-red-50 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Immersive Track List View */
          <div className="space-y-12 animate-in fade-in duration-1000">
            {/* God Tier Header */}
            <div className="relative group/header rounded-[3rem] overflow-hidden bg-white shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-black/5">
              <div className="absolute inset-0 bg-gradient-to-br from-plum/5 to-transparent pointer-events-none" />
              <div className="relative flex flex-col md:flex-row items-center gap-10 p-8">
                <div className="relative w-56 h-56 rounded-[2.5rem] overflow-hidden shadow-2xl group-hover/header:scale-[1.02] transition-transform duration-1000 ring-4 ring-white">
                  <img src={currentAlbum?.cover} alt="" className="w-full h-full object-cover" />
                  <Button
                    onClick={() => albumSongs[0] && setPlaying(albumSongs[0])}
                    className="absolute bottom-4 right-4 w-12 h-12 rounded-2xl bg-white text-plum shadow-2xl hover:scale-110 active:scale-95 transition-all"
                  >
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  </Button>
                </div>
                <div className="flex-1 text-center md:text-left pt-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-plum/10 text-plum text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                    <Disc className="w-3 h-3 animate-spin-slow" /> Studio Collection
                  </div>
                  <h2 className="text-4xl md:text-5xl font-display font-black text-[#2D2D2D] tracking-tighter mb-4 leading-none">{currentAlbum?.title}</h2>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-black/5 flex items-center justify-center text-olive/40">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-olive/20 uppercase tracking-widest">Added on</p>
                        <p className="text-sm font-bold">{new Date(currentAlbum?.createdAt || 0).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-black/5 flex items-center justify-center text-olive/40">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-olive/20 uppercase tracking-widest">Track count</p>
                        <p className="text-sm font-bold">{albumSongs.length} Tracks</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* God Tier Action Bar - Ultra Compact Row */}
            <div className="flex items-center gap-2 px-6">
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  onClick={() => albumSongs[0] && setPlaying(albumSongs[0])}
                  className="rounded-xl bg-plum text-white hover:bg-plum/90 h-9 px-5 font-black text-[11px] shadow-lg shadow-plum/20 transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
                >
                  Play Album
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsShuffle(!isShuffle)}
                  className={`rounded-xl w-9 h-9 transition-all shrink-0 ${isShuffle ? 'bg-plum/10 text-plum' : 'bg-black/5 text-black hover:bg-black/10'}`}
                >
                  <Shuffle className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => currentAlbumId && toggleLikeAlbum(currentAlbumId)}
                  className={`rounded-xl w-9 h-9 transition-all shrink-0 ${currentAlbumId && likedAlbums.includes(currentAlbumId) ? 'bg-red-500/10 text-red-500' : 'bg-black/5 text-black hover:bg-black/10'}`}
                >
                  <Heart className={`w-4 h-4 ${currentAlbumId && likedAlbums.includes(currentAlbumId) ? 'fill-current' : ''}`} />
                </Button>
              </div>
              <div className="h-5 w-px bg-black/5 shrink-0 mx-1" />
              <Button
                onClick={() => setAddSongToAlbum(currentAlbumId)}
                className="rounded-xl bg-[#2D2D2D] text-white hover:bg-plum h-9 px-4 gap-2 transition-all shadow-lg shadow-black/5 whitespace-nowrap shrink-0 text-[11px] font-bold"
              >
                <Plus className="w-4 h-4" /> Add Songs
              </Button>
              <div className="h-5 w-px bg-black/5 shrink-0 mx-1" />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => currentAlbum && setEditingAlbum(currentAlbum)}
                className="rounded-xl w-9 h-9 bg-black/5 text-black hover:bg-black/10 hover:text-plum transition-all shrink-0"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => currentAlbumId && deleteAlbum(currentAlbumId)}
                className="rounded-xl w-9 h-9 bg-black/5 text-black hover:bg-red-50 hover:text-red-500 transition-all shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Premium Track List */}
            <div className="bg-white rounded-[4rem] border border-black/5 shadow-[0_40px_100px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="flex items-center px-12 py-8 border-b border-black/5 text-[10px] font-black uppercase tracking-[0.3em] text-olive/30">
                <span className="w-12">#</span>
                <span className="flex-1">Title & Artist</span>
                <span className="hidden lg:block w-48 text-right">Added</span>
                <span className="w-24 text-right">Action</span>
              </div>
              <div className="divide-y divide-black/5">
                {albumSongs.map((s, idx) => (
                  <div
                    key={s.id}
                    onClick={() => setPlaying(s)}
                    className={`flex items-center px-12 py-7 cursor-pointer transition-all group ${playing?.id === s.id ? 'bg-plum/[0.03]' : 'hover:bg-black/[0.02]'}`}
                  >
                    <div className="w-12 flex items-center">
                      {playing?.id === s.id && isPlaying ? (
                        <div className="flex items-end gap-1 h-5">
                          <div className="w-1 bg-plum animate-visualizer-1 rounded-full" />
                          <div className="w-1 bg-plum animate-visualizer-2 rounded-full" />
                          <div className="w-1 bg-plum animate-visualizer-3 rounded-full" />
                        </div>
                      ) : (
                        <span className={`text-xs font-black ${playing?.id === s.id ? 'text-plum' : 'text-olive/20'}`}>
                          {(idx + 1).toString().padStart(2, '0')}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 flex items-center gap-6 min-w-0">
                      <div className="relative w-16 h-16 rounded-[1.5rem] overflow-hidden bg-black/5 shadow-sm flex-shrink-0 group-hover:shadow-xl transition-all duration-500">
                        <img src={s.cover} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      </div>
                      <div className="min-w-0">
                        <h4 className={`font-black text-xl truncate tracking-tight transition-colors mb-1 ${playing?.id === s.id ? 'text-plum' : 'text-[#2D2D2D]'}`}>{s.title}</h4>
                        <p className="text-[11px] text-olive/40 font-black uppercase tracking-widest">{s.artist}</p>
                      </div>
                    </div>
                    <div className="hidden lg:block w-48 text-right text-[11px] font-black text-olive/20 uppercase tracking-widest tabular-nums">
                      {new Date(s.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                    </div>
                    <div className="w-24 flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                      <Button variant="ghost" size="icon" onClick={(e) => { 
                        e.stopPropagation(); 
                        if (confirm(`Are you sure you want to delete "${s.title}"?`)) {
                          setSongs(songs.filter(item => item.id !== s.id));
                        }
                      }}
                        className="rounded-2xl w-11 h-11 text-olive/20 hover:text-red-500 hover:bg-red-500/5 transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Album Edit Dialog */}
      {editingAlbum && (
        <Dialog onClose={() => setEditingAlbum(null)}>
          <div className="p-12 space-y-10">
            <div>
              <h2 className="text-4xl font-display font-black text-[#2D2D2D] tracking-tighter">Album Details</h2>
              <p className="text-xs font-bold text-olive/40 uppercase tracking-widest mt-2">Personalize your collection</p>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-olive/40 ml-1">Album Title</label>
                <Input
                  value={editingAlbum.title}
                  onChange={e => setEditingAlbum({ ...editingAlbum, title: e.target.value })}
                  className="bg-black/5 border-0 text-xl font-black rounded-3xl h-16 px-8 focus-visible:ring-plum/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-olive/40 ml-1">Cover Image URL</label>
                <Input
                  value={editingAlbum.cover}
                  onChange={e => setEditingAlbum({ ...editingAlbum, cover: e.target.value })}
                  className="bg-black/5 border-0 rounded-2xl h-14 px-7 focus-visible:ring-plum/20"
                />
              </div>
            </div>
            <div className="flex items-center justify-between pt-8 border-t border-black/5">
              <Button variant="ghost" onClick={() => deleteAlbum(editingAlbum.id)} className="text-red-500 hover:bg-red-50 rounded-2xl px-8 h-12 gap-2 font-bold transition-all">
                <Trash2 className="w-5 h-5" /> Delete Album
              </Button>
              <Button onClick={() => saveAlbum(editingAlbum)} className="bg-plum text-white rounded-3xl px-12 h-14 font-black shadow-2xl shadow-plum/20 active:scale-95 transition-all">Save Changes</Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Add Song Dialog */}
      {addSongToAlbum && (
        <Dialog onClose={() => setAddSongToAlbum(null)}>
          <SongDialog
            albumId={addSongToAlbum}
            onClose={() => setAddSongToAlbum(null)}
            onSave={(s) => {
              if (Array.isArray(s)) setSongs([...s, ...songs]);
              else setSongs([s, ...songs]);
              setAddSongToAlbum(null);
              toast.success("Library updated");
            }}
          />
        </Dialog>
      )}

      {/* "God Tier" Spotify Compact Player Bar */}
      {playing && (
        <>
          {/* Enhanced Video Proof - Minimalist Floating */}
          <div
            className={`fixed bottom-48 right-10 w-[400px] aspect-video rounded-[3rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)] border-4 border-white/20 transition-all duration-1000 z-[150] pointer-events-auto bg-black ${showVideo ? 'opacity-100 scale-100 translate-y-0 rotate-0' : 'opacity-0 scale-50 translate-y-20 rotate-6 pointer-events-none'
              }`}
          >
            <div className="w-full h-full flex items-center justify-center bg-black overflow-hidden relative">
              <div id="yt-player" className="origin-center scale-[2.2]" style={{ width: '200px', height: '112px' }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
            </div>
            <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-xl px-4 py-2 rounded-2xl text-[10px] font-black text-white z-20 border border-white/10 flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              LOW BITRATE 144P LIVE
            </div>
          </div>

          {/* THE PLAYER CARD - COMPACT GOD TIER */}
          <div className="fixed inset-x-0 bottom-8 z-[140] px-6 pointer-events-none">
            <div className="max-w-4xl mx-auto relative group/player">
              {/* Refined Glow */}
              <div className="absolute -inset-4 bg-plum/20 blur-[60px] rounded-[3rem] opacity-0 group-hover/player:opacity-100 transition-opacity duration-1000" />

              <div className="relative bg-[#121212]/95 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.6)] overflow-hidden pointer-events-auto flex flex-col">

                <div className="flex flex-col p-4 px-6 md:px-10 gap-3">
                  {/* Top Tier: Primary Info & Controls */}
                  <div className="flex items-center justify-between gap-4">

                    {/* Left: Track Signature */}
                    <div 
                      className="flex items-center gap-3 md:gap-4 flex-1 min-w-0 md:max-w-[300px] cursor-pointer"
                      onClick={() => setIsExpanded(true)}
                    >
                      <div className="relative shrink-0 w-12 h-12 md:w-14 md:h-14 group/thumb">
                        <div className="w-full h-full rounded-xl md:rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black/40">
                          <img src={playing.cover} alt="" className="w-full h-full object-cover transition-transform group-hover/thumb:scale-110" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
                            <Maximize2 className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 md:w-5 md:h-5 rounded-full bg-[#121212] border-2 border-[#121212] flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-display text-sm md:text-base font-black truncate text-white tracking-tight leading-tight mb-1">{playing.title}</h4>
                        <p className="text-[9px] md:text-[10px] font-black text-white/30 uppercase tracking-[0.2em] truncate">{playing.artist}</p>
                      </div>
                    </div>

                    {/* Center: Playback Commands (Always Visible) */}
                    <div className="flex items-center gap-4 md:gap-8 shrink-0">
                      <Button variant="ghost" size="icon" onClick={() => setIsShuffle(!isShuffle)}
                        className={`hidden sm:flex rounded-xl w-9 h-9 transition-all ${isShuffle ? 'text-plum bg-plum/10' : 'text-white/20 hover:text-white'}`}>
                        <Shuffle className="w-4 h-4" />
                      </Button>

                      <div className="flex items-center gap-2 md:gap-4">
                        <Button variant="ghost" size="icon" onClick={playPrev} className="rounded-xl w-9 h-9 md:w-10 md:h-10 text-white/40 hover:text-white transition-all">
                          <SkipBack className="w-5 h-5 md:w-6 md:h-6 fill-current" />
                        </Button>

                        <Button
                          onClick={togglePlay}
                          className="rounded-xl md:rounded-[1.5rem] w-12 h-12 md:w-16 md:h-16 bg-white text-black hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center justify-center"
                        >
                          {isPlaying ? <Pause className="w-6 h-6 md:w-8 md:h-8" fill="currentColor" /> : <Play className="w-6 h-6 md:w-8 md:h-8 ml-1" fill="currentColor" />}
                        </Button>

                        <Button variant="ghost" size="icon" onClick={playNext} className="rounded-xl w-9 h-9 md:w-10 md:h-10 text-white/40 hover:text-white transition-all">
                          <SkipForward className="w-5 h-5 md:w-6 md:h-6 fill-current" />
                        </Button>
                      </div>

                      <Button variant="ghost" size="icon" className="hidden sm:flex rounded-xl w-9 h-9 text-white/20 hover:text-white transition-all">
                        <Repeat className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Right: Master Utilities (Responsive) */}
                    <div className="flex items-center justify-end gap-2 md:gap-6 md:min-w-[150px]">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowVideo(!showVideo)}
                        className={`hidden md:flex rounded-xl w-10 h-10 transition-all ${showVideo ? 'text-plum bg-plum/10' : 'text-white/20 hover:text-white'}`}
                      >
                        <Eye className="w-5 h-5" />
                      </Button>

                      <div className="hidden lg:flex items-center gap-3 w-32 group/volume">
                        <Volume2 className="w-4 h-4 text-white/20 group-hover/volume:text-white transition-colors" />
                        <Slider
                          value={[volume]}
                          max={100}
                          step={1}
                          onValueChange={handleVolumeChange}
                          className="flex-1 cursor-pointer opacity-30 group-hover/volume:opacity-100 transition-opacity"
                        />
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setPlaying(null)}
                        className="rounded-full w-9 h-9 md:w-10 md:h-10 text-white/10 hover:text-red-500 hover:bg-red-500/10 transition-all"
                      >
                        <X className="w-5 h-5 md:w-6 md:h-6" />
                      </Button>
                    </div>
                  </div>

                  {/* Bottom Tier: Precision Scrubber - Fluid Red Style */}
                  <div className="flex items-center gap-3 md:gap-4 px-1">
                    <span className="text-[9px] md:text-[10px] font-black text-white/20 tabular-nums w-8 md:w-10 text-right">{formatTime(currentTime)}</span>
                    <div className="flex-1 relative h-6 group/scrub flex items-center">
                      <div className="absolute inset-x-0 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-red-500 via-red-600 to-red-500 shadow-[0_0_25px_rgba(239,68,68,0.3)]"
                          style={{ width: `${(currentTime / (duration || 1)) * 100}%` }} />
                      </div>
                      <Slider
                        value={[currentTime]}
                        max={duration || 100}
                        step={0.1}
                        onValueChange={handleSeek}
                        onValueCommit={commitSeek}
                        className="w-full cursor-pointer opacity-0 hover:opacity-100 transition-opacity z-10 player-slider"
                      />
                    </div>
                    <span className="text-[9px] md:text-[10px] font-black text-white/20 tabular-nums w-8 md:w-10">{formatTime(duration)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* God Tier Expanded Player UI */}
      {playing && isExpanded && (
        <div className="fixed inset-0 z-[200] bg-black animate-in fade-in zoom-in duration-500 overflow-y-auto scrollbar-hide">
          <div className="min-h-screen flex flex-col md:flex-row p-8 md:p-16 gap-12 max-w-7xl mx-auto">
            
            {/* Background Atmosphere */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
               <img src={playing.cover} className="w-full h-full object-cover opacity-20 blur-[100px] scale-150" alt="" />
            </div>

            {/* Close Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsExpanded(false)}
              className="fixed top-8 right-8 z-[210] rounded-full w-14 h-14 bg-white/5 hover:bg-white/10 text-white transition-all hover:rotate-90"
            >
              <X className="w-8 h-8" />
            </Button>

            {/* Left Column: Visuals & Player */}
            <div className="relative z-[205] flex-1 flex flex-col gap-8">
              <div className="aspect-square w-full max-w-[500px] mx-auto rounded-[4rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.6)] border-8 border-white/5">
                <img src={playing.cover} alt="" className="w-full h-full object-cover" />
              </div>

              <div className="text-center md:text-left">
                <h2 className="text-4xl md:text-6xl font-display font-black text-white tracking-tighter mb-4">{playing.title}</h2>
                <div className="flex items-center justify-center md:justify-start gap-4 text-white/40 font-black uppercase tracking-[0.3em]">
                   <span className="text-plum">{playing.artist}</span>
                   <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                   <span>Studio Master</span>
                </div>
              </div>

              {/* YouTube IFrame - Large Format */}
              <div className="rounded-[3rem] overflow-hidden bg-black/40 border border-white/5 aspect-video w-full max-w-2xl mx-auto relative group">
                <div id="yt-player-expanded" className="w-full h-full" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                
                {/* Visualizer Overlay */}
                {isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center gap-1.5 opacity-20 pointer-events-none">
                    {[...Array(12)].map((_, i) => (
                      <div key={i} 
                           className="w-1.5 bg-white rounded-full animate-visualizer" 
                           style={{ 
                             height: '40px', 
                             animationDelay: `${i * 0.1}s`,
                             animationDuration: `${0.5 + Math.random()}s`
                           }} />
                    ))}
                  </div>
                )}

                <div className="absolute bottom-6 left-6 flex items-center gap-4">
                  <div className="bg-black/60 backdrop-blur-xl px-4 py-2 rounded-2xl text-[10px] font-black text-white flex items-center gap-3 border border-white/10">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    LIVE QUALITY: {quality.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>

{/* Right Column: Controls & Extra Info */}
            <div className="relative z-[205] w-full md:w-[400px] flex flex-col gap-10 pt-12 md:pt-0">
               
               {/* Controls Dashboard */}
               <div className="bg-white/5 backdrop-blur-3xl rounded-[3rem] p-10 border border-white/10 space-y-12">
                   <div className="flex items-center justify-between">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setShowLyrics(!showLyrics)} 
                      className={`w-12 h-12 rounded-2xl transition-all ${showLyrics ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 text-white/20 hover:text-white'}`}
                    >
                      <Mic2 className="w-6 h-6" />
                    </Button>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setIsShuffle(!isShuffle)} className={isShuffle ? 'text-plum' : 'text-white/20'}>
                        <Shuffle className="w-6 h-6" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-8">
                     <div className="flex items-center gap-10">
                        <Button variant="ghost" size="icon" onClick={playPrev} className="text-white/40 hover:text-white scale-125 transition-all">
                          <SkipBack className="w-8 h-8 fill-current" />
                        </Button>
                        <Button onClick={togglePlay} className="w-24 h-24 rounded-full bg-white text-black hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center justify-center">
                          {isPlaying ? <Pause className="w-10 h-10" fill="currentColor" /> : <Play className="w-10 h-10 ml-1" fill="currentColor" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={playNext} className="text-white/40 hover:text-white scale-125 transition-all">
                          <SkipForward className="w-8 h-8 fill-current" />
                        </Button>
                     </div>

                     <div className="w-full space-y-4">
                        <div className="flex justify-between text-[10px] font-black text-white/20 uppercase tracking-widest">
                           <span>{formatTime(currentTime)}</span>
                           <span>{formatTime(duration)}</span>
                        </div>
                        <Slider 
                          value={[currentTime]} 
                          max={duration || 100} 
                          step={0.1} 
                          onValueChange={handleSeek}
                          onValueCommit={commitSeek}
                          className="w-full cursor-pointer player-slider-dark"
                        />
                     </div>
                  </div>

                  {/* Lyrics Display */}
                  <div className={`transition-all duration-700 overflow-hidden ${showLyrics ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="space-y-6 text-center md:text-left pt-6 border-t border-white/5">
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Lyrics Mode</p>
                       <div className="space-y-4 font-display text-xl md:text-2xl font-bold text-white/60">
                          {isLyricsLoading ? (
                            <p className="animate-pulse">Fetching lyrics from studio...</p>
                          ) : lyrics ? (
                            <div className="whitespace-pre-line text-white leading-relaxed max-h-[400px] overflow-y-auto pr-4 scrollbar-hide">
                              {lyrics}
                            </div>
                          ) : (
                            <>
                              <p className="text-white">Looking for the right words...</p>
                              <p>Connecting to studio master...</p>
                              <p>Lyrics will appear as the track progresses.</p>
                            </>
                          )}
                       </div>
                    </div>
                  </div>
               </div>

               {/* Quality Selection Dashboard */}
               <div className="bg-white/5 backdrop-blur-3xl rounded-[3rem] p-8 border border-white/10">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-6">Playback Assurance</p>
                  <div className="grid grid-cols-2 gap-3">
                    {['tiny', 'small', 'medium', 'large', 'hd720'].map((q) => (
                      <button
                        key={q}
                        onClick={() => changeQuality(q)}
                        className={`h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          quality === q ? 'bg-white text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'
                        }`}
                      >
                        {q === 'hd720' ? '720p HD' : q === 'tiny' ? '144p' : q}
                      </button>
                    ))}
                  </div>
               </div>

               {/* About Artist Section */}
               <div className="bg-white/5 backdrop-blur-3xl rounded-[3rem] p-10 border border-white/10 space-y-6 group/artist">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-display font-black text-white tracking-tight">About the artist</h3>
                    <Mic2 className="w-5 h-5 text-plum animate-pulse" />
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/10 shadow-2xl transition-transform group-hover/artist:scale-110">
                       <img src={playing.cover} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                       <div className="text-white font-black text-lg leading-none mb-1">{playing.artist}</div>
                       <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Verified Creator</div>
                    </div>
                  </div>
                  <p className="text-white/40 text-sm leading-relaxed font-medium">
                    This artist is currently trending in your studio collection. Most played track this week from the {playing.albumId ? 'same album' : 'library'}.
                  </p>
               </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;400;600;800&display=swap');
        
        body {
          font-family: 'Plus Jakarta Sans', sans-serif;
          letter-spacing: -0.02em;
        }

        @keyframes visualizer {
          0% { height: 20%; opacity: 0.3; transform: scaleY(0.5); }
          50% { height: 100%; opacity: 1; transform: scaleY(1); }
          100% { height: 20%; opacity: 0.3; transform: scaleY(0.5); }
        }
        .animate-visualizer-1 { animation: visualizer 0.5s ease-in-out infinite; }
        .animate-visualizer-2 { animation: visualizer 0.8s ease-in-out infinite; }
        .animate-visualizer-3 { animation: visualizer 0.6s ease-in-out infinite; }
        
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .player-slider [data-radix-collection-item] {
          background-color: white !important;
          border-color: #ef4444 !important;
          box-shadow: 0 0 15px rgba(239, 68, 68, 0.4) !important;
        }
      `}} />
    </div>
  );
}

function SongDialog({ albumId, onClose, onSave }: {
  albumId: string; onClose: () => void; onSave: (s: SongEntry | SongEntry[]) => void;
}) {
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [bulkUrls, setBulkUrls] = useState("");
  const [s, setS] = useState<Partial<SongEntry>>({
    id: uid(),
    title: "",
    artist: "",
    url: "",
    albumId: albumId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    cover: ""
  });

  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const autoFill = async (url: string) => {
    const id = getYouTubeId(url);
    if (!id) return;
    setS(prev => ({ ...prev, url, cover: `https://img.youtube.com/vi/${id}/maxresdefault.jpg` }));

    try {
      const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (data.title) setS(prev => ({ ...prev, title: data.title, artist: data.author_name }));
    } catch { }
  };

  const handleBulkAdd = async () => {
    const lines = bulkUrls.split("\n").filter(l => l.trim().length > 0);
    const newSongs: SongEntry[] = [];

    toast.promise(Promise.all(lines.map(async (url) => {
      const id = getYouTubeId(url);
      if (id) {
        let title = "Loading...";
        let artist = "Unknown Artist";
        try {
          const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
          const data = await res.json();
          title = data.title || "YouTube Track";
          artist = data.author_name || "Unknown";
        } catch { }

        newSongs.push({
          id: uid(),
          title,
          artist,
          url: url.trim(),
          albumId,
          cover: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
      }
    })), {
      loading: "Processing tracks...",
      success: () => {
        onSave(newSongs);
        return `Added ${newSongs.length} tracks to album`;
      },
      error: "Failed to process some tracks"
    });
  };

  return (
    <div className="p-12 space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-display font-black text-[#2D2D2D] tracking-tighter">Add Music</h2>
          <p className="text-xs font-bold text-olive/40 uppercase tracking-widest mt-2">
            {mode === "single" ? "Paste a link to begin" : "Batch import your tracks"}
          </p>
        </div>
        <div className="flex bg-black/5 rounded-3xl p-1.5 ring-1 ring-black/5">
          <Button
            variant={mode === "single" ? "default" : "ghost"}
            size="sm"
            onClick={() => setMode("single")}
            className={`rounded-2xl px-6 h-9 text-[11px] font-black uppercase tracking-wider transition-all ${mode === "single" ? "bg-white text-plum shadow-lg shadow-black/5" : "text-olive/40"}`}
          >Single</Button>
          <Button
            variant={mode === "bulk" ? "default" : "ghost"}
            size="sm"
            onClick={() => setMode("bulk")}
            className={`rounded-2xl px-6 h-9 text-[11px] font-black uppercase tracking-wider transition-all ${mode === "bulk" ? "bg-white text-plum shadow-lg shadow-black/5" : "text-olive/40"}`}
          >Bulk Add</Button>
        </div>
      </div>

      {mode === "single" ? (
        <div className="space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-olive/40 ml-2">Video Destination</label>
            <Input
              placeholder="Paste YouTube URL..."
              onChange={e => autoFill(e.target.value)}
              className="bg-black/5 border-0 rounded-3xl h-16 px-8 text-lg font-medium focus-visible:ring-plum/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-olive/40 ml-2">Track Title</label>
              <Input
                placeholder="Song name"
                value={s.title}
                onChange={e => setS({ ...s, title: e.target.value })}
                className="bg-black/5 border-0 rounded-2xl h-14 px-7 font-bold focus-visible:ring-plum/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-olive/40 ml-2">Main Artist</label>
              <Input
                placeholder="Artist name"
                value={s.artist}
                onChange={e => setS({ ...s, artist: e.target.value })}
                className="bg-black/5 border-0 rounded-2xl h-14 px-7 font-bold focus-visible:ring-plum/20"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-widest text-olive/40 ml-2">Batch URLs (One per line)</label>
          <textarea
            placeholder="https://youtube.com/watch?v=...&#10;https://youtube.com/watch?v=..."
            value={bulkUrls}
            onChange={e => setBulkUrls(e.target.value)}
            className="w-full h-56 bg-black/5 border-0 rounded-[2.5rem] p-8 font-mono text-sm resize-none focus:ring-2 ring-plum/20 transition-all outline-none"
          />
        </div>
      )}

      <div className="flex justify-end gap-4 pt-8 border-t border-black/5">
        <Button variant="ghost" onClick={onClose} className="rounded-2xl px-10 font-bold h-14 hover:bg-black/5">Cancel</Button>
        {mode === "single" ? (
          <Button
            onClick={() => onSave(s as SongEntry)}
            disabled={!s.title}
            className="bg-plum text-white rounded-[2rem] px-12 h-14 font-black shadow-2xl shadow-plum/20 active:scale-95 transition-all"
          >
            Add Track
          </Button>
        ) : (
          <Button
            onClick={handleBulkAdd}
            disabled={!bulkUrls.trim()}
            className="bg-plum text-white rounded-[2rem] px-12 h-14 font-black shadow-2xl shadow-plum/20 active:scale-95 transition-all"
          >
            Import {bulkUrls.split("\n").filter(l => l.trim()).length} Tracks
          </Button>
        )}
      </div>
    </div>
  );
}
