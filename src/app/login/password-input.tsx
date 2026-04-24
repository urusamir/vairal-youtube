"use client";

import { useState } from "react";
import Link from "next/link";

export default function PasswordInput({ isSignup }: { isSignup: boolean }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
         <label htmlFor="password" className="text-[13px] font-bold text-slate-700">Password</label>
         {!isSignup && <Link href="#" className="text-[13px] font-bold text-[#5E43FF] hover:underline">Forgot password?</Link>}
      </div>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
        <input 
          id="password" 
          name="password" 
          type={showPassword ? "text" : "password"} 
          required 
          placeholder="••••••••"
          className="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#5E43FF]/30 focus:border-[#5E43FF] transition-all bg-white text-sm font-medium placeholder:text-slate-400 font-sans tracking-widest" 
        />
        <button 
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer border-none bg-transparent"
        >
          {showPassword ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600 transition-colors"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 hover:text-slate-600 transition-colors"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
          )}
        </button>
      </div>
    </div>
  );
}
