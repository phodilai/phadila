import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
  messagingSenderId: "373888053638",
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: "G-25P00B0M3Q"
};

const vapidKey = "BJXPaiZL-lYNsbU_u59EnHXFq4o6eb2QvaNpNGVzY9NxhUNhLJmMFN46iuXPJNyFIfWOroXYblJ4HiClDoUA6ic";

// Initialize Firebase app if not already initialized
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error: any) {
  if (error.code === 'app/duplicate-app') {
    // App is already initialized, get the existing app
    app = initializeApp(firebaseConfig, 'orderSystem');
  } else {
    throw error;
  }
}

const messaging = getMessaging(app);

export async function requestNotificationPermission(): Promise<string | null> {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, { vapidKey });
      console.log('FCM Registration Token:', token);
      return token;
    } else {
      console.log('Unable to get permission to notify.');
      return null;
    }
  } catch (error) {
    console.error('An error occurred while retrieving token. ', error);
    return null;
  }
}

export function onMessageListener() {
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('Message received. ', payload);
      resolve(payload);
    });
  });
}

export function showNotification(title: string, body: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body: body,
      icon: '/favicon.ico'
    });
  }
}

export { messaging };
