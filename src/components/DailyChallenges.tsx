import React from 'react';
import { Target, CheckCircle2, Circle, Sparkle, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { db, doc, updateDoc, increment } from '../lib/firebase';

const CHALLENGES = [
  { id: 'bottle', text: 'Used a reusable water bottle today', xp: 5 },
  { id: 'meatless', text: 'Had a meatless meal', xp: 10 },
  { id: 'cycle', text: 'Walked or cycled for a short trip', xp: 15 },
  { id: 'lights', text: 'Turned off lights when not in use', xp: 5 },
];

export default function DailyChallenges() {
  const { user, profile } = useAuth();
  const [completed, setCompleted] = React.useState<string[]>([]);

  const handleComplete = async (id: string, xp: number) => {
    if (!user || completed.includes(id)) return;
    
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        xp: increment(xp)
      });
      setCompleted([...completed, id]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white border border-slate-200 p-10 rounded-[2rem] shadow-xl shadow-slate-200/50 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-sea-aqua">Social Quests</p>
          <h3 className="text-xl font-serif italic font-black text-slate-900">Daily Ripples</h3>
        </div>
        <Target size={24} className="text-slate-200" />
      </div>

      <div className="space-y-4">
        {CHALLENGES.map((challenge) => {
          const isDone = completed.includes(challenge.id);
          return (
            <motion.div
              key={challenge.id}
              whileHover={!isDone ? { x: 5 } : {}}
              onClick={() => handleComplete(challenge.id, challenge.xp)}
              className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                isDone 
                  ? 'bg-slate-50 border-slate-100 opacity-60' 
                  : 'bg-white border-slate-100 hover:border-sea-aqua hover:shadow-lg'
              }`}
            >
              {isDone ? (
                <CheckCircle2 size={18} className="text-sea-aqua" />
              ) : (
                <Circle size={18} className="text-slate-200 group-hover:text-sea-aqua" />
              )}
              <div className="flex-1">
                <p className={`text-[11px] font-bold leading-tight ${isDone ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                  {challenge.text}
                </p>
                {!isDone && (
                  <div className="flex items-center gap-1 mt-1">
                    <Sparkle size={10} className="text-sea-aqua" />
                    <span className="text-[9px] font-black uppercase text-sea-aqua">+{challenge.xp} XP</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {completed.length === CHALLENGES.length && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900 p-6 rounded-2xl text-center space-y-2"
        >
          <Trophy size={20} className="text-yellow-400 mx-auto" />
          <p className="text-white text-[10px] font-black uppercase tracking-widest">Surge Mode Active</p>
          <p className="text-slate-400 text-[9px] font-bold italic">All daily quests complete. Waves incoming.</p>
        </motion.div>
      )}
    </div>
  );
}
