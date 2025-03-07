import functions from "firebase-functions";
import admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

// Specify the region for your Cloud Function
export const dialogflowWebhook = functions.https.onRequest(async (req, res) => {
    const intentName = req.body.queryResult.intent.displayName;
    const parameters = req.body.queryResult.parameters;
    const session = req.body.session;

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
                    lifespanCount: 5
                }
            ]
        });
    }
    else if (intentName === "Provide Address") {
    const deliveryAddress = parameters["address"] || "No address provided";
    const userId = req.body.originalDetectIntentRequest?.payload?.user?.uid || "guest";

    res.json({
        fulfillmentText: `You've entered: ${deliveryAddress}. Should I confirm the order?`,
        outputContexts: [
            {
                name: `${req.body.session}/contexts/awaiting-confirmation`,
                lifespanCount: 5,
                parameters: {
                    address: deliveryAddress,
                    foodItem: req.body.queryResult.outputContexts[0]?.parameters["foodItem"],
                    quantity: req.body.queryResult.outputContexts[0]?.parameters["quantity"] || 1,
                    userId: userId
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
            fulfillmentText: "I can help you track your order. Please provide your order ID."
        });
    }
    else {
        res.json({
            fulfillmentText: "I couldn't process your request. Please try again."
        });
    }
});
