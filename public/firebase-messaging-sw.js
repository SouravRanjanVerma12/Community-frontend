// Static service worker — Vite serves everything in public/ from the site root,
// which is required: FCM's service worker must be reachable at /firebase-messaging-sw.js.
// It can't import the app's ES modules, so the config below is duplicated from
// src/firebase/config.js. Keep the two in sync if the Firebase project changes.
importScripts('https://www.gstatic.com/firebasejs/12.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCm7vOCQFJSxI5Cgb60y7rRl3YO6ArBhKE",
  authDomain: "community-7be2b.firebaseapp.com",
  projectId: "community-7be2b",
  storageBucket: "community-7be2b.firebasestorage.app",
  messagingSenderId: "583434436507",
  appId: "1:583434436507:web:a99fe0005ba68f18f26b3e",
  measurementId: "G-T7L3KD79FE"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || '/favicon.svg',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
