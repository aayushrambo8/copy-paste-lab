'use client';

import React, { useState } from 'react';
import { Copy, Check, FileText, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface ItemType {
  id: string;
  type: 'text' | 'image';
  content: string;
  timestamp: string;
}

export default function ClipboardItem({ item }: { item: ItemType }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (item.type === 'text') {
        await navigator.clipboard.writeText(item.content);
      } else if (item.type === 'image') {
        const response = await fetch(item.content);
        const blob = await response.blob();
        await navigator.clipboard.write([
          new window.ClipboardItem({ [blob.type]: blob })
        ]);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const timeString = new Date(item.timestamp).toLocaleTimeString();

  return (
    <div 
      className="glass-panel group rounded-2xl overflow-hidden flex flex-col relative transition-all duration-200 cursor-pointer animate-[fadeIn_0.4s_ease-out_forwards] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] hover:border-accent/30"
      onClick={handleCopy}
    >
      <div className="flex justify-between items-center px-4 py-3 bg-black/20 border-b border-glass-border">
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          {item.type === 'text' ? <FileText className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
          <span>{timeString}</span>
        </div>
        <button className="bg-transparent border-none text-gray-400 transition-colors group-hover:text-white">
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      
      <div className="p-5 max-h-[250px] overflow-hidden relative bg-black/10 flex-1">
        {item.type === 'text' ? (
          <p className="font-mono text-[0.95rem] leading-relaxed whitespace-pre-wrap break-words">
            {item.content}
          </p>
        ) : (
          <div className="relative w-full h-full min-h-[150px]">
             {/* Note: In a real app we'd use Next Image, but since these are data URIs from clipboard, an img tag is easier to handle safely. */}
             <img src={item.content} alt="Pasted" className="w-full h-full object-cover rounded-lg" />
          </div>
        )}
        {item.type === 'text' && (
           <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#101012] to-transparent pointer-events-none"></div>
        )}
      </div>
      
      <div className="absolute inset-0 bg-accent/80 flex items-center justify-center opacity-0 transition-opacity duration-200 backdrop-blur-sm group-hover:opacity-100">
        <span className="font-semibold text-lg tracking-wide text-white transform translate-y-2 transition-transform duration-200 group-hover:translate-y-0">
          Click to Copy
        </span>
      </div>
    </div>
  );
}
