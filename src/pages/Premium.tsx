import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, doc, updateDoc, increment } from '../lib/firebase';
import { motion } from 'motion/react';
import { Check, Crown, Zap, BarChart3, ShieldCheck, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Premium() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        isPremium: true,
        xp: increment(100) // Bonus XP for joining!
      });
      alert("Welcome to Guardian+! Your impact is now amplified.");
      navigate(`/profile/${user.uid}`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const perks = [
    { 
      icon: <ShieldCheck className="text-amber-500" />, 
      title: "Golden Verified Badge", 
      desc: "Show the world your commitment with a unique profile badge." 
    },
    { 
      icon: <BarChart3 className="text-blue-500" />, 
      title: "Advanced Impact Analytics", 
      desc: "Track your environmental reach with detailed graphs and data." 
    },
    { 
      icon: <Crown className="text-purple-500" />, 
      title: "Guardian Themes", 
      desc: "Unlock premium profile layouts and exclusive ripple effects." 
    },
    { 
      icon: <Zap className="text-amber-400" />, 
      title: "XP Multiplier", 
      desc: "Earn 2x XP for every positive action you take in the community." 
    },
    { 
      icon: <Sparkles className="text-emerald-500" />, 
      title: "Ad-Free Experience", 
      desc: "An undisturbed journey across the platform." 
    }
  ];

  return (
    <div className="max-w-4xl mx-auto pt-12 pb-24 px-4">
      <div className="text-center space-y-4 mb-16">
        <motion.div
           initial={{ scale: 0.9, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           className="inline-flex items-center gap-2 px-4 py-1 bg-amber-50 rounded-full border border-amber-100 text-amber-600 font-black text-[10px] uppercase tracking-widest mb-4"
        >
          <Crown size={12} className="fill-amber-500" /> Introducing Guardian Plus
        </motion.div>
        <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none">
          Amplify Your <span className="text-sea-aqua italic font-serif">Environmental</span> Legacy.
        </h1>
        <p className="text-slate-500 max-w-xl mx-auto text-lg">
          Support the community's growth and unlock tools designed for the most dedicated protectors of our planet.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          {perks.map((perk, idx) => (
            <motion.div 
              key={idx}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="flex gap-4"
            >
              <div className="mt-1 w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 shadow-sm border border-slate-100">
                {perk.icon}
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{perk.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{perk.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-[3rem] p-12 shadow-2xl border border-slate-100 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
             <Crown size={180} className="text-amber-500" />
          </div>
          
          <div className="relative z-10 space-y-8">
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Commitment</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-slate-900">$4.99</span>
                <span className="text-slate-400 font-serif italic text-xl">/ month</span>
              </div>
            </div>

            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm text-slate-600">
                <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                  <Check size={12} strokeWidth={3} />
                </div>
                Support climate action projects
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-600">
                <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                  <Check size={12} strokeWidth={3} />
                </div>
                All Premium Features included
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-600">
                <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                  <Check size={12} strokeWidth={3} />
                </div>
                Cancel anytime
              </li>
            </ul>

            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full py-4 bg-slate-900 hover:bg-sea-aqua text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-slate-900/20 disabled:opacity-50 active:scale-95"
            >
              {loading ? 'Processing...' : 'Become a Guardian+'}
            </button>
            <p className="text-[10px] text-center text-slate-400 italic font-serif">
              *Membership fees go toward platform maintenance and verified environmental offsets.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Social Proof */}
      <div className="mt-24 text-center">
         <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-8 underline decoration-sea-aqua underline-offset-8">The Elite Guard</p>
         <div className="flex flex-wrap justify-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all cursor-default">
            {[1,2,3,4,5].map(i => (
              <img key={i} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=pwa${i}`} className="w-8 h-8 rounded-full border border-white shadow-sm" alt="" />
            ))}
            <div className="text-[10px] font-bold text-slate-400 flex items-center">+ 1,240 Joiners</div>
         </div>
      </div>
    </div>
  );
}
