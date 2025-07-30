'use client';

import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Story } from '@/lib/types';
import { Button } from './ui/button';
import Image from 'next/image';

interface StoryViewerProps {
  stories: Story[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onLearnMore: (url: string, title: string) => void;
}

export function StoryViewer({ stories, currentIndex, onClose, onNext, onPrev, onLearnMore }: StoryViewerProps) {
  const story = stories[currentIndex];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrev]);

  if (!story) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="relative flex h-full w-full items-center justify-center">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 z-10 h-10 w-10 text-white hover:bg-white/20 hover:text-white"
          onClick={onClose}
        >
          <X className="h-8 w-8" />
          <span className="sr-only">Close story</span>
        </Button>

        {currentIndex > 0 && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 h-14 w-14 text-white hover:bg-white/20 hover:text-white"
            onClick={onPrev}
          >
            <ChevronLeft className="h-12 w-12" />
            <span className="sr-only">Previous story</span>
          </Button>
        )}

        <div className="relative h-[90%] w-[90%] max-w-md">
          <Image
            src={story.imageUrl}
            alt={story.title}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 90vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>

        {currentIndex < stories.length - 1 && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 h-14 w-14 text-white hover:bg-white/20 hover:text-white"
            onClick={onNext}
          >
            <ChevronRight className="h-12 w-12" />
            <span className="sr-only">Next story</span>
          </Button>
        )}
        
        <div className="absolute bottom-12 left-1/2 w-full max-w-lg -translate-x-1/2 px-4 text-center">
          <h3 className="mb-4 inline-block rounded-full bg-black/50 px-4 py-2 text-white">{story.title}</h3>
          {story.link && (
             <Button 
                onClick={() => onLearnMore(story.link, story.title)} 
                className="bg-pink-600 text-white hover:bg-orange-500 rounded-full font-bold">
                Learn More
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
