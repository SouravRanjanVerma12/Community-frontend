import { getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging';
import { vapidKey } from './config';
import { getFirebaseApp } from './app';

const FCM_TOKEN_CACHE_KEY = 'fcmToken';

let messagingPromise = null;

// Push isn't available in every browser (Safari <16, in-app webviews, etc.) —
// isSupported() checks that before we touch the messaging APIs.
function getMessagingInstance() {
  if (!messagingPromise) {
    messagingPromise = isSupported().then((supported) => {
      if (!supported) return null;
      return getMessaging(getFirebaseApp());
    });
  }
  return messagingPromise;
}

export function getCachedFcmToken() {
  return localStorage.getItem(FCM_TOKEN_CACHE_KEY);
}

export async function requestFcmToken() {
  if (!('Notification' in window)) return null;

  const messaging = await getMessagingInstance();
  if (!messaging) return null;

  if (Notification.permission === 'default') {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;
  } else if (Notification.permission !== 'granted') {
    return null;
  }

  const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
  const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
  if (token) localStorage.setItem(FCM_TOKEN_CACHE_KEY, token);
  return token;
}

export function clearCachedFcmToken() {
  localStorage.removeItem(FCM_TOKEN_CACHE_KEY);
}

export async function onForegroundMessage(callback) {
  const messaging = await getMessagingInstance();
  if (!messaging) return () => {};
  return onMessage(messaging, callback);
}
