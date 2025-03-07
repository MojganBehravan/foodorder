// Wait for the DOM to load
window.onload = async () => {
    console.log("Page loaded.");
    const authBtn = document.getElementById("auth-btn");

    if (authBtn) {
        authBtn.addEventListener("click", () => {
            if (window.currentUserId) {
                signOut(auth).then(() => {
                    alert("Logged out successfully.");
                    window.location.href = "index.html";
                }).catch((error) => {
                    console.error("Logout failed:", error);
                });
            } else {
                window.location.href = "index.html";
            }
        });
    }

    if (window.currentUserId) {
        await loadUserProfile({ uid: window.currentUserId });
        await loadUserOrders(window.currentUserId);
    } else {
        console.log("No user logged in.");
    }

    loadChatHistory();
};

// Load User Profile
async function loadUserProfile(user) {
    try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        let userData = {};

        if (userDoc.exists()) {
            userData = userDoc.data();
        } else {
            userData = {
                name: "No name available",
                email: "No email available",
                address: "No address saved",
            };
        }

        document.getElementById("user-name").value = userData.name;
        document.getElementById("user-email").value = userData.email;
        document.getElementById("user-address").value = userData.address;

        toggleEditMode(false);
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

// Toggle Edit Mode
function toggleEditMode(editMode) {
    document.getElementById("user-name").disabled = !editMode;
    document.getElementById("user-email").disabled = !editMode;
    document.getElementById("user-address").disabled = !editMode;

    document.getElementById("edit-btn").classList.toggle("hidden", editMode);
    document.getElementById("save-btn").classList.toggle("hidden", !editMode);
}

// Chatbot Integration
async function sendMessageToChatbot(message) {
    const chatWindow = document.getElementById("chat-window");
    chatWindow.innerHTML += `<div class="message user">${message}</div>`;
    chatWindow.scrollTop = chatWindow.scrollHeight;

    try {
        const userId = window.currentUserId || "guest"; // Use the global user ID
        console.log("User ID in Chatbot:", userId);

        const response = await fetch("/dialogflowWebhook", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                queryResult: { queryText: message },
                originalDetectIntentRequest: {
                    payload: {
                        user: { uid: userId }
                    }
                }
            }),
        });

        const data = await response.json();
        chatWindow.innerHTML += `<div class="message bot">${data.fulfillmentText}</div>`;
        chatWindow.scrollTop = chatWindow.scrollHeight;

        saveChatHistory(chatWindow.innerHTML);
    } catch (error) {
        console.error("Error communicating with the chatbot:", error);
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

// Make functions accessible globally
window.sendMessageToChatbot = sendMessageToChatbot;
