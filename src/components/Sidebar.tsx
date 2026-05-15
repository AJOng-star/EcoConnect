import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Search, 
  PlusSquare, 
  User, 
  MapPin, 
  Waves, 
  Settings, 
  Bell,
  Navigation,
  Sparkle,
  Trophy,
  Crown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, profile } = useAuth();
  const location = useLocation();

  const menuItems = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Waves of Inspiration', icon: Sparkle, path: '/inspiration' },
    { name: 'AI Species Identifier', icon: Search, path: '/identify' },
    { name: 'Leaderboard', icon: Trophy, path: '/leaderboard' },
    { name: 'Organize Events', icon: MapPin, path: '/events' },
    { name: 'Notifications', icon: Bell, path: '/notifications' },
    { name: 'Guardian+', icon: Crown, path: '/premium' },
    { name: 'Profile', icon: User, path: `/profile/${user?.uid}` },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-80 bg-white shadow-2xl z-[70] flex flex-col p-8"
          >
            <div className="flex items-center gap-3 mb-12">
              <div className="p-2 bg-sea-aqua rounded-xl text-white">
                <Waves size={24} />
              </div>
              <span className="font-serif italic font-black text-xl text-slate-900">Eco Connect</span>
            </div>

            <nav className="flex-1 space-y-2">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                      isActive 
                        ? 'bg-slate-50 text-sea-aqua font-bold' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <item.icon size={20} />
                    <span className="text-[11px] font-black uppercase tracking-widest">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {profile && (
              <div className="mt-auto border-t border-slate-100 pt-8">
                <Link 
                  to={`/profile/${user?.uid}`} 
                  onClick={onClose}
                  className="flex items-center gap-4 p-2 hover:bg-slate-50 rounded-2xl transition-all"
                >
                  <img 
                    src={profile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`} 
                    className="w-10 h-10 rounded-full border border-slate-100" 
                    alt="Me"
                  />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 truncate">
                      {profile.displayName}
                    </p>
                    <p className="text-[9px] text-slate-400 font-bold italic">
                      @{profile.username || 'seaprotector'}
                    </p>
                  </div>
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
