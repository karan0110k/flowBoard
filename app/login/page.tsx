import Link from "next/link";
import { LoginForm } from "./form";
import { LayoutTemplate } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#1d2125] flex">
      {/* Left side - Image & Branding (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1611224923853-80b023f02d71?q=80&w=2000&auto=format&fit=crop')" }}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
        
        <div className="relative z-10 flex items-center gap-2">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-xl shadow-lg border border-white/10">
            <LayoutTemplate className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white drop-shadow-md">FlowBoard</span>
        </div>

        <div className="relative z-10 max-w-md">
          <blockquote className="space-y-4">
            <p className="text-3xl font-bold text-white leading-tight drop-shadow-lg">
              "FlowBoard has revolutionized how our team tracks progress. It's beautiful, fast, and exactly what we needed."
            </p>
            <footer className="text-gray-300 font-medium">— Sarah J., Product Manager</footer>
          </blockquote>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Abstract background blobs for right side */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-blue-600/10 to-purple-600/10 rounded-full blur-3xl -z-10 animate-pulse-slow"></div>

        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center justify-center gap-2 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-xl shadow-lg border border-white/10">
              <LayoutTemplate className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-bold tracking-tight text-white drop-shadow-md">FlowBoard</span>
          </div>

          <div className="bg-[#282e33]/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/[0.08]">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Welcome back</h2>
              <p className="text-gray-400 text-sm">Log in to your account to continue</p>
            </div>
            
            <LoginForm />
            
            <div className="mt-8 text-center text-sm text-gray-400">
              <p>Don&apos;t have an account? <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">Sign up</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
