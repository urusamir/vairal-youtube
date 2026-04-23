const fs = require('fs');
let code = fs.readFileSync('src/app/login/page.tsx', 'utf8');

// Replace the grid container and the left-side text completely, making the form perfectly centered under the main title.
const startToken = '{/* Left Text Detail Side';
const endToken = '          </div>\n\n       </main>';

const startIndex = code.indexOf(startToken);
const endIndex = code.indexOf(endToken);

if (startIndex > -1 && endIndex > -1) {
  const replacement = `          {/* Form Box - Centered under the title */}
          <div className="relative z-20 w-full px-4 lg:px-0 mx-auto flex flex-col items-center justify-center pb-16">
             
             <div className="bg-white/95 backdrop-blur-3xl p-8 rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-slate-100 max-w-[420px] w-full">
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
`;
  const newCode = code.substring(0, startIndex) + replacement + code.substring(endIndex);
  fs.writeFileSync('src/app/login/page.tsx', newCode);
  console.log("Patched login page!");
} else {
  console.error("Could not find the injection points.");
}
