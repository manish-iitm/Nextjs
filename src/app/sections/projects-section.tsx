'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Loader2, Info, Filter, Briefcase } from 'lucide-react';
import type { Project } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import type { ProjectCategory } from '@/app/page';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ProjectsSectionProps {
  onIframeOpen: (url: string, title: string) => void;
  initialCategory: ProjectCategory;
}

const PROJECTS_URL = 'https://docs.google.com/spreadsheets/d/13ZV6BXtXKp9aQCKc0OHQoLFCRrif32zvx4khFc4bR9w/export?format=csv';

const categoryDescriptions: { [key in ProjectCategory & string]: string } = {
  Alpha: 'Alpha is the upcoming and under development projects.',
  Beta: 'Beta is the working projects, but they may have some bugs or issues.',
  Gamma: 'Gamma is for projects that are ready to use.',
};

const filterCategories: { label: string; value: ProjectCategory }[] = [
  { label: 'All', value: null },
  { label: 'Alpha', value: 'Alpha' },
  { label: 'Beta', value: 'Beta' },
  { label: 'Gamma', value: 'Gamma' },
];

export default function ProjectsSection({ onIframeOpen, initialCategory }: ProjectsSectionProps) {
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<ProjectCategory>(initialCategory);

  useEffect(() => {
    setActiveCategory(initialCategory);
  }, [initialCategory]);

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
          .slice(1) // Skip header row
          .map(line => {
            const [name, icon, link, category] = line.split(',').map(p => p.trim());
            return { name, icon, link, category, search: (name || '').toLowerCase() };
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
    let projects = allProjects;
    if (activeCategory) {
      projects = projects.filter(p => p.category?.toLowerCase() === activeCategory.toLowerCase());
    }
    if (searchTerm) {
      projects = projects.filter(p => p.search.includes(searchTerm.toLowerCase()));
    }
    return projects;
  }, [allProjects, searchTerm, activeCategory]);

  const description = activeCategory ? categoryDescriptions[activeCategory] : 'Browse all available projects.';

  return (
    <div className="py-8 px-4 animate-fadeIn">
      <h1 className="mb-4 text-center text-4xl font-bold font-headline text-foreground">
        Projects
      </h1>
      <p className="mb-8 text-center text-lg text-muted-foreground max-w-2xl mx-auto">{description}</p>
      
      <Card className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              id="projectSearchBar"
              placeholder="Search projects..."
              className="w-full rounded-full bg-background pl-10 pr-4 py-2 text-lg"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              aria-label="Search projects"
            />
          </div>
          <div className="flex items-center justify-center gap-2">
            {filterCategories.map(cat => (
              <Button
                key={cat.label}
                variant={activeCategory === cat.value ? 'default' : 'outline'}
                onClick={() => setActiveCategory(cat.value)}
                className="rounded-full"
              >
                {cat.label}
              </Button>
            ))}
          </div>
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
               <Card key={project.name} className="flex flex-col overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
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
                  <Button onClick={() => onIframeOpen(project.link, project.name)} className="w-full rounded-t-none" variant="default">
                    View Project
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center text-muted-foreground">
            <Info className="h-10 w-10 text-primary" />
            <p className="text-lg font-medium">No projects match your search.</p>
            <p className="text-sm">Try a different filter or search term.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
