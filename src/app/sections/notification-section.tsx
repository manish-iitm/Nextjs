"use client";

import { useEffect, useState } from "react";
import { fetchAndParseNotifications } from "@/lib/utils";
import { Notification } from "@/lib/types";
import { NotificationCard } from "@/components/notification-card";

export function NotificationSection() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    async function getNotifications() {
      const fetchedNotifications = await fetchAndParseNotifications();
      setNotifications(fetchedNotifications);
    }
    getNotifications();
  }, []);

  return (
    <div id="notifications" className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-center mb-8">Notifications</h2>
      <div className="grid gap-4">
        {notifications.map((notification, index) => (
          <NotificationCard key={index} notification={notification} />
        ))}
      </div>
    </div>
  );
}
