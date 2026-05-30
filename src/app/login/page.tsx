"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Shield, KeyRound, Loader2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!password) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed. Please check the password.");
      }

      // If successful, push to the chat route
      router.push("/chat");
      router.refresh();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dark min-h-screen w-screen bg-black flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Premium ambient light glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-zinc-800/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-md bg-zinc-950/60 border border-zinc-900 backdrop-blur-md rounded-2xl p-8 shadow-2xl shadow-black/80 flex flex-col items-center animate-fade-in relative z-10">
        {/* Shield Icon Container */}
        <div className="flex items-center justify-center size-14 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-zinc-900 border border-emerald-500/10 shadow-lg shadow-emerald-500/5 mb-6">
          <Shield className="size-6 text-emerald-400 animate-pulse" />
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-lg font-bold tracking-wider text-zinc-100 uppercase">
            BTC Chat Terminal
          </h1>
          <p className="text-xs text-zinc-500 font-semibold uppercase tracking-widest mt-1.5 leading-none">
            Secure Entry Required
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-1.5 relative">
            <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 ml-1">
              Terminal Password
            </label>
            <div className="relative flex items-center">
              <KeyRound className="absolute left-3.5 size-4 text-zinc-600 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                disabled={isLoading}
                className="w-full bg-zinc-900/60 border border-zinc-900 focus:border-zinc-800 hover:border-zinc-850 rounded-xl py-3 pl-11 pr-4 text-sm text-zinc-200 placeholder:text-zinc-650 font-sans outline-none transition-all focus:ring-2 focus:ring-emerald-500/10 focus:shadow-md focus:shadow-emerald-950/10"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/15 border border-rose-900/40 text-rose-400 text-xs font-medium leading-relaxed tracking-tight animate-fade-in flex items-center gap-2">
              <span className="flex size-1.5 rounded-full bg-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !password}
            className="w-full mt-2 h-11 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 disabled:bg-zinc-900 disabled:border-zinc-900 disabled:text-zinc-700 disabled:pointer-events-none shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Authorizing...</span>
              </>
            ) : (
              <>
                <span>Access Terminal</span>
                <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-8 text-center text-[10px] font-medium text-zinc-600 select-none">
          SECURE CONNECTION ENCRYPTED VIA WEB CRYPTO API
        </div>
      </div>
    </div>
  );
}
