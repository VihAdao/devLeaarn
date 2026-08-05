// Importa o auth e a função signInWithEmailAndPassword do seu firebase.js na raiz
import { auth, signInWithEmailAndPassword } from './firebase.js';

const logarForm = document.getElementById('logarForm');
const userEmail = document.getElementById('userEmail');
const userSenha = document.getElementById('userSenha');

logarForm.addEventListener('submit', async function(e) {
    // 1. Impede o recarregamento do formulário HTML
    e.preventDefault(); 

    // Validação básica dos campos
    if (!userEmail.value.trim() || !userSenha.value.trim()) {
        alert("Preencha todos os campos!");
        return;
    }

    try {
        // 2. Autentica no Firebase Auth
        const userCredential = await signInWithEmailAndPassword(
            auth, 
            userEmail.value, 
            userSenha.value
        );

        console.log("Login realizado com sucesso! UID:", userCredential.user.uid);
        alert("Login deu certo! O UID do usuário é: " + userCredential.user.uid);

        // 3. Redireciona para a página principal na raiz
        //window.location.href = "./principal.html";

    } catch (error) {
        console.error("Erro detalhado do Firebase:", error.code, error.message);
        
        // Trata os erros mais comuns do Firebase Auth
        switch (error.code) {
            case 'auth/invalid-credential':
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                alert("E-mail ou senha incorretos.");
                break;
            case 'auth/invalid-email':
                alert("Formato de e-mail inválido.");
                break;
            case 'auth/too-many-requests':
                alert("Muitas tentativas malsucedidas. Aguarde um instante.");
                break;
            default:
                alert("Erro ao realizar login: " + error.message);
        }
    }
});