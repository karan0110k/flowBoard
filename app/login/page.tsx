import Link from "next/link";
import { LoginForm } from "./form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f1f2f4] overflow-hidden relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-purple-500/20 to-blue-500/20 rounded-full blur-3xl -z-10" />
      
      <div className="flex items-center gap-2 mb-8">
        <div className="flex gap-0.5">
          <span className="w-2 h-6 bg-blue-600 rounded-sm inline-block"></span>
          <span className="w-2 h-8 bg-blue-500 rounded-sm inline-block translate-y-[-4px]"></span>
          <span className="w-2 h-4 bg-blue-400 rounded-sm inline-block translate-y-[4px]"></span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-[#172b4d]">FlowBoard</h1>
      </div>

      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-xl border border-gray-100">
        <h2 className="text-xl font-semibold text-center text-[#172b4d] mb-6">Log in to continue</h2>
        <LoginForm />
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Don't have an account? <Link href="/signup" className="text-blue-600 hover:underline">Sign up</Link></p>
        </div>
      </div>
    </div>
  );
}
