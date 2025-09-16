const firebaseConfig = {
  apiKey: "AIzaSyCA6_evBe_QmNZN3GCLpQos1ri9w3NGrA4",          // ← keep as-is if this matches your console
  authDomain: "fworld-78baf.firebaseapp.com",
  projectId: "fworld-78baf",
  storageBucket: "fworld-78baf.appspot.com",
  messagingSenderId: "813839307001",
  appId: "1:813839307001:web:REPLACE_WITH_YOUR_WEB_APP_ID",   // ← MUST be ':web:' not ':android:'
  // measurementId: "G-XXXXXXXXXX"                             // (optional) if shown in your console
};

// --- Safety check: warn if someone accidentally pasted an Android appId ---
if (firebaseConfig.appId && firebaseConfig.appId.includes(':android:')) {
  console.error('❌ You used an Android appId in web config. Create a Web app in Firebase Console and use its config (appId must include :web:).');
  // Show a visible message if login.html has the error element:
  const el = document.getElementById('error-msg');
  if (el) el.textContent = 'Incorrect Firebase appId for web. Please paste the Web app config from Firebase Console (appId must include :web:).';
}

// Initialize Firebase (v8)
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Authentication and Firestore
window.auth = firebase.auth();
window.db = firebase.firestore();

console.log('🔥 Firebase initialized with Web app config');