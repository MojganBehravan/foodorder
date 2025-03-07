// Import Firebase SDK for Firestore
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

// Initialize Firestore
const db = getFirestore();

// Reference to the authentication button
const authBtn = document.getElementById("auth-btn");

// Handle Authentication Button on Page Load
window.onload = () => {
    console.log("Page loaded. Current User ID:", window.currentUserId);

    if (window.currentUserId) {
        authBtn.textContent = "Profile";
        authBtn.onclick = () => {
            window.location.href = "profile.html";
        };
    } else {
        authBtn.textContent = "Login";
        authBtn.onclick = () => login();
    }

    fetchMenu(); // Load menu items when page loads
};

// Fetch Menu Items from Firestore
async function fetchMenu() {
    const menuGrid = document.getElementById("menu-grid");
    menuGrid.innerHTML = ""; // Clear existing items
    try {
        const querySnapshot = await getDocs(collection(db, "foods"));
        querySnapshot.forEach((doc) => {
            const food = doc.data();
            const foodCard = `
                <div class="menu-card">
                    <img src="${food.image}" alt="${food.name}">
                    <h3>${food.name}</h3>
                    <p class="price">$${food.price}</p>
                </div>
            `;
            menuGrid.innerHTML += foodCard;
        });
    } catch (error) {
        console.error("Error fetching menu:", error);
    }
}

// Trigger Custom Events for Login and Logout
function login() {
    window.dispatchEvent(new CustomEvent("trigger-login"));
}

function logout() {
    window.dispatchEvent(new CustomEvent("trigger-logout"));
}

// Make functions globally accessible if needed
window.login = login;
window.logout = logout;
