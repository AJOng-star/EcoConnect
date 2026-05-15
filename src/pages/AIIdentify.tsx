import React, { useState, useRef } from 'react';
import { Camera, Search, Sparkle, Loader2, Info, Leaf, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SectionHeading from '../components/SectionHeading';

interface SpeciesInfo {
  name: string;
  scientificName: string;
  description: string;
  importance: string;
}

export default function AIIdentify() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SpeciesInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      setResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const identifySpecies = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);

    try {
      const base64Data = image.split(',')[1];
      const mimeType = image.split(';')[0].split(':')[1];

      const response = await fetch('/api/gemini/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Data, mimeType }),
      });

      if (!response.ok) throw new Error('AI analysis failed');
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError('The waves are too rough for identification right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8">
      <div className="text-center space-y-4">
        <SectionHeading title="Species Registry" />
        <p className="text-slate-500 font-serif italic text-lg max-w-xl mx-auto">
          Capture a piece of the ecosystem and let our neural currents identify its spirit.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Upload Zone */}
        <div className="space-y-6">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className={`aspect-square rounded-[3rem] border-2 border-dashed transition-all flex flex-col items-center justify-center p-8 text-center cursor-pointer overflow-hidden relative ${
              image ? 'border-sea-aqua' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            {image ? (
              <img src={image} className="absolute inset-0 w-full h-full object-cover" alt="Captured" />
            ) : (
              <div className="space-y-4">
                <div className="w-20 h-20 bg-white rounded-3xl shadow-xl shadow-slate-200 flex items-center justify-center mx-auto">
                  <Camera size={32} className="text-sea-aqua" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-900">Transmit Visual</p>
                  <p className="text-[10px] text-slate-400 font-bold italic mt-1">Tap to select or capture</p>
                </div>
              </div>
            )}
          </motion.div>

          <button
            onClick={identifySpecies}
            disabled={!image || loading}
            className={`w-full py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-3 transition-all ${
              !image || loading 
                ? 'bg-slate-100 text-slate-400' 
                : 'bg-sea-aqua text-white shadow-xl shadow-sea-aqua/20 hover:scale-[1.02]'
            }`}
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Sparkle size={18} />
            )}
            {loading ? 'Analyzing Current...' : 'Identify Spirit'}
          </button>
        </div>

        {/* Analysis Results */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-slate-200 border border-slate-50 space-y-8"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-sea-aqua">Species Identified</span>
                  <h2 className="text-3xl font-serif italic font-black text-slate-900">{result.name}</h2>
                  <p className="text-slate-400 font-mono text-[10px] italic">{result.scientificName}</p>
                </div>

                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="mt-1 p-2 bg-slate-50 rounded-lg text-slate-900">
                      <Info size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Description</p>
                      <p className="text-sm leading-relaxed text-slate-600 italic font-serif ">{result.description}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="mt-1 p-2 bg-sea-aqua/10 rounded-lg text-sea-aqua">
                      <Leaf size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Ecological Role</p>
                      <p className="text-sm leading-relaxed text-slate-600">{result.importance}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                   <div className="flex -space-x-2">
                     {[1,2,3].map(i => (
                       <div key={i} className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white" />
                     ))}
                   </div>
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Share with Community</p>
                </div>
              </motion.div>
            ) : error ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-8 bg-red-50 rounded-[2rem] border border-red-100 text-red-500 text-center space-y-4"
              >
                <Target size={32} className="mx-auto opacity-50" />
                <p className="text-sm font-bold">{error}</p>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-6 border-2 border-dashed border-slate-100 rounded-[3rem]">
                <div className="p-6 bg-slate-50 rounded-full text-slate-200">
                  <Search size={48} />
                </div>
                <div className="space-y-2">
                  <h3 className="font-serif italic font-black text-slate-300">Awaiting Signal</h3>
                  <p className="text-xs text-slate-300 max-w-[200px] leading-relaxed">
                    Once you transmit a visual, our AI will peer through the depths to identify it.
                  </p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
