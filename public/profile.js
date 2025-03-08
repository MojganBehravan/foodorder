// Import Firestore and Authentication functions
import { db, auth, logout } from "./auth.js";
import { collection, getDocs,doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

// Listen for Authentication State Changes
window.addEventListener("auth-state-changed", async (event) => {
    const user = event.detail?.user || null;
    console.log("Auth state changed on Profile Page. User:", user);

    if (user) {
        await loadUserProfile({ uid: user.uid });
        await loadUserOrders(user.uid);
    } else {
        console.log("No user logged in. Redirecting to index.html");
        window.location.href = "index.html";
    }

    setupAuthButtons();
    loadChatHistory();
});

// Load User Profile
// Load User Profile
async function loadUserProfile(user) {
    try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        let userData = {};

        if (userDoc.exists()) {
            userData = userDoc.data();
            console.log("Loaded user data from Firestore:", userData);
        } else {
            const currentUser = auth.currentUser;
            if (currentUser) {
                userData = {
                    name: currentUser.displayName || "No name available",
                    email: currentUser.email || "No email available",
                    address: "No address saved",
                };

                // Save default user data to Firestore
                await setDoc(userDocRef, userData);
                console.log("Saved new user data to Firestore:", userData);
            }
        }

        // Update the profile form with user data
        document.getElementById("username").value = userData.name || "";
        document.getElementById("user-email").value = userData.email || "";
        document.getElementById("user-address").value = userData.address || "";

    } catch (error) {
        console.error("Error loading user profile:", error);
    }
}

// Load User Orders
async function loadUserOrders(userId) {
    const ordersTable = document.getElementById("orders-table");
    ordersTable.innerHTML = "<tr><td colspan='5'>Loading orders...</td></tr>";

    try {
        const ordersSnapshot = await getDocs(collection(db, "orders"));
        ordersTable.innerHTML = "";
        let hasOrders = false;

        ordersSnapshot.forEach((doc) => {
            const order = doc.data();
            if (order.userId === userId) {
                hasOrders = true;
                ordersTable.innerHTML += `
                    <tr>
                        <td>${order.item || "N/A"}</td>
                        <td>${order.quantity || "N/A"}</td>
                        <td>${order.address || "N/A"}</td>
                        <td>${order.status || "N/A"}</td>
                        <td>${new Date(order.timestamp.seconds * 1000).toLocaleString()}</td>
                    </tr>
                `;
            }
        });

        if (!hasOrders) {
            ordersTable.innerHTML = "<tr><td colspan='5'>No orders found.</td></tr>";
        }
    } catch (error) {
        console.error("Error loading orders:", error);
    }
}



// Setup Authentication Buttons
function setupAuthButtons() {
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.style.display = "inline-block";
        logoutBtn.onclick = () => logout();
    }
}

// Reference to buttons
const editBtn = document.getElementById("edit-btn");
const saveBtn = document.getElementById("save-btn");

// Event Listener for Edit Button
editBtn.addEventListener("click", () => toggleEditMode(true));

// Event Listener for Save Button
saveBtn.addEventListener("click", async () => {
    await saveUserProfile();
    toggleEditMode(false);
});

function toggleEditMode(editMode) {
    document.getElementById("username").disabled = !editMode;
    document.getElementById("user-email").disabled = !editMode;
    document.getElementById("user-address").disabled = !editMode;

    editBtn.style.display = editMode ? "none" : "inline-block";
    saveBtn.style.display = editMode ? "inline-block" : "none";
}
async function saveUserProfile() {
    const userId = window.currentUserId;
    if (!userId) {
        console.error("No user ID found.");
        return;
    }

    const userData = {
        name: document.getElementById("username").value,
        email: document.getElementById("user-email").value,
        address: document.getElementById("user-address").value
    };

    try {
        await setDoc(doc(db, "users", userId), userData, { merge: true });
        console.log("Profile updated successfully!");
        alert("Profile updated successfully!");
    } catch (error) {
        console.error("Error updating profile:", error);
    }
}
// Load Chat History
function loadChatHistory() {
    const chatWindow = document.getElementById("chat-window");
    if (chatWindow) {
        const chatHistory = localStorage.getItem("chatHistory") || "";
        chatWindow.innerHTML = chatHistory;
    }
}

