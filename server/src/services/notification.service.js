export async function createNotification({ userId, title, message, type = "system", link = "" }) {
  void userId;
  void title;
  void message;
  void type;
  void link;
  // Notifications are disabled globally for MADVIRA.
  return null;
}

export async function markNotificationRead({ userId, notificationId }) {
  void userId;
  void notificationId;
  return null;
}
