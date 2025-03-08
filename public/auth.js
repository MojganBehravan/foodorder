// Import Firebase Modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, signInWithPopup, GoogleAuthProvider, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { firebaseConfig } from "./firebaseConfig.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Set auth state persistence to LOCAL
setPersistence(auth, browserLocalPersistence)
    .then(() => {
        console.log("Auth state persistence set to LOCAL.");
    })
    .catch((error) => {
        console.error("Error setting auth persistence:", error);
    });

// Handle Authentication State
onAuthStateChanged(auth, (user) => {
    const userNameSpan = document.getElementById("user-name");
    const loginBtn = document.getElementById("login-btn");
    const logoutBtn = document.getElementById("logout-btn");

    if (user) {
        window.currentUserId = user.uid;
        console.log("Authenticated User:", user);

        // Update UI Elements
        if (userNameSpan) {
            userNameSpan.textContent = user.displayName;
            userNameSpan.style.display = "inline-block";
            userNameSpan.onclick = () => window.location.href = "profile.html";
        }

        if (loginBtn) loginBtn.style.display = "none";
        if (logoutBtn) {
            logoutBtn.style.display = "inline-block";
            logoutBtn.onclick = () => logout();
        }

        window.dispatchEvent(new CustomEvent("auth-state-changed", { detail: { user } }));
    } else {
        window.currentUserId = null;
        console.log("No user logged in.");

        // Reset UI Elements
        if (userNameSpan) {
            userNameSpan.textContent = "";
            userNameSpan.style.display = "none";
        }

        if (loginBtn) loginBtn.style.display = "inline-block";
        if (logoutBtn) logoutBtn.style.display = "none";

        window.dispatchEvent(new CustomEvent("auth-state-changed", { detail: { user: null } }));
    }
});

// Login Function
export async function login() {
    try {
        const result = await signInWithPopup(auth, provider);
        console.log(`Welcome, ${result.user.displayName}!`);
        window.location.href = "profile.html";
    } catch (error) {
        console.error("Login failed:", error);
        alert("Login failed. Please try again.");
    }
}

// Logout Function
export async function logout() {
    try {
        await signOut(auth);
        console.log("Logged out successfully.");
        window.location.href = "index.html";
    } catch (error) {
        console.error("Logout failed:", error);
    }
}

// Make functions globally accessible
window.login = login;
window.logout = logout;
