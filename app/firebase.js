// Importações via CDN oficial da Google
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyA67X_XXTlmAviBd1zuq6g7OD-1sbfJYdQ",
  authDomain: "bddlab.firebaseapp.com",
  databaseURL: "https://bddlab-default-rtdb.firebaseio.com",
  projectId: "bddlab",
  storageBucket: "bddlab.firebasestorage.app",
  messagingSenderId: "624325085266",
  appId: "1:624325085266:web:992b51f613a5b9fa81f78b",
  measurementId: "G-W3SMT448EE"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);