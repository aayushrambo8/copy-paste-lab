'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Github, GitPullRequest, MessageSquare, ChevronDown, ExternalLink } from 'lucide-react';

export default function GitHubDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const repoUrl = 'https://github.com/aayushrambo8/paste-labs';
  const issueUrl = `${repoUrl}/issues/new`;
  const prUrl = `${repoUrl}/pulls`;

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Dropdown Toggle Button */}
      <button
        onClick={toggleDropdown}
        className={`flex items-center gap-1 sm:gap-2 bg-black/40 border border-glass-border hover:border-accent/40 text-gray-300 hover:text-white px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs md:text-sm font-semibold transition-all cursor-pointer active:scale-95 shadow-[0_0_10px_rgba(204,255,0,0.05)] ${
          isOpen ? 'border-accent/50 text-white bg-accent/10 shadow-[0_0_15px_rgba(204,255,0,0.15)]' : ''
        }`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Github className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
        <span className="hidden sm:inline">GitHub</span>
        <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 opacity-60 transition-transform duration-200 ${isOpen ? 'rotate-180 text-accent' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-56 rounded-2xl glass-panel bg-black/90 border border-accent/20 shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_30px_rgba(204,255,0,0.05)] overflow-hidden z-50 animate-[slideUp_0.2s_cubic-bezier(0.16,1,0.3,1)]"
          role="menu"
        >
          <div className="p-1.5 flex flex-col gap-1">
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm text-gray-300 hover:text-black hover:bg-accent font-medium transition-all group"
              role="menuitem"
              onClick={() => setIsOpen(false)}
            >
              <span className="flex items-center gap-2.5">
                <Github className="w-4 h-4 text-accent group-hover:text-black transition-colors" />
                <span>View Repository</span>
              </span>
              <ExternalLink className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 group-hover:text-black transition-all" />
            </a>

            <a
              href={issueUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm text-gray-300 hover:text-black hover:bg-accent font-medium transition-all group"
              role="menuitem"
              onClick={() => setIsOpen(false)}
            >
              <span className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-accent group-hover:text-black transition-colors" />
                <span>Suggest & Report</span>
              </span>
              <ExternalLink className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 group-hover:text-black transition-all" />
            </a>

            <a
              href={prUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm text-gray-300 hover:text-black hover:bg-accent font-medium transition-all group"
              role="menuitem"
              onClick={() => setIsOpen(false)}
            >
              <span className="flex items-center gap-2.5">
                <GitPullRequest className="w-4 h-4 text-accent group-hover:text-black transition-colors" />
                <span>Create & View PR</span>
              </span>
              <ExternalLink className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 group-hover:text-black transition-all" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
