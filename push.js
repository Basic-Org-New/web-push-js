// Backend endpoint
const backendEndpoint = "http://localhost:3000/tokens";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAoOXnoo6uAiaTP-sBFuKP6ork-JhmYqaw",
  authDomain: "staging-pubnotify.firebaseapp.com",
  projectId: "staging-pubnotify",
  storageBucket: "staging-pubnotify.appspot.com",
  messagingSenderId: "210904409944",
  appId: "1:210904409944:web:372ea4d6bead9ed481272d"
};

// Configuration object
const notificationConfig = {
    showPopup: true,  // Whether to show the custom popup
    popupPosition: 'top-right',  // Default popup position, options: 'top-center', 'top-right', 'top-left', 'bottom-center', 'bottom-left', 'bottom-right'
    showDenyButton: true,  // Whether to show the deny button
    allowButtonText: 'Allow',  // Text for the allow button
    denyButtonText: 'Deny',  // Text for the deny button
    popupTitle: 'faceebook wants to notify you about the latest updates', // Popup title
    popupMessage: 'You can unsubscribe from notifications anytime.', // Popup message
    vapidKey: 'BNmXU0cqiryYeayMMac2i8AVJ4ZY5-k4-AftWEMXqYXrb2iyLLvkGDOb-92WbqR-4Ibd2gz3KErFkBcldrDEBXA'
};

// Utility functions
const Utils = {
    loadScripts: (srcs, callback) => {
        let count = 0;
        srcs.forEach(src => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                count += 1;
                if (count === srcs.length) {
                    callback();
                }
            };
            document.head.appendChild(script);
        });
    },
    getDeviceType: () => {
        const ua = navigator.userAgent;
        if (/tablet|ipad|playbook|silk/i.test(ua) && !/mobile|phone|android/i.test(ua)) {
            return "Tablet";
        }
        if (/Mobile|Android|iP(ad|hone|od)|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Fennec|BlackBerry|BB10|PlayBook|Opera M(obi|ini)/.test(ua)) {
            return "Mobile";
        }
        return "Desktop";
    },
    getBrowserName: () => {
        const ua = navigator.userAgent;
        if (/chrome|crios|crmo/i.test(ua)) {
            return "Chrome";
        } else if (/firefox|iceweasel|fxios/i.test(ua)) {
            return "Firefox";
        } else if (/safari/i.test(ua)) {
            return "Safari";
        } else if (/opr|opera/i.test(ua)) {
            return "Opera";
        } else if (/msie|trident/i.test(ua)) {
            return "Internet Explorer";
        } else if (/edg/i.test(ua)) {
            return "Edge";
        }
        return "Unknown";
    },
    getOperatingSystem: () => {
        const ua = navigator.userAgent;
        if (/windows nt/i.test(ua)) {
            return "Windows";
        } else if (/android/i.test(ua)) {
            return "Android";
        } else if (/linux/i.test(ua)) {
            return "Linux";
        } else if (/iphone|ipad|ipod/i.test(ua)) {
            return "iOS";
        } else if (/mac os x/i.test(ua)) {
            return "Mac OS";
        }
        return "Unknown";
    },
    getDomain: () => {
        return window.location.hostname.replace('www.', '');
    },
    getIpAndLocation: async () => {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        return {
            ip: data.ip,
            country: data.country_name,
            region: data.region,
            city: data.city
        };
    },
    sendDataToServer: async (data, endpoint) => {
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const responseData = await response.json();
            console.log('Server response:', responseData);
        } catch (error) {
            console.error('Error sending data to server:', error);
        }
    },
    extractKeys: (subscription) => {
        if (!subscription) {
            return {
                endpoint: '',
                keys: {
                    auth: '',
                    p256dh: ''
                }
            };
        }

        const rawKey = subscription.getKey ? subscription.getKey('p256dh') : '';
        const key = rawKey ? btoa(String.fromCharCode.apply(null, new Uint8Array(rawKey))) : '';
        const rawAuthSecret = subscription.getKey ? subscription.getKey('auth') : '';
        const authSecret = rawAuthSecret ? btoa(String.fromCharCode.apply(null, new Uint8Array(rawAuthSecret))) : '';

        return {
            endpoint: subscription.endpoint,
            keys: {
                auth: authSecret,
                p256dh: key
            }
        };
    },
    urlBase64ToUint8Array: (base64String) => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }
};

// Load Firebase scripts
function loadFirebaseScripts() {
    Utils.loadScripts([
        "https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js",
        "https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js"
    ], initializeFirebase);
}

// Initialize Firebase
async function initializeFirebase() {
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    // Ensure the service worker is ready
    await navigator.serviceWorker.register('firebase-messaging-sw.js');

    // Initialize notification handling
    initializeNotification(messaging);
}

// Request notification permission and get token
async function requestNotificationPermission(messaging) {
    if (Notification.permission === 'granted') {
        return await messaging.getToken({ vapidKey: notificationConfig.vapidKey });
    } else {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            return await messaging.getToken({ vapidKey: notificationConfig.vapidKey });
        } else {
            throw new Error('Notification permission not granted');
        }
    }
}

// Inject and show custom popup for notification permission
function showCustomPopup(callback) {
    // Inject CSS for Animate.css
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css';
    document.head.appendChild(link);

    // Inject CSS for Popup
    const style = document.createElement('style');
    style.innerHTML = `
        .notification-popup {
            position: fixed;
            z-index: 9999;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 320px;
            padding: 15px;
            background-color: #fff;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
            border-radius: 10px;
            opacity: 0;
            pointer-events: none;
            font-family: 'Arial', sans-serif;
        }
        .notification-popup.show {
            opacity: 1;
            pointer-events: auto;
        }
        .notification-popup.top-center,
        .notification-popup.top-right,
        .notification-popup.top-left {
            top: 0;
        }
        .notification-popup.bottom-center,
        .notification-popup.bottom-right,
        .notification-popup.bottom-left {
            bottom: 20px;
        }
        .notification-popup.top-center {
            left: 50%;
            margin-left: -160px; /* half the width of the popup */
        }
        .notification-popup.top-right {
            right: 20px;
        }
        .notification-popup.top-left {
            left: 20px;
        }
        .notification-popup.bottom-center {
            left: 50%;
            margin-left: -160px; /* half the width of the popup */
        }
        .notification-popup.bottom-right {
            right: 20px;
        }
        .notification-popup.bottom-left {
            left: 20px;
        }
        .notification-content {
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .notification-content img {
            width: 50px;
            height: 50px;
        }
        .notification-content h4 {
            margin: 10px 0 5px;
            font-size: 16px;
            text-align: center;
        }
        .notification-content p {
            margin: 0 0 10px;
            font-size: 14px;
            text-align: center;
        }
        .notification-buttons {
            display: flex;
            justify-content: space-between;
            width: 100%;
        }
        .notification-buttons button {
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-family: 'Arial', sans-serif;
        }
        .notification-buttons .allow-button {
            background-color: #007bff;
            color: #fff;
        }
        .notification-buttons .deny-button {
            background-color: #dc3545;
            color: #fff;
        }
        @media (max-width: 480px) {
            .notification-popup {
                width: 82% !important;
                left: 5% !important;
                right: 5% !important;
                margin-left: 0 !important; /* reset margin */
            }
         
        }
    `;
    document.head.appendChild(style);

    // Inject HTML
    const popup = document.createElement('div');
    popup.id = 'notification-popup';
    popup.className = `notification-popup ${notificationConfig.popupPosition} animate__animated`;
    popup.innerHTML = `
        <div class="notification-content">
            <img src="https://cdn.larapush.com/uploads/bell-logo.jpg" alt="Notification Icon">
            <h4>${notificationConfig.popupTitle}</h4>
            <p>${notificationConfig.popupMessage}</p>
            <div class="notification-buttons">
                ${notificationConfig.showDenyButton ? `<button class="deny-button">${notificationConfig.denyButtonText}</button>` : ''}
                <button class="allow-button">${notificationConfig.allowButtonText}</button>
            </div>
        </div>
    `;
    document.body.appendChild(popup);

    // Determine the animation class
    const slideInClass = notificationConfig.popupPosition.includes('bottom') ? 'animate__slideInUp' : 'animate__slideInDown';
    const slideOutClass = notificationConfig.popupPosition.includes('bottom') ? 'animate__slideOutDown' : 'animate__slideOutUp';

    // Animate popup
    setTimeout(() => {
        popup.classList.add('show', slideInClass);
    }, 100);

    popup.querySelector('.allow-button').addEventListener('click', () => {
        callback(true);
        popup.classList.remove(slideInClass);
        popup.classList.add(slideOutClass);
        setTimeout(() => {
            popup.remove();
        }, 800);
    });

    if (notificationConfig.showDenyButton) {
        popup.querySelector('.deny-button').addEventListener('click', () => {
            callback(false);
            popup.classList.remove(slideInClass);
            popup.classList.add(slideOutClass);
            setTimeout(() => {
                popup.remove();
            }, 800);
        });
    }
}

// Initialize notification system
async function initializeNotification(messaging) {
    // Check if permission is already granted
    if (Notification.permission === 'granted') {
        console.log('Notification permission already granted, no need to show popup.');
        await handleNotificationPermission(messaging);
        return;
    }

    // Show custom popup if configured to do so or if the browser doesn't support native popups
    const isNativePopupSupported = typeof Notification !== 'undefined';
    if (notificationConfig.showPopup || !isNativePopupSupported) {
        showCustomPopup(async (isAllowed) => {
            if (isAllowed) {
                await handleNotificationPermission(messaging);
            } else {
                console.log('User denied notification permission');
            }
        });
    } else {
        // Directly request permission if native popup is supported
        await handleNotificationPermission(messaging);
    }
}

// Handle notification permission and send data to server
async function handleNotificationPermission(messaging) {
    try {
        const locationData = await Utils.getIpAndLocation();
        const deviceType = Utils.getDeviceType();
        const browserName = Utils.getBrowserName();
        const operatingSystem = Utils.getOperatingSystem();
        const domain = Utils.getDomain();
        const currentUrl = window.location.href;
        const token = await requestNotificationPermission(messaging);

        if (localStorage.getItem('notificationToken') !== token) {
            localStorage.setItem('notificationToken', token);

            const registration = await navigator.serviceWorker.ready;
            let subscription = await registration.pushManager.getSubscription();
            if (!subscription) {
                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: Utils.urlBase64ToUint8Array(notificationConfig.vapidKey)
                });
            }
            const keys = Utils.extractKeys(subscription);

            const data = {
                notificationToken: token,
                endpoint: keys.endpoint,
                auth: keys.keys.auth,
                p256dh: keys.keys.p256dh,
                ipAddress: locationData.ip,
                country: locationData.country,
                state: locationData.region,
                city: locationData.city,
                deviceType: deviceType,
                browser: browserName,
                operatingSystem: operatingSystem,
                domain: domain,
                currentUrl: currentUrl
            };

            console.log('Notification Token:', token);
            console.log('Data:', data);

            // Send the data to your backend server
            await Utils.sendDataToServer(data, backendEndpoint); // Replace with your backend endpoint
        } else {
            console.log('Token is already active, no need to send again.');
        }
    } catch (error) {
        console.error('Error during notification initialization', error);
    }
}

// Handle permission reset and delete the token from Firebase
async function resetNotificationPermissions(messaging) {
    const token = localStorage.getItem('notificationToken');
    if (token) {
        try {
            await messaging.deleteToken(token);
            localStorage.removeItem('notificationToken');
            console.log('Notification token deleted');
        } catch (error) {
            console.error('Error deleting notification token:', error);
        }
    } else {
        console.log('No notification token found');
    }
}

// Load Firebase scripts and initialize notification system
document.addEventListener('DOMContentLoaded', () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('firebase-messaging-sw.js')
        .then(function(registration) {
            console.log('Service Worker registered with scope:', registration.scope);
        }).catch(function(err) {
            console.error('Service Worker registration failed:', err);
        });
    }
    loadFirebaseScripts();
});