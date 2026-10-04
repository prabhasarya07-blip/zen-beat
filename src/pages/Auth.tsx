import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Brain, Mail, Lock, Sparkles, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_URL } from "@/lib/apiConfig";

import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user, isReady } = useAuth();

  useEffect(() => {
    if (isReady && user) {
      navigate("/", { replace: true });
    }
  }, [isReady, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      toast.error("Please enter email and password");
      return;
    }
    if (trimmedPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setSubmitting(true);

    try {
                  const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, password: trimmedPassword }),
      });


      if (!response.ok) {
        try {
          const errorData = await response.json();
          toast.error(errorData.message || errorData.error || "Authentication failed");
        } catch {
          toast.error(`Authentication failed (${response.status})`);
        }
        return;
      }

      const data = await response.json();

      if (isLogin || data.token) {
        toast.success(isLogin ? "Welcome back!" : "Account created! Welcome to MoodSync");
        // We can't call useAuth() hook directly here, but we can call a function from it.
        // The component already destructures `const { user, isReady } = useAuth();`
        // Wait, I didn't destructure `login` earlier in the component. Let's redirect instead and let useAuth pick up the token on next render.
        // Actually, just set localStorage directly here to be absolutely safe, then navigate.
        localStorage.setItem("moodsync_token", data.token);
        localStorage.setItem("moodsync_user", JSON.stringify(data.user));
        
        // Force a small delay or just navigate
        setTimeout(() => {
          navigate("/", { replace: true });
          window.location.reload(); // Quick hack to ensure state refresh without refactoring the whole component tree
        }, 100);
      } else {
        toast.success("Account created! You can now sign in.");
        setIsLogin(true);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            className="inline-flex p-4 rounded-2xl bg-primary/15 glow-primary mb-4"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          >
            <Brain className="w-10 h-10 text-primary" />
          </motion.div>
          <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-2">
            MoodSync <Sparkles className="w-5 h-5 text-accent" />
          </h1>
          <p className="text-sm font-mono text-muted-foreground mt-2">
            AI-powered adaptive music player
          </p>
        </div>

        {/* Auth Card */}
        <div className="glass rounded-2xl p-8 border border-border/50">
          <h2 className="text-xl font-semibold text-foreground mb-1 text-center">
            {isLogin ? "Welcome Back" : "Get Started"}
          </h2>
          <p className="text-xs text-muted-foreground font-mono text-center mb-6">
            {isLogin ? "Sign in to your account" : "Create a free account"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                autoComplete="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-secondary/50 border-border/50 font-mono text-sm h-11"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                autoComplete={isLogin ? "current-password" : "new-password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 bg-secondary/50 border-border/50 font-mono text-sm h-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Button
              type="submit"
              className="w-full font-mono h-11 text-sm"
              size="lg"
              disabled={submitting}
            >
              {submitting ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin((p) => !p)}
              className="text-sm font-mono text-muted-foreground hover:text-primary transition-colors"
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
          </div>
        </div>

          <div className="mt-6 flex items-center justify-center gap-4 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
            <span>🎵 Adaptive Music</span>
            <span>•</span>
            <span>😊 Emotion AI</span>
            <span>•</span>
            <span>🌍 Multi-Language</span>
          </div>
        </motion.div>
      </div>
  );
}
