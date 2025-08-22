'use client';

import React from 'react';
import Image from 'next/image';
import type { Project } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedLinkButton } from './animated-link-button';
import { Button } from './ui/button';
import { Briefcase } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onOpenIframe: (url: string, title: string) => void;
}

export function ProjectCard({ project, onOpenIframe }: ProjectCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
      <CardHeader className="p-0">
        <div className="relative aspect-video w-full">
          <Image
            src={project.icon || 'https://placehold.co/600x400'}
            alt={project.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            data-ai-hint="project concept"
          />
          <div className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white">
            <Briefcase />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg leading-snug mb-2">{project.name}</CardTitle>
        <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-secondary text-secondary-foreground">
          {project.category}
        </span>
      </CardContent>
      <CardFooter className="p-0">
        <Button onClick={() => onOpenIframe(project.link, project.name)} className="w-full rounded-t-none" variant="default">
          View Project
        </Button>
      </CardFooter>
    </Card>
  );
}
