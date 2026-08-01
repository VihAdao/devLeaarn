// Função que sanitiza o input pra eliminar algumas vulnerabilidades de segurança, não é necessário pro CodeLab mas achei interessante de colocar.
function sanitizarInput(string){
  const mapaCaracteres = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };

  return string.replace(/[&<>"'/]/g, (caractere) => mapaCaracteres[caractere]);
}

const formCadastro = document.querySelector('form');

if(formCadastro && document.querySelector('#userNome')) {
  const inputNome = document.querySelector('#userNome');
  const inputEmail = document.querySelector('#userEmail');
  const inputSenha = document.querySelector('#userSenha');
  const inputConfSenha = document.querySelector('#userConfSenha');

  formCadastro.addEventListener('submit', (event) => {
    event.preventDefault();

    const nomeProtegido = sanitizarInput(inputNome.value.trim());
    const emailProtegido = sanitizarInput(inputEmail.value.trim().toLowerCase());
    const senhaLimpa = inputSenha.value;
    const confSenhaLimpa = inputConfSenha.value;

    if(nomeProtegido === "" || emailProtegido === "" || senhaLimpa === "") {
      alert("⚠️ Por favor, preencha todos os campos!");
      return;
    }

    if(senhaLimpa !== confSenhaLimpa) {
      alert("⚠️ As senhas não coincidem!");
      inputConfSenha.value = "";
      inputConfSenha.focus();
      return;
    }

    if (senhaLimpa.length < 6) {
      alert("⚠️ Por segurança, sua senha deve ter pelo menos 6 caracteres.");
      return;
    }

    // Exibe no console se tudo tiver certo;
    console.log("Dados sanitizados e validados com sucesso!");
    console.log("Nome:", nomeProtegido);
    console.log("Email:", emailProtegido);

    alert("Cadastro realizado com sucesso!");
    window.location.href = "login.html"; 

  })
}