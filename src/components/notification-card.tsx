import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Notification } from "@/lib/types";

interface NotificationCardProps {
  notification: Notification;
}

export function NotificationCard({ notification }: NotificationCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{notification.heading}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{notification.message}</p>
      </CardContent>
    </Card>
  );
}
