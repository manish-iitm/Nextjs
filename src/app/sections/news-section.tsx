'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Rss } from 'lucide-react';
import type { NewsItem } from '@/lib/types';
import Image from 'next/image';
import { AnimatedLinkButton } from '@/components/animated-link-button';

const RSS_URL = 'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fnews.google.com%2Frss';

interface NewsSectionProps {
  onIframeOpen: (url: string, title: string) => void;
}

export default function NewsSection({ onIframeOpen }: NewsSectionProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(RSS_URL);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        if (data.status !== 'ok') throw new Error('Failed to fetch RSS feed.');
        
        const items: NewsItem[] = data.items.map((item: any) => ({
          title: item.title,
          pubDate: item.pubDate,
          link: item.link,
          author: item.author,
          thumbnail: item.thumbnail,
          description: item.description,
        }));
        setNews(items);
      } catch (e: any) {
        console.error('Error fetching news:', e);
        setError('Failed to load news feed. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const handleReadMore = (item: NewsItem) => {
    onIframeOpen(item.link, item.title);
  }

  return (
    <div className="py-8 px-4 animate-fadeIn">
      <h1 className="mb-8 text-center text-4xl font-bold font-headline text-foreground">
        Latest News
      </h1>
      <Card className="mx-auto max-w-4xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Rss className="h-6 w-6 text-primary" />
            <div>
              <CardTitle className="text-2xl">Google News Feed</CardTitle>
              <CardDescription>Top stories right now</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-24 w-24 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="py-20 text-center text-destructive">{error}</div>
          ) : (
            <div className="space-y-6">
              {news.map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-4 items-start border-b pb-6 last:border-b-0 last:pb-0">
                  {item.thumbnail && (
                     <div className="w-full sm:w-32 h-32 flex-shrink-0 relative rounded-lg overflow-hidden">
                      <Image
                        src={item.thumbnail}
                        alt={`Thumbnail for ${item.title}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 128px"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">{new Date(item.pubDate).toLocaleString()}</p>
                    <h3 className="mb-2 text-lg font-semibold leading-snug">{item.title}</h3>
                    <AnimatedLinkButton 
                      onClick={() => handleReadMore(item)} 
                      thumbnail={item.thumbnail}
                      text="Read More"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
