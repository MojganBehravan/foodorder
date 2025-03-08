import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { firebaseConfig } from "./firebaseConfig.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Admin Login Function
export async function adminLogin() {
    const email = document.getElementById("admin-email").value;
    const password = document.getElementById("admin-password").value;
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("Admin logged in:", userCredential.user.email);
        window.location.href = "admin.html";
    } catch (error) {
        console.error("Admin login failed:", error);
        alert("Invalid admin credentials. Please try again.");
    }
}

// Make functions globally accessible
window.adminLogin = adminLogin;
