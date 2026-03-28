"use client";

import { signup } from "@/src/lib/auth-actions";
import { Button } from "@/src/components/ui/button";
import { useState } from "react";
import { User, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";

export function SignupForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    try {
      const res = await signup(formData);
      if (res?.error) {
        setError(res.error);
        setLoading(false);
      }
    } catch {
      // Expected NEXT_REDIRECT error
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-red-400 bg-red-500/10 rounded-xl border border-red-500/20">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}
      
      <div className="flex flex-col gap-2 relative group">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Full Name</label>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
          <input 
            type="text" 
            name="name" 
            required 
            autoComplete="name"
            className="w-full bg-[#22272b] border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all hover:bg-[#262d34]" 
            placeholder="Jane Doe" 
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 relative group">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
          <input 
            type="email" 
            name="email" 
            required 
            autoComplete="email"
            className="w-full bg-[#22272b] border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all hover:bg-[#262d34]" 
            placeholder="name@company.com" 
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 relative group">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Password</label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
          <input 
            type="password" 
            name="password" 
            required 
            autoComplete="new-password"
            className="w-full bg-[#22272b] border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all hover:bg-[#262d34]" 
            placeholder="••••••••" 
          />
        </div>
        <p className="text-[10px] text-gray-500 ml-1">Must be at least 8 characters</p>
      </div>

      <Button type="submit" disabled={loading} className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-6 rounded-xl text-base shadow-lg shadow-blue-900/20 border border-white/10 transition-all active:scale-[0.98]">
        {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Signing up...</> : "Create Account"}
      </Button>
    </form>
  )
}
