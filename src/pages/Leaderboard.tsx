import React, { useState, useEffect } from 'react';
import { db, collection, query, orderBy, limit, onSnapshot, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile, getLevelFromXP, getPrestigeTitle } from '../types';
import { Trophy, Medal, Crown, Star, ArrowUp, Waves, Sparkle } from 'lucide-react';
import { motion } from 'motion/react';
import SectionHeading from '../components/SectionHeading';
import { Link } from 'react-router-dom';

export default function Leaderboard() {
  const [topUsers, setTopUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('xp', 'desc'), limit(20));
    return onSnapshot(q, (snapshot) => {
      setTopUsers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });
  }, []);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Crown className="text-yellow-400" size={24} />;
      case 1: return <Medal className="text-slate-300" size={24} />;
      case 2: return <Medal className="text-amber-600" size={24} />;
      default: return <span className="text-slate-300 font-serif italic text-xl font-black">{index + 1}</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8">
      <div className="text-center space-y-4">
        <SectionHeading title="Impact Currents" />
        <p className="text-slate-500 font-serif italic text-lg max-w-xl mx-auto">
          Honoring those whose ripples create the largest waves of change.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Podium */}
        {topUsers.slice(0, 3).map((user, idx) => (
          <motion.div
            key={user.uid}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`relative p-8 rounded-[2.5rem] border text-center flex flex-col items-center ${
              idx === 0 ? 'bg-slate-950 text-white border-slate-900 shadow-2xl scale-110 z-10' : 'bg-white border-slate-100 shadow-xl'
            }`}
          >
            <div className="absolute -top-4 -right-4 bg-sea-aqua p-3 rounded-2xl text-white shadow-xl rotate-12">
              {getRankIcon(idx)}
            </div>
            
            <Link to={`/profile/${user.uid}`} className="group relative mb-6 block">
              <img 
                src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} 
                className={`w-28 h-28 rounded-full border-4 transition-all duration-500 ${
                  idx === 0 ? 'border-sea-aqua grayscale-0' : 'border-white grayscale group-hover:grayscale-0'
                }`} 
                alt="" 
              />
              {idx === 0 && (
                <div className="absolute inset-0 rounded-full animate-ping border-4 border-sea-aqua/20" />
              )}
            </Link>

            <h3 className="text-xl font-serif italic font-black mb-1 truncate w-full">{user.displayName}</h3>
            <p className={`text-[10px] font-black uppercase tracking-widest mb-6 ${idx === 0 ? 'text-sea-aqua' : 'text-slate-400'}`}>
              {getPrestigeTitle(user)}
            </p>

            <div className="space-y-1">
              <div className="flex items-center gap-2 justify-center">
                <Sparkle size={14} className="text-sea-aqua" />
                <span className="text-2xl font-black">{user.xp}</span>
              </div>
              <p className="text-[9px] font-bold uppercase tracking-widest opacity-50">Impact XP</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* List */}
      <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
        <div className="p-10 border-b border-slate-50 flex items-center justify-between">
           <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">The Global Registry</h4>
           <div className="flex items-center gap-2 text-sea-aqua">
             <Trophy size={14} />
             <span className="text-[10px] font-black uppercase tracking-widest">Rankings</span>
           </div>
        </div>

        <div className="divide-y divide-slate-50">
          {topUsers.slice(3).map((user, idx) => (
            <motion.div
              key={user.uid}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="group flex items-center gap-6 p-8 hover:bg-slate-50 transition-all cursor-pointer"
            >
              <div className="w-12 text-center text-slate-200 group-hover:text-sea-aqua transition-colors">
                <span className="text-xl font-serif italic font-black">{idx + 4}</span>
              </div>

              <Link to={`/profile/${user.uid}`} className="flex-1 flex items-center gap-4">
                <img 
                  src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} 
                  className="w-12 h-12 rounded-full border border-white shadow-md" 
                  alt="" 
                />
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-900">{user.displayName}</p>
                  <p className="text-[9px] text-slate-400 font-bold italic">@{user.username || 'protector'}</p>
                </div>
              </Link>

              <div className="text-right space-y-1">
                <div className="text-sm font-black text-slate-900 group-hover:text-sea-aqua transition-colors flex items-center gap-2 justify-end">
                   {user.xp} <ArrowUp size={12} className="text-green-400" />
                </div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Level {getLevelFromXP(user.xp)}</p>
              </div>
            </motion.div>
          ))}
          
          {loading && (
            <div className="p-20 text-center text-slate-300 font-serif italic text-xl animate-pulse">
              Reading the currents...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
