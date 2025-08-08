"use client";

import { useEffect, useState } from "react";
import { fetchAndParseNotifications } from "@/lib/utils";
import { Notification } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export function NotificationPopup() {
  const [notification, setNotification] = useState<Notification | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    async function getNotifications() {
      const fetchedNotifications = await fetchAndParseNotifications();
      if (fetchedNotifications.length > 0) {
        setNotification(fetchedNotifications[fetchedNotifications.length - 1]);
      }
    }
    getNotifications();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (notification) {
        setIsOpen(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [notification]);

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen || !notification) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <Card className="w-80">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{notification.heading}</CardTitle>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <p>{notification.message}</p>
        </CardContent>
      </Card>
    </div>
  );
}
