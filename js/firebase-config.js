/* =========================================================
   Firebase-Konfiguration
   Diese Werte bekommst du in der Firebase-Konsole unter
   Projekteinstellungen → Allgemein → Deine Apps → Web-App.
   Sie dürfen öffentlich auf GitHub stehen – geschützt werden
   die Daten durch die Security Rules (siehe firestore.rules).
   ========================================================= */

export const firebaseConfig = {
  apiKey: "AIzaSyCuB1OMx3odg82CIdV_A0NFEMxNCiabFoQ",
  authDomain: "mischa-therapie.firebaseapp.com",
  projectId: "mischa-therapie",
  storageBucket: "mischa-therapie.firebasestorage.app",
  messagingSenderId: "921453932574",
  appId: "1:921453932574:web:6614d5bb00d8b46288fe0f"
};

// Nutzer-UID von Person 1 (Schrift grün). Jedes andere Konto ist Person 2 (Schrift rot).
// UID: Firebase-Konsole → Authentication → Nutzer.
export const person1Uid = "sO549tngtSOJ38gGrNi5qPI00fA2";
