// Import Firebase SDK using CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "",
  authDomain: "food-ordering-81175.firebaseapp.com",
  projectId: "food-ordering-81175",
 
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

// Google Login
document.getElementById("login-btn").addEventListener("click", async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    alert(`Welcome, ${user.displayName}!`);
    console.log("User logged in:", user);
  } catch (error) {
    console.error("Login failed:", error);
  }
});

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

// Load Menu on Page Load
window.onload = fetchMenu