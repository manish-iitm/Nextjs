"use client";

import React, { useState, useEffect } from "react";
import { NewsItem } from "@/lib/types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

const ANNOUNCEMENTS_URL = 'https://docs.google.com/spreadsheets/d/1G0L_oKetzel-cj6nbp2Qf_elgc45YFyJS_pUR4Ytn0A/export?format=csv';

interface AnnouncementSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onIframeOpen: (url: string, title: string) => void;
}

const parseCSV = (csvData: string): NewsItem[] => {
    const lines = csvData.split('\n');
    const items: NewsItem[] = [];

    // Skip header row
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
            const parts = line.split(',').map(part => part.replace(/"/g, '').trim());
            // Expecting Title in the first column (index 0) and PubDate in the second (index 1)
            if (parts.length >= 2) {
                 items.push({
                    title: parts[0] || 'No Title',
                    pubDate: parts[1] || new Date().toISOString(),
                    link: parts[2] || '',
                    author: parts[3] || 'Author',
                    thumbnail: parts[4] || '',
                    description: parts[5] || '',
                });
            }
        }
    }
    return items.filter(item => item.title && item.title !== 'No Title');
};


export function AnnouncementSheet({ isOpen, onClose }: AnnouncementSheetProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const fetchAnnouncements = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(ANNOUNCEMENTS_URL);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.text();
            const parsedAnnouncements = parseCSV(data);
            setNews(parsedAnnouncements);
        } catch (err) {
            console.error('Error fetching announcements:', err);
            setError('Failed to load announcements. Please try again later.');
        } finally {
            setLoading(false);
        }
      };
      fetchAnnouncements();
    }
  }, [isOpen]);
  
  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-4 pt-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Separator className="mt-2" />
            </div>
          ))}
        </div>
      );
    }
    
    if (error) {
        return <p className="text-center py-10 text-destructive">{error}</p>;
    }

    if (news.length === 0) {
      return <p className="text-center py-10 text-muted-foreground">No new announcements.</p>;
    }

    return (
       <div className="space-y-4 pt-4">
        {news.map((item, index) => (
          <div key={index}>
            <div className="mb-4">
                <p className="font-bold text-foreground mb-1">{item.title}</p>
                <p className="text-sm text-muted-foreground">{new Date(item.pubDate).toLocaleString()}</p>
            </div>
            {index < news.length - 1 && <Separator />}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold pb-2 border-b">Announcements</SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          {renderContent()}
        </div>
      </SheetContent>
    </Sheet>
  );
}
