import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, setAuth, API_BASE } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, ArrowRight, Lock, User } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (getAuth()) navigate("/");
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return toast.error("Please fill in all fields");

    setLoading(true);
    try {
      const endpoint = isRegister ? `${API_BASE}/auth/register` : `${API_BASE}/auth/login`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Authentication failed");

      setAuth(data);
      toast.success(isRegister ? "Account created!" : "Welcome back!");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sand flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[3rem] p-8 md:p-12 shadow-[0_40px_80px_rgba(0,0,0,0.05)] border border-black/5 animate-in fade-in zoom-in duration-700">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 rounded-full bg-primary grid place-items-center mb-6 shadow-lg shadow-primary/20">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-4xl font-black text-plum tracking-tighter mb-2">
            {isRegister ? "Start your studio" : "Welcome back"}
          </h1>
          <p className="text-olive/40 font-bold uppercase tracking-widest text-[10px]">
            {isRegister ? "Create a quiet place for your mind" : "Enter your creative space"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-olive/20 group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="pl-12 h-14 rounded-2xl bg-sand/30 border-0 focus-visible:ring-primary/20 font-bold"
            />
          </div>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-olive/20 group-focus-within:text-primary transition-colors" />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-12 h-14 rounded-2xl bg-sand/30 border-0 focus-visible:ring-primary/20 font-bold"
            />
          </div>

          <Button 
            disabled={loading}
            className="w-full h-14 rounded-2xl bg-plum hover:bg-plum/90 text-white font-black uppercase tracking-widest text-xs gap-2 shadow-xl shadow-plum/20 mt-4 transition-all active:scale-[0.98]"
          >
            {loading ? "Syncing..." : isRegister ? "Create Studio" : "Enter Studio"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-olive/40 font-bold uppercase tracking-widest text-[9px] hover:text-plum transition-colors"
          >
            {isRegister ? "Already have an account? Sign in" : "New here? Create your account"}
          </button>
        </div>
      </div>
    </div>
  );
}
