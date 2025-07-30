'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import type { Project } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';

interface ProjectCardProps {
  project: Project;
  onOpenIframe: (url: string, title: string) => void;
}

const DEFAULT_ICON = 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4bb.svg';

export function ProjectCard({ project, onOpenIframe }: ProjectCardProps) {
  const [imgSrc, setImgSrc] = useState(project.icon || DEFAULT_ICON);

  return (
    <Card
      className="group flex h-full cursor-pointer flex-col items-center overflow-hidden text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-accent"
      onClick={() => onOpenIframe(project.link, project.name)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onOpenIframe(project.link, project.name);
        }
      }}
      tabIndex={0}
    >
      <CardContent className="flex flex-col items-center p-6 w-full">
        <div className="relative mb-4 h-24 w-24 rounded-lg bg-gray-100 dark:bg-gray-800 transition-colors duration-300 group-hover:bg-primary/20">
          <Image
            src={imgSrc}
            alt=""
            fill
            className="p-2 object-contain transition-transform duration-300 group-hover:scale-110"
            sizes="96px"
            onError={() => setImgSrc(DEFAULT_ICON)}
          />
        </div>
        <h3 className="flex-grow text-lg font-semibold text-foreground font-headline">{project.name}</h3>
      </CardContent>
    </Card>
  );
}
