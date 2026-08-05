import { db } from './firebase.js';
import { ref, push } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const userNome = document.getElementById('userNome');
const userEmail = document.getElementById('userEmail');
const userSenha = document.getElementById('userSenha');
const userConfSenha = document.getElementById('userConfSenha');
const addButon = document.getElementById('addButon');

addButon.addEventListener('click', function() {
    console.log("Iniciando envio para o Firebase...");

    if (!userNome.value || !userEmail.value || !userSenha.value) {
        alert("Preencha todos os campos!");
        return;
    }

    if (userSenha.value !== userConfSenha.value) {
        alert("As senhas não coincidem!");
        return;
    }

    const data = {
        nome: userNome.value,
        email: userEmail.value,
        senha: userSenha.value
    };

    const dbRef = ref(db, 'usuarios');

    push(dbRef, data)
        .then(() => {
            console.log("Sucesso! Dados salvos no Firebase.");
            alert("Usuário cadastrado com sucesso!");
            userNome.value = '';
            userEmail.value = '';
            userSenha.value = '';
            userConfSenha.value = '';
        })
        .catch((error) => {
            console.error("Erro retornado pelo Firebase:", error);
            alert("Erro ao cadastrar: " + error.message);
        });
});