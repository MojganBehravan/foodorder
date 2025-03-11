import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { firebaseConfig } from "./firebaseConfig.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Logout Function
document.getElementById("logout-btn").addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "adminLogin.html";
});

// Load Menu Items from Firestore
async function loadMenuItems() {
    const menuTable = document.getElementById("menu-table").querySelector("tbody");
    menuTable.innerHTML = ""; // Clear previous data

    try {
        const querySnapshot = await getDocs(collection(db, "foods"));
        querySnapshot.forEach((doc) => {
            const food = doc.data();

            const row = document.createElement("tr");
            row.innerHTML = `
                <td contenteditable="true" data-field="name">${food.name}</td>
                <td contenteditable="true" data-field="description">${food.description}</td>
                <td contenteditable="true" data-field="price">$${food.price}</td>
                <td><img src="${food.image}" width="50"></td>
                <td>
                 <button class="btn btn-edit" onclick="toggleEditMenu('${doc.id}', this)">Edit</button>
                 <button class="btn btn-save" onclick="saveMenuChanges('${doc.id}', this)" style="display:none;">Save</button>
                 <button class="btn btn-delete" onclick="deleteMenuItem('${doc.id}')">Delete</button>
                 </td>
            `;
            menuTable.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading menu:", error);
    }
}

// Add a New Menu Item
window.addMenuItem = async function addMenuItem() {
    const name = document.getElementById("menu-name").value;
    const description = document.getElementById("menu-description").value;
    const price = parseFloat(document.getElementById("menu-price").value);
    const image = document.getElementById("menu-image").value;

    if (!name || !description || !price || !image) {
        alert("Please fill in all fields.");
        return;
    }

    try {
        await addDoc(collection(db, "foods"), { name, description, price, image });
        alert("Menu item added successfully!");
        loadMenuItems(); // Reload menu
    } catch (error) {
        console.error("Error adding menu item:", error);
    }
};

// Update an Existing Menu Item
window.saveMenuChanges = async function saveMenuChanges(menuId, button) {
    const row = button.parentElement.parentElement;
    const newName = row.querySelector('[data-field="name"]').textContent.trim();
    const newDescription = row.querySelector('[data-field="description"]').textContent.trim();
    const newPrice = parseFloat(row.querySelector('[data-field="price"]').textContent.replace("$", "").trim());

    try {
        await updateDoc(doc(db, "foods", menuId), { name: newName, description: newDescription, price: newPrice });
        alert("Menu item updated successfully!");
    } catch (error) {
        console.error("Error updating menu:", error);
    }
};

// Delete Menu Item
window.deleteMenuItem = async function deleteMenuItem(menuId) {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
        await deleteDoc(doc(db, "foods", menuId));
        alert("Menu item deleted!");
        loadMenuItems();
    } catch (error) {
        console.error("Error deleting menu item:", error);
    }
};

// Load Menu on Page Load
document.addEventListener("DOMContentLoaded", loadMenuItems);

// Toggle Edit and Save Functionality
window.toggleEditMenu = function (menuId, button) {
    const row = button.parentElement.parentElement;
    const isEditing = button.textContent === "Edit";

    // Toggle Editable Fields
    row.querySelectorAll("[contenteditable]").forEach(cell => {
        cell.setAttribute("contenteditable", isEditing ? "true" : "false");
        cell.style.border = isEditing ? "2px solid blue" : "1px solid #ddd";
    });

    // Change Button Text
    if (isEditing) {
        button.textContent = "Save";
    } else {
        saveMenuChanges(menuId, row);
        button.textContent = "Edit";
    }
};

// Save Changes to Menu Item
async function saveMenuChanges(menuId, row) {
    const newName = row.querySelector('[data-field="name"]').textContent.trim();
    const newDescription = row.querySelector('[data-field="description"]').textContent.trim();
    const newPrice = parseFloat(row.querySelector('[data-field="price"]').textContent.replace("$", "").trim());

    try {
        await updateDoc(doc(db, "foods", menuId), { name: newName, description: newDescription, price: newPrice });
        alert("Menu item updated successfully!");
    } catch (error) {
        console.error("Error updating menu:", error);
    }
}