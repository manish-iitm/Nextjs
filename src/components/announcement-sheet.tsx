"use client";

import { useEffect, useState } from "react";
import { fetchAndParseNotifications } from "@/lib/utils";
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
  onNotificationsRead: () => void;
}

export function AnnouncementSheet({ isOpen, onClose, onNotificationsRead }: AnnouncementSheetProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      async function getNotifications() {
        setLoading(true);
        setError(null);
        try {
          const fetchedNotifications = await fetchAndParseNotifications();
          setNotifications(fetchedNotifications.reverse());
          onNotificationsRead();
        } catch (err) {
          console.error("Failed to fetch announcements:", err);
          setError("Could not fetch announcements. Please check your network connection and try again.");
        } finally {
          setLoading(false);
        }
      }
      getNotifications();
    }
  }, [isOpen]);

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

    if (error) {
      return <p className="text-red-500">{error}</p>;
    }

    if (notifications.length === 0) {
      return <p>No announcements found.</p>;
    }

    return notifications.map((notification, index) => (
      <div key={index}>
        <h3 className="font-bold">{notification.heading}</h3>
        <p>{notification.message}</p>
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
