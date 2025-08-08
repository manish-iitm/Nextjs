"use client";

import { useEffect, useState } from "react";
import { Notification } from "@/lib/types";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";

interface AnnouncementSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  notifications: Notification[];
}

export function AnnouncementSheet({ isOpen, onClose, onOpen, notifications }: AnnouncementSheetProps) {
  const [loading, setLoading] = useState<boolean>(false);
  
  useEffect(() => {
    if (isOpen) {
      onOpen();
    }
  }, [isOpen, onOpen]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      );
    }

    if (notifications.length === 0) {
      return <p>No announcements found.</p>;
    }

    return [...notifications].reverse().map((notification, index) => (
      <div key={index} className="pb-4 border-b last:border-b-0">
        <h3 className="font-bold text-lg mb-1">{notification.heading}</h3>
        <p className="text-muted-foreground">{notification.message}</p>
      </div>
    ));
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Announcements</SheetTitle>
          <SheetDescription>
            Here are the latest announcements.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-8 space-y-4">
          {renderContent()}
        </div>
      </SheetContent>
    </Sheet>
  );
}
