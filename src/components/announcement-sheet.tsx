"use client";

import { useEffect } from "react";
import { NewsItem } from "@/lib/types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

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
  
  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-4 pt-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      );
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
