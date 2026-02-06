// Scripts for firebase messaging service worker

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Configuration will be populated by the client, but for SW we often hardcode or fetch config.
// Since we can't easily inject env vars into static SW without build step magic, 
// we'll advise the user to fill this part or use a solution where main app registers it with config. 
// For now, let's assume standard firebase behavior or use a specific import strategy if needed.
// ACTUALLY: The easiest way for Next.js is often to just let the user fill the config here or fetch it.
// To keep it dynamic, we'll try to rely on default instance if possible, but usually keys are needed.

// Placeholder: User must fill this after creating project
// Parse config from URL query parameters
const urlParams = new URLSearchParams(location.search);
const firebaseConfig = Object.fromEntries(urlParams);

if (Object.keys(firebaseConfig).length === 0) {
    // Only warn in development, but this file is public so avoid secrets anyway
    console.log('Firebase Config missing in SW URL. Initializing with empty or waiting for manual init.');
} else {
    firebase.initializeApp(firebaseConfig);
}

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/icon-192x192.png',
        badge: '/badge.png', // Optional
        data: payload.data
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
