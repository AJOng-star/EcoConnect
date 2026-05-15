import React, { useEffect, useState } from 'react';
import { db, collection, query, where, orderBy, onSnapshot, doc, updateDoc } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Notification } from '../types';
import SectionHeading from '../components/SectionHeading';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, MessageCircle, UserPlus, Trash2, BellOff } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'notifications'),
      where('receiverId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification)));
    });

    return () => unsub();
  }, [user]);

  const markAsRead = async (id: string) => {
    await updateDoc(doc(db, 'notifications', id), { isRead: true });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart size={16} className="text-red-500 fill-red-500/20" />;
      case 'comment': return <MessageCircle size={16} className="text-blue-500 fill-blue-500/20" />;
      case 'follow': return <UserPlus size={16} className="text-sea-aqua" />;
      default: return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-12 pb-24">
      <div className="flex items-center justify-between">
        <SectionHeading title="Currents & Ripples" />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {notifications.filter(n => !n.isRead).length} New
        </span>
      </div>

      {notifications.length === 0 && (
        <div className="py-32 text-center">
          <BellOff className="text-slate-100 mx-auto mb-6" size={64} />
          <p className="text-slate-400 font-serif italic text-lg">The ocean is calm right now.</p>
        </div>
      )}

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onClick={() => markAsRead(n.id)}
              className={`group flex items-center gap-4 p-6 rounded-3xl transition-all cursor-pointer border ${
                n.isRead ? 'bg-white border-slate-50' : 'bg-sea-aqua/[0.03] border-sea-aqua/10 shadow-sm'
              }`}
            >
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm relative shrink-0">
                {getIcon(n.type)}
                {!n.isRead && <div className="absolute -top-1 -right-1 w-3 h-3 bg-sea-aqua rounded-full border-2 border-white" />}
              </div>

              <div className="flex-1">
                <p className="text-sm font-serif italic leading-snug">
                  <span className="font-sans font-black not-italic text-slate-900 uppercase text-[10px] tracking-widest mr-2 group-hover:text-sea-aqua transition-colors">
                    {n.senderName}
                  </span>
                  {n.content}
                </p>
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-300 mt-2 block">
                  {n.createdAt.toDate().toLocaleDateString()}
                </span>
              </div>

              {n.postId && (
                <Link to={`/profile/${user?.uid}`} className="shrink-0 w-12 h-12 bg-slate-100 rounded-xl overflow-hidden hover:opacity-80 transition-opacity">
                  {/* For simplicity we don't fetch the post thumbnail here, but we could */}
                </Link>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
