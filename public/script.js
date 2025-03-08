// Import Firestore and Authentication functions
import { db, login, logout } from "./auth.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

// Elements for authentication and menu
let loginBtn, profileName, logoutBtn, menuGrid;

document.addEventListener("DOMContentLoaded", () => {
    console.log("Page loaded.");

    // Initialize DOM elements
    loginBtn = document.getElementById("login-btn");
    profileName = document.getElementById("user-name");
    logoutBtn = document.getElementById("logout-btn");
    menuGrid = document.getElementById("menu-grid");

    // Always set the login button event
    if (loginBtn) {
        console.log("Setting up login button click event.");
        loginBtn.style.display = "inline-block";
        loginBtn.onclick = () => {
            console.log("Login button clicked. Executing login function.");
            login();
        };
    } else {
        console.error("Login button not found in DOM.");
    }

    // Initial UI state
    showLoggedOutState();

    // Fetch menu items when page loads
    fetchMenu();

    // Add event listener to df-messenger chatbot
    setupChatbotListener();
});

// Listen for Authentication State Changes
window.addEventListener("auth-state-changed", (event) => {
    const user = event.detail?.user || null;
    console.log("Auth state changed. User:", user);

    if (user) {
        window.currentUserId = user.uid;
        showLoggedInState(user);

    } else {
        window.currentUserId = null;
        showLoggedOutState();

    }
});

// Display Logged In State
function showLoggedInState(user) {
    if (loginBtn) loginBtn.style.display = "none";

    if (profileName) {
        profileName.style.display = "inline-block";
        profileName.textContent = user.displayName;
        profileName.onclick = () => {
            console.log("Navigating to profile page...");
            window.location.href = "profile.html";
        };
    }

    if (logoutBtn) {
        logoutBtn.style.display = "inline-block";
        logoutBtn.onclick = () => logout();
    }
}

// Display Logged Out State
function showLoggedOutState() {
    if (loginBtn) {
        loginBtn.style.display = "inline-block";
        loginBtn.onclick = () => login();
    }

    if (profileName) {
        profileName.style.display = "none";
        profileName.textContent = "";
    }

    if (logoutBtn) logoutBtn.style.display = "none";
}

// Fetch Menu Items from Firestore
async function fetchMenu() {
    if (!menuGrid) return;

    menuGrid.innerHTML = "<p>Loading menu...</p>";
    try {
        const querySnapshot = await getDocs(collection(db, "foods"));
        menuGrid.innerHTML = ""; // Clear existing items

        querySnapshot.forEach((doc) => {
            const food = doc.data();
            menuGrid.innerHTML += `
                <div class="menu-card">
                    <img src="${food.image}" alt="${food.name}">
                    <h3>${food.name}</h3>
                    <p class="price">$${food.price}</p>
                </div>`;
        });

        if (!menuGrid.innerHTML) {
            menuGrid.innerHTML = "<p>No menu items available.</p>";
        }
    } catch (error) {
        console.error("Error fetching menu:", error);
        menuGrid.innerHTML = "<p>Error loading menu. Please try again later.</p>";
    }
}
// Setup Chatbot Event Listener
function setupChatbotListener() {
    const dfMessenger = document.querySelector("df-messenger");
    if (dfMessenger) {
        dfMessenger.addEventListener("df-request-sent", (event) => {
            console.log("Message sent to Dialogflow", event);

            const userMessage = event.detail.queryText;
            if (userMessage) {
                sendMessageToChatbot(userMessage);
            }
        });
    } else {
        console.error("df-messenger not found in the DOM.");
    }
}
// Chatbot Integration
async function sendMessageToChatbot(message) {
    try {
        const userId = window.currentUserId || "guest";
        console.log("Sending User ID to Chatbot:", userId);

        const response = await fetch("/dialogflowWebhook", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                queryResult: {
                    queryText: message,
                    parameters: { userId: userId }
                },
                originalDetectIntentRequest: { payload: {} }
            }),
        });

        const data = await response.json();
        console.log("Bot Response:", data.fulfillmentText);

    } catch (error) {
        console.error("Error communicating with the chatbot:", error);
    }
}