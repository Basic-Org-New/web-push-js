importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyAoOXnoo6uAiaTP-sBFuKP6ork-JhmYqaw",
    authDomain: "staging-pubnotify.firebaseapp.com",
    projectId: "staging-pubnotify",
    storageBucket: "staging-pubnotify.appspot.com",
    messagingSenderId: "210904409944",
    appId: "1:210904409944:web:372ea4d6bead9ed481272d"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
    console.log('[firebase-messaging-sw.js] Received background message', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.icon || '', // Default to empty string if undefined
        image: payload.notification.image || '', // Optional chaining with default value
        actions: payload.notification.actions || [], // Optional chaining with default value
        vibrate: payload.notification.vibrate || [200, 100, 200], // Optional chaining with default value
        requireInteraction: payload.notification.requireInteraction || false, // Optional chaining with default value
        tag: payload.notification.tag || 'default-tag', // Optional chaining with default value
    };

    console.log('Displaying notification:', {
        title: notificationTitle,
        options: notificationOptions
    });

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle push events
self.addEventListener('push', event => {
    console.log('[Service Worker] Push Received.');
    console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

    try {
        const data = event.data.json();
        console.log('[Service Worker] Push data:', data);

        const notificationTitle = data.notification.title;
        const notificationOptions = {
            body: data.notification.body,
            icon: data.notification.icon || '',
            image: data.notification.image || '',
            actions: data.notification.actions || [],
            vibrate: data.notification.vibrate || [200, 100, 200],
            requireInteraction: data.notification.requireInteraction || false,
            tag: data.notification.tag || 'default-tag',
            data: { click_action: data.notification.click_action } // pass click_action in data for handling click event
        };

        console.log('[Service Worker] Notification options:', notificationOptions);
        self.registration.showNotification(notificationTitle, notificationOptions);
    } catch (error) {
        console.error('[Service Worker] Error handling push event:', error);
    }
});

// Handle notification click event
self.addEventListener('notificationclick', function(event) {
    console.log('[Service Worker] Notification click Received.');

    event.notification.close(); // Close notification

    if (event.notification.data && event.notification.data.click_action) {
        event.waitUntil(
            clients.openWindow(event.notification.data.click_action)
        );
    }
});
