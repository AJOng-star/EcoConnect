import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

export default function BubbleBackground() {
  const [bubbles, setBubbles] = useState<{ id: number; left: string; size: number; duration: number; delay: number }[]>([]);

  useEffect(() => {
    const newBubbles = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 40 + 10,
      duration: Math.random() * 10 + 5,
      delay: Math.random() * 5
    }));
    setBubbles(newBubbles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-white">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-slate-50 to-white" />
      <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-sea-aqua/5 rounded-full blur-[120px]" />
      <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-blue-100/30 rounded-full blur-[100px]" />
      
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="bubble opacity-40"
          style={{
            left: bubble.left,
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            animationDuration: `${bubble.duration}s`,
            animationDelay: `${bubble.delay}s`
          }}
        />
      ))}
    </div>
  );
}
