import os

with open('src/app/login/page.tsx', 'r') as f:
    text = f.read()

new_page = """import { login, signup, signInWithGoogle } from './actions'
import Link from "next/link"

export default async function LoginPage(props: { searchParams: Promise<{ error?: string, message?: string, mode?: string }> }) {
  const searchParams = await props.searchParams;
  const isSignup = searchParams?.mode === 'signup';
  
  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex flex-col font-sans">
       {/* GoFundMe-style Top Nav */}
       <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 md:px-12 bg-transparent">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <svg width="32" height="32" viewBox="0 0 28 28" fill="none"><path d="M4 4L14 24L24 4" stroke="#4671F6" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 14H20" stroke="#4671F6" strokeWidth="3.5" strokeLinecap="round"/></svg>
              <span className="text-2xl font-black text-slate-800 tracking-tight">Vairal</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
             <Link href="/" className="text-sm font-bold text-slate-600 hover:text-primary hidden sm:block transition-colors">Back to home</Link>
             <Link href={isSignup ? "/login" : "/login?mode=signup"} className="text-sm font-bold text-primary hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-full transition-colors">
               {isSignup ? "Sign In" : "Register"}
             </Link>
          </div>
       </header>

       {/* Orbital Background & Centered Content */}
       <main className="flex-1 relative flex items-center justify-center w-full min-h-screen">
          
          {/* The concentric orbital circles centered on the form */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0 flex items-center justify-center pointer-events-none opacity-40">
             <div className="absolute w-[450px] h-[450px] rounded-full border border-slate-300"></div>
             <div className="absolute w-[750px] h-[750px] rounded-full border border-slate-200 border-dashed"></div>
             <div className="absolute w-[1100px] h-[1100px] rounded-full border border-slate-200"></div>
             <div className="absolute w-[1500px] h-[1500px] rounded-full border border-slate-100"></div>
          </div>

          {/* Floating Avatars (Positioned tightly around the login box) */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden hidden lg:block">
             
             {/* Avatar 1: Top Left */}
             <div className="absolute top-[20%] left-[25%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="p-1 rounded-full bg-emerald-50 border-[4px] border-emerald-500 shadow-xl overflow-hidden bg-white">
                   <img src="/assets-legacy/creator_1.png" alt="Creator" className="w-[100px] h-[100px] object-cover rounded-full" />
                </div>
                <div className="bg-slate-100 text-slate-700 font-extrabold text-xs uppercase tracking-wider px-3 py-1.5 rounded-md -mt-4 shadow-sm border border-slate-200 z-10">Your Campaign</div>
             </div>

             {/* Avatar 2: Bottom Left */}
             <div className="absolute top-[70%] left-[15%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-[bounce_8s_infinite] drop-shadow-xl">
                <div className="p-1 rounded-full bg-blue-50 border-[4px] border-primary shadow-xl overflow-hidden bg-white">
                   <img src="/assets-legacy/creator_2.png" alt="Creator" className="w-[120px] h-[120px] object-cover rounded-full" />
                </div>
                <div className="bg-slate-100 text-slate-700 font-extrabold text-xs uppercase tracking-wider px-3 py-1.5 rounded-md -mt-4 shadow-sm border border-slate-200 z-10">Education</div>
             </div>

             {/* Avatar 3: Top Right */}
             <div className="absolute top-[25%] right-[22%] transform translate-x-1/2 -translate-y-1/2 flex flex-col items-center drop-shadow-xl">
                <div className="p-1 rounded-full bg-rose-50 border-[4px] border-rose-500 shadow-xl overflow-hidden bg-white">
                   <img src="/assets-legacy/creator_4.png" alt="Creator" className="w-[110px] h-[110px] object-cover rounded-full" />
                </div>
                <div className="bg-slate-100 text-slate-700 font-extrabold text-xs uppercase tracking-wider px-3 py-1.5 rounded-md -mt-4 shadow-sm border border-slate-200 z-10">Kids Fashion</div>
             </div>

             {/* Avatar 4: Bottom Right */}
             <div className="absolute top-[65%] right-[12%] transform translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-[pulse_6s_infinite] drop-shadow-lg">
                 <div className="p-1 rounded-full bg-amber-50 border-[4px] border-amber-500 shadow-xl overflow-hidden bg-white">
                   <img src="/assets-legacy/creator_5.png" alt="Creator" className="w-[140px] h-[140px] object-cover rounded-full" />
                </div>
                <div className="bg-slate-100 text-slate-700 font-extrabold text-xs uppercase tracking-wider px-3 py-1.5 rounded-md -mt-4 shadow-sm border border-slate-200 z-10">Lifestyle</div>
             </div>
          </div>

          {/* Core Login Form - Absolute Center */}
          <div className="relative z-20 w-full px-4 lg:px-0 mx-auto flex flex-col items-center justify-center">
             
             {/* Small contextual header sitting directly on top of the auth box */}
             <div className="text-center mb-6 max-w-[420px]">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                   Successful campaigns <br className="hidden sm:block"/> start right here.
                </h1>
                <p className="font-medium text-slate-500 mt-2">#1 Influencer Marketing Platform</p>
             </div>

             <div className="bg-white p-8 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-slate-200/60 max-w-[440px] w-full">
              <h3 className="text-2xl font-black text-slate-800 mb-6 text-center">
                 {isSignup ? 'Create your Account' : 'Welcome Back'}
              </h3>
              
              {searchParams?.error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 text-sm font-bold border border-red-100 text-center">
                  {searchParams.error}
                </div>
              )}
              
              {searchParams?.message && (
                <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl mb-6 text-sm font-bold border border-emerald-100 text-center">
                  {searchParams.message}
                </div>
              )}

              <form className="flex flex-col gap-5">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-bold text-slate-700">Email Address</label>
                  <input id="email" name="email" type="email" required placeholder="name@company.com"
                    className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-slate-50 text-base font-medium placeholder:text-slate-400 font-sans" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                     <label htmlFor="password" className="text-sm font-bold text-slate-700">Password</label>
                     {!isSignup && <Link href="#" className="text-xs font-bold text-primary hover:underline">Forgot password?</Link>}
                  </div>
                  <input id="password" name="password" type="password" required placeholder="••••••••"
                    className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-slate-50 text-base font-medium placeholder:text-slate-400 font-sans tracking-widest" />
                </div>

                <div className="pt-4 flex flex-col gap-4">
                  {isSignup ? (
                     <>
                       <button formAction={signup} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white border-none rounded-2xl font-black text-lg shadow-[0_10px_20px_-10px_rgba(5,150,105,0.4)] transition-all hover:-translate-y-1">Register Account</button>
                     </>
                  ) : (
                     <>
                       <button formAction={login} className="w-full py-4 bg-[#4671F6] hover:bg-blue-700 text-white border-none rounded-2xl font-black text-lg shadow-[0_10px_20px_-10px_rgba(70,113,246,0.4)] transition-all hover:-translate-y-1">Sign In to Dashboard</button>
                     </>
                  )}
                </div>
              </form>

              <div className="flex items-center my-8">
                <div className="flex-1 h-px bg-slate-200"></div>
                <span className="px-5 text-sm text-slate-400 font-bold uppercase tracking-widest">or</span>
                <div className="flex-1 h-px bg-slate-200"></div>
              </div>

              <form>
                <button formAction={signInWithGoogle} className="w-full py-4 bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 rounded-2xl font-bold text-base shadow-sm transition-all flex items-center justify-center gap-3">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Continue with Google
                </button>
              </form>
            </div>
          </div>
       </main>

       {/* GoFundMe style Bottom Ribbon fixed to absolute bottom */}
       <div className="absolute bottom-0 w-full bg-[#fdf5e6] py-3 border-t border-amber-200 z-10 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 px-6 overflow-hidden hidden sm:flex">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-900 tracking-wide">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
             No fee to start collaborating
          </div>
          <div className="hidden md:block w-16 h-px border-t border-dashed border-amber-300"></div>
          <div className="flex items-center gap-2 text-sm font-bold text-amber-900 tracking-wide">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
             1 campaign matched every second
          </div>
          <div className="hidden md:block w-16 h-px border-t border-dashed border-amber-300"></div>
          <div className="flex items-center gap-2 text-sm font-bold text-amber-900 tracking-wide">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
             8K+ creators vetted daily
          </div>
       </div>

    </div>
  )
}
"""

with open('src/app/login/page.tsx', 'w') as f:
    f.write(new_page)

