// firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyC5CVyQ3fUtMYDtm2BpsEvin8fFbMHjA",
  authDomain: "theo-doi-can-nang.firebaseapp.com",
  projectId: "theo-doi-can-nang",
  storageBucket: "theo-doi-can-nang.firebasestorage.app",
  messagingSenderId: "628935130155",
  appId: "1:628935130155:web:b210145d907ccad7607e6e",
  measurementId: "G-6QEJP5PDJS"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || "https://cdn-icons-png.flaticon.com/512/2966/2966481.png"
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
