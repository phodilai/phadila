// Import Firebase scripts for service worker
importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js');

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCgJYCKOeHmh57ro5vQ4JWJX-szldH-UeA",
  authDomain: "pdlvt-9aae7.firebaseapp.com",
  projectId: "pdlvt-9aae7",
  storageBucket: "pdlvt-9aae7.appspot.com",
  messagingSenderId: "373888053638",
  appId: "1:373888053638:web:e50174ab1ab789bfe53c07",
  measurementId: "G-25P00B0M3Q"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || 'Đơn hàng mới';
  const notificationOptions = {
    body: payload.notification?.body || 'Có đơn hàng mới cần xử lý',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'new-order',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'Xem đơn hàng'
      },
      {
        action: 'dismiss',
        title: 'Đóng'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click received.');

  event.notification.close();

  if (event.action === 'view') {
    // Open the app and navigate to admin view
    event.waitUntil(
      clients.openWindow('/?view=admin')
    );
  }
});