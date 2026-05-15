import { Post, UserProfile } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { db, doc, updateDoc, arrayUnion, arrayRemove, Timestamp, collection, addDoc, onSnapshot, query, orderBy, deleteDoc, handleFirestoreError, OperationType, increment, createNotification } from '../lib/firebase';
import { Heart, MessageCircle, MoreHorizontal, Trash2, ShieldCheck, Gift, Send, Trophy, Waves, Newspaper, Flag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function PostCard({ post }: { post: Post }) {
  const { user, profile } = useAuth();
  const [isLiked, setIsLiked] = useState(post.likes.includes(user?.uid || ''));
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    setIsLiked(post.likes.includes(user?.uid || ''));
  }, [post.likes, user?.uid]);

  useEffect(() => {
    if (showComments) {
      const path = `posts/${post.id}/comments`;
      const q = query(collection(db, path), orderBy('createdAt', 'asc'));
      return onSnapshot(q, (snapshot) => {
        setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      });
    }
  }, [showComments, post.id]);

  const toggleLike = async () => {
    if (!user) return;
    const postRef = doc(db, 'posts', post.id);
    const authorRef = doc(db, 'users', post.authorId);
    const userRef = doc(db, 'users', user.uid);
    
    try {
      if (isLiked) {
        await updateDoc(postRef, { likes: arrayRemove(user.uid) });
      } else {
        await updateDoc(postRef, { likes: arrayUnion(user.uid) });
        // Interactor gets 0.5 XP for liking someone else
        if (post.authorId !== user.uid) {
          await updateDoc(userRef, { xp: increment(0.5) });
          // Author gets 1 XP
          await updateDoc(authorRef, { xp: increment(1) });
          
          await createNotification(
            post.authorId,
            user.uid,
            profile?.displayName || 'A Protector',
            'like',
            'appreciated your ripple',
            post.id
          );
        }
      }
    } catch (err) { console.error(err); }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    try {
      await addDoc(collection(db, `posts/${post.id}/comments`), {
        postId: post.id,
        authorId: user.uid,
        authorName: profile?.displayName || 'Eco Explorer',
        content: newComment,
        createdAt: Timestamp.now()
      });
      
      const postRef = doc(db, 'posts', post.id);
      await updateDoc(postRef, { commentCount: (post.commentCount || 0) + 1 });

      // Rewards logic
      if (post.authorId !== user.uid) {
        // Commenter gets 0.5 XP
        await updateDoc(doc(db, 'users', user.uid), { xp: increment(0.5) });
        // Author gets 1 XP
        await updateDoc(doc(db, 'users', post.authorId), { xp: increment(1) });

        await createNotification(
          post.authorId,
          user.uid,
          profile?.displayName || 'A Protector',
          'comment',
          `commented: "${newComment.substring(0, 30)}${newComment.length > 30 ? '...' : ''}"`,
          post.id
        );
      }

      setNewComment('');
    } catch (err) { console.error(err); }
  };

  const deletePost = async () => {
    if (!profile?.isAdmin && post.authorId !== user?.uid) return;
    try {
      await deleteDoc(doc(db, 'posts', post.id));
    } catch (err) { console.error(err); }
  };

  const featurePost = async () => {
    if (!profile?.isAdmin) return;
    try {
      const postRef = doc(db, 'posts', post.id);
      await updateDoc(postRef, { isFeatured: !post.isFeatured });
      
      // Update author status
      const authorRef = doc(db, 'users', post.authorId);
      await updateDoc(authorRef, { hasBeenFeatured: true });
      setShowOptions(false);
    } catch (err) { console.error(err); }
  };

  const reportPost = async () => {
    if (!user) return;
    try {
      const postRef = doc(db, 'posts', post.id);
      await updateDoc(postRef, { 
        reportCount: (post.reportCount || 0) + 1,
        isReported: true
      });
      setShowOptions(false);
      alert('Ripple reported for moderation. Nature thanks your vigilance.');
    } catch (err) { console.error(err); }
  };

  return (
    <div className="bg-white rounded-sm border border-slate-200 overflow-hidden max-w-lg mx-auto w-full shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)]">
      {/* Header */}
      <div className="flex justify-between items-center p-3">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${post.authorId}`} className="relative group">
            <img src={post.authorPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorId}`} className="w-8 h-8 rounded-full border border-slate-100 p-0.5 object-cover" alt={post.authorName} referrerPolicy="no-referrer" />
            <div className="absolute inset-0 rounded-full border border-sea-deep/5 group-hover:border-sea-aqua/50 transition-colors" />
          </Link>
          <div>
            <div className="flex items-center gap-1">
              <Link to={`/profile/${post.authorId}`} className="font-bold text-sm text-slate-900 hover:text-sea-aqua transition-colors tracking-tight">{post.authorName}</Link>
              {post.authorId === 'belanjaoy@gmail.com' && <ShieldCheck size={14} className="text-sea-aqua fill-sea-aqua/5" strokeWidth={2.5} />}
              {post.isFeatured && <Trophy size={14} className="text-amber-500 fill-amber-50 ml-1" />}
              {post.type === 'article' && <Newspaper size={12} className="text-slate-400 ml-1" />}
            </div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{post.createdAt.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
          </div>
        </div>
        <div className="relative">
          <button onClick={() => setShowOptions(!showOptions)} className="p-1 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
            <MoreHorizontal size={20} />
          </button>
          {showOptions && (
            <div className="absolute right-0 top-full mt-2 bg-white shadow-xl rounded-lg border border-slate-100 z-20 min-w-[140px] overflow-hidden py-1">
              {profile?.isAdmin && (
                <button onClick={featurePost} className="w-full text-left px-4 py-3 text-[10px] text-amber-600 font-black uppercase tracking-widest hover:bg-amber-50 flex items-center gap-2">
                  <Trophy size={14} /> {post.isFeatured ? 'Unfeature' : 'Feature Ripple'}
                </button>
              )}
              {(profile?.isAdmin || post.authorId === user?.uid) && (
                <button onClick={deletePost} className="w-full text-left px-4 py-3 text-[10px] text-red-500 font-black uppercase tracking-widest hover:bg-red-50 flex items-center gap-2 border-t border-slate-50">
                  <Trash2 size={14} /> Delete Post
                </button>
              )}
              {user && post.authorId !== user.uid && (
                <button onClick={reportPost} className="w-full text-left px-4 py-3 text-[10px] text-slate-500 font-black uppercase tracking-widest hover:bg-slate-50 flex items-center gap-2 border-t border-slate-50">
                  <Flag size={14} /> Report Ripple
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Image/Video */}
      <div className="bg-slate-50 relative aspect-square flex items-center justify-center group overflow-hidden border-y border-slate-100">
        {post.videoUrl ? (
          <video 
            src={post.videoUrl} 
            className="w-full h-full object-cover" 
            controls 
            playsInline
            muted
            loop
          />
        ) : post.imageUrl ? (
          <img src={post.imageUrl} className="w-full h-full object-cover" alt="Post" referrerPolicy="no-referrer" />
        ) : (
          <div className="p-8 text-center bg-gradient-to-br from-slate-50 to-slate-100 w-full h-full flex flex-col items-center justify-center">
            <Waves size={32} className="text-sea-deep/10 mb-4" />
            <p className="text-sea-deep/40 text-sm font-serif italic font-medium px-4">"{post.content}"</p>
          </div>
        )}
        
        {/* Double click heart animation zone */}
        {!post.videoUrl && <div className="absolute inset-0 z-0" onDoubleClick={toggleLike} />}
      </div>

      {/* Actions */}
      <div className="p-4 space-y-3">
        <div className="flex gap-4 items-center">
          <button 
            onClick={toggleLike}
            className={`transition-all hover:scale-110 active:scale-95 ${isLiked ? 'text-sea-coral' : 'text-slate-800 hover:text-sea-coral'}`}
          >
            <Heart size={24} fill={isLiked ? 'currentColor' : 'none'} strokeWidth={2} />
          </button>
          <button 
            onClick={() => setShowComments(!showComments)}
            className="text-slate-800 hover:text-sea-aqua transition-all hover:scale-110 active:scale-95"
          >
            <MessageCircle size={24} strokeWidth={2} />
          </button>
          <button className="text-slate-800 hover:text-amber-500 transition-all ml-auto hover:scale-110 active:scale-95">
            <Gift size={24} strokeWidth={2} />
          </button>
        </div>

        {/* Content & Likes */}
        <div className="space-y-1">
          <p className="font-extrabold text-sm text-slate-900">{post.likes.length} ocean keepers</p>
          <div className="text-sm text-slate-800 leading-relaxed overflow-hidden">
            <span className="font-extrabold mr-2">{post.authorName}</span>
            {post.content}
          </div>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {post.tags.map(tag => (
                <span key={tag} className="text-[9px] font-black uppercase tracking-widest text-sea-aqua bg-sea-aqua/5 px-2 py-0.5 rounded-sm">
                  #{tag.replace(/\s+/g, '')}
                </span>
              ))}
            </div>
          )}
          {post.commentCount > 0 && !showComments && (
            <button onClick={() => setShowComments(true)} className="text-slate-400 text-xs font-bold hover:text-sea-aqua block pt-1">
              View all {post.commentCount} ripples...
            </button>
          )}
        </div>

        {/* Comments Section */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="pt-3 border-t border-sea-foam space-y-3 overflow-hidden"
            >
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 items-start group">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.authorId}`} className="w-7 h-7 rounded-full border border-sea-deep/5" alt="" />
                  <div className="flex-1">
                    <p className="text-xs">
                      <span className="font-extrabold text-sea-deep mr-2">{comment.authorName}</span>
                      <span className="text-sea-deep/80">{comment.content}</span>
                    </p>
                  </div>
                </div>
              ))}
              <div className="bg-sea-foam/50 h-[1px] w-full my-2" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input */}
        <form onSubmit={handleAddComment} className="flex gap-2 pt-2 items-center">
          <input 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a ripple..."
            className="flex-1 bg-transparent py-1 text-sm focus:outline-none placeholder:text-sea-deep/30"
          />
          <button 
            type="submit" 
            disabled={!newComment.trim()}
            className="text-sea-aqua font-bold text-sm disabled:opacity-30 transition-opacity"
          >
            Post
          </button>
        </form>
      </div>
    </div>
  );
}
