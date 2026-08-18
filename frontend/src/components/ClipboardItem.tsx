'use client';

import React, { useState } from 'react';
import { Copy, Check, FileText, Image as ImageIcon, File, Download, Loader2 } from 'lucide-react';

interface ItemType {
  id: string;
  type: 'text' | 'image' | 'file';
  content: string;
  timestamp: string;
  fileName?: string;
}

// Helper to convert any image URL or Data URI to a PNG Blob for ClipboardItem API
async function fetchImageAsPngBlob(contentUrl: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas 2D context'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert canvas to PNG blob'));
        }
      }, 'image/png');
    };
    img.onerror = (err) => reject(err);
    img.src = contentUrl;
  });
}

// Helper to trigger cross-origin & blob file downloads reliably
async function triggerFileDownload(url: string, fileName: string) {
  try {
    if (url.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error status: ${response.status}`);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  } catch (err) {
    console.warn('Direct blob download failed, falling back to direct window open:', err);
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export default function ClipboardItem({ item }: { item: ItemType }) {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleCopy = async () => {
    try {
      if (item.type === 'text') {
        await navigator.clipboard.writeText(item.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else if (item.type === 'image') {
        const pngBlob = await fetchImageAsPngBlob(item.content);
        await navigator.clipboard.write([
          new window.ClipboardItem({ 'image/png': pngBlob })
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else if (item.type === 'file') {
        await handleDownload();
      }
    } catch (err) {
      console.error('Failed to copy/download item: ', err);
      if (item.type === 'image') {
        alert('Could not copy image to clipboard automatically. Try downloading it instead.');
      }
    }
  };

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      let fileName = item.fileName;
      if (!fileName) {
        if (item.type === 'image') {
          let extension = 'png';
          const match = item.content.match(/^data:image\/(\w+);base64,/);
          if (match) extension = match[1];
          fileName = `pasted-image-${item.id}.${extension}`;
        } else {
          fileName = `shared-file-${item.id}`;
        }
      }
      await triggerFileDownload(item.content, fileName);
    } catch (err) {
      console.error('Failed to download: ', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const timeString = new Date(item.timestamp).toLocaleTimeString();

  return (
    <div
      className="glass-panel group rounded-2xl overflow-hidden flex flex-col relative transition-all duration-200 cursor-pointer animate-[fadeIn_0.4s_ease-out_forwards] md:hover:-translate-y-1 md:hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] md:hover:border-accent/30 active:scale-[0.98]"
      onClick={handleCopy}
    >
      <div className="flex justify-between items-center px-4 py-3 bg-black/20 border-b border-glass-border">
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          {item.type === 'text' ? <FileText className="w-4 h-4" /> : item.type === 'image' ? <ImageIcon className="w-4 h-4" /> : <File className="w-4 h-4" />}
          <span>{timeString}</span>
        </div>
        <div className="flex items-center gap-1">
          {item.type === 'image' ? (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); handleCopy(); }}
                className="bg-transparent border-none text-gray-400 hover:text-white transition-colors p-2 active:scale-90 rounded-full hover:bg-white/5"
                title="Copy Image"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleDownload(); }}
                disabled={isDownloading}
                className="bg-transparent border-none text-gray-400 hover:text-white transition-colors p-2 active:scale-90 rounded-full hover:bg-white/5 disabled:opacity-50"
                title="Download Image"
              >
                {isDownloading ? <Loader2 className="w-4 h-4 animate-spin text-accent" /> : <Download className="w-4 h-4" />}
              </button>
            </>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); handleCopy(); }}
              disabled={isDownloading}
              className="bg-transparent border-none text-gray-400 hover:text-white transition-colors p-2 -mr-2 active:scale-90 rounded-full hover:bg-white/5 disabled:opacity-50"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : item.type === 'file' ? (
                isDownloading ? <Loader2 className="w-4 h-4 animate-spin text-accent" /> : <Download className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>

      <div className="p-5 max-h-[250px] overflow-hidden relative bg-black/10 flex-1">
        {item.type === 'text' ? (
          <p className="font-mono text-[0.95rem] leading-relaxed whitespace-pre-wrap break-words">
            {item.content}
          </p>
        ) : item.type === 'image' ? (
          <div className="relative w-full h-full min-h-[150px]">
            <img src={item.content} alt="Pasted" className="w-full h-full object-cover rounded-lg" />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[150px] opacity-80">
            <File className="w-16 h-16 mb-4 text-accent" />
            <p className="font-mono text-sm text-center break-all px-4">{item.fileName || 'file-download'}</p>
          </div>
        )}
        {item.type === 'text' && (
          <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#101012] to-transparent pointer-events-none"></div>
        )}
      </div>

      {item.type === 'image' ? (
        <div className="hidden md:flex absolute inset-0 bg-black/70 items-center justify-center gap-4 opacity-0 transition-opacity duration-200 backdrop-blur-sm group-hover:opacity-100">
          <button
            onClick={(e) => { e.stopPropagation(); handleCopy(); }}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold bg-accent text-black hover:bg-accent-hover active:scale-[0.97] transition-all transform translate-y-2 group-hover:translate-y-0 duration-200 shadow-lg"
          >
            {copied ? <Check className="w-5 h-5 text-green-700" /> : <Copy className="w-5 h-5" />}
            <span>{copied ? 'Copied!' : 'Copy Image'}</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDownload(); }}
            disabled={isDownloading}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold bg-white/10 border border-white/20 text-white hover:bg-white/20 active:scale-[0.97] transition-all transform translate-y-2 group-hover:translate-y-0 duration-200 delay-75 shadow-lg disabled:opacity-50"
          >
            {isDownloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            <span>{isDownloading ? 'Downloading...' : 'Download'}</span>
          </button>
        </div>
      ) : (
        <div className="hidden md:flex absolute inset-0 bg-accent/80 items-center justify-center opacity-0 transition-opacity duration-200 backdrop-blur-sm group-hover:opacity-100">
          <span className="font-bold text-lg tracking-wide text-black transform translate-y-2 transition-transform duration-200 group-hover:translate-y-0">
            {item.type === 'file' ? (isDownloading ? 'Downloading...' : 'Click to Download') : 'Click to Copy'}
          </span>
        </div>
      )}

      {item.type === 'image' ? (
        <div className="md:hidden flex border-t border-glass-border/50 divide-x divide-glass-border/50">
          <button
            onClick={(e) => { e.stopPropagation(); handleCopy(); }}
            className="flex-1 bg-black/40 py-3 text-center text-xs text-gray-300 font-bold uppercase hover:bg-white/5 active:bg-white/10 transition-colors flex items-center justify-center gap-1.5"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDownload(); }}
            disabled={isDownloading}
            className="flex-1 bg-black/40 py-3 text-center text-xs text-gray-300 font-bold uppercase hover:bg-white/5 active:bg-white/10 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isDownloading ? <Loader2 className="w-4 h-4 animate-spin text-accent" /> : <Download className="w-4 h-4" />}
            <span>{isDownloading ? 'Downloading...' : 'Download'}</span>
          </button>
        </div>
      ) : (
        <div className="md:hidden bg-black/40 py-2 text-center border-t border-glass-border/50">
          <span className="text-xs text-gray-400 font-medium tracking-wide uppercase">
            {copied ? (item.type === 'file' ? 'Downloaded!' : 'Copied!') : (item.type === 'file' ? (isDownloading ? 'Downloading...' : 'Tap to Download') : 'Tap to Copy')}
          </span>
        </div>
      )}
    </div>
  );
}

