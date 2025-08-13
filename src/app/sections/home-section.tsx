'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StoryViewer } from '@/components/story-viewer';
import type { Story, InstagramPost } from '@/lib/types';
import { StoryCard } from '@/components/story-card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

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
    const storedViewed = new Set<string>(JSON.parse(localStorage.getItem('viewedStories') || '[]'));
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
  
  const handlePostClick = (post: InstagramPost) => {
    if (post.link && post.link !== '#') {
      onIframeOpen(post.link, post.title)
    }
  }

  return (
    <div className="py-8 px-4 animate-fadeIn">
      <h1 className="mb-8 text-center text-4xl font-bold font-headline text-foreground">Home</h1>

      <Card className="mb-8">
        <CardContent className="p-4">
          <div className="grid grid-flow-col auto-cols-max gap-3 overflow-x-auto pb-2">
            {loadingStories && Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-28 rounded-lg" />
            ))}
            {errorStories && <p className="text-destructive">{errorStories}</p>}
            {stories.map((story, index) => (
               <StoryCard 
                  key={story.id} 
                  story={story} 
                  isViewed={viewedStories.has(story.id)}
                  onClick={() => openStory(index)}
                />
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loadingPosts && Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-12 w-full" />
          </Card>
        ))}
        {errorPosts && <p className="text-destructive text-center col-span-2">{errorPosts}</p>}
        {posts.map((post, index) => (
          <Card key={index} className="overflow-hidden bg-card/50 hover:bg-card transition-colors duration-300">
            {post.link && post.link !== '#' && (
              <div className="flex items-center p-4">
                 <div className="relative h-16 w-16 mr-4 rounded-lg bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                    <Image
                        src={post.imageUrl}
                        alt={`${post.title} icon`}
                        fill
                        className="p-1 object-contain"
                        sizes="64px"
                    />
                </div>
                <Button 
                  onClick={() => handlePostClick(post)} 
                  className="w-full h-14 text-lg font-semibold group justify-between"
                  variant="ghost"
                >
                  <span className="truncate">{post.title}</span>
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 flex-shrink-0" />
                </Button>
              </div>
            )}
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
