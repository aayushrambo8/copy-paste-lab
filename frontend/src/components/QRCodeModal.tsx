'use client';

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, QrCode, ExternalLink, Smartphone } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
}

export default function QRCodeModal({ isOpen, onClose, sessionId }: QRCodeModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [sessionUrl, setSessionUrl] = useState('');

  const [qrSize, setQrSize] = useState(160);

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionId) {
      const url = `${window.location.origin}/session?id=${sessionId}`;
      setSessionUrl(url);
    }
  }, [sessionId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      setQrSize(window.innerWidth < 640 ? 150 : 180);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const copyLink = () => {
    if (!sessionUrl) return;
    navigator.clipboard.writeText(sessionUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyCode = () => {
    if (!sessionId) return;
    navigator.clipboard.writeText(sessionId);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
    >
      <div 
        className="glass-panel p-5 sm:p-6 md:p-8 text-center max-w-sm w-full rounded-3xl border border-accent/20 bg-black/70 backdrop-blur-xl shadow-[0_0_50px_rgba(204,255,0,0.1)] relative z-10 animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all cursor-pointer"
          aria-label="Close QR Code Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title & Icon */}
        <div className="inline-flex p-2.5 sm:p-3 rounded-2xl bg-accent/10 border border-accent/20 mb-2 sm:mb-3 text-accent">
          <QrCode className="w-8 h-8" />
        </div>
        
        <h3 className="text-xl md:text-2xl font-bold text-white mb-1">
          Scan to Join
        </h3>
        
        <p className="text-gray-400 text-xs md:text-sm mb-3 sm:mb-5 flex items-center justify-center gap-1.5">
          <Smartphone className="w-4 h-4 text-accent" />
          Point phone camera to join instantly
        </p>

        {/* QR Code Container */}
        <div className="bg-white p-3 sm:p-4 rounded-2xl inline-block shadow-2xl mb-3 sm:mb-5 border-4 border-accent/30 relative group">
          {sessionUrl ? (
            <QRCodeSVG
              value={sessionUrl}
              size={qrSize}
              level="H"
              includeMargin={false}
            />
          ) : (
            <div className="flex items-center justify-center text-gray-500 text-sm" style={{ width: qrSize, height: qrSize }}>
              Generating...
            </div>
          )}
        </div>

        {/* Session Details & Copy Actions */}
        <div className="flex flex-col gap-2.5 w-full">
          {/* Session ID Pill */}
          <div className="flex items-center justify-between bg-black/40 border border-glass-border px-3.5 py-2.5 rounded-xl">
            <div className="flex flex-col text-left">
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Session ID</span>
              <span className="text-white font-mono text-base font-bold tracking-widest">{sessionId}</span>
            </div>
            <button
              onClick={copyCode}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-xs text-gray-200 transition-all border border-white/10 active:scale-95"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-green-400 font-semibold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Code</span>
                </>
              )}
            </button>
          </div>

          {/* Direct Link Copy Button */}
          <button
            onClick={copyLink}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-medium bg-accent text-black hover:bg-accent-hover active:scale-[0.98] transition-all shadow-[0_0_15px_rgba(204,255,0,0.15)] text-sm"
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4" />
                <span className="font-bold">Link Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <ExternalLink className="w-4 h-4" />
                <span className="font-semibold">Copy Direct Session Link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
