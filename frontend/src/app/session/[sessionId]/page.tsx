'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { ArrowLeft, Copy, ShieldCheck } from 'lucide-react';
import ClipboardItem from '@/components/ClipboardItem';

interface ItemType {
  id: string;
  type: 'text' | 'image';
  content: string;
  timestamp: string;
}

export default function Session({ params }: { params: { sessionId: string } }) {
  const router = useRouter();
  const sessionId = params.sessionId;

  const [items, setItems] = useState<ItemType[]>([]);
  const [copiedId, setCopiedId] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Ensure window is defined before accessing hostname
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || `http://${hostname}:4000`;
    socketRef.current = io(socketUrl);
    const socket = socketRef.current;

    socket.emit('join-session', sessionId);

    socket.on('session-history', (history: ItemType[]) => {
      setItems(history);
    });

    socket.on('new-item', (item: ItemType) => {
      setItems(prev => [item, ...prev]);
    });

    return () => {
      socket.off('session-history');
      socket.off('new-item');
      socket.disconnect();
    };
  }, [sessionId]);

  const handlePaste = (e: any) => {
    // Prevent default to avoid pasting text directly into the contenteditable div
    if (e.target?.isContentEditable) {
      e.preventDefault();
    }

    const clipboardData = e.clipboardData || (window as any).clipboardData;
    if (!clipboardData) return;

    const itemsData = clipboardData.items;
    const socket = socketRef.current;
    if (!socket) return;

    for (let i = 0; i < itemsData.length; i++) {
      const item = itemsData[i];

      if (item.kind === 'file') {
        const blob = item.getAsFile();
        if (!blob) continue;

        const reader = new FileReader();
        reader.onload = (event) => {
          if (!event.target?.result) return;
          const newItem: ItemType = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'image',
            content: event.target.result as string,
            timestamp: new Date().toISOString()
          };
          setItems(prev => [newItem, ...prev]);
          socket.emit('send-item', { sessionId, item: newItem });
        };
        reader.readAsDataURL(blob);

      } else if (item.type === 'text/plain') {
        item.getAsString((text: string) => {
          if (!text.trim()) return;
          const newItem: ItemType = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'text',
            content: text,
            timestamp: new Date().toISOString()
          };
          setItems(prev => [newItem, ...prev]);
          socket.emit('send-item', { sessionId, item: newItem });
        });
      }
    }
  };

  const handlePasteButtonClick = async () => {
    try {
      if (navigator.clipboard.read) {
        const clipboardItems = await navigator.clipboard.read();
        for (const clipboardItem of clipboardItems) {
          const imageTypes = clipboardItem.types.filter(type => type.startsWith('image/'));
          if (imageTypes.length > 0) {
            const blob = await clipboardItem.getType(imageTypes[0]);
            const reader = new FileReader();
            reader.onload = (event) => {
              if (!event.target?.result) return;
              const newItem: ItemType = {
                id: Math.random().toString(36).substr(2, 9),
                type: 'image',
                content: event.target.result as string,
                timestamp: new Date().toISOString()
              };
              setItems(prev => [newItem, ...prev]);
              socketRef.current?.emit('send-item', { sessionId, item: newItem });
            };
            reader.readAsDataURL(blob);
            return;
          }
          
          if (clipboardItem.types.includes('text/plain')) {
            const blob = await clipboardItem.getType('text/plain');
            const text = await blob.text();
            if (!text.trim()) continue;
            const newItem: ItemType = {
              id: Math.random().toString(36).substr(2, 9),
              type: 'text',
              content: text,
              timestamp: new Date().toISOString()
            };
            setItems(prev => [newItem, ...prev]);
            socketRef.current?.emit('send-item', { sessionId, item: newItem });
            return;
          }
        }
      } else {
        const text = await navigator.clipboard.readText();
        if (!text.trim()) return;
        const newItem: ItemType = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'text',
          content: text,
          timestamp: new Date().toISOString()
        };
        setItems(prev => [newItem, ...prev]);
        socketRef.current?.emit('send-item', { sessionId, item: newItem });
      }
    } catch (err) {
      console.error('Failed to read clipboard:', err);
      alert("Browser blocked direct access. Please press Ctrl+V anywhere on the page to paste.");
    }
  };

  useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, []);



  const copySessionId = () => {
    navigator.clipboard.writeText(sessionId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <header className="glass-panel flex items-center justify-between px-6 py-4 sticky top-0 z-10 border-x-0 border-t-0 rounded-none">
        <button
          className="bg-transparent border-none text-gray-400 cursor-pointer p-2 rounded-full transition-all hover:bg-white/10 hover:text-white flex items-center justify-center"
          onClick={() => router.push('/')}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div
          className="flex items-center gap-3 cursor-pointer py-1.5 px-3 rounded-lg transition-colors hover:bg-white/5"
          onClick={copySessionId}
        >
          <span className="text-gray-400 text-sm">Session ID</span>
          <div className="bg-accent/15 border border-accent/30 text-indigo-300 px-3 py-1 rounded-full font-mono text-lg tracking-wide flex items-center">
            {sessionId}
            {copiedId ? (
              <ShieldCheck className="w-4 h-4 text-green-400 ml-2" />
            ) : (
              <Copy className="w-4 h-4 ml-2 opacity-50" />
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full flex flex-col">

        {/* Universal Paste Button - Fixed to bottom */}
        <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/90 via-black/80 to-transparent z-20 pointer-events-none">
          <div className="max-w-4xl mx-auto relative group pointer-events-auto">
            <div className="absolute inset-0 bg-accent/20 rounded-2xl blur-lg transition-opacity opacity-50 group-hover:opacity-100 active:opacity-100"></div>
            <button 
              onClick={handlePasteButtonClick}
              className="w-full relative glass-panel rounded-2xl p-4 md:p-6 text-center border border-accent/30 flex items-center justify-center min-h-[70px] md:min-h-[90px] transition-all hover:border-accent/60 focus:border-accent/80 focus:shadow-[0_0_20px_var(--tw-colors-accent)] bg-black/40 backdrop-blur-md active:scale-[0.98] cursor-pointer"
            >
              <div className="flex flex-col items-center opacity-90">
                <div className="flex items-center gap-2 text-lg md:text-xl font-bold text-white tracking-wide">
                  <Copy className="w-5 h-5 md:w-6 md:h-6" />
                  <span>Tap to Paste</span>
                </div>
                <span className="text-xs md:text-sm text-gray-400 mt-1">Instantly paste text or images from clipboard</span>
              </div>
            </button>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center text-gray-400 min-h-[40vh] pb-24">
            <div className="w-20 h-20 rounded-full bg-accent/10 border-2 border-accent/30 mb-6 relative animate-pulse-glow">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-accent rounded-full shadow-[0_0_20px_var(--tw-colors-accent)]"></div>
            </div>
            <h3 className="text-white text-2xl mb-2">Waiting for clipboard items...</h3>
            <p className="max-w-md">Press <kbd className="bg-white/10 px-2 py-1 rounded text-white text-sm mx-1">Ctrl+V</kbd> anywhere, or use the Paste box below.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pb-28">
            {items.map(item => (
              <ClipboardItem key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>

      {/* Background glow effects */}
      <div className="absolute top-[-100px] left-[-100px] w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(6,182,212,0.6)_0%,transparent_70%)] rounded-full blur-[120px] opacity-60 animate-float pointer-events-none"></div>
      <div className="absolute bottom-[-50px] right-[-50px] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(217,70,239,0.6)_0%,transparent_70%)] rounded-full blur-[120px] opacity-60 animate-float pointer-events-none" style={{ animationDelay: '-5s' }}></div>
    </div>
  );
}
