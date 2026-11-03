const STORAGE_KEY = 'cramzero-in-app-notifications';
const UPDATE_EVENT = 'cramzero-in-app-notifications-updated';
const MAX_NOTIFICATIONS = 50;

const readStoredNotifications = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(stored) ? stored : [];
  } catch (error) {
    console.warn('Could not load in-app notifications:', error);
    return [];
  }
};

export const getInAppNotifications = () => readStoredNotifications();

export const addInAppNotification = ({ type, message, description }) => {
  const notification = {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    message,
    description,
    is_read: false,
    created_at: new Date().toISOString(),
    source: 'local',
  };
  const next = [notification, ...readStoredNotifications()].slice(0, MAX_NOTIFICATIONS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(UPDATE_EVENT));
  return notification;
};

export const markInAppNotificationRead = (id) => {
  const next = readStoredNotifications().map(notification => (
    notification.id === id ? { ...notification, is_read: true } : notification
  ));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(UPDATE_EVENT));
};

export const IN_APP_NOTIFICATIONS_UPDATED = UPDATE_EVENT;
