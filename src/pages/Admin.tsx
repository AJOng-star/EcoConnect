import { Post, UserProfile, Article, getLevelFromXP } from '../types';
import { Newspaper, Users, ShieldAlert, CheckCircle, Trophy, Megaphone, Sparkle, Send } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, collection, query, orderBy, onSnapshot, addDoc, Timestamp, updateDoc, doc, getDocs, deleteDoc } from '../lib/firebase';
import SectionHeading from '../components/SectionHeading';
import { motion } from 'motion/react';
import { Navigate } from 'react-router-dom';

export default function Admin() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'moderate' | 'articles' | 'featured'>('moderate');
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    if (!profile?.isAdmin) return;
    
    const unsubPosts = onSnapshot(query(collection(db, 'posts'), orderBy('createdAt', 'desc')), (snap) => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Post)));
    });

    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile)));
    });

    return () => { unsubPosts(); unsubUsers(); };
  }, [profile]);

  if (!profile?.isAdmin) return <Navigate to="/" />;

  const featurePerson = async (uid: string) => {
    try {
      // Clear previous people of the month
      const currentFeatured = users.filter(u => u.isPersonOfMonth);
      for (const u of currentFeatured) {
        await updateDoc(doc(db, 'users', u.uid), { isPersonOfMonth: false });
      }
      // Set new one
      await updateDoc(doc(db, 'users', uid), { isPersonOfMonth: true });
      alert("New Person of the Month crowned!");
    } catch (err) { console.error(err); }
  };

  const featurePost = async (postId: string) => {
    try {
      // Clear previous featured posts
      const currentFeatured = posts.filter(p => p.isFeatured);
      for (const p of currentFeatured) {
        await updateDoc(doc(db, 'posts', p.id), { isFeatured: false });
      }
      // Set new one
      await updateDoc(doc(db, 'posts', postId), { isFeatured: true });
      alert("Post featured on homepage!");
    } catch (err) { console.error(err); }
  };

  const [confirming, setConfirming] = useState<{ id: string, type: 'dismiss' | 'delete' } | null>(null);

  const dismissReport = async (postId: string) => {
    try {
      await updateDoc(doc(db, 'posts', postId), { 
        isReported: false,
        reportCount: 0 
      });
      setConfirming(null);
    } catch (err) { console.error(err); }
  };

  const deletePost = async (postId: string) => {
    try {
      await deleteDoc(doc(db, 'posts', postId));
      setConfirming(null);
    } catch (err) { console.error(err); }
  };

  const reportedPosts = posts.filter(p => p.isReported);
  const normalPosts = posts.filter(p => !p.isReported);

  return (
    <div className="space-y-8">
      <header className="bg-sea-deep text-white p-8 rounded-[2.5rem] shadow-xl flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-black mb-2">Deep Sea Control</h1>
          <p className="text-white/60">Administrator Dashboard</p>
        </div>
        <ShieldAlert size={48} className="text-sea-aqua" />
      </header>

      <div className="flex gap-4 p-2 bg-white rounded-2xl shadow-sm border border-sea-deep/5">
        {[
          { id: 'moderate', icon: Megaphone, label: 'Moderate' },
          { id: 'articles', icon: Newspaper, label: 'Stories' },
          { id: 'featured', icon: Trophy, label: 'Awards' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${activeTab === tab.id ? 'bg-sea-aqua text-white shadow-lg' : 'text-sea-deep hover:bg-sea-foam'}`}
          >
            <tab.icon size={20} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-sea-deep/5 min-h-[400px]">
        {activeTab === 'moderate' && (
          <div className="space-y-12">
            {reportedPosts.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                   <SectionHeading title="Moderation Queue" />
                   <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">ACTION REQUIRED</span>
                </div>
                <div className="grid gap-4">
                  {reportedPosts.map(post => (
                    <div key={post.id} className="flex flex-col md:flex-row md:items-center justify-between border-2 border-red-100 bg-red-50/30 px-6 py-4 rounded-2xl gap-4">
                      <div className="flex items-center gap-4">
                        <img src={post.authorPhoto} className="w-10 h-10 rounded-full" alt="" />
                        <div>
                          <p className="font-bold text-sm text-sea-deep">{post.authorName}</p>
                          <p className="text-xs text-red-700/60 truncate max-w-md italic">"{post.content}"</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="bg-red-500 text-white text-[9px] font-black px-3 py-1 rounded-full shadow-lg shadow-red-500/20">
                          {post.reportCount} REPORTS
                        </div>

                        {confirming?.id === post.id ? (
                          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-red-200">
                            <span className="text-[9px] font-black uppercase text-slate-400 px-2">Confirm {confirming.type}?</span>
                            <button 
                              onClick={() => confirming.type === 'dismiss' ? dismissReport(post.id) : deletePost(post.id)}
                              className="px-3 py-1 bg-slate-900 text-white text-[9px] font-black rounded-lg hover:bg-sea-aqua transition-colors"
                            >
                              YES
                            </button>
                            <button 
                              onClick={() => setConfirming(null)}
                              className="px-3 py-1 bg-slate-100 text-slate-500 text-[9px] font-black rounded-lg"
                            >
                              NO
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button 
                              onClick={() => setConfirming({ id: post.id, type: 'dismiss' })} 
                              className="p-2 bg-white text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all shadow-sm border border-emerald-100 group relative"
                              title="Dismiss Report"
                            >
                              <CheckCircle size={20} />
                              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Dismiss</span>
                            </button>
                            <button 
                              onClick={() => setConfirming({ id: post.id, type: 'delete' })} 
                              className="p-2 bg-white text-red-600 hover:bg-red-50 rounded-xl transition-all shadow-sm border border-red-100 group relative"
                              title="Delete Post"
                            >
                              <ShieldAlert size={20} />
                              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-6">
              <SectionHeading title="Recent Waves" />
              <div className="grid gap-4">
                {normalPosts.map(post => (
                  <div key={post.id} className="flex items-center justify-between bg-sea-foam px-6 py-4 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <img src={post.authorPhoto} className="w-10 h-10 rounded-full" alt="" />
                      <div>
                        <p className="font-bold text-sm text-sea-deep">{post.authorName}</p>
                        <p className="text-xs text-sea-deep/60 truncate max-w-md">{post.content}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => featurePost(post.id)} className={`p-2 rounded-xl transition-all ${post.isFeatured ? 'bg-sea-aqua text-white' : 'bg-white text-sea-deep hover:bg-sea-aqua/10'}`}>
                        <Trophy size={20} />
                      </button>
                      <button onClick={() => deleteDoc(doc(db, 'posts', post.id))} className="p-2 bg-white text-red-500 hover:bg-red-50 rounded-xl transition-all">
                        <ShieldAlert size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'articles' && (
          <div className="py-20 text-center">
            <Newspaper size={48} className="text-slate-100 mx-auto mb-6" />
            <p className="text-slate-400 font-serif italic text-lg">Use the Creation Ripple (FAB) in the bottom right to publish new inspiration.</p>
          </div>
        )}

        {activeTab === 'featured' && (
          <div className="space-y-6">
            <SectionHeading title="Eco Guardians" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {users.map(u => (
                <div key={u.uid} className="bg-sea-foam p-4 rounded-3xl flex items-center justify-between border-2 border-transparent hover:border-sea-aqua transition-all">
                  <div className="flex items-center gap-4">
                    <img src={u.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.uid}`} className="w-12 h-12 rounded-2xl" alt="" />
                    <div>
                      <p className="font-bold text-sea-deep">{u.displayName}</p>
                      <p className="text-xs text-sea-aqua font-bold">Level {getLevelFromXP(u.xp)}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => featurePerson(u.uid)}
                    className={`p-3 rounded-2xl transition-all ${u.isPersonOfMonth ? 'bg-yellow-400 text-white shadow-lg' : 'bg-white text-yellow-400 hover:bg-yellow-50'}`}
                  >
                    <Trophy size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
