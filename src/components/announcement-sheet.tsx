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

interface AnnouncementSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AnnouncementSheet({ isOpen, onClose }: AnnouncementSheetProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    async function getNotifications() {
      const fetchedNotifications = await fetchAndParseNotifications();
      setNotifications(fetchedNotifications.reverse());
    }
    getNotifications();
  }, []);

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
          {notifications.map((notification, index) => (
            <div key={index}>
              <h3 className="font-bold">{notification.heading}</h3>
              <p>{notification.message}</p>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
