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

const formLogin = document.querySelector('form');

if (formLogin) {
    const inputEmail = document.querySelector('#userEmail') || document.querySelector('input[type="email"]');
    const inputSenha = document.querySelector('#userSenha') || document.querySelector('input[type="password"]');

    formLogin.addEventListener('submit', (event) => {
        event.preventDefault();

        const emailLimpo = inputEmail.value.trim().toLowerCase();
        const senhaLimpa = inputSenha.value;

        if (emailLimpo === "" || senhaLimpa === "") {
            alert("⚠️ Preencha o e-mail e a senha!");
            return;
        }

        console.log("Login pronto para o Firebase:", emailLimpo);

        // alert("Login realizado com sucesso! Redirecionando...");
        // window.location.href = "cards.html";


    });
}
