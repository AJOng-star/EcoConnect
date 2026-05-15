import React, { useState, useEffect } from 'react';
import { db, collection, addDoc, query, orderBy, onSnapshot, Timestamp, updateDoc, doc, arrayUnion } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { CleanupEvent, UserProfile } from '../types';
import SectionHeading from '../components/SectionHeading';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Plus, 
  X, 
  Trash2, 
  Navigation,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function Events() {
  const { user, profile } = useAuth();
  const [events, setEvents] = useState<CleanupEvent[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nearbyUsers, setNearbyUsers] = useState<UserProfile[]>([]);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'events'), orderBy('date', 'asc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CleanupEvent)));
    });

    // Mock nearby users - in a real app, we'd query by GeoHash
    const usersQ = query(collection(db, 'users'), orderBy('xp', 'desc'));
    const unsubUsers = onSnapshot(usersQ, (snapshot) => {
      setNearbyUsers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile)).slice(0, 5));
    });

    return () => { unsub(); unsubUsers(); };
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      await addDoc(collection(db, 'events'), {
        title,
        description,
        location: locationName,
        date: Timestamp.fromDate(new Date(date)),
        organizerId: user.uid,
        organizerName: user.displayName,
        participants: [user.uid],
        status: 'upcoming'
      });
      setShowForm(false);
      setTitle('');
      setDescription('');
      setLocationName('');
      setDate('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const joinEvent = async (eventId: string) => {
    if (!user) return;
    await updateDoc(doc(db, 'events', eventId), {
      participants: arrayUnion(user.uid)
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <SectionHeading title="Organize Events" />
          <p className="text-slate-400 font-serif italic mt-2">Turning ripples into waves of change.</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-sea-aqua text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-sea-aqua/20 flex items-center gap-2 hover:scale-105 transition-all"
        >
          <Plus size={16} /> New Cleanup
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Events List */}
        <div className="lg:col-span-3 space-y-8">
          {events.length === 0 && (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-24 text-center">
              <Calendar size={48} className="text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-serif italic">No events scheduled. Be the one to lead.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {events.map((event) => (
              <motion.div 
                key={event.id}
                layout
                className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-900/[0.02] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-sea-aqua/10 text-sea-aqua px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">
                      Upcoming
                    </span>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                      {event.date.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <h3 className="text-xl font-serif italic text-slate-900 mb-2">{event.title}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-6 font-serif">{event.description}</p>
                  
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3 text-slate-400">
                      <MapPin size={14} className="text-sea-aqua" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-400">
                      <Users size={14} className="text-sea-aqua" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{event.participants.length} Protectors Joining</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => joinEvent(event.id)}
                    disabled={event.participants.includes(user?.uid || '')}
                    className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-sea-aqua disabled:bg-slate-100 disabled:text-slate-400 transition-all"
                  >
                    {event.participants.includes(user?.uid || '') ? 'Already Joined' : 'Join Action'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sidebar: Nearby Users (Geo-Social) */}
        <div className="space-y-10">
          <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-sea-aqua mb-8 flex items-center gap-2">
              <Navigation size={12} /> Nearby Protectors
            </h4>
            <div className="space-y-6">
              {nearbyUsers.map((u) => (
                <div key={u.uid} className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-full border border-white/10 p-[2px]">
                    <img src={u.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.uid}`} className="w-full h-full rounded-full" alt="" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest truncate group-hover:text-sea-aqua transition-colors">{u.username || 'protector'}</p>
                    <p className="text-[8px] text-white/40 uppercase tracking-widest">Within 5 miles</p>
                  </div>
                  <div className="text-sea-aqua"><CheckCircle2 size={12} /></div>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-3 border border-white/10 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">
              Update My Location
            </button>
          </section>

          <section className="p-8 border border-slate-100 rounded-[2.5rem] bg-slate-50">
             <AlertCircle className="text-sea-aqua mb-4" size={24} />
             <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-900 mb-2">Ocean Safety</h5>
             <p className="text-[10px] text-slate-500 leading-relaxed uppercase tracking-widest font-black">
               Always check tide conditions and bring reusable bags for collection.
             </p>
          </section>
        </div>
      </div>

      {/* Create Event Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setShowForm(false)} />
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-xl rounded-[3rem] p-12 relative z-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]"
            >
              <button 
                onClick={() => setShowForm(false)}
                className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition-colors"
              >
                <X size={24} />
              </button>

              <SectionHeading title="Lead a Cleanup" />
              <p className="text-slate-400 font-serif italic text-lg mb-10">Inspire your community to take action.</p>

              <form onSubmit={handleCreateEvent} className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-2 block">Action Title</label>
                  <input 
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Morning Tide Cleanup at Crystal Bay" 
                    className="w-full bg-slate-50 px-6 py-4 rounded-2xl focus:outline-none focus:ring-1 focus:ring-slate-100 transition-all font-serif text-lg"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-2 block">Location</label>
                  <input 
                    required
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder="Specific beach or meeting point" 
                    className="w-full bg-slate-50 px-6 py-4 rounded-2xl focus:outline-none focus:ring-1 focus:ring-slate-100 transition-all text-sm font-black uppercase tracking-widest"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-2 block">Action Date</label>
                    <input 
                      required
                      type="datetime-local"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-slate-50 px-6 py-4 rounded-2xl focus:outline-none focus:ring-1 focus:ring-slate-100 transition-all text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-2 block">Why Join?</label>
                  <textarea 
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Explain the impact and goals..." 
                    className="w-full bg-slate-50 px-6 py-4 rounded-2xl focus:outline-none focus:ring-1 focus:ring-slate-100 transition-all font-serif min-h-[120px]"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-sea-aqua transition-all shadow-xl shadow-slate-950/20"
                >
                  {loading ? 'Submitting to the Depths...' : 'Launch Cleanup Action'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
