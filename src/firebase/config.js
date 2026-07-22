export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCm7vOCQFJSxI5Cgb60y7rRl3YO6ArBhKE',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'community-7be2b.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'community-7be2b',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'community-7be2b.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '583434436507',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:583434436507:web:a99fe0005ba68f18f26b3e',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-T7L3KD79FE',
};

export const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY
  || 'BFCj6XhWqE8qrEmwRD37pEWXz-dTZTzQvnvjOYcATcgQvRl8XSfFaRM9oQr3OHcoE4-mhG_JwIcLLleJbvcxBAM';
