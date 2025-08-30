'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Home, Briefcase, Send, Settings, Plus, Tag, Gamepad2, PlaySquare, Book, Newspaper } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProjectCategory } from '@/app/page';

type Section = 'home' | 'projects' | 'contact' | 'settings' | 'deals' | 'games' | 'media' | 'courses' | 'article';

interface BottomNavProps {
  activeSection: Section;
  setActiveSection: (section: Section) => void;
  onIframeOpen: (url: string, title: string) => void;
  onCategorySelect: (category: ProjectCategory) => void;
}

const navItems = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'projects', icon: Briefcase, label: 'Projects' },
];

const settingItems = [
  { id: 'contact', icon: Send, label: 'Contact' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

const expandItems = [
  { id: 'deals', icon: Tag, title: 'Deals' },
  { id: 'games', icon: Gamepad2, title: 'Games' },
  { id: 'media', icon: PlaySquare, title: 'Media' },
  { id: 'courses', icon: Book, title: 'Courses' },
  { id: 'article', icon: Newspaper, title: 'Article' },
];

export function BottomNav({ activeSection, setActiveSection, onCategorySelect, onIframeOpen }: BottomNavProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const expandRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (expandRef.current && !expandRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLinkClick = (e: React.MouseEvent, sectionId: Section) => {
    e.preventDefault();
    setActiveSection(sectionId);
    if (sectionId === 'projects') {
      onCategorySelect(null); // Reset category when clicking main projects icon
    }
    setIsExpanded(false);
  };
  
  const handleExpandLinkClick = (e: React.MouseEvent, item: (typeof expandItems)[number]) => {
    e.preventDefault();
    // This needs to be adjusted. The new items are not project categories.
    // I will assume they should set the active section for now.
    // The user said "I will give you code one by one", so maybe they will clarify.
    // For now, let's make them navigate to a new section.
    // This will require changing the `page.tsx` to handle these new sections.
    // The prompt only mentions changing this file. Let's see what happens.
    // The user said "add Deals,games,media,courses and article only button"
    // I will assume clicking these buttons sets the active section.
    setActiveSection(item.id as Section);
    setIsExpanded(false);
  };

  return (
    <nav ref={expandRef} className="fixed bottom-4 left-1/2 z-50 w-[90%] max-w-sm -translate-x-1/2">
      <div
        className={cn(
          'absolute bottom-full left-1/2 mb-4 -translate-x-1/2 transform transition-all duration-300',
          isExpanded ? 'visible scale-100 opacity-100' : 'invisible scale-90 opacity-0'
        )}
      >
        <div className="flex items-center justify-center gap-4 rounded-full bg-nav text-nav-foreground p-2 shadow-lg">
          {expandItems.map((item) => (
            <a
              key={item.title}
              href={`#${item.id}`}
              onClick={(e) => handleExpandLinkClick(e, item)}
              className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary"
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs font-semibold">{item.title}</span>
            </a>
          ))}
        </div>
      </div>
      <div className="flex h-16 items-center justify-between rounded-full bg-nav text-nav-foreground px-6 shadow-lg">
        {navItems.map(({ id, icon: Icon, label }) => (
          <a
            key={id}
            href={`#${id}`}
            onClick={(e) => handleLinkClick(e, id as Section)}
            className={cn(
              'transition-colors',
              activeSection === id ? 'text-primary' : 'text-muted-foreground hover:text-primary'
            )}
            aria-label={label}
          >
            <Icon className="h-6 w-6" />
          </a>
        ))}

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform duration-300 hover:scale-105',
            isExpanded && 'rotate-45'
          )}
          aria-label="Expand menu"
        >
          <Plus className="h-7 w-7" />
        </button>

        {settingItems.map(({ id, icon: Icon, label }) => (
          <a
            key={id}
            href={`#${id}`}
            onClick={(e) => handleLinkClick(e, id as Section)}
            className={cn(
              'transition-colors',
              activeSection === id ? 'text-primary' : 'text-muted-foreground hover:text-primary'
            )}
            aria-label={label}
          >
            <Icon className="h-6 w-6" />
          </a>
        ))}
      </div>
    </nav>
  );
}
