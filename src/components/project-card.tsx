'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { BrainCircuit, Loader2 } from 'lucide-react';
import type { Project } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { suggestBetterName } from '@/ai/flows/project-renaming';

interface ProjectCardProps {
  project: Project;
  onOpenIframe: (url: string, title: string) => void;
}

const DEFAULT_ICON = 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4bb.svg';

export function ProjectCard({ project, onOpenIframe }: ProjectCardProps) {
  const [imgSrc, setImgSrc] = useState(project.icon || DEFAULT_ICON);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSuggestName = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    setSuggestion(null);
    try {
      const result = await suggestBetterName({ projectName: project.name });
      if (result.isLowQuality) {
        setSuggestion(result.suggestedName);
      } else {
        setSuggestion('Current name is great!');
      }
    } catch (error) {
      console.error('Error suggesting name:', error);
      setSuggestion('Could not get suggestion.');
    } finally {
      setIsLoading(false);
    }
  };

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

        <Popover onOpenChange={() => setSuggestion(null)}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="mt-4 opacity-50 group-hover:opacity-100 transition-opacity"
              onClick={handleSuggestName}
              aria-label="Suggest a better name"
            >
              <BrainCircuit className="mr-2 h-4 w-4" />
              Suggest Name
            </Button>
          </PopoverTrigger>
          <PopoverContent 
              onClick={(e) => e.stopPropagation()} 
              side="bottom" 
              className="w-56 text-center"
            >
            {isLoading && <Loader2 className="mx-auto h-6 w-6 animate-spin" />}
            {suggestion && <p className="text-sm text-popover-foreground">{suggestion}</p>}
          </PopoverContent>
        </Popover>

      </CardContent>
    </Card>
  );
}
