import { markNotificationRead } from "../services/notification.service.js";

export async function getMyNotifications(req, res) {
  void req;
  res.json({ notifications: [], unreadCount: 0 });
}

export async function markAsRead(req, res) {
  void req;
  await markNotificationRead({ userId: null, notificationId: null });
  res.json({ message: "Notifications are disabled" });
}
