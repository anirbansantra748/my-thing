import { useState } from "react";
import { useStore, uid, getAuth, VaultEntry } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, Shield, Search, Eye, EyeOff, Trash2, Pin, 
  FileText, CreditCard, GraduationCap, Briefcase, Heart, MoreVertical,
  ChevronRight, ArrowLeft
} from "lucide-react";
import { Dialog, Empty } from "./Movies";
import { toast } from "sonner";
import { PageTransition } from "@/components/PageTransition";

const CATEGORIES = [
  { id: 'identity', label: 'Identity', icon: CreditCard, color: 'bg-blue-500' },
  { id: 'education', label: 'Education', icon: GraduationCap, color: 'bg-emerald-500' },
  { id: 'work', label: 'Work', icon: Briefcase, color: 'bg-plum' },
  { id: 'medical', label: 'Medical', icon: Heart, color: 'bg-red-500' },
  { id: 'other', label: 'Other', icon: FileText, color: 'bg-olive' },
];

export default function Vault() {
  const [items, setItems] = useStore("vault");
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [isPrivate, setIsPrivate] = useState(true);

  const filtered = items
    .filter(i => {
      const matchSearch = i.title.toLowerCase().includes(search.toLowerCase());
      const matchCat = selectedCat ? i.category === selectedCat : true;
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.updatedAt - a.updatedAt;
    });

  const deleteItem = (id: string) => {
    if (confirm("Delete this document?")) {
      setItems(items.filter(i => i.id !== id));
      toast.success("Document removed from vault");
    }
  };

  const togglePin = (id: string) => {
    setItems(items.map(i => i.id === id ? { ...i, isPinned: !i.isPinned } : i));
  };

  const isPdf = (data?: string) => typeof data === 'string' && data.startsWith("data:application/pdf");

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 text-plum mb-3">
              <div className="p-2.5 bg-plum/10 rounded-2xl">
                <Shield className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50">Secure Archives</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-black text-plum tracking-tighter">
              The Vault
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              onClick={() => setIsPrivate(!isPrivate)}
              className={`rounded-2xl h-14 px-6 gap-3 transition-all ${isPrivate ? 'bg-plum text-white hover:bg-plum/90' : 'bg-black/5 text-plum hover:bg-black/10'}`}
            >
              {isPrivate ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              <span className="text-xs font-black uppercase tracking-widest">{isPrivate ? "Privacy ON" : "Privacy OFF"}</span>
            </Button>
            <Button onClick={() => setShowAdd(true)} className="rounded-2xl h-14 px-8 bg-[#2D2D2D] text-white hover:bg-plum transition-all shadow-xl shadow-black/10 gap-3">
              <Plus className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-widest">Deposit</span>
            </Button>
          </div>
        </div>

        {/* Stats & Filters */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          {CATEGORIES.map(cat => {
            const count = items.filter(i => i.category === cat.id).length;
            const isActive = selectedCat === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(isActive ? null : cat.id)}
                className={`p-6 rounded-[2.5rem] border transition-all text-left group relative overflow-hidden ${
                  isActive ? 'bg-plum border-plum text-white shadow-xl shadow-plum/20 scale-[1.02]' : 'bg-white border-black/5 text-olive hover:border-plum/30'
                }`}
              >
                <cat.icon className={`w-6 h-6 mb-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-plum'}`} />
                <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{cat.label}</div>
                <div className="text-2xl font-display font-black leading-none">{count}</div>
                {isActive && (
                   <div className="absolute top-4 right-6 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative mb-12">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-olive/30" />
          <Input 
            placeholder="Search documents by name..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-16 pl-16 pr-8 bg-white border-black/5 rounded-3xl text-lg font-medium focus-visible:ring-plum/20 shadow-sm"
          />
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <Empty 
            onAdd={() => setShowAdd(true)} 
            icon={<Shield className="w-12 h-12 text-olive/20" />} 
            label={search ? "No matches found in your vault" : "Your secure vault is empty"} 
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((item) => (
              <div key={item.id} className="group bg-white rounded-[3rem] border border-black/5 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="aspect-[16/10] bg-warm-wash relative overflow-hidden">
                  {isPdf(item.image) ? (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-red-50 text-red-500">
                       <FileText className="w-12 h-12" />
                       <span className="text-[10px] font-black uppercase tracking-widest">PDF DOCUMENT</span>
                    </div>
                  ) : (
                    <img 
                      src={item.image} 
                      alt="" 
                      className={`w-full h-full object-cover transition-all duration-700 ${isPrivate ? 'blur-2xl scale-110' : 'group-hover:scale-105'}`}
                    />
                  )}
                  
                  {isPrivate && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-md">
                       <Shield className="w-10 h-10 text-plum/30" />
                    </div>
                  )}
                  
                  <div className="absolute top-6 right-6 flex gap-2">
                    <button onClick={() => togglePin(item.id)} className={`p-3 rounded-2xl backdrop-blur-xl transition-all ${item.isPinned ? 'bg-plum text-white shadow-lg' : 'bg-white/80 text-plum opacity-0 group-hover:opacity-100'}`}>
                      <Pin className={`w-4 h-4 ${item.isPinned ? 'fill-current' : ''}`} />
                    </button>
                    <button onClick={() => deleteItem(item.id)} className="p-3 rounded-2xl bg-white/80 backdrop-blur-xl text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="absolute bottom-6 left-6">
                    <div className="px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-[9px] font-black uppercase tracking-[0.2em] text-plum border border-black/5">
                      {CATEGORIES.find(c => c.id === item.category)?.label}
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-xl font-display font-black text-plum leading-tight mb-1">{item.title}</h3>
                      <p className="text-[10px] font-bold text-olive/40 uppercase tracking-widest">Deposited {new Date(item.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => {
                        const win = window.open();
                        win?.document.write(`<iframe src="${item.image}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                      }}
                      className="rounded-xl hover:bg-plum/5"
                    >
                      <ChevronRight className="w-5 h-5 text-plum" />
                    </Button>
                  </div>
                  {item.notes && (
                    <p className="text-sm text-olive/60 line-clamp-2 leading-relaxed italic">"{item.notes}"</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdd && (
        <Dialog onClose={() => setShowAdd(false)}>
          <VaultDialog 
            onClose={() => setShowAdd(false)} 
            onSave={(val) => {
              setItems([val, ...items]);
              setShowAdd(false);
              toast.success("Document securely archived");
            }} 
          />
        </Dialog>
      )}
    </PageTransition>
  );
}

function VaultDialog({ onClose, onSave }: { onClose: () => void; onSave: (v: VaultEntry) => void }) {
  const [v, setV] = useState<Partial<VaultEntry>>({
    id: uid(),
    title: "",
    category: "identity",
    notes: "",
    createdAt: Date.now(),
    updatedAt: Date.now()
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<"image" | "pdf" | null>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const data = reader.result as string;
      setPreview(data);
      setV({ ...v, image: data });
      setFileType(file.type.includes("pdf") ? "pdf" : "image");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-10 space-y-8">
      <div>
        <h2 className="text-4xl font-display font-black text-plum tracking-tighter">Vault Deposit</h2>
        <p className="text-xs font-bold text-olive/40 uppercase tracking-widest mt-2">Archive your important documents</p>
      </div>

      <div className="grid md:grid-cols-[240px_1fr] gap-8">
        <label className="aspect-square rounded-[2rem] border-2 border-dashed border-sand bg-warm-wash hover:bg-sand transition-all cursor-pointer flex flex-col items-center justify-center p-6 text-center group">
          {preview ? (
            fileType === "pdf" ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-red-50 text-red-500 rounded-xl">
                 <FileText className="w-10 h-10" />
                 <span className="text-[10px] font-black uppercase tracking-widest">PDF SELECTED</span>
              </div>
            ) : (
              <img src={preview} alt="" className="w-full h-full object-cover rounded-xl" />
            )
          ) : (
            <>
              <Shield className="w-10 h-10 text-olive/20 mb-3 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest text-olive/40">Secure Upload</span>
              <span className="text-[8px] font-bold text-olive/20 mt-1">IMG / PDF</span>
            </>
          )}
          <input type="file" accept="image/*,.pdf" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </label>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-olive/40 ml-2">Document Title</label>
            <Input 
              placeholder="e.g. Aadhaar Card, Degree Certificate" 
              value={v.title}
              onChange={e => setV({ ...v, title: e.target.value })}
              className="bg-black/5 border-0 h-14 px-6 rounded-2xl font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-olive/40 ml-2">Category</label>
              <select 
                value={v.category}
                onChange={e => setV({ ...v, category: e.target.value })}
                className="w-full h-14 bg-black/5 border-0 rounded-2xl px-6 text-sm font-bold uppercase tracking-wider outline-none"
              >
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-olive/40 ml-2">Notes</label>
              <Input 
                placeholder="Optional notes..." 
                value={v.notes}
                onChange={e => setV({ ...v, notes: e.target.value })}
                className="bg-black/5 border-0 h-14 px-6 rounded-2xl font-bold"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t border-black/5">
        <Button variant="ghost" onClick={onClose} className="rounded-2xl px-8 h-14 font-bold">Cancel</Button>
        <Button 
          disabled={!v.title || !v.image} 
          onClick={() => {
            const user = getAuth();
            if (user) onSave({ ...v, userId: user.id } as VaultEntry);
          }}
          className="bg-plum text-white rounded-2xl px-12 h-14 font-black shadow-xl shadow-plum/20"
        >
          Archive Document
        </Button>
      </div>
    </div>
  );
}
