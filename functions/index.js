import functions from "firebase-functions";
import admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

// Specify the region for your Cloud Function
export const dialogflowWebhook = functions.https.onRequest(async (req, res) => {
    const intentName = req.body.queryResult.intent.displayName;
    const parameters = req.body.queryResult.parameters;
    const session = req.body.session;
     // Correctly extract user ID from queryParams payload
    let userId = req.body.queryResult?.parameters?.userId || "guest";
    console.log("Received user ID in webhook:", userId);

    if (intentName === "Place Order") {
        try {
            // Fetch menu items from Firestore
            const menuSnapshot = await db.collection("foods").get();
            let menuItems = "";

            menuSnapshot.forEach((doc) => {
                const food = doc.data();
                menuItems += `${food.name} - $${food.price}\n`;
            });

            // Respond with the menu
            res.json({
                fulfillmentText: `Here's our menu:\n${menuItems}\nWhat would you like to order?`,
                outputContexts: [
                    {
                        name: `${session}/contexts/ongoing-order`,
                        lifespanCount: 5
                    },
                    {
                        name: `${session}/contexts/awaiting-address`,
                        lifespanCount: 5
                    }
                ]
            });
        } catch (error) {
            console.error("Error fetching menu:", error);
            res.status(500).json({
                fulfillmentText: "Sorry, I couldn't retrieve the menu at the moment. Please try again later."
            });
        }
    }
    else if (intentName === "Select Food") {
        const foodItem = parameters["food-item"];
        const quantity = parameters["quantity"] || 1;

        res.json({
            fulfillmentText: `You want ${quantity} ${foodItem}(s). Please provide your delivery address.`,
            outputContexts: [
                {
                    name: `${session}/contexts/awaiting-address`,
                    lifespanCount: 5,
                    parameters: {
                    "food-item": foodItem,
                    "quantity": quantity
                }
                }
            ]
        });
    }
    else if (intentName === "Provide Address") {
    const deliveryAddress = parameters["address"] || "No address provided";
// Fetch the existing order details from the previous context (e.g., awaiting-address)
    const previousContext = req.body.queryResult.outputContexts.find(
        (context) => context.name.endsWith("/awaiting-address")
    )?.parameters;
    const foodItem = previousContext?.["food-item"] || "Unknown item";
    const quantity = previousContext?.["quantity"] || 1;

    res.json({
        fulfillmentText: `You've entered: ${deliveryAddress}.\nShould I confirm this delivery address?`,
        outputContexts: [
            {
                name: `${req.body.session}/contexts/awaiting-confirmation`,
                lifespanCount: 5,
                parameters: {
                   "address": deliveryAddress,
                    "food-item": foodItem, // Preserve food item
                    "quantity": quantity,  // Preserve quantity
                    "userId": userId
                }
            }
        ]
    });
}
    else if (intentName === "Confirm Order") {
    // Retrieve parameters from the context
    const contextParameters = req.body.queryResult.outputContexts.find(
        (context) => context.name.endsWith("/awaiting-confirmation")
    )?.parameters;

    const foodItem = contextParameters?.["food-item"] || "Unknown item";
    const quantity = contextParameters?.["quantity"] || 1;
    const deliveryAddress = contextParameters?.["address"] || "No address provided";
    const userId = contextParameters?.["userId"] || "guest";
    console.log("User ID for order:", userId);
    // Generate a unique tracking number (e.g., using a timestamp and a random number)
    const trackingNumber = `TRK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    try {
        // Add the order to Firestore
        await db.collection("orders").add({
            item: foodItem,
            quantity: quantity,
            address: deliveryAddress,
            userId: userId,
            trackingNumber: trackingNumber, // Add the tracking number
            status: "Pending",
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        res.json({
            fulfillmentText: `Got it! Your order for ${quantity} ${foodItem}(s) will be delivered to ${deliveryAddress}.Your tracking number is ${trackingNumber}. Thank you!`
        });

    } catch (error) {
        console.error("Error placing order:", error);
        res.status(500).json({
            fulfillmentText: "Sorry, I couldn't place your order right now. Please try again later."
        });
    }
}

    else if (intentName === "Track Order") {
    res.json({
        fulfillmentText: "Sure! Please provide your order's tracking number.",
        outputContexts: [
            {
                name: `${session}/contexts/awaiting-tracking-id`,
                lifespanCount: 5
            }
        ]
    });
}

else if (intentName === "Confirm Track Order") {
    const trackingNumber = parameters["trackingNumber"] || req.body.queryResult.queryText.match(/TRK-\d+-\d+/)?.[0];

    if (!trackingNumber) {
        res.json({
            fulfillmentText: "I couldn't understand your tracking number. Please provide it again."
        });
        return;
    }

    try {
        // Fetch the order from Firestore using the tracking number
        const ordersSnapshot = await db.collection("orders")
            .where("trackingNumber", "==", trackingNumber)
            .get();

        if (!ordersSnapshot.empty) {
            const orderData = ordersSnapshot.docs[0].data();
            res.json({
                fulfillmentText: `Order Status: ${orderData.status}. Your order of ${orderData.quantity} ${orderData.item}(s) will be delivered to ${orderData.address}.`,
                outputContexts: [
                    {
                        name: `${req.body.session}/contexts/awaiting-tracking-id`,
                        lifespanCount: 0 // Clear the tracking context
                    }
                ]

            });
        } else {
            res.json({
                fulfillmentText: "Sorry, I couldn't find an order with that tracking number. Please try again.",
                outputContexts: [
                    {
                        name: `${req.body.session}/contexts/awaiting-tracking-id`,
                        lifespanCount: 5 // Keep waiting for a valid tracking ID
                    }
                ]

            });
        }
    } catch (error) {
        console.error("Error tracking order:", error);
        res.status(500).json({
            fulfillmentText: "There was an issue retrieving your order status. Please try again later."
        });
    }
}
    else {
        res.json({
            fulfillmentText: "I couldn't process your request. Please try again.",
            outputContexts: [
                {
                    name: `${req.body.session}/contexts/awaiting-tracking-id`,
                    lifespanCount: 0 // Ensure the context is cleared on error
                }
            ]
        });
    }
});
