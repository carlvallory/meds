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
const firebaseConfig = {
    apiKey: "AIzaSyBIQ1MS7z9GwyjLCcUQKTkZoZ3bMPQ1C7s",
    authDomain: "mediator-pwa.firebaseapp.com",
    projectId: "mediator-pwa",
    storageBucket: "mediator-pwa.firebasestorage.app",
    messagingSenderId: "718606804737",
    appId: "1:718606804737:web:25d6f85013d780c7219d00"
};

firebase.initializeApp(firebaseConfig);

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
