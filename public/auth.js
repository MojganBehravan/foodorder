// Import Firebase Modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { firebaseConfig } from "./firebaseConfig.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Global variable for current user ID
window.currentUserId = null;
window.auth = auth; // Make auth globally accessible

// Handle Authentication State Globally
onAuthStateChanged(auth, (user) => {
    const authBtn = document.getElementById("auth-btn");

    if (user) {
        window.currentUserId = user.uid;
        console.log("Authenticated User:", user);

        if (authBtn) {
            authBtn.textContent = "Profile";
            authBtn.onclick = () => {
                window.location.href = "profile.html";
            };
        }
    } else {
        window.currentUserId = null;
        console.log("No user logged in.");
        if (authBtn) {
            authBtn.textContent = "Login";
            authBtn.onclick = () => login();
        }
    }
});

// Login Function
async function login() {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        alert(`Welcome, ${user.displayName}!`);
        window.location.href = "profile.html"; // Redirect to profile page after login
    } catch (error) {
        console.error("Login failed:", error);
        alert("Login failed. Please try again.");
    }
}

// Logout Function
async function logout() {
    try {
        await signOut(auth);
        alert("Logged out successfully.");
        window.location.href = "index.html";
    } catch (error) {
        console.error("Logout failed:", error);
    }
}

// Handle Custom Events from Other Scripts
window.addEventListener("trigger-login", async () => {
    console.log("Login triggered from another script");
    await login();
});

window.addEventListener("trigger-logout", async () => {
    console.log("Logout triggered from another script");
    await logout();
});

// Make login and logout functions globally accessible
window.login = login;
window.logout = logout;
