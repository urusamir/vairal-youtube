import { login, signup, signInWithGoogle } from './actions'
import Link from "next/link"
import Image from "next/image"
import { Users, TrendingUp, ShieldCheck, Heart, Sparkles, UserCheck } from "lucide-react"
import PasswordInput from './password-input'

export default async function LoginPage(props: { searchParams: Promise<{ error?: string, message?: string, mode?: string }> }) {
  const searchParams = await props.searchParams;
  const isSignup = searchParams?.mode === 'signup';
  
  return (
    <div className="min-h-screen bg-[#F5F7FF] relative overflow-hidden flex flex-col font-sans">
       
       {/* Background gradients */}
       <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-white/60 rounded-full blur-3xl -translate-x-1/4 -translate-y-1/4 z-0 pointer-events-none"></div>
       <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-50/50 rounded-full blur-3xl translate-x-1/4 translate-y-1/4 z-0 pointer-events-none"></div>

       {/* Top Nav */}
       <header className="relative z-50 flex items-center justify-between px-8 py-4 max-w-6xl mx-auto w-full">
          <Link href="/" className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none"><path d="M4 4L14 24L24 4" stroke="#5E43FF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 14H20" stroke="#5E43FF" strokeWidth="3.5" strokeLinecap="round"/></svg>
            <span className="text-2xl font-black text-slate-900 tracking-tight">Vairal</span>
          </Link>
          <div className="flex items-center gap-3">
             <span className="text-sm font-medium text-slate-500 hidden sm:block">New to Vairal?</span>
             <Link href={isSignup ? "/login" : "/login?mode=signup"} className="text-sm font-semibold text-[#5E43FF] border border-[#5E43FF]/30 px-6 py-2.5 rounded-full hover:bg-[#5E43FF]/5 transition-colors">
               {isSignup ? "Log in" : "Create an account"}
             </Link>
          </div>
       </header>

       <main className="flex-1 relative w-full max-w-6xl mx-auto px-4 sm:px-8 flex flex-col lg:flex-row items-center justify-between z-10 gap-8 lg:gap-0">
          
          {/* Left Column: Hero Text & Features */}
          <div className="flex-1 w-full max-w-[420px] relative z-20 pt-4 lg:pt-0">
             <h1 className="text-4xl lg:text-[44px] font-black text-[#1C1D21] tracking-tight leading-[1.1] mb-4">
               Where family influences the <span className="text-[#5E43FF] relative">future.</span>
             </h1>
             <p className="text-[16px] leading-relaxed text-[#6B7280] mb-8 font-medium max-w-[340px]">
               The all-in-one influencer marketing platform for kids, family & lifestyle brands.
             </p>

             <div className="space-y-6 relative">
               <div className="flex items-start gap-4">
                 <div className="w-12 h-12 shrink-0 rounded-2xl bg-[#5E43FF]/10 flex items-center justify-center text-[#5E43FF]">
                   <Users className="w-5 h-5" />
                 </div>
                 <div>
                   <h4 className="text-[15px] font-bold text-slate-900 mb-0.5">Vetted Family Creators</h4>
                   <p className="text-[13px] text-slate-500 font-medium">8K+ trusted creators worldwide</p>
                 </div>
               </div>

               <div className="flex items-start gap-4">
                 <div className="w-12 h-12 shrink-0 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                   <TrendingUp className="w-5 h-5" />
                 </div>
                 <div>
                   <h4 className="text-[15px] font-bold text-slate-900 mb-0.5">Real Engagement</h4>
                   <p className="text-[13px] text-slate-500 font-medium">Data-driven. Result-focused.</p>
                 </div>
               </div>

               <div className="flex items-start gap-4">
                 <div className="w-12 h-12 shrink-0 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                   <ShieldCheck className="w-5 h-5" />
                 </div>
                 <div>
                   <h4 className="text-[15px] font-bold text-slate-900 mb-0.5">Safe & Brand Friendly</h4>
                   <p className="text-[13px] text-slate-500 font-medium">Kid-safe content, brand-approved</p>
                 </div>
               </div>
             </div>

          </div>

          {/* Center Column: Login Card */}
          <div className="flex-1 w-full max-w-[420px] relative z-30 mx-auto lg:mr-12">
             <div className="bg-white p-8 rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-white relative z-10">
              
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center border border-slate-50">
                <svg width="20" height="20" viewBox="0 0 28 28" fill="none"><path d="M4 4L14 24L24 4" stroke="#5E43FF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 14H20" stroke="#5E43FF" strokeWidth="3.5" strokeLinecap="round"/></svg>
              </div>

              <div className="text-center mb-10 pt-4">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                   {isSignup ? 'Create your Account' : 'Welcome back!'}
                </h3>
                <p className="text-sm font-medium text-slate-500">
                   {isSignup ? 'Sign up to get started' : 'Login to access your dashboard'}
                </p>
              </div>
              
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

              <form className="flex flex-col gap-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-[13px] font-bold text-slate-700">Email address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    </div>
                    <input id="email" name="email" type="email" required placeholder="name@company.com"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#5E43FF]/30 focus:border-[#5E43FF] transition-all bg-white text-sm font-medium placeholder:text-slate-400 font-sans" />
                  </div>
                </div>
                
                <PasswordInput isSignup={isSignup} />

                {!isSignup && (
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="remember" className="w-4 h-4 rounded border-slate-300 text-[#5E43FF] focus:ring-[#5E43FF]" defaultChecked />
                    <label htmlFor="remember" className="text-[13px] font-medium text-slate-500">Remember me</label>
                  </div>
                )}

                <div className="pt-2">
                  <button formAction={isSignup ? signup : login} className="w-full py-3.5 bg-[#6A4EFE] hover:bg-[#593CE5] text-white border-none rounded-xl font-bold text-[15px] shadow-[0_10px_20px_-10px_rgba(106,78,254,0.5)] transition-all flex items-center justify-center gap-2 relative">
                    {isSignup ? "Create Account" : "Sign in to Dashboard"}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="absolute right-6"><path d="m9 18 6-6-6-6"/></svg>
                  </button>
                </div>
              </form>

              <div className="mt-8 text-center flex items-center justify-center gap-1.5 text-[13px] text-slate-500 font-medium">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Your data is safe with us. <Link href="#" className="text-[#5E43FF] hover:underline font-bold">Learn more</Link>
              </div>
            </div>
            
            {/* Soft shadow under card */}
            <div className="absolute inset-4 -bottom-4 bg-black/5 blur-xl rounded-[32px] -z-10"></div>
          </div>

          {/* Right Column: Floating Polaroids & Stats */}
          <div className="flex-1 hidden xl:block relative w-full h-[500px] z-10 perspective-1000">
            {/* Top Polaroid */}
            <div className="absolute top-0 right-12 w-[180px] bg-white p-2 pb-6 rounded-xl shadow-2xl rotate-[6deg] animate-[float_8s_ease-in-out_infinite_1s] z-30 transform-origin-bottom-left border border-slate-100">
               <Image src="/images/polaroid-1.png" alt="Kids in nature" width={180} height={180} className="w-full h-auto rounded" />
            </div>

            {/* Middle Right Polaroid */}
            <div className="absolute top-32 -right-4 w-[160px] bg-white p-2 pb-6 rounded-xl shadow-2xl -rotate-[8deg] animate-[float_7s_ease-in-out_infinite_2s] z-20 border border-slate-100">
               <Image src="/images/polaroid-2.png" alt="Kids at beach" width={160} height={160} className="w-full h-auto rounded" />
            </div>

            {/* Bottom Polaroid */}
            <div className="absolute bottom-4 right-16 w-[200px] bg-white p-2 pb-6 rounded-xl shadow-2xl rotate-[3deg] animate-[float_9s_ease-in-out_infinite_0s] z-40 border border-slate-100">
               <Image src="/images/polaroid-3.png" alt="Girl cooking" width={200} height={200} className="w-full h-auto rounded" />
            </div>

            {/* Stat Box: 8K+ Creators */}
            <div className="absolute top-16 right-0 bg-white/90 backdrop-blur px-4 py-3 rounded-2xl shadow-xl flex flex-col items-center gap-1 animate-[float_5s_ease-in-out_infinite_1.5s] z-50 border border-white/50">
               <div className="w-8 h-8 rounded-full bg-[#5E43FF] flex items-center justify-center text-white mb-1 shadow-md shadow-[#5E43FF]/30">
                 <Users className="w-4 h-4" />
               </div>
               <span className="font-black text-base text-slate-900 leading-none">8K+</span>
               <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Creators</span>
            </div>

            {/* Stat Box: Engagement */}
            <div className="absolute top-[200px] left-12 bg-white/90 backdrop-blur px-4 py-3 rounded-2xl shadow-xl flex flex-col items-start gap-1 animate-[float_6s_ease-in-out_infinite_0.5s] z-50 border border-white/50 w-[140px]">
               <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Engagement Rate</span>
               <div className="flex items-end gap-2 w-full justify-between">
                 <div className="flex items-center gap-1">
                   <span className="font-black text-lg text-slate-900 leading-none">4.21%</span>
                   <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
                 </div>
                 <svg width="32" height="16" viewBox="0 0 40 20" fill="none"><path d="M2 18C2 18 6.5 4 12 8C17.5 12 21 8 26 12C31 16 38 2 38 2" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
               </div>
            </div>

            {/* Stat Box: 210K+ Campaigns */}
            <div className="absolute bottom-[100px] left-8 bg-white/90 backdrop-blur px-4 py-3 rounded-2xl shadow-xl flex flex-col items-center gap-1 animate-[float_7s_ease-in-out_infinite_2.5s] z-50 border border-white/50">
               <div className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center text-white mb-1 shadow-md shadow-rose-500/30 relative">
                 <Heart className="w-5 h-5 fill-white" />
               </div>
               <span className="font-black text-base text-slate-900 leading-none">210K+</span>
               <span className="text-[9px] font-bold text-slate-500 text-center leading-tight">Successful<br/>Campaigns</span>
            </div>

          </div>

       </main>

    </div>
  )
}
