import React, { useEffect, useState } from 'react';
import { db, collection, query, where, orderBy, onSnapshot } from '../lib/firebase';
import { Post } from '../types';
import SectionHeading from '../components/SectionHeading';
import { motion } from 'motion/react';
import { ExternalLink, Newspaper, BookOpen, Anchor } from 'lucide-react';
import { Link } from 'react-router-dom';

const CURATED_LINKS = [
  { title: "Ocean Conservation Guide", url: "https://www.oceanconservancy.org", icon: <Anchor size={16} /> },
  { title: "Marine Biology Basics", url: "https://marinebio.org", icon: <BookOpen size={16} /> },
  { title: "Plastic Free Living", url: "https://www.plasticfreejuly.org", icon: <Newspaper size={16} /> },
];

export default function Inspiration() {
  const [articles, setArticles] = useState<Post[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, 'posts'),
      where('type', '==', 'article'),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      setArticles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post)));
    });
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-16 pb-24">
      {/* Curated Section */}
      <section className="bg-slate-900 rounded-[2.5rem] p-10 md:p-16 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sea-aqua/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <SectionHeading title="Waves of Inspiration" />
          <p className="text-slate-400 font-serif italic text-xl mt-4 mb-12 max-w-xl">
            Curated wisdom and deep dives into the protection of our blue planet.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CURATED_LINKS.map((link, i) => (
              <a 
                key={i} 
                href={link.url} 
                target="_blank" 
                rel="noreferrer"
                className="group bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-all"
              >
                <div className="text-sea-aqua mb-4 group-hover:scale-110 transition-transform">{link.icon}</div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest leading-tight">{link.title}</span>
                  <ExternalLink size={12} className="text-slate-500" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Feed */}
      <section className="space-y-12">
        <div className="flex items-center justify-between border-b border-slate-100 pb-6 uppercase tracking-[0.3em] font-black text-[10px] text-slate-400">
          <span>Member Perspectives</span>
          <span>{articles.length} Deep Dives</span>
        </div>

        <div className="grid gap-16">
          {articles.map((article) => (
            <motion.article 
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="flex flex-col md:flex-row gap-12 items-start">
                <div className="flex-1 space-y-6">
                  <div className="flex items-center gap-4">
                    <img src={article.authorPhoto} className="w-8 h-8 rounded-full" alt="" />
                    <Link to={`/profile/${article.authorId}`} className="text-[10px] font-black uppercase tracking-widest text-slate-900 hover:text-sea-aqua transition-colors">
                      {article.authorName}
                    </Link>
                    <span className="text-slate-200">•</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {article.createdAt.toDate().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                  </div>

                  <h2 className="text-3xl font-serif italic text-slate-900 group-hover:text-sea-aqua transition-colors leading-tight">
                    {article.content.substring(0, 80)}...
                  </h2>

                  <p className="text-slate-500 font-serif leading-relaxed text-lg line-clamp-3">
                    {article.content}
                  </p>

                  <Link 
                    to={`/profile/${article.authorId}`}
                    className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-sea-aqua hover:gap-4 transition-all"
                  >
                    Read Full Perspective <BookOpen size={12} />
                  </Link>
                </div>

                {article.imageUrl && (
                  <div className="w-full md:w-80 aspect-[4/5] rounded-3xl overflow-hidden bg-slate-100">
                    <img src={article.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                  </div>
                )}
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </div>
  );
}
