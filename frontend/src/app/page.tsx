'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, ArrowRight, Zap } from 'lucide-react';

export default function Landing() {
  const [sessionId, setSessionId] = useState('');
  const router = useRouter();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (sessionId.trim().length === 8) {
      router.push(`/session/${sessionId.trim()}`);
    } else {
      alert("Please enter a valid 8-digit session ID.");
    }
  };

  const handleCreate = () => {
    const randomId = Math.floor(10000000 + Math.random() * 90000000).toString();
    router.push(`/session/${randomId}`);
  };

  return (
    <div className="relative flex justify-center items-center min-h-screen p-5">
      <div className="glass-panel p-12 text-center max-w-lg w-full rounded-3xl animate-[slideUp_0.6s_cubic-bezier(0.16,1,0.3,1)] z-10">
        <div className="inline-flex p-5 rounded-2xl bg-accent/10 border border-accent/20 mb-6">
          <Zap className="text-accent w-12 h-12" />
        </div>
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-br from-white to-indigo-300 bg-clip-text text-transparent">
          Copy-Paste Lab
        </h1>
        <p className="text-gray-400 text-lg mb-10 leading-relaxed">
          Seamlessly sync your clipboard across devices in real-time.
        </p>
        
        <div className="flex flex-col gap-5">
          <button 
            onClick={handleCreate}
            className="flex items-center justify-center gap-2 w-full p-4 rounded-xl font-medium bg-accent text-white shadow-[0_0_20px_rgba(99,102,241,0.15)] hover:bg-accent-hover hover:-translate-y-0.5 hover:shadow-[0_4px_25px_rgba(99,102,241,0.4)] transition-all"
          >
            <Copy className="w-5 h-5" />
            <span>Create New Session</span>
          </button>
          
          <div className="flex items-center text-gray-500 text-sm">
            <div className="flex-1 border-b border-glass-border"></div>
            <span className="px-4">OR</span>
            <div className="flex-1 border-b border-glass-border"></div>
          </div>

          <form onSubmit={handleJoin} className="flex gap-3">
            <input 
              type="text" 
              placeholder="Enter 8-digit Session ID" 
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value.replace(/[^0-9]/g, '').slice(0, 8))}
              className="flex-1 bg-black/20 border border-glass-border rounded-xl px-4 text-white text-lg outline-none transition-colors text-center tracking-widest focus:border-accent"
              maxLength={8}
            />
            <button 
              type="submit" 
              disabled={sessionId.length !== 8}
              className="flex items-center justify-center gap-2 px-6 rounded-xl font-medium bg-glass border border-glass-border text-white hover:bg-white/10 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              <span>Join</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
      
      {/* Background glow effects */}
      <div className="absolute top-[-100px] left-[-100px] w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(99,102,241,0.4)_0%,transparent_70%)] rounded-full blur-[120px] opacity-50 animate-float"></div>
      <div className="absolute bottom-[-50px] right-[-50px] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(236,72,153,0.3)_0%,transparent_70%)] rounded-full blur-[120px] opacity-50 animate-float" style={{ animationDelay: '-5s' }}></div>
    </div>
  );
}
