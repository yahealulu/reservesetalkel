importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
    // Firebase configuration
    apiKey: "__FIREBASE_API_KEY__",
    authDomain: "__FIREBASE_AUTH_DOMAIN__",
    projectId: "__FIREBASE_PROJECT_ID__",
    storageBucket: "__FIREBASE_STORAGE_BUCKET__",
    messagingSenderId: "__FIREBASE_MESSAGING_SENDER_ID__",
    appId: "__FIREBASE_APP_ID__"
});

const messaging = firebase.messaging();