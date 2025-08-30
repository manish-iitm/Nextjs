'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Rss } from 'lucide-react';
import type { NewsItem } from '@/lib/types';
import Image from 'next/image';
import { AnimatedLinkButton } from '@/components/animated-link-button';
import Papa from 'papaparse';

const ANNOUNCEMENTS_URL = 'https://docs.google.com/spreadsheets/d/1G0L_oKetzel-cj6nbp2Qf_elgc45YFyJS_pUR4Ytn0A/export?format=csv';

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
        const res = await fetch(ANNOUNCEMENTS_URL);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const csvText = await res.text();
        
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.errors.length) {
              console.error('Error parsing CSV:', results.errors);
              setError('Failed to parse announcements data.');
            } else {
              const items: NewsItem[] = (results.data as any[]).map((item: any) => ({
                title: item.title,
                pubDate: item.pubDate || new Date().toISOString(),
                link: item.link,
                author: item.author || 'Author',
                thumbnail: item.thumbnail,
                description: item.description,
              })).filter(item => item.title && item.link);
              setNews(items);
            }
            setLoading(false);
          },
          error: (err: any) => {
            console.error('Error fetching or parsing news:', err);
            setError('Failed to load news feed. Please try again later.');
            setLoading(false);
          }
        });

      } catch (e: any) {
        console.error('Error fetching news:', e);
        setError('Failed to load news feed. Please try again later.');
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
              <CardTitle className="text-2xl">Announcements</CardTitle>
              <CardDescription>Latest updates and news</CardDescription>
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
                      thumbnail={item.thumbnail || 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4e2.svg'}
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
