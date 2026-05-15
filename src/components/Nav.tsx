import { Link, useNavigate } from 'react-router-dom';
import { Home, User, LogOut, Trophy, Waves, PlusSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import React from 'react';
import { getPrestigeTitle, getXPProgress } from '../types';

export default function Nav({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { user, profile, logout, login } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const title = profile ? getPrestigeTitle(profile) : 'None';
  const isChancellor = title === 'Eco Chancellor';

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-b border-slate-200 z-50 h-16 px-4">
      <div className="max-w-5xl mx-auto h-full flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onToggleSidebar}
            className="w-8 h-8 bg-sea-deep rounded-lg flex items-center justify-center shadow-lg shadow-sea-deep/10 hover:bg-sea-aqua transition-colors cursor-pointer"
          >
            <Waves className="text-white" size={18} />
          </button>
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-xl font-display font-black text-sea-deep tracking-tighter">EcoConnect</span>
          </Link>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          {user ? (
            <>
              <Link to="/" className="p-2 text-sea-deep hover:text-sea-aqua transition-colors">
                <Home size={22} strokeWidth={2.5} />
              </Link>
              
              <Link to={`/profile/${user.uid}`} className="flex items-center gap-2 p-1 bg-white rounded-full border border-slate-200 hover:border-sea-aqua transition-all shadow-sm">
                <img 
                  src={profile?.photoURL || user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} 
                  className="w-7 h-7 rounded-full object-cover" 
                  alt="Avatar" 
                  referrerPolicy="no-referrer"
                />
                <span className="text-[10px] font-black text-sea-deep px-1 hidden md:block uppercase tracking-widest">
                  @{profile?.username || 'protector'}
                </span>
              </Link>

              {profile?.isAdmin && (
                <Link to="/admin" className="p-2 text-sea-deep hover:text-sea-aqua transition-colors">
                  <PlusSquare size={22} strokeWidth={2.5} />
                </Link>
              )}

              <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                <LogOut size={20} strokeWidth={2.5} />
              </button>
            </>
          ) : (
            <button 
              onClick={login}
              className="bg-sea-deep text-white px-5 py-2 rounded-full font-display font-black text-xs uppercase tracking-widest shadow-xl shadow-sea-deep/10 hover:bg-sea-aqua transition-all"
            >
              Sign Up
            </button>
          )}
        </div>
      </div>
      
      {/* Visual level progress if logged in, hidden for Chancellor */}
      {user && profile && !isChancellor && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-sea-deep/5">
          <motion.div 
            className="h-full bg-sea-aqua"
            initial={{ width: 0 }}
            animate={{ width: `${getXPProgress(profile.xp)}%` }}
          />
        </div>
      )}
    </nav>
  );
}
