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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    if(item.link && item.link !== '#') {
        onIframeOpen(item.link, item.title);
    }
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
             <Card key={i}>
                <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-5/6" />
                </CardContent>
             </Card>
          ))}
        </div>
      );
    }

    if (news.length === 0) {
      return <p className="text-center py-10 text-muted-foreground">No new announcements.</p>;
    }

    return (
       <div className="space-y-4">
        {news.map((item, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-lg font-bold">{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{item.description}</p>
              {item.link && item.link !== '#' && (
                <AnimatedLinkButton 
                  onClick={() => handleReadMore(item)} 
                  thumbnail={item.thumbnail || 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4e2.svg'}
                  text="Read More"
                />
              )}
            </CardContent>
          </Card>
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
