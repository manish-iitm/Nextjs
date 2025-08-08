"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnnouncementIconProps {
  onOpen: () => void;
  notificationCount: number;
}

export function AnnouncementIcon({ onOpen, notificationCount }: AnnouncementIconProps) {
  return (
    <div className="fixed top-5 right-5 z-50">
      <Button variant="outline" size="icon" onClick={onOpen} className="relative">
        <Bell className="h-4 w-4" />
        {notificationCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {notificationCount}
          </span>
        )}
      </Button>
    </div>
  );
}
