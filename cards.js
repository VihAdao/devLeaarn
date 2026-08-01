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

const formTarefa = document.querySelector('#form-tarefa') || document.querySelector('form');
const inputTarefa = document.querySelector('#input-tarefa') || document.querySelector('input[type="text"]');
const containerCards = document.querySelector('#container-cards') || document.body;

if(formTarefa) {
    formTarefa.addEventListener('submit', (event) => {
        event.preventDefault();

        const textoDigitado = inputTarefa.value.trim();

        const selectPrioridade = document.querySelector('#prioridade-tarefa');
        const prioridadeSelecionada = selectPrioridade ? selectPrioridade.value : "baixa";


        if(textoDigitado === "") {
            alert("⚠️ Digite o nome da tarefa!");
            return;
        }

        const textoLimpo = sanitizarInput(textoDigitado);

        const novaTarefa = {
            id: Date.now().toString(),
            titulo: textoLimpo,
            prioridade: prioridadeSelecionada,
            status: "A Fazer"
        };

        renderizarCardNaTela(novaTarefa);

        inputTarefa.value = "";
    });
}

function renderizarCardNaTela(tarefa) {
    const divCard = document.createElement('div');
    divCard.classList.add('card-tarefa');
    divCard.setAttribute('data-id', tarefa.id);

    let corPrioridade = "green";
    if (tarefa.prioridade === "media") corPrioridade = "orange";
    if (tarefa.prioridade === "alta") corPrioridade = "red";
    divCard.innerHTML = `
    <div class="conteudo-card">
        <span class="badge-prioridade"></span>
        <p class="titulo-tarefa"></p> 
    </div>
    <div class="acoes-card">
        <button class="btn-concluir">✅ Marcar como concluída</button>
        <button class="btn-deletar">🗑️ Apagar</button>
    </div>
    
    `;

    // Proteção contra scripts no input.
    divCard.querySelector('.titulo-tarefa').textContent = tarefa.titulo;
    divCard.querySelector('.badge-prioridade').textContent = tarefa.prioridade.toUpperCase();

    // Adiciona uma classe pra poder colorir a prioridade direto no CSS;
    divCard.classList.add(`urgencia-${tarefa.prioridade}`);


    const botaoConcluir = divCard.querySelector('.btn-concluir');
    botaoConcluir.addEventListener('click', () => {
        if (tarefa.status === "A Fazer") {
            tarefa.status = "Concluída";
            divCard.classList.add('card-concluido'); // Estilizar no CSS
            divCard.querySelector('.badge-prioridade').textContent = "CONCLUÍDA";
        } else {
            tarefa.status = "A Fazer";
            divCard.classList.remove('card-concluido');
            divCard.querySelector('.badge-prioridade').textContent = tarefa.prioridade.toUpperCase();
        }
        console.log(`Tarefa ${tarefa.id} alterada para: ${tarefa.status}`);
    });

    const botaoDeletar = divCard.querySelector('.btn-deletar');
    botaoDeletar.addEventListener('click', () => {
        divCard.remove();
        console.log(`Tarefa ${tarefa.id} removida localmente.`);
        // Firebase vai aq!!
    });

    // Coloca o card dentro do container da página.
    containerCards.appendChild(divCard);
}