import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db, doc, onSnapshot, collection, query, where, orderBy, updateDoc, increment, arrayUnion, arrayRemove, createNotification, Timestamp } from '../lib/firebase';
import { UserProfile, Post, getLevelFromXP, getXPProgress, getPrestigeTitle } from '../types';
import PostExpanded from '../components/PostExpanded';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Settings, 
  Grid, 
  Heart, 
  MessageCircle, 
  ShieldCheck, 
  Camera,
  Check,
  Newspaper,
  Crown,
  BarChart3,
  TrendingUp,
  Droplets
} from 'lucide-react';

export default function Profile() {
  const { uid } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ displayName: '', username: '', bio: '', photoURL: '' });
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditForm(prev => ({ ...prev, photoURL: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!uid) return;
    const unsub = onSnapshot(doc(db, 'users', uid), (doc) => {
      if (doc.exists()) {
        const data = doc.data() as UserProfile;
        setProfile(data);
        setIsFollowing(data.followers?.includes(user?.uid || ''));
        setEditForm({
          displayName: data.displayName || '',
          username: data.username || '',
          bio: data.bio || '',
          photoURL: data.photoURL || ''
        });
      }
    });

    const postsQuery = query(
      collection(db, 'posts'),
      where('authorId', '==', uid),
      orderBy('createdAt', 'desc')
    );
    const unsubPosts = onSnapshot(postsQuery, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post)));
    });

    return () => { unsub(); unsubPosts(); };
  }, [uid, user?.uid]);

  const [isFollowLoading, setIsFollowLoading] = useState(false);

  const toggleFollow = async () => {
    if (!user || !profile || !uid || isFollowLoading) return;
    setIsFollowLoading(true);
    try {
      const targetRef = doc(db, 'users', uid);
      const meRef = doc(db, 'users', user.uid);

      if (isFollowing) {
        await updateDoc(targetRef, { followers: arrayRemove(user.uid) });
        await updateDoc(meRef, { following: arrayRemove(uid) });
      } else {
        await updateDoc(targetRef, { followers: arrayUnion(user.uid) });
        await updateDoc(meRef, { following: arrayUnion(uid) });
        
        await createNotification(
          uid,
          user.uid,
          user.displayName || 'A Protector',
          'follow',
          'started following your environmental journey'
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !uid) return;
    try {
      await updateDoc(doc(db, 'users', uid), {
        ...editForm,
        updatedAt: Timestamp.now()
      });
      setShowEditModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (!profile) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-pulse text-slate-300 font-serif italic text-xl">Peering through the waves...</div>
    </div>
  );

  const title = getPrestigeTitle(profile);
  const currentLevel = getLevelFromXP(profile.xp);
  const progress = getXPProgress(profile.xp);
  const isMe = user?.uid === uid;

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row items-center md:items-start gap-12 pt-8">
        <div className="relative group">
          <div className="w-40 h-40 rounded-full bg-gradient-to-tr from-sea-aqua to-blue-500 p-[3px] shadow-2xl">
            <div className="w-full h-full rounded-full bg-white p-1 overflow-hidden">
              <img 
                src={profile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.uid}`} 
                className="w-full h-full rounded-full object-cover" 
                alt={profile.displayName} 
              />
            </div>
          </div>
          {isMe && (
            <button 
              onClick={() => {
                setShowEditModal(true);
                setTimeout(() => fileInputRef.current?.click(), 100);
              }}
              className="absolute bottom-1 right-1 bg-white p-2 rounded-full shadow-xl text-slate-900 hover:text-sea-aqua transition-colors border border-slate-100 opacity-0 group-hover:opacity-100"
            >
              <Camera size={18} />
            </button>
          )}
        </div>

        <div className="flex-1 space-y-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center justify-center md:justify-start gap-2">
              {profile.username || 'protector'}
              {title === 'Eco Chancellor' && <ShieldCheck size={20} className="text-sea-aqua fill-sea-aqua/5" strokeWidth={2.5} />}
              {profile.isPremium && <Crown size={18} className="text-amber-500 fill-amber-500/10" strokeWidth={2.5} />}
            </h1>
            
            <div className="flex items-center justify-center gap-2">
              {isMe ? (
                <>
                  <button 
                    onClick={() => setShowEditModal(true)}
                    className="px-6 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all text-slate-900"
                  >
                    Edit Profile
                  </button>
                  <button className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-100 transition-all text-slate-900">
                    <Settings size={18} />
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={toggleFollow}
                    disabled={isFollowLoading}
                    className={`px-8 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-lg ${
                      isFollowing 
                        ? 'bg-white border border-slate-200 text-slate-500' 
                        : 'bg-sea-aqua text-white shadow-sea-aqua/20 hover:scale-[1.02]'
                    } ${isFollowLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isFollowing ? (
                      <span className="flex items-center gap-2 font-black uppercase tracking-widest leading-none">
                        {isFollowLoading ? 'Wait...' : <><Check size={14} /> Following</>}
                      </span>
                    ) : (
                      isFollowLoading ? 'Wait...' : 'Follow'
                    )}
                  </button>
                  <button className="px-6 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-slate-100 text-slate-900">
                    Message
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-8 font-serif italic text-lg text-slate-900">
            <div><span className="font-sans font-black not-italic text-xl mr-1">{posts.length}</span> posts</div>
            <div><span className="font-sans font-black not-italic text-xl mr-1">{profile.followers?.length || 0}</span> followers</div>
            <div><span className="font-sans font-black not-italic text-xl mr-1">{profile.following?.length || 0}</span> following</div>
          </div>

          <div className="space-y-1">
            <p className="font-black text-xs uppercase tracking-[0.2em] text-slate-400">{profile.displayName}</p>
            {title !== 'None' && <p className="text-sea-aqua font-serif italic text-base">{title}</p>}
            <p className="text-slate-600 text-sm max-w-md leading-relaxed whitespace-pre-wrap">{profile.bio || "Dedication is the first ripple towards change."}</p>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-4 py-2 border-t border-slate-100">
             <div className="text-center md:text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">XP Power</p>
                <p className="text-sm font-bold text-slate-900">{profile.xp} Shells</p>
             </div>
             <div className="w-[1px] h-8 bg-slate-100" />
             <div className="text-center md:text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Impact Level</p>
                <p className="text-sm font-bold text-slate-900">{currentLevel}</p>
             </div>
             {profile.streak !== undefined && (
               <>
                 <div className="w-[1px] h-8 bg-slate-100" />
                 <div className="text-center md:text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Streak</p>
                    <p className="text-sm font-bold text-slate-900 flex items-center gap-1">
                      <TrendingUp size={14} className="text-orange-500" />
                      {profile.streak} Days
                    </p>
                 </div>
               </>
             )}
          </div>
          
          {isMe && !profile.isPremium && (
            <Link 
              to="/premium"
              className="group flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-amber-100/30 rounded-2xl border border-amber-100 transition-all hover:shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-xl text-amber-500 shadow-sm">
                  <Crown size={20} className="fill-amber-500" />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-amber-600">Upgrade to Guardian+</p>
                  <p className="text-[10px] text-amber-800/60 font-serif italic">Unlock exclusive impact tools</p>
                </div>
              </div>
              <p className="text-[10px] font-bold text-amber-600 bg-white px-3 py-1 rounded-full group-hover:bg-amber-600 group-hover:text-white transition-all">JOIN</p>
            </Link>
          )}
        </div>
      </header>

      {/* Profile Grid */}
      <div className="border-t border-slate-100 pt-1">
        <div className="flex justify-center gap-12">
          <button className="flex items-center gap-2 py-4 border-t-2 border-slate-900 -mt-[2px] transition-all">
            <Grid size={12} className="text-slate-900" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Post Ripples</span>
          </button>
          {profile.isPremium && (
            <button className="flex items-center gap-2 py-4 border-t-2 border-transparent -mt-[2px] opacity-40 hover:opacity-100 transition-all">
              <BarChart3 size={12} />
              <span className="text-[10px] font-black uppercase tracking-widest">Impact Stats</span>
            </button>
          )}
        </div>

        {/* Premium Stats Visualization */}
        {profile.isPremium && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
          >
            <div className="p-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12 group-hover:scale-125 transition-transform">
                <TrendingUp size={100} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Growth Metric</p>
              <h3 className="text-4xl font-black text-slate-900 mb-1">+{profile.xp * 12}%</h3>
              <p className="text-xs text-slate-500 font-serif italic">Quarterly environmental influence</p>
              <div className="mt-6 flex items-end gap-1 h-12">
                {[4,7,5,8,9,6,10].map((h, i) => (
                  <div key={i} className="flex-1 bg-sea-aqua/20 rounded-full" style={{ height: `${h*10}%` }} />
                ))}
              </div>
            </div>

            <div className="p-8 bg-slate-900 text-white rounded-[2rem] shadow-xl shadow-slate-900/10 overflow-hidden relative group">
              <div className="absolute bottom-0 right-0 p-4 opacity-10 group-hover:-translate-y-2 transition-transform">
                <Droplets size={100} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 mb-2">Carbon Offset</p>
              <h3 className="text-4xl font-black text-white mb-1">{(profile.xp * 0.4).toFixed(1)}kg</h3>
              <p className="text-xs text-slate-400 font-serif italic">Verified ripple contribution</p>
              <div className="mt-6 flex items-center justify-between text-[10px] font-black tracking-widest uppercase">
                <span className="text-sea-aqua">Level {currentLevel} Path</span>
                <span className="text-slate-500">Goal: 50.0kg</span>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full mt-2">
                <div className="h-full bg-sea-aqua rounded-full shadow-lg shadow-sea-aqua/20" style={{ width: `${Math.min(100, (profile.xp * 0.4 / 50) * 100)}%` }} />
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-3 gap-1 md:gap-4 mt-1">
          {posts.map((post) => (
            <motion.div 
              key={post.id}
              whileHover={{ scale: 0.98 }}
              onClick={() => setSelectedPost(post)}
              className="aspect-square relative group cursor-pointer bg-slate-100 overflow-hidden"
            >
              {post.imageUrl ? (
                <img src={post.imageUrl} className="w-full h-full object-cover" alt="" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-slate-50 group-hover:bg-slate-100 transition-colors">
                  <Newspaper className="text-slate-200 mb-2" size={32} />
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-tight">Article</p>
                </div>
              )}
              
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4 text-white">
                <div className="flex items-center gap-2">
                  <Heart className="fill-white" size={20} />
                  <span className="font-black text-lg">{post.likes.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="fill-white" size={20} />
                  <span className="font-black text-lg">{post.commentCount}</span>
                </div>
              </div>
            </motion.div>
          ))}
          {posts.length === 0 && (
            <div className="col-span-3 py-24 text-center">
              <p className="text-slate-400 font-serif italic">No ripples discovered yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" 
              onClick={() => setShowEditModal(false)} 
            />
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 relative z-10 shadow-2xl"
            >
              <h2 className="text-2xl font-serif italic font-black text-slate-900 mb-6">Refine Your Ripple</h2>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Display Name</label>
                  <input
                    type="text"
                    value={editForm.displayName}
                    onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                    className="w-full bg-slate-50 px-4 py-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-200 transition-all text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Username</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-sm">@</span>
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                      className="w-full bg-slate-50 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-200 transition-all text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Profile Picture</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-2xl">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-200 shadow-inner">
                      <img 
                        src={editForm.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${uid}`} 
                        className="w-full h-full object-cover"
                        alt="Preview"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-2 bg-white border border-slate-200 rounded-lg text-[9px] font-black uppercase tracking-widest hover:border-sea-aqua hover:text-sea-aqua transition-all"
                    >
                      Choose New Photo
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Bio</label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    className="w-full bg-slate-50 px-4 py-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-200 transition-all text-sm min-h-[100px] font-serif italic"
                    placeholder="Tell your environmental story..."
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-slate-900 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-sea-aqua transition-all shadow-xl shadow-slate-900/10"
                  >
                    Update Profile
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Expanded Post View */}
      <AnimatePresence>
        {selectedPost && (
          <PostExpanded 
            post={selectedPost} 
            user={user ? { uid: user.uid, displayName: user.displayName || 'Protector', photoURL: user.photoURL || null } : null}
            onClose={() => setSelectedPost(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
