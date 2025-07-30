'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Loader2, Info } from 'lucide-react';
import type { Project } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { ProjectCard } from '@/components/project-card';
import { Card } from '@/components/ui/card';

interface ProjectsSectionProps {
  onIframeOpen: (url: string, title: string) => void;
}

const PROJECTS_URL = 'https://docs.google.com/spreadsheets/d/13ZV6BXtXKp9aQCKc0OHQoLFCRrif32zvx4khFc4bR9w/export?format=csv';

export default function ProjectsSection({ onIframeOpen }: ProjectsSectionProps) {
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(PROJECTS_URL);
        if (!response.ok) throw new Error('Network error');
        const data = await response.text();
        const projectsData: Project[] = data
          .trim()
          .split('\n')
          .map(line => {
            const [name, icon, link] = line.split(',').map(p => p.trim());
            return { name, icon, link, search: (name || '').toLowerCase() };
          })
          .filter(p => p.name && p.link);
        setAllProjects(projectsData);
      } catch (e) {
        console.error('Error fetching projects:', e);
        setError('Failed to load projects.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    return allProjects.filter(p => p.search.includes(searchTerm.toLowerCase()));
  }, [allProjects, searchTerm]);

  return (
    <div className="py-8 px-4 animate-fadeIn">
      <h1 className="mb-8 text-center text-4xl font-bold font-headline text-foreground">Projects</h1>
      <Card className="p-6 md:p-8">
        <div className="relative mx-auto mb-8 max-w-lg">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            id="projectSearchBar"
            placeholder="Search projects by name..."
            className="w-full rounded-full bg-background pl-10 pr-4 py-2 text-lg"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            aria-label="Search projects"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center text-destructive py-20">{error}</div>
        ) : filteredProjects.length > 0 ? (
          <div id="projectGrid" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProjects.map(project => (
              <ProjectCard key={project.name} project={project} onOpenIframe={onIframeOpen} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center text-muted-foreground">
            <Info className="h-10 w-10 text-primary" />
            <p className="text-lg font-medium">No projects match your search.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
