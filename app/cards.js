import { 
    auth, 
    db, 
    ref, 
    push, 
    set, 
    get, 
    child, 
    update, 
    remove, 
    signOut, 
    onAuthStateChanged 
} from './firebase.js';

const paginaPrincipal = window.location.href.includes("principal.html");

// Função para sanitizar input contra XSS
function sanitizarInput(string) {
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

// Formatação para exibição
function formatarDataBR(dataString) {
    if (!dataString) return "Sem prazo";
    const [ano, mes, dia] = dataString.split('-');
    return `${dia}/${mes}/${ano}`;
}

let bancoDeTarefas = [];

//funcao que obtem a data de hoje
function obterDataHojeBR() { 
    const hoje = new Date();

    const dia = String(hoje.getDate()).padStart(2, '0');
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const ano = hoje.getFullYear();

    return `${dia}/${mes}/${ano}`;
}

function atualizarResumos() {
    const total = bancoDeTarefas.length;
    const concluidas = bancoDeTarefas.filter(t => t.status === "Concluída").length;
    const pendentes = total - concluidas;
    const dataHoje = obterDataHojeBR();
    const tarefasHoje = bancoDeTarefas.filter(tarefa => {
        return (
            tarefa.data === dataHoje &&
            tarefa.status !== "Concluída"
        );
    }).length;

    if (document.querySelector('#total-tarefas')) {
        document.querySelector('#total-tarefas').textContent = total;
        document.querySelector('#tarefas-pendentes').textContent = pendentes;
        document.querySelector('#tarefas-concluidas').textContent = concluidas;
        document.querySelector('#tarefas-hoje').textContent = tarefasHoje;

    }
}

// Elementos da DOM
const formTarefa = document.querySelector('#form-tarefa');
const inputTarefa = document.querySelector('#input-tarefa');
const inputDescricao = document.querySelector('#descricao-tarefa');
const selectPrioridade = document.querySelector('#prioridade-tarefa');
const inputData = document.querySelector('#data-tarefa');
const containerCards = document.querySelector('#container-cards');

// Monitora o estado da autenticação e carrega apenas as tarefas do usuário logado
onAuthStateChanged(auth, (usuario) => {
    if (usuario) {
        carregarTarefasDoUsuario(usuario.uid);
    } else {
        window.location.href = "landing-page.html";
    }
});

// Evento para deslogar
const btnSair = document.querySelector('#btn-sair');
if (btnSair) {
    btnSair.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            await signOut(auth);
            window.location.href = "landing-page.html";
        } catch (erro) {
            console.error("Erro ao fazer logout:", erro);
        }
    });
}

// Busca as tarefas salvas do nó do usuário no Realtime Database: tarefas/UID/
async function carregarTarefasDoUsuario(userId) {
    containerCards.innerHTML = '';
    bancoDeTarefas = [];

    try {
        const dbRef = ref(db);
        const snapshot = await get(child(dbRef, `tarefas/${userId}`));

        if (snapshot.exists()) {
            const dados = snapshot.val();
          
            //Busca a data de hoje para quando estiver na página principal
            const hoje = obterDataHojeBR();
            // Converte o objeto de IDs em Array
            Object.keys(dados).forEach((key) => {
                
                const tarefa = { id: key, ...dados[key] };

                bancoDeTarefas.push(tarefa);

                //Página inicial: mostra apenas as tarefas do dia de hoje 
                if (paginaPrincipal) {
                    if( tarefa.data == hoje && tarefa.status !== "Concluída") {
                        renderizarCardNaTela(tarefa);
                    }
                }

                //Se não estiver na página inical 
                else {
                    renderizarCardNaTela(tarefa);
                }
                               
            });
        }

        atualizarResumos();
    } catch (erro) {
        console.error("Erro ao carregar tarefas do Firebase:", erro);
    }
}

// Listener de cadastro no Firebase Realtime Database
if (formTarefa) {
    formTarefa.addEventListener('submit', async (event) => {
        event.preventDefault();

        const usuarioAtual = auth.currentUser;
        if (!usuarioAtual) {
            alert("Você precisa estar logado para cadastrar uma tarefa!");
            return;
        }

        const tituloDigitado = inputTarefa.value.trim();
        const descricaoDigitada = inputDescricao.value.trim();
        const dataSelecionada = inputData ? inputData.value : "";
        const prioridadeSelecionada = selectPrioridade ? selectPrioridade.value : "baixa";

        if (tituloDigitado === "") {
            alert("⚠️ Digite o nome da tarefa!");
            return;
        }

        const novaTarefa = {
            titulo: sanitizarInput(tituloDigitado),
            descricao: sanitizarInput(descricaoDigitada),
            prioridade: prioridadeSelecionada,
            data: formatarDataBR(dataSelecionada),
            status: "A Fazer",
            criadoEm: Date.now()
        };

        try {
            // Gera uma chave única no nó 'tarefas/userId'
            const userTarefasRef = ref(db, `tarefas/${usuarioAtual.uid}`);
            const novaTarefaRef = push(userTarefasRef);
            
            await set(novaTarefaRef, novaTarefa);

            const tarefaComID = { id: novaTarefaRef.key, ...novaTarefa };
            bancoDeTarefas.push(tarefaComID);

            renderizarCardNaTela(tarefaComID);
            atualizarResumos();

            formTarefa.reset();
        } catch (erro) {
            console.error("Erro ao salvar tarefa no Firebase:", erro);
        }
    });
}

// Renderiza e associa os eventos do CRUD
function renderizarCardNaTela(tarefa) {
    const articleCard = document.createElement('article');
    articleCard.classList.add('card-tarefa', `urgencia-${tarefa.prioridade}`);
    if (tarefa.status === "Concluída") articleCard.classList.add('card-concluido');
    articleCard.setAttribute('data-id', tarefa.id);

    articleCard.innerHTML = `
        <div class="cabecalho-card">
            <h3 class="titulo-tarefa"></h3>
            <span class="badge-prioridade"></span>
        </div>
        <p class="descricao-card"></p>
        <div class="informacoes-card">
            <span class="prazo-tarefa"></span>
            <span class="status-tarefa ${tarefa.status === 'Concluída' ? 'status-concluido' : ''}">${tarefa.status === 'Concluída' ? 'Concluída' : 'Pendente'}</span>
        </div>
        <div class="acoes-card">
            <button class="btn-concluir">${tarefa.status === 'Concluída' ? 'Reabrir' : 'Concluir'}</button>
            <button class="btn-editar">Editar</button>
            <button class="btn-deletar">Excluir</button>
        </div>
    `;

    articleCard.querySelector('.titulo-tarefa').textContent = tarefa.titulo;
    articleCard.querySelector('.descricao-card').textContent = tarefa.descricao || "Sem descrição fornecida.";

    const badge = articleCard.querySelector('.badge-prioridade');
    badge.classList.add(`prioridade-${tarefa.prioridade}`);
    const prioridadesTexto = { baixa: 'Baixa', media: 'Média', alta: 'Alta' };
    badge.textContent = prioridadesTexto[tarefa.prioridade] || 'Baixa';

    articleCard.querySelector('.prazo-tarefa').textContent = `Prazo: ${tarefa.data}`;

    // Atualização de Status (Concluir / Reabrir)
    const botaoConcluir = articleCard.querySelector('.btn-concluir');
    const labelStatus = articleCard.querySelector('.status-tarefa');

    botaoConcluir.addEventListener('click', async () => {
        const usuarioAtual = auth.currentUser;
        if (!usuarioAtual) return;

        const novoStatus = tarefa.status === "A Fazer" ? "Concluída" : "A Fazer";

        try {
            const tarefaRef = ref(db, `tarefas/${usuarioAtual.uid}/${tarefa.id}`);
            await update(tarefaRef, { status: novoStatus });

            tarefa.status = novoStatus;

            if (novoStatus === "Concluída") {
                articleCard.classList.add('card-concluido');
                labelStatus.textContent = "Concluída";
                labelStatus.classList.add('status-concluido');
                botaoConcluir.textContent = "Reabrir";
            } else {
                articleCard.classList.remove('card-concluido');
                labelStatus.textContent = "Pendente";
                labelStatus.classList.remove('status-concluido');
                botaoConcluir.textContent = "Concluir";
            }

            atualizarResumos();
        } catch (erro) {
            console.error("Erro ao atualizar status:", erro);
        }
    });

    // Exclusão de documento
    const botaoDeletar = articleCard.querySelector('.btn-deletar');
    botaoDeletar.addEventListener('click', async () => {
        const usuarioAtual = auth.currentUser;
        if (!usuarioAtual) return;

        try {
            const tarefaRef = ref(db, `tarefas/${usuarioAtual.uid}/${tarefa.id}`);
            await remove(tarefaRef);

            articleCard.remove();
            bancoDeTarefas = bancoDeTarefas.filter(t => t.id !== tarefa.id);
            atualizarResumos();
        } catch (erro) {
            console.error("Erro ao deletar tarefa:", erro);
        }
    });

    // Edição no Realtime Database
    const botaoEditar = articleCard.querySelector('.btn-editar');
    botaoEditar.addEventListener('click', async () => {
        const usuarioAtual = auth.currentUser;
        if (!usuarioAtual) return;

        const novoTitulo = prompt("Edite o título da tarefa:", tarefa.titulo);
        if (novoTitulo === null || novoTitulo.trim() === "") return;

        const novaDescricao = prompt("Edite a descrição da tarefa:", tarefa.descricao || "");
        if (novaDescricao === null) return;

        const tituloSanitizado = sanitizarInput(novoTitulo.trim());
        const descricaoSanitizada = sanitizarInput(novaDescricao.trim());

        try {
            const tarefaRef = ref(db, `tarefas/${usuarioAtual.uid}/${tarefa.id}`);
            await update(tarefaRef, {
                titulo: tituloSanitizado,
                descricao: descricaoSanitizada
            });

            tarefa.titulo = tituloSanitizado;
            tarefa.descricao = descricaoSanitizada;

            articleCard.querySelector('.titulo-tarefa').textContent = tarefa.titulo;
            articleCard.querySelector('.descricao-card').textContent = tarefa.descricao || "Sem descrição fornecida.";
        } catch (erro) {
            console.error("Erro ao atualizar dados no Firebase:", erro);
        }
    });

    containerCards.appendChild(articleCard);
}