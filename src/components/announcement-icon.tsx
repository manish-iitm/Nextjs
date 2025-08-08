"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnnouncementIconProps {
  onOpen: () => void;
}

export function AnnouncementIcon({ onOpen }: AnnouncementIconProps) {
  return (
    <div className="fixed top-5 right-5 z-50">
      <Button variant="outline" size="icon" onClick={onOpen}>
        <Bell className="h-4 w-4" />
      </Button>
    </div>
  );
}
