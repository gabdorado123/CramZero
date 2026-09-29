const STORAGE_KEY = 'cramzero-analytics-events';
const UPDATE_EVENT = 'cramzero:analytics-updated';

const readEvents = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const events = stored ? JSON.parse(stored) : [];
    return Array.isArray(events) ? events : [];
  } catch {
    return [];
  }
};

export const getAnalyticsEvents = () => readEvents();

export const recordAnalyticsEvent = (event) => {
  const nextEvent = {
    ...event,
    id: crypto.randomUUID(),
    recordedAt: new Date().toISOString(),
  };
  const events = [...readEvents(), nextEvent].slice(-2000);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: nextEvent }));
  return nextEvent;
};

export const subscribeToAnalytics = (callback) => {
  const handleUpdate = () => callback(getAnalyticsEvents());
  window.addEventListener(UPDATE_EVENT, handleUpdate);
  window.addEventListener('storage', handleUpdate);
  return () => {
    window.removeEventListener(UPDATE_EVENT, handleUpdate);
    window.removeEventListener('storage', handleUpdate);
  };
};
