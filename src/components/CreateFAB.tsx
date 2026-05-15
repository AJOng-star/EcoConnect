import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Camera, Video, Newspaper, X, Send, ImagePlus, Tag as TagIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db, collection, addDoc, Timestamp, updateDoc, doc, increment } from '../lib/firebase';
import { AVAILABLE_TAGS, PostTag } from '../types';

export default function CreateFAB() {
  const { user, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState<'photo' | 'video' | 'article' | null>(null);
  
  // Form State
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [selectedTags, setSelectedTags] = useState<PostTag[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (!user) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleOpenModal = (type: 'photo' | 'video' | 'article') => {
    setModalType(type);
    setIsOpen(false);
  };

  const handleCloseModal = () => {
    setModalType(null);
    setContent('');
    setMediaUrl('');
    setSelectedTags([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;
    setLoading(true);

    try {
      await addDoc(collection(db, 'posts'), {
        authorId: user.uid,
        authorName: profile?.displayName || 'Eco Explorer',
        authorPhoto: user.photoURL,
        content,
        imageUrl: modalType === 'photo' ? mediaUrl : null,
        videoUrl: modalType === 'video' ? mediaUrl : null,
        likes: [],
        commentCount: 0,
        isFeatured: false,
        type: modalType === 'article' ? 'article' : 'ripple',
        tags: selectedTags,
        createdAt: Timestamp.now()
      });

      if (profile) {
        const xpAmount = modalType === 'article' ? 5 : 1;
        await updateDoc(doc(db, 'users', user.uid), {
          xp: increment(xpAmount),
          articleCount: modalType === 'article' ? increment(1) : increment(0),
          updatedAt: Timestamp.now()
        });
      }

      handleCloseModal();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tag: PostTag) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const actions = [
    { icon: <Camera size={20} />, label: 'Photo', type: 'photo', color: 'bg-sea-aqua' },
    { icon: <Video size={20} />, label: 'Video', type: 'video', color: 'bg-blue-500' },
    { icon: <Newspaper size={20} />, label: 'Article', type: 'article', color: 'bg-slate-900' },
  ];

  return (
    <>
      <div className="fixed bottom-8 right-8 z-[80] flex flex-col items-end gap-4">
        <AnimatePresence>
          {isOpen && (
            <div className="flex flex-col items-end gap-3 mb-2">
              {actions.map((action, idx) => (
                <motion.button
                  key={action.type}
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.8 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => handleOpenModal(action.type as any)}
                  className="flex items-center gap-3 group"
                >
                  <span className="bg-white px-3 py-1.5 rounded-lg shadow-xl text-[10px] font-black uppercase tracking-widest text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity">
                    {action.label}
                  </span>
                  <div className={`w-12 h-12 ${action.color} rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-slate-900/10 hover:scale-110 transition-transform`}>
                    {action.icon}
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-16 h-16 rounded-[2rem] flex items-center justify-center text-white shadow-2xl transition-all duration-500 ${
            isOpen ? 'bg-slate-900 rotate-45' : 'bg-sea-aqua shadow-sea-aqua/20 hover:scale-110'
          }`}
        >
          <Plus size={32} />
        </button>
      </div>

      <AnimatePresence>
        {modalType && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-xl rounded-[3rem] p-10 relative z-10 shadow-2xl"
            >
              <button 
                onClick={handleCloseModal}
                className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition-colors"
              >
                <X size={24} />
              </button>

              <div className="flex items-center gap-3 mb-8">
                <div className={`p-2 rounded-xl text-white ${
                  modalType === 'photo' ? 'bg-sea-aqua' : 
                  modalType === 'video' ? 'bg-blue-500' : 'bg-slate-900'
                }`}>
                  {modalType === 'photo' ? <Camera size={20} /> : 
                   modalType === 'video' ? <Video size={20} /> : <Newspaper size={20} />}
                </div>
                <div>
                  <h3 className="text-xl font-serif italic font-black text-slate-900">
                    Create {modalType.charAt(0)?.toUpperCase() + modalType.slice(1)}
                  </h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Share your impact with the community
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <textarea
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={modalType === 'article' ? "Deep dive into your environmental perspective..." : "Tell the story of this ripple..."}
                  className="w-full bg-slate-50 px-6 py-4 rounded-2xl focus:outline-none focus:ring-1 focus:ring-slate-200 transition-all min-h-[150px] font-serif text-lg leading-relaxed placeholder:text-slate-300"
                />

                {modalType !== 'article' && (
                  <div className="space-y-4">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept={modalType === 'video' ? "video/*" : "image/*"}
                      className="hidden"
                    />
                    
                    {mediaUrl ? (
                      <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-50 group">
                        {modalType === 'video' ? (
                          <video src={mediaUrl} className="w-full h-full object-cover" controls />
                        ) : (
                          <img src={mediaUrl} className="w-full h-full object-cover" alt="Preview" />
                        )}
                        <button
                          type="button"
                          onClick={() => setMediaUrl('')}
                          className="absolute top-4 right-4 bg-slate-900/50 backdrop-blur-md text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center gap-3 text-slate-400 hover:border-sea-aqua hover:text-sea-aqua transition-all"
                      >
                        <div className="p-3 bg-slate-50 rounded-xl">
                          {modalType === 'video' ? <Video size={24} /> : <ImagePlus size={24} />}
                        </div>
                        <div className="text-center">
                          <p className="font-black uppercase tracking-widest text-[10px]">Select {modalType === 'video' ? 'Video' : 'Photo'}</p>
                          <p className="text-[9px] lowercase italic font-serif">or drag and drop here</p>
                        </div>
                      </button>
                    )}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <TagIcon size={12} /> Tag your ripple
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_TAGS.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                          selectedTags.includes(tag) 
                            ? 'bg-slate-900 text-white border-slate-900 shadow-lg' 
                            : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !content.trim()}
                  className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-sea-aqua transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3 disabled:opacity-30"
                >
                  {loading ? 'Submitting...' : 'Post to the Depths'}
                  {!loading && <Send size={14} />}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
