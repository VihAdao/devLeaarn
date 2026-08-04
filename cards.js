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

// Função que formata a data lida pelo HTML no formato típico brasileiro de DD MM YYYY
function formatarDataBR(dataString) {
    if (!dataString) return "Sem prazo";
    const [ano, mes, dia] = dataString.split('-');
    return `${dia}/${mes}/${ano}`;
}

// Array que gerencia o estado do site
let bancoDeTarefas = [];

function atualizarResumos() {
    const total = bancoDeTarefas.length;
    const concluidas = bancoDeTarefas.filter(t => t.status === "Concluída").length;
    const pendentes = total - concluidas;

    // Atualiza os elementos;
    if (document.querySelector('#total-tarefas')) {
        document.querySelector('#total-tarefas').textContent = total;
        document.querySelector('#tarefas-pendentes').textContent = pendentes;
        document.querySelector('#tarefas-concluidas').textContent = concluidas;
    }
}

// Mapeamento do formulário
const formTarefa = document.querySelector('#form-tarefa');
const inputTarefa = document.querySelector('#input-tarefa');
const inputDescricao = document.querySelector('#descricao-tarefa');
const selectPrioridade = document.querySelector('#prioridade-tarefa');
const inputData = document.querySelector('#data-tarefa');
const containerCards = document.querySelector('#container-cards');

if(formTarefa) {
    containerCards.innerHTML = '';
    atualizarResumos();

    formTarefa.addEventListener('submit', (event) => {
        event.preventDefault();

        const tituloDigitado = inputTarefa.value.trim();
        const descricaoDigitada = inputDescricao.value.trim();
        const dataSelecionada = inputData ? inputData.value: "";
        const prioridadeSelecionada = selectPrioridade ? selectPrioridade.value : "baixa";


        if(tituloDigitado === "") {
            alert("⚠️ Digite o nome da tarefa!");
            return;
        }

        const tituloLimpo = sanitizarInput(tituloDigitado);
        const descricaoLimpa = sanitizarInput(descricaoDigitada)

        const novaTarefa = {
            id: Date.now().toString(),
            titulo: tituloLimpo,
            descricao: descricaoLimpa,
            prioridade: prioridadeSelecionada,
            data: formatarDataBR(dataSelecionada),
            status: "A Fazer"
        };

        bancoDeTarefas.push(novaTarefa);
        renderizarCardNaTela(novaTarefa);
        atualizarResumos();

        formTarefa.reset();
    });
}

// Gerador de cards dinâmico
function renderizarCardNaTela(tarefa) {
    const articleCard = document.createElement('article');
    articleCard.classList.add('card-tarefa', `urgencia-${tarefa.prioridade}`);
    articleCard.setAttribute('data-id', tarefa.id);

    // Cria um card com o mesmo HTML do padrão que o Malick fez;
    articleCard.innerHTML = `
    <div class="cabecalho-card">
            <h3 class="titulo-tarefa"></h3>
            <span class="badge-prioridade"></span>
        </div>
        <p class="descricao-card"></p>
        <div class="informacoes-card">
            <span class="prazo-tarefa"></span>
            <span class="status-tarefa">Pendente</span>
        </div>
        <div class="acoes-card">
            <button class="btn-concluir">Concluir</button>
            <button class="btn-editar">Editar</button>
            <button class="btn-deletar">Excluir</button>
        </div>
    `;

    // Proteção contra scripts no input.
    articleCard.querySelector('.titulo-tarefa').textContent = tarefa.titulo;
    articleCard.querySelector('.descricao-card').textContent = tarefa.descricao || "Sem descrição fornecida.";

    // Mapeamento dinâmico da prioridade
    const badge = articleCard.querySelector('.badge-prioridade');
    badge.classList.add(`prioridade-${tarefa.prioridade}`);
    const prioridadesTexto = { baixa: 'Baixa', media: 'Média', alta: 'Alta' };
    badge.textContent = prioridadesTexto[tarefa.prioridade];

    // Adiciona o texto de prazo já formatado
    articleCard.querySelector('.prazo-tarefa').textContent = `Prazo: ${tarefa.data}`;

    // Lógica do botão de concluir tarefa
    const botaoConcluir = articleCard.querySelector('.btn-concluir');
    const labelStatus = articleCard.querySelector('.status-tarefa');
    botaoConcluir.addEventListener('click', () => {
        if (tarefa.status === "A Fazer") {
            tarefa.status = "Concluída";
            articleCard.classList.add('card-concluido');
            labelStatus.textContent = "Concluída";
            labelStatus.classList.add('status-concluido');
            botaoConcluir.textContent = "Reabrir"; // Troca o texto do botão
        } else {
            tarefa.status = "A Fazer";
            articleCard.classList.remove('card-concluido'); // Desativa o estilo do CSS dele
            labelStatus.textContent = "Pendente";
            labelStatus.classList.remove('status-concluido');
            botaoConcluir.textContent = "Concluir"; // Volta o texto original do botão
        }
        atualizarResumos();
        console.log(`Tarefa ${tarefa.id} alterada para: ${tarefa.status}`);
    });

    // Botão de deletar tarefa
    const botaoDeletar = articleCard.querySelector('.btn-deletar');
    botaoDeletar.addEventListener('click', () => {
        articleCard.remove();
        bancoDeTarefas = bancoDeTarefas.filter(t => t.id !== tarefa.id);
        atualizarResumos();
        console.log(`Tarefa ${tarefa.id} removida localmente.`);
        // Firebase vai aq!!
    });

    // Botão de edição
    const botaoEditar = articleCard.querySelector('.btn-editar');
    botaoEditar.addEventListener('click', () => {
        const novoTitulo = prompt("Edite o título da tarefa:", tarefa.titulo);

        if(novoTitulo === null) return;

        
        if (novoTitulo.trim() === "") {
            alert("O título não pode ficar vazio!");
            return;
        }

        const novaDescricao = prompt("Edite a descrição da tarefa:", tarefa.descricao || "");

        if(novaDescricao === null) return;

        // Aplica as alterações e sanitiza os inputs só p ter certeza..
        tarefa.titulo = sanitizarInput(novoTitulo.trim());
        tarefa.descricao = sanitizarInput(novaDescricao.trim());

        // Atualiza os elementos visuais na tela
        articleCard.querySelector('.titulo-tarefa').textContent = tarefa.titulo;
        articleCard.querySelector('.descricao-card').textContent = tarefa.descricao || "Sem descrição fornecida.";

        
        console.log(`Tarefa ${tarefa.id} atualizada com sucesso!`);
        // O Firebase de atualizar o BD vem aq; 
    });

    // Coloca o card dentro do container da página.
    containerCards.appendChild(articleCard);
}