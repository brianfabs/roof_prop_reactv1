// Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyDKGIcQ8AktI_beAawHh8WbBLKcfsIkf3A",
  authDomain: "roofing-sales-app-76397.firebaseapp.com",
  projectId: "roofing-sales-app-76397",
  storageBucket: "roofing-sales-app-76397.firebasestorage.app",
  messagingSenderId: "568368669108",
  appId: "1:568368669108:web:de2ee1b80b3cd082f3d2e1",
  measurementId: "G-YNSBK3CRLH"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Initialize Auth and sign in anonymously if no user
firebase.auth().onAuthStateChanged((user) => {
  if (!user) {
    // Sign in anonymously for basic access
    firebase.auth().signInAnonymously().catch((error) => {
      console.error('Anonymous sign-in failed:', error);
    });
  }
});