import { 
  auth, 
  db, 
  onAuthStateChanged, 
  ref, 
  get, 
  child, 
  signOut 
} from './firebase.js'; // Caminho correto para arquivos dentro de app/

const boasVindas = document.getElementById('boasVindas');
const btnSair = document.getElementById('btnSair');

onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      const dbRef = ref(db);
      const snapshot = await get(child(dbRef, `usuarios/${user.uid}`));

      if (snapshot.exists()) {
        const userData = snapshot.val();
        boasVindas.textContent = `Olá, ${userData.nome || 'Usuário'}`;
      } else {
        boasVindas.textContent = 'Olá, Usuário';
      }
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
      boasVindas.textContent = 'Olá, Usuário';
    }
  } else {
    // Redireciona para o login se não houver usuário autenticado
    window.location.href = "./login.html";
  }
});

if (btnSair) {
  btnSair.addEventListener('click', (e) => {
    e.preventDefault();
    signOut(auth).then(() => {
      window.location.href = "./login.html";
    });
  });
}