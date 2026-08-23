/* ============================================
   GAJATHURU INTERIORS — Firebase Configuration
   ============================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAczKW9sGNZAc1rch3NbJr8NbZEhWF5Ri8",
    authDomain: "gajathuru-interiors.firebaseapp.com",
    projectId: "gajathuru-interiors",
    storageBucket: "gajathuru-interiors.firebasestorage.app",
    messagingSenderId: "782548919287",
    appId: "1:782548919287:web:e2d76f3d6f40f3927984f2",
    measurementId: "G-Z2QPL6TCR2"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
