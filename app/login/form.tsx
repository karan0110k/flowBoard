"use client";

import { login } from "@/src/lib/auth-actions";
import { Button } from "@/src/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    try {
      const res = await login(formData);
      if (res?.error) {
        setError(res.error);
        setLoading(false);
      }
      // If no error, the server action will redirect
    } catch {
      // redirect() throws NEXT_REDIRECT — this is expected behavior
      // The page will redirect automatically
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-black">
      {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-100">{error}</div>}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-gray-700">Email Address</label>
        <input type="email" name="email" required className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter your email" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-gray-700">Password</label>
        <input type="password" name="password" required className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter your password" />
      </div>
      <Button type="submit" disabled={loading} className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 h-auto text-base">
        {loading ? "Logging in..." : "Log in"}
      </Button>
    </form>
  )
}
