'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { Story } from '@/lib/types';

interface StoryCardProps {
  story: Story;
  isViewed: boolean;
  onClick: () => void;
}

export function StoryCard({ story, isViewed, onClick }: StoryCardProps) {
  return (
    <div
      onClick={onClick}
      className="relative h-48 w-28 cursor-pointer overflow-hidden rounded-lg shadow-md transition-transform duration-300 ease-in-out hover:scale-105"
    >
      <Image
        src={story.imageUrl}
        alt={story.title}
        fill
        sizes="112px"
        className="object-cover transition-opacity duration-300 group-hover:opacity-90"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />
      <div
        className={cn(
          'absolute top-2 left-2 rounded-full p-1 ring-2',
          isViewed ? 'ring-muted' : 'ring-primary'
        )}
      >
        <Image
          src={story.thumbUrl}
          alt=""
          width={32}
          height={32}
          className="rounded-full"
        />
      </div>
      <p className="absolute bottom-2 left-2 right-2 truncate text-xs font-semibold text-white">
        {story.title}
      </p>
    </div>
  );
}
