'use client';

import React from 'react';
import Image from 'next/image';
import type { Project } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { AnimatedLinkButton } from './animated-link-button';

interface ProjectCardProps {
  project: Project;
  onOpenIframe: (url: string, title: string) => void;
}

const DEFAULT_ICON = 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4bb.svg';

export function ProjectCard({ project, onOpenIframe }: ProjectCardProps) {
  return (
    <Card
      className="group flex h-full flex-col items-center overflow-hidden text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
      tabIndex={0}
    >
      <CardContent className="flex flex-col items-center justify-between p-4 w-full h-full">
        <div className="relative mb-4 h-20 w-20 rounded-lg bg-gray-100 dark:bg-gray-800 transition-colors duration-300 group-hover:bg-primary/20">
          <Image
            src={project.icon || DEFAULT_ICON}
            alt={`${project.name} icon`}
            fill
            className="p-2 object-contain transition-transform duration-300 group-hover:scale-110"
            sizes="80px"
          />
        </div>
        <h3 className="flex-grow text-lg font-semibold text-foreground font-headline mb-4">{project.name}</h3>
        <AnimatedLinkButton
          onClick={() => onOpenIframe(project.link, project.name)}
          thumbnail={project.icon || DEFAULT_ICON}
          text="View Project"
        />
      </CardContent>
    </Card>
  );
}
