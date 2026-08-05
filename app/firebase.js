// Importações via CDN oficial da Google
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

// Importações de Autenticação
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Importações do Realtime Database
import { 
  getDatabase, 
  ref, 
  push, 
  set, 
  onValue, 
  remove, 
  update,
  get,
  child
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

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

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Instâncias dos serviços
export const db = getDatabase(app);
export const auth = getAuth(app);

// Exporta funções do Auth para usar nos outros arquivos
export { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
};

// Exporta funções do Database para usar nos outros arquivos
export { 
  ref, 
  push, 
  set, 
  onValue, 
  remove, 
  update,
  get,
  child 
};