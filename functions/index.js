const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

// Specify the region for your Cloud Function
exports.dialogflowWebhook = functions.https.onRequest(async (req, res) => {
  const intentName = req.body.queryResult.intent.displayName;

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
        fulfillmentText: `Here’s our menu:\n${menuItems}\nWhat would you like to order?`
      });
    } catch (error) {
      console.error("Error fetching menu:", error);
      res.status(500).json({
        fulfillmentText: "Sorry, I couldn't retrieve the menu at the moment. Please try again later."
      });
    }
  } else {
    res.json({
      fulfillmentText: "I couldn't process your request. Please try again."
    });
  }
});
