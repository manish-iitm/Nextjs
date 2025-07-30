'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StoryViewer } from '@/components/story-viewer';
import type { Story, InstagramPost } from '@/lib/types';
import { cn } from '@/lib/utils';

interface HomeSectionProps {
  onIframeOpen: (url: string, title: string) => void;
}

const STORIES_URL = 'https://docs.google.com/spreadsheets/d/1p63AK6_2JPI1prbQpglHi5spB2f1y2PbcdnsvtS74g8/export?format=csv';
const POSTS_URL = 'https://docs.google.com/spreadsheets/d/1aDM5fGKjmLmYNkkQCW4NuSZsVorj_5ETk9KygVsD0OA/export?format=csv';

export default function HomeSection({ onIframeOpen }: HomeSectionProps) {
  const [stories, setStories] = useState<Story[]>([]);
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loadingStories, setLoadingStories] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [errorStories, setErrorStories] = useState<string | null>(null);
  const [errorPosts, setErrorPosts] = useState<string | null>(null);
  const [viewedStories, setViewedStories] = useState<Set<string>>(new Set());
  
  const [storyViewerState, setStoryViewerState] = useState<{
    isOpen: boolean;
    currentIndex: number;
  }>({ isOpen: false, currentIndex: 0 });

  useEffect(() => {
    const storedViewed = new Set(JSON.parse(localStorage.getItem('viewedStories') || '[]'));
    setViewedStories(storedViewed);

    const fetchStories = async () => {
      try {
        const res = await fetch(STORIES_URL);
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.text();
        const parsedStories = data.split('\n').slice(1).map((line, index) => {
          const [thumbUrl, imageUrl, link, title] = line.split(',').map(c => c.trim());
          return { id: `story-${index}`, thumbUrl, imageUrl, link, title: title || 'Untitled' };
        }).filter(s => s.thumbUrl && s.imageUrl);

        parsedStories.sort((a,b) => (storedViewed.has(a.id) ? 1 : -1) - (storedViewed.has(b.id) ? 1 : -1));
        setStories(parsedStories);
      } catch (err) {
        setErrorStories('Could not load stories.');
      } finally {
        setLoadingStories(false);
      }
    };

    const fetchPosts = async () => {
      try {
        const res = await fetch(POSTS_URL);
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.text();
        const parsedPosts = data.split('\n').slice(1).map(line => {
          const [imageUrl, title, link] = line.split(',').map(c => c.trim());
          return { imageUrl, title: title || 'Untitled', link: link || '#' };
        }).filter(p => p.imageUrl);
        setPosts(parsedPosts);
      } catch (err) {
        setErrorPosts('Failed to load posts.');
      } finally {
        setLoadingPosts(false);
      }
    };
    
    fetchStories();
    fetchPosts();
  }, []);

  const openStory = (index: number) => {
    const storyId = stories[index].id;
    if (!viewedStories.has(storyId)) {
      const newViewed = new Set(viewedStories).add(storyId);
      setViewedStories(newViewed);
      localStorage.setItem('viewedStories', JSON.stringify(Array.from(newViewed)));
    }
    setStoryViewerState({ isOpen: true, currentIndex: index });
  };
  
  const closeStory = () => setStoryViewerState({ isOpen: false, currentIndex: 0 });
  const nextStory = () => {
    if (storyViewerState.currentIndex < stories.length - 1) {
      openStory(storyViewerState.currentIndex + 1);
    } else {
      closeStory();
    }
  };
  const prevStory = () => {
    if (storyViewerState.currentIndex > 0) {
      openStory(storyViewerState.currentIndex - 1);
    }
  };

  const handleLearnMore = useCallback((url: string, title: string) => {
    closeStory();
    onIframeOpen(url, title);
  }, [onIframeOpen]);

  return (
    <div className="py-8 px-4 animate-fadeIn">
      <h1 className="mb-8 text-center text-4xl font-bold font-headline text-foreground">Home</h1>

      <Card className="mb-8 overflow-hidden">
        <CardContent className="p-4">
          <div className="flex gap-4 overflow-x-auto pb-4">
            {loadingStories && Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Skeleton className="h-20 w-20 rounded-full" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
            {errorStories && <p className="text-destructive">{errorStories}</p>}
            {stories.map((story, index) => (
              <div key={story.id} className="flex flex-col items-center gap-2 text-center cursor-pointer min-w-[100px]" onClick={() => openStory(index)}>
                <div className={cn("relative h-24 w-24 rounded-full p-1", viewedStories.has(story.id) ? 'bg-muted' : 'bg-gradient-to-tr from-yellow-400 via-red-500 to-pink-500')}>
                  <div className="bg-card p-1 rounded-full h-full w-full">
                    <Image src={story.thumbUrl} alt={story.title} width={88} height={88} className="rounded-full object-cover h-full w-full" />
                  </div>
                </div>
                <p className="w-24 truncate text-sm font-medium">{story.title}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="mx-auto max-w-lg space-y-6">
        {loadingPosts && Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <Skeleton className="w-full aspect-square" />
            <div className="p-4"><Skeleton className="h-6 w-3/4" /></div>
          </Card>
        ))}
        {errorPosts && <p className="text-destructive text-center">{errorPosts}</p>}
        {posts.map((post, index) => (
          <Card key={index} className="overflow-hidden">
             <div 
              className="relative w-full aspect-square cursor-pointer" 
              onClick={() => post.link && post.link !== '#' && onIframeOpen(post.link, post.title)}>
              <Image src={post.imageUrl} alt={post.title} fill className="object-cover" sizes="(max-width: 640px) 100vw, 640px"/>
            </div>
            <div className="p-4 text-center border-t">
              <p className="font-semibold">{post.title}</p>
            </div>
          </Card>
        ))}
      </div>

      {storyViewerState.isOpen && (
        <StoryViewer
          stories={stories}
          currentIndex={storyViewerState.currentIndex}
          onClose={closeStory}
          onNext={nextStory}
          onPrev={prevStory}
          onLearnMore={handleLearnMore}
        />
      )}
    </div>
  );
}
