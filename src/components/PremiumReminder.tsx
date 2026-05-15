import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, doc, updateDoc, getDoc } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, X, Sparkles, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PremiumReminder() {
  const { user } = useAuth();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!user) return;

    const checkReminder = async () => {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const data = userSnap.data();
        if (data.isPremium) return;

        const lastReminder = data.lastPremiumReminder ? new Date(data.lastPremiumReminder) : new Date(0);
        const now = new Date();
        const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;

        if (now.getTime() - lastReminder.getTime() > thirtyDaysInMs) {
          setShow(true);
        }
      }
    };

    checkReminder();
  }, [user]);

  const handleDismiss = async () => {
    if (!user) return;
    setShow(false);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        lastPremiumReminder: new Date().toISOString()
      });
    } catch (err) {
      console.error("Failed to update reminder date", err);
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed bottom-8 right-8 z-[100] w-[320px]"
        >
          <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Crown size={80} />
            </div>

            <button 
              onClick={handleDismiss}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500 rounded-xl shadow-lg shadow-amber-500/20">
                  <Sparkles size={20} className="fill-white" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">Guardian+ Monthly</p>
              </div>

              <h3 className="text-xl font-serif italic text-white leading-tight">
                Your impact could be <span className="text-amber-500">twice</span> as large.
              </h3>

              <p className="text-xs text-slate-400 leading-relaxed">
                Join the elite protectors and double your XP gain while gaining exclusive analytics.
              </p>

              <Link
                to="/premium"
                onClick={() => setShow(false)}
                className="block w-full py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] text-center hover:bg-amber-50 transition-all active:scale-95"
              >
                Explore Guardian+
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
