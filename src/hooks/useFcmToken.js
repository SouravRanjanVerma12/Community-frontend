import { useEffect } from 'react';
import { showNotificationToast } from '../components/ui/NotificationToast';
import api from '../api/axiosInstance';
import { requestFcmToken, onForegroundMessage } from '../firebase/messaging';

// Requests notification permission, grabs an FCM token, and registers it with
// the backend so it can push to this device. Also shows a toast for messages
// that arrive while the tab is focused (background messages are handled by
// the service worker instead). Call once, while the user is authenticated.
export function useFcmToken(enabled) {
  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    requestFcmToken()
      .then((token) => {
        if (!token || cancelled) return;
        return api.post('/users/fcm-token', { token });
      })
      .catch((err) => console.error('FCM token registration failed:', err));

    const unsubscribePromise = onForegroundMessage((payload) => {
      const { title, body } = payload.notification ?? {};
      if (title) showNotificationToast(body ? `${title}: ${body}` : title);
    });

    return () => {
      cancelled = true;
      unsubscribePromise.then((unsubscribe) => unsubscribe?.());
    };
  }, [enabled]);
}
