import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db, collection, query, orderBy, onSnapshot, addDoc, Timestamp, updateDoc, doc, arrayUnion, arrayRemove, handleFirestoreError, OperationType, increment } from '../lib/firebase';
import { Post, UserProfile, Article, AVAILABLE_TAGS, PostTag } from '../types';
import PostCard from '../components/PostCard';
import SectionHeading from '../components/SectionHeading';
import DailyChallenges from '../components/DailyChallenges';
import SustainableAd from '../components/SustainableAd';
import { motion, AnimatePresence } from 'motion/react';
import { ImagePlus, Send, Newspaper, Sparkle, Trophy, Waves, Filter, Tag } from 'lucide-react';

export default function Home() {
  const { user, profile, login } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [featuredPost, setFeaturedPost] = useState<Post | null>(null);
  const [activeFilter, setActiveFilter] = useState<PostTag | 'All'>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'articles'), orderBy('publishedAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      setArticles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'articles');
    });
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const fetchedPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
      setPosts(fetchedPosts);
      setFeaturedPost(fetchedPosts.find(p => p.isFeatured) || null);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'posts');
    });
  }, []);

  const filteredPosts = activeFilter === 'All' 
    ? posts 
    : posts.filter(p => p.tags?.includes(activeFilter as PostTag));

  return (
    <div className="space-y-16">
      {/* Magazine Header Section (Hero Article) */}
      {articles.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <SectionHeading title="Feature Story" />
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 bg-white overflow-hidden shadow-2xl shadow-slate-200 border border-slate-100 group cursor-pointer relative"
            >
              <div className="relative h-[500px]">
                {articles[0].imageUrl ? (
                  <img src={articles[0].imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                ) : (
                  <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                    <Newspaper size={100} className="text-white/10" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent p-8 md:p-16 flex flex-col justify-end">
                  <span className="text-sea-aqua font-black tracking-[0.3em] text-[10px] uppercase mb-4">The Deep Issue • {articles[0].publishedAt.toDate().toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}</span>
                  <h1 className="text-4xl md:text-6xl font-serif italic font-black text-white mb-8 leading-[0.9] max-w-2xl">{articles[0].title}</h1>
                  <div className="flex items-center gap-6">
                    <button className="bg-white text-slate-950 px-10 py-4 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-sea-aqua hover:text-white transition-all">Read Story</button>
                    <span className="text-white/40 font-black uppercase text-[10px] tracking-widest">6 min read</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="space-y-6">
            <SectionHeading title="The Brief" />
            <div className="mt-4 space-y-2">
              {articles.slice(1, 4).map((article, idx) => (
                <motion.div 
                  key={article.id}
                  whileHover={{ x: 5 }}
                  className="bg-white p-6 border-b border-slate-100 flex gap-4 cursor-pointer last:border-0"
                >
                  <span className="text-sea-aqua font-serif italic text-2xl font-black">0{idx + 1}</span>
                  <div className="flex flex-col justify-center">
                    <h4 className="text-sm font-bold text-slate-900 leading-tight line-clamp-2 mb-1 group-hover:text-sea-aqua transition-colors">{article.title}</h4>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{article.publishedAt.toDate().toLocaleDateString()}</span>
                  </div>
                </motion.div>
              ))}
              <Link to="/stories" className="block text-center py-5 border-t border-slate-100 text-slate-900 font-black text-[10px] uppercase tracking-[0.2em] hover:text-sea-aqua transition-colors">View All Stories</Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-16">
          {!user && (
            <div className="bg-slate-950 p-16 text-center text-white relative overflow-hidden">
               <div className="relative z-10">
                 <h2 className="text-5xl font-serif italic font-black mb-6">Join the Registry</h2>
                 <p className="text-slate-400 text-lg mb-10 max-w-lg mx-auto leading-relaxed">Connect with high-impact ocean protectors and share your contributions.</p>
                 <button onClick={login} className="bg-white text-slate-950 px-12 py-5 rounded-full font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl hover:scale-105 transition-transform">Get Started</button>
               </div>
               <div className="absolute top-0 right-0 w-full h-full opacity-10">
                 <Waves size={400} className="absolute -top-40 -right-40" />
               </div>
            </div>
          )}

          {/* Social Feed */}
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <SectionHeading title="The Feed" />
              <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
                <Filter size={14} className="text-slate-400 flex-shrink-0" />
                <button
                  onClick={() => setActiveFilter('All')}
                  className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                    activeFilter === 'All' 
                      ? 'bg-slate-900 text-white shadow-md' 
                      : 'bg-white text-slate-400 border border-slate-100'
                  }`}
                >
                  All
                </button>
                {AVAILABLE_TAGS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setActiveFilter(tag)}
                    className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                      activeFilter === tag 
                        ? 'bg-sea-aqua text-white shadow-md' 
                        : 'bg-white text-slate-400 border border-slate-100'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-12">
              {filteredPosts.map((post: Post) => (
                <div key={post.id}>
                  <PostCard post={post} />
                </div>
              ))}
              {filteredPosts.length === 0 && !loading && (
                <div className="bg-white p-12 text-center border border-slate-100 italic text-slate-400 text-sm">
                  No ripples found in this category yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-16">
          <DailyChallenges />
          
          {/* Featured Person */}
          <div className="bg-white p-10 border border-slate-200 text-center relative">
             <span className="inline-block text-sea-aqua text-[9px] uppercase font-black tracking-[0.3em] mb-8">Member Spotlight</span>
             <div className="relative inline-block mb-6">
               <img src={featuredPost ? featuredPost.authorPhoto : `https://api.dicebear.com/7.x/avataaars/svg?seed=admin`} className="w-32 h-32 rounded-full border border-slate-100 grayscale hover:grayscale-0 transition-all duration-700" alt="" />
               <div className="absolute -bottom-2 -right-2 bg-slate-900 p-3 rounded-full border-4 border-white text-white">
                 <Trophy size={18} />
               </div>
             </div>
             <h3 className="text-2xl font-serif italic font-black text-slate-900 mb-2">{featuredPost ? featuredPost.authorName : "Eco Guardian"}</h3>
             <p className="text-slate-400 text-xs italic mb-10 leading-relaxed">"Every ripple starts with a single point of impact."</p>
             <button className="w-full py-5 border border-slate-200 text-slate-900 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-950 hover:text-white transition-all">Read Interview</button>
          </div>

          <SustainableAd />

          {/* Environmental Fact/Tip */}
          <div className="bg-slate-50 p-10 border border-slate-100">
             <Sparkle size={24} className="text-sea-aqua mb-8" />
             <h3 className="text-xl font-serif italic font-black text-slate-900 mb-6">Ocean Note</h3>
             <p className="text-slate-500 text-sm leading-relaxed mb-8">The ocean produces over 50% of the world's oxygen and absorbs 50 times more carbon dioxide than our atmosphere.</p>
             <div className="h-[1px] bg-slate-200 w-full mb-8" />
             <button className="text-[9px] font-black uppercase text-sea-deep tracking-[0.2em] hover:text-sea-aqua transition-colors">Contribute Data</button>
          </div>
        </div>
      </div>
    </div>
  );
}
