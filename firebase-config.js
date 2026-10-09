// Paste your Firebase web app config here (Firebase console → Project settings →
// General → Your apps → Web app → "SDK setup and configuration" → Config).
// These values are not secret: anyone can see them in the page source. What keeps
// the board private is the email allowlist in firestore.rules.
//
// While apiKey still starts with "PASTE", the page runs in demo mode: no sign-in,
// and the board state lives only in this browser.
export const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:0000000000000000",
};
