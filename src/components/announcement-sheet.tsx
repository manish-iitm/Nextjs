"use client";

import { useEffect } from "react";
import Image from 'next/image';
import { NewsItem } from "@/lib/types";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedLinkButton } from '@/components/animated-link-button';

interface AnnouncementSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  news: NewsItem[];
  loading: boolean;
  onIframeOpen: (url: string, title: string) => void;
}

export function AnnouncementSheet({ isOpen, onClose, onOpen, news, loading, onIframeOpen }: AnnouncementSheetProps) {
  
  useEffect(() => {
    if (isOpen) {
      onOpen();
    }
  }, [isOpen, onOpen]);
  
  const handleReadMore = (item: NewsItem) => {
    onClose(); // Close the sheet before opening iframe
    onIframeOpen(item.link, item.title);
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
             <div key={i} className="flex gap-4">
              <Skeleton className="h-24 w-24 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (news.length === 0) {
      return <p className="text-center py-10 text-muted-foreground">No new announcements.</p>;
    }

    return (
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
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Announcements</SheetTitle>
          <SheetDescription>
            Here are the latest announcements.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-8">
          {renderContent()}
        </div>
      </SheetContent>
    </Sheet>
  );
}
