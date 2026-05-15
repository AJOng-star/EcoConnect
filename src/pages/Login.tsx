import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Waves, Mail, Lock, User, ArrowRight, Crown } from 'lucide-react';
import { db, doc, setDoc, Timestamp, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, auth } from '../lib/firebase';

export default function Login() {
  const { login: googleLogin } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isPremiumSignup, setIsPremiumSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName });
        
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          email,
          displayName,
          username: username.toLowerCase().replace(/\s+/g, ''),
          xp: isPremiumSignup ? 100 : 0,
          level: 1,
          badges: [],
          isAdmin: false,
          isPersonOfMonth: false,
          isPremium: isPremiumSignup,
          lastPremiumReminder: new Date().toISOString(),
          followers: [],
          following: [],
          createdAt: Timestamp.now()
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] border border-slate-100"
      >
        <div className="text-center mb-10">
          <div className="inline-flex p-3 bg-sea-aqua rounded-2xl text-white mb-6 shadow-xl shadow-sea-aqua/20">
            <Waves size={32} />
          </div>
          <h1 className="text-3xl font-serif italic font-black text-slate-900 mb-2">Eco Connect</h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
            {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
          </p>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          <AnimatePresence mode="wait">
            {mode === 'signup' && (
              <motion.div
                key="signup-fields"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden"
              >
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    type="text"
                    placeholder="Full Name"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-slate-50 pl-12 pr-4 py-4 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-slate-200 transition-all"
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-sm">@</span>
                  <input
                    type="text"
                    placeholder="Username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-50 pl-12 pr-4 py-4 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-slate-200 transition-all"
                  />
                </div>
                
                <button
                  type="button"
                  onClick={() => setIsPremiumSignup(!isPremiumSignup)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${isPremiumSignup ? 'bg-amber-50 border-amber-200 shadow-sm' : 'bg-slate-50 border-transparent'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isPremiumSignup ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                      <Crown size={18} fill={isPremiumSignup ? "currentColor" : "none"} />
                    </div>
                    <div className="text-left">
                      <p className={`text-[10px] font-black uppercase tracking-widest ${isPremiumSignup ? 'text-amber-600' : 'text-slate-400'}`}>Guardian+ (Recommended)</p>
                      <p className="text-[10px] text-slate-400 font-serif italic">Amplify your impact from day one</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isPremiumSignup ? 'border-amber-500 bg-amber-500' : 'border-slate-200'}`}>
                    {isPremiumSignup && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 pl-12 pr-4 py-4 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-slate-200 transition-all"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 pl-12 pr-4 py-4 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-slate-200 transition-all"
            />
          </div>

          {error && <p className="text-red-500 text-[10px] font-bold text-center uppercase tracking-widest">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-slate-900/10 hover:bg-sea-aqua transition-all flex items-center justify-center gap-2 group"
          >
            {loading ? 'Thinking...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
            {!loading && <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-8 flex items-center gap-4">
          <div className="h-[1px] flex-1 bg-slate-100" />
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Or</span>
          <div className="h-[1px] flex-1 bg-slate-100" />
        </div>

        <button
          onClick={googleLogin}
          type="button"
          className="w-full mt-8 bg-white border border-slate-200 text-slate-600 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
        >
          <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
          Continue with Google
        </button>

        <p className="mt-10 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">
          {mode === 'login' ? "New protector?" : "Already part of the sea?"}
          <button 
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="ml-2 text-sea-aqua hover:underline"
          >
            {mode === 'login' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
