import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Post, Comment, UserProfile } from '../types';
import { db, collection, query, where, orderBy, onSnapshot, addDoc, Timestamp, doc, updateDoc, increment, arrayUnion, createNotification } from '../lib/firebase';
import { X, Heart, MessageCircle, Send, MoreHorizontal, ShieldCheck, Trophy, Newspaper } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PostExpandedProps {
  post: Post;
  user: { uid: string; displayName: string; photoURL: string | null } | null;
  onClose: () => void;
}

export default function PostExpanded({ post, user, onClose }: PostExpandedProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(post.likes.includes(user?.uid || ''));

  useEffect(() => {
    const q = query(
      collection(db, 'comments'),
      where('postId', '==', post.id),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment)));
    });
  }, [post.id]);

  const handleLike = async () => {
    if (!user) return;
    const postRef = doc(db, 'posts', post.id);
    const authorRef = doc(db, 'users', post.authorId);
    
    if (isLiked) {
      await updateDoc(postRef, { likes: post.likes.filter(id => id !== user.uid) });
      setIsLiked(false);
    } else {
      await updateDoc(postRef, { likes: arrayUnion(user.uid) });
      setIsLiked(true);
      if (post.authorId !== user.uid) {
        await updateDoc(doc(db, 'users', user.uid), { xp: increment(0.5) });
        await updateDoc(authorRef, { xp: increment(1) });
        
        await createNotification(
          post.authorId,
          user.uid,
          user.displayName,
          'like',
          'appreciated your ripple',
          post.id
        );
      }
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    await addDoc(collection(db, 'comments'), {
      postId: post.id,
      authorId: user.uid,
      authorName: user.displayName,
      content: newComment,
      createdAt: Timestamp.now()
    });

    await updateDoc(doc(db, 'posts', post.id), { commentCount: increment(1) });
    if (post.authorId !== user.uid) {
      await updateDoc(doc(db, 'users', user.uid), { xp: increment(0.5) });
      await updateDoc(doc(db, 'users', post.authorId), { xp: increment(1) });

      await createNotification(
        post.authorId,
        user.uid,
        user.displayName,
        'comment',
        `commented: "${newComment.substring(0, 30)}${newComment.length > 30 ? '...' : ''}"`,
        post.id
      );
    }
    setNewComment('');
  };

  const [showMobileComments, setShowMobileComments] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-8"
    >
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
      
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-[110] hidden md:block"
      >
        <X size={32} />
      </button>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white w-full max-w-6xl h-full md:h-auto md:max-h-[800px] rounded-sm overflow-hidden flex flex-col md:flex-row relative z-10"
      >
        {/* Close button for mobile */}
        <button 
          onClick={onClose}
          className="absolute top-4 left-4 text-white p-2 bg-black/20 rounded-full md:hidden z-20"
        >
          <X size={20} />
        </button>

        {/* Media Side (3/4 on desktop) */}
        <div className="md:flex-1 bg-slate-950 flex items-center justify-center relative overflow-hidden h-[40vh] md:h-auto">
          {post.videoUrl ? (
            <video 
              src={post.videoUrl} 
              className="w-full h-full object-contain" 
              controls 
              autoPlay
              playsInline
              loop
            />
          ) : post.imageUrl ? (
            <img 
              src={post.imageUrl} 
              className="w-full h-full object-contain" 
              alt="Post content" 
            />
          ) : (
            <div className="p-12 text-white max-w-xl text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-6">
                <Newspaper className="text-sea-aqua" size={32} />
                <span className="text-[10px] font-black uppercase tracking-widest text-sea-aqua">Full Article</span>
              </div>
              <p className="text-xl md:text-2xl font-serif italic leading-relaxed">
                {post.content}
              </p>
            </div>
          )}
        </div>

        {/* Interaction Side (1/4 on desktop) */}
        <div className="flex-1 flex flex-col bg-white border-l border-slate-100 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-slate-50 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <img src={post.authorPhoto} className="w-8 h-8 rounded-full border border-slate-100" alt="" />
              <div>
                <Link to={`/profile/${post.authorId}`} className="text-[10px] font-black uppercase tracking-widest text-slate-900 block hover:text-sea-aqua cursor-pointer leading-tight">
                  {post.authorName}
                </Link>
                {post.isFeatured && (
                  <div className="flex items-center gap-1 text-[8px] text-amber-500 font-black uppercase tracking-[0.2em]">
                    <Trophy size={8} /> Featured Protector
                  </div>
                )}
              </div>
            </div>
            <button className="text-slate-400">
              <MoreHorizontal size={18} />
            </button>
          </div>

          <div className="md:hidden p-4 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <button onClick={handleLike} className={`${isLiked ? 'text-red-500 fill-red-500' : 'text-slate-900'}`}>
                <Heart size={20} />
              </button>
              <button onClick={() => setShowMobileComments(!showMobileComments)} className={`${showMobileComments ? 'text-sea-aqua' : 'text-slate-900'}`}>
                <MessageCircle size={20} />
              </button>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">
              {post.likes.length} Shells
            </p>
          </div>

          {/* Comments List (Always scrollable, mobile height adjusted) */}
          <div className={`flex-1 overflow-y-auto p-4 space-y-6 flex flex-col-reverse custom-scrollbar ${!showMobileComments && 'hidden md:flex'}`}>
            {comments.map(comment => (
              <div key={comment.id} className="flex gap-3">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.authorId}`} className="w-8 h-8 rounded-full flex-shrink-0" alt="" />
                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 mb-1">
                    {comment.authorName}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed font-serif italic">
                    {comment.content}
                  </p>
                  <p className="text-[8px] text-slate-300 font-bold uppercase mt-2">
                    {comment.createdAt.toDate().toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {/* Post Content as Caption */}
            {post.imageUrl && (
              <div className="flex gap-3 border-b border-slate-50 pb-6">
                <img src={post.authorPhoto} className="w-8 h-8 rounded-full flex-shrink-0" alt="" />
                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 mb-1">
                    {post.authorName}
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed font-serif italic">
                    {post.content}
                  </p>
                </div>
              </div>
            )}
            {comments.length === 0 && !post.imageUrl && (
              <p className="text-center text-slate-300 font-serif italic py-12">No echoes yet.</p>
            )}
          </div>

          {/* Action Bar (Desktop only) */}
          <div className="hidden md:block p-4 border-t border-slate-50 shrink-0">
            <div className="flex items-center gap-4 mb-3">
              <button onClick={handleLike} className={`${isLiked ? 'text-red-500 fill-red-500' : 'text-slate-900'} hover:scale-110 active:scale-95 transition-transform`}>
                <Heart size={24} />
              </button>
              <button onClick={() => document.getElementById('comment-input')?.focus()} className="text-slate-900 hover:scale-110 active:scale-95 transition-transform">
                <MessageCircle size={24} />
              </button>
              <button className="text-slate-900 hover:scale-110 active:scale-95 transition-transform">
                <Send size={24} />
              </button>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">
              {post.likes.length} keepers of the blue heart
            </p>
          </div>
          
          <form onSubmit={handleComment} className="p-4 border-t border-slate-50 shrink-0 bg-white">
            <div className="relative">
              <input 
                id="comment-input"
                type="text" 
                placeholder="Cast a ripple (comment)..." 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full bg-slate-50 px-5 py-4 rounded-full text-xs focus:outline-none pr-12 font-serif italic"
              />
              <button 
                type="submit"
                disabled={!newComment.trim()}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-sea-aqua font-black uppercase text-[10px] tracking-widest disabled:opacity-30"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}
