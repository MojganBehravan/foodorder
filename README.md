# Food Ordering System with Chatbot Integration

This project is a chatbot-powered food ordering web application built using Firebase, Dialogflow, and Node.js. The system allows users to browse a menu, place food orders through natural language, and administrators to manage items through an admin panel.

---

## 🚀 Features

- Chatbot interface (powered by Dialogflow)
- Role-based admin panel for menu management
- Firebase Firestore for storing menu and order data
- Firebase Cloud Functions for backend logic
- Docker support for local or containerized deployment
- Firebase Emulator for local development and testing

---

## 🛠️ Technologies Used

- **Frontend**: HTML, CSS, JavaScript (in `public/`)
- **Backend**: Firebase Functions (Node.js)
- **Database**: Firebase Firestore (NoSQL)
- **Authentication**: Firebase Auth (optional)
- **Chatbot**: Dialogflow CX/ES webhook integration
- **Deployment**: Firebase Hosting & Docker

---

## 📦 Folder Structure

- `/public` – Frontend static site
- `/functions` – Cloud Function backend code
- `/Dockerfile` – Used for local container setup
- `/firebase.json` – Firebase configuration(For security reasons, the Firebase configuration is not uploaded to GitHub.)
- `/requirements.txt` – Python requirements (for tools or scripts, optional)

---

   
## 🔧 Setup Instructions

### ✅ Prerequisites

- Node.js and npm
- Firebase CLI (`npm install -g firebase-tools`)
- (Optional) Docker

---

### ▶️ Run Locally with Firebase Emulator

1. Install dependencies inside `functions`:
   ```bash
   cd functions
   npm install
   ```

2. Start local emulators:
   ```bash
   firebase emulators:start 
   ```

3. Access:
   - Frontend: http://localhost:5000
   - Functions: http://localhost:5001
   - Emulator UI: http://localhost:4000

---

### 🐳 Run with Docker

1. Build the image:
   ```bash
   docker build -t foodorder-bot .
   ```

2. Run the container:
   ```bash
   docker run -p 5000:5000 -p 5001:5001 foodorder-bot
   ```

---
### ▶️ Run with Docker Compose

You can use Docker Compose to run the Firebase emulator with hosting and functions:

1. Make sure Docker is installed.
2. From the project root, run:

```bash
docker-compose up
 ```
---

## 🤖 Dialogflow Setup

1. Create or import intents like:
   - `Select Food`
   - `Provide Address`
   - `Confirm Order`

2. Enable webhook fulfillment and point it to:

```
https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/dialogflowWebhook
```

> Deploy functions using:
> ```bash
> firebase deploy --only functions
> ```

---

## 📬 Sample Order Flow

1. User: "I want 2 Kebabs"
2. Bot: "Please provide your delivery address."
3. User: "123 Main Street"
4. Bot: "Should I confirm this order for 2 kebabs to 123 Main Street?"

---

## 📄 License

This project was created as part of a university software engineering course and is intended for educational use.

