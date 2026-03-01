"use client";

import { useState } from "react";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect happens in AuthContext
  if (authLoading) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);
    if (!result.success) {
      setError(result.error || "Login failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col relative overflow-hidden">
      {/* Abstract Background Design */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-gray-200/50 to-transparent skew-x-12 translate-x-32" />

      {/* Header */}
      <header className="absolute top-0 left-0 w-full p-8 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#2B1F1A] flex items-center justify-center text-[#CBA135]">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 14v-4a8 8 0 0 1 16 0v4" />
              <path d="M2 14h20" />
              <path d="M12 2v2" />
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-widest font-playfair uppercase text-[#1A1A1A]">
            Banquet Pro
          </h1>
        </div>
        <p className="text-sm text-gray-500 hidden sm:block">
          Premium Event Management Suite
        </p>
      </header>

      {/* Login Card */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 z-10">
        <div className="bg-white rounded-2xl shadow-sm p-10 w-full max-w-md border border-gray-100">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-semibold font-playfair mb-3 text-[#1A1A1A]">
              WELCOME BACK
            </h2>
            <p className="text-gray-500">Please login to your dashboard.</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-xs font-semibold text-gray-500 tracking-wider uppercase"
              >
                Email
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 bg-[#F8F9FA] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CBA135] text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-xs font-semibold text-gray-500 tracking-wider uppercase"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-3 bg-[#F8F9FA] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CBA135] text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm py-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-[#2B1F1A] focus:ring-[#CBA135]"
                />
                <span className="text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-[#CBA135] hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2B1F1A] text-white py-3.5 rounded-lg font-medium tracking-wide uppercase hover:bg-[#1f1612] transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-[#2B1F1A] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
