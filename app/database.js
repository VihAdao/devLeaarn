// Importe as funções e instâncias diretamente do seu firebase.js
import { 
  auth, 
  db, 
  createUserWithEmailAndPassword, 
  ref, 
  set 
} from './firebase.js';

const userNome = document.getElementById('userNome');
const userEmail = document.getElementById('userEmail');
const userSenha = document.getElementById('userSenha');
const userConfSenha = document.getElementById('userConfSenha');
const addButon = document.getElementById('addButon');

addButon.addEventListener('click', async function(e) {
    e.preventDefault(); // Evita recarregar a página caso o botão esteja em um <form>

    console.log("Iniciando cadastro...");

    // 1. Validações básicas
    if (!userNome.value || !userEmail.value || !userSenha.value) {
        alert("Preencha todos os campos!");
        return;
    }

    if (userSenha.value !== userConfSenha.value) {
        alert("As senhas não coincidem!");
        return;
    }

    if (userSenha.value.length < 6) {
        alert("A senha deve ter pelo menos 6 caracteres!");
        return;
    }

    try {
        // 2. Criar o usuário no Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(
            auth, 
            userEmail.value, 
            userSenha.value
        );
        
        const user = userCredential.user;
        console.log("Usuário criado no Auth com UID:", user.uid);

        // 3. Salvar informações adicionais (Nome) no Realtime Database usando o UID
        // Caminho: usuarios/UID_DO_USUARIO
        await set(ref(db, 'usuarios/' + user.uid), {
            nome: userNome.value,
            email: userEmail.value,
            criadoEm: new Date().toISOString()
        });

        console.log("Dados salvos no Realtime Database com sucesso!");
        alert("Usuário cadastrado com sucesso!");
        window.location.href = "./login.html";

        // 4. Limpar os campos do formulário
        userNome.value = '';
        userEmail.value = '';
        userSenha.value = '';
        userConfSenha.value = '';

        // Opcional: Redirecionar para a página principal/login
        // window.location.href = "index.html";

    } catch (error) {
        console.error("Erro no cadastro:", error);

        // Tratamento de erros comuns do Firebase Auth
        switch (error.code) {
            case 'auth/email-already-in-use':
                alert("Este e-mail já está em uso por outra conta.");
                break;
            case 'auth/invalid-email':
                alert("O e-mail digitado é inválido.");
                break;
            case 'auth/weak-password':
                alert("A senha deve ter pelo menos 6 caracteres.");
                break;
            default:
                alert("Erro ao cadastrar: " + error.message);
        }
    }
});