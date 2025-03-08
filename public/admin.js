import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, getDocs, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { firebaseConfig } from "./firebaseConfig.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Check if the user is an Admin
async function checkAdmin(uid) {
    try {
        const adminDocRef = doc(db, "admins", uid);
        const adminDoc = await getDoc(adminDocRef);
        const isAdmin = adminDoc.exists();
        console.log(`Admin check for UID: ${uid} Result: ${isAdmin}`);
        return isAdmin;
    } catch (error) {
        console.error("Error checking admin status:", error);
        return false;
    }
}

// Handle Authentication State for Admin
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "adminLogin.html"; // Redirect if not logged in
        return;
    }
    console.log("User logged in. Checking admin status...");
    const isAdmin = await checkAdmin(user.uid);
    if (!isAdmin) {
        alert("Access denied. Admins only.");
        await signOut(auth);
        window.location.href = "adminLogin.html";
    } else {
        console.log("Admin authenticated. Access granted.");
        document.getElementById("logout-btn").onclick = async () => {
            await signOut(auth);
            window.location.href = "adminLogin.html";
        };
        loadAdminDashboard(); // Load the dashboard data if needed
    }
});

// Load Admin Dashboard
function loadAdminDashboard() {
    console.log("Loading admin dashboard...");
    loadOrders(); // Automatically load orders when the admin dashboard loads
}
async function loadOrders() {
    const orderTable = document.getElementById("order-table").querySelector("tbody");
    orderTable.innerHTML = ""; // Clear previous data

    try {
        console.log("Fetching orders from Firestore...");
        const querySnapshot = await getDocs(collection(db, "orders"));

        if (querySnapshot.empty) {
            console.log("No orders found in Firestore.");
            orderTable.innerHTML = "<tr><td colspan='6'>No orders available.</td></tr>";
            return;
        }

        querySnapshot.forEach((doc) => {
            const order = doc.data();
            console.log("Order fetched:", order);

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${doc.id}</td>
                <td>${order.userId || "N/A"}</td>
                <td>${order.item} (x${order.quantity})</td>
                <td>$${(order.quantity * 10).toFixed(2)}</td>
                <td contenteditable="true" data-field="status">${order.status}</td>
                <td>
                    <button class="btn edit-btn" onclick="toggleEditOrder(this, '${doc.id}')">Edit</button>
                    <button class="btn delete-btn" onclick="deleteOrder('${doc.id}')">Delete</button>
                </td>
            `;
            orderTable.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading orders:", error);
        orderTable.innerHTML = "<tr><td colspan='6'>Failed to load orders.</td></tr>";
    }
}
// Toggle between Edit and Save
window.toggleEditOrder = function(button, orderId) {
    const row = button.parentElement.parentElement;
    const isEditing = button.textContent === "Edit";

    // Toggle to Edit Mode
    if (isEditing) {
        button.textContent = "Save";
        row.querySelectorAll("[contenteditable]").forEach(cell => cell.setAttribute("contenteditable", "true"));
    } else {
        // Save Changes to Firestore
        saveOrderChanges(orderId, row);
        button.textContent = "Edit";
        row.querySelectorAll("[contenteditable]").forEach(cell => cell.setAttribute("contenteditable", "false"));
    }
};

// Save Changes to Order
async function saveOrderChanges(orderId, button) {
    const row = button.parentElement.parentElement;
    const statusCell = row.querySelector('[data-field="status"]');
    const newStatus = statusCell.textContent.trim();

    try {
        const orderRef = doc(db, "orders", orderId);
        await updateDoc(orderRef, { status: newStatus });
        alert("Order status updated successfully.");
    } catch (error) {
        console.error("Error updating order:", error);
    }
}

// Delete Order
window.deleteOrder =async function deleteOrder(orderId) {
    if (!confirm("Are you sure you want to delete this order?")) return;

    try {
        await deleteDoc(doc(db, "orders", orderId));
        alert("Order deleted successfully.");
        loadOrders(); // Refresh the orders table
    } catch (error) {
        console.error("Error deleting order:", error);
    }
}
