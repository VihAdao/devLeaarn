import {
    auth,
    db,
    ref,
    onValue,
    onAuthStateChanged
} from './firebase.js';

const containerCalendario = document.querySelector('#calendario-dias');
const tituloMes = document.querySelector('#titulo-mes');

const botaoAnterior = document.querySelector('#mes-anterior');
const botaoProximo = document.querySelector('#mes-proximo');
const botaoHoje = document.querySelector('#botao-hoje');

const resumoEventosMes = document.querySelector('#eventos-mes');
const resumoEventosHoje = document.querySelector('#eventos-hoje');
const resumoProximosPrazos = document.querySelector('#proximos-prazos');
const resumoConcluidos = document.querySelector('#eventos-concluidos');

let dataExibida = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
);

let bancoDeTarefas = [];

onAuthStateChanged(auth, (usuario) => {
    if (!usuario) {
        window.location.href = './login.html';
        return;
    }

    const tarefasRef = ref(db, `tarefas/${usuario.uid}`);

    onValue(tarefasRef, (snapshot) => {
        bancoDeTarefas = [];

        if (snapshot.exists()) {
            const dados = snapshot.val();

            Object.keys(dados).forEach((id) => {
                bancoDeTarefas.push({
                    id,
                    ...dados[id]
                });
            });
        }

        renderizarCalendario();
    });
});

function converterDataBR(dataString) {
    if (!dataString || dataString === 'Sem prazo') {
        return null;
    }

    const partes = dataString.split('/');

    if (partes.length !== 3) {
        return null;
    }

    const dia = Number(partes[0]);
    const mes = Number(partes[1]);
    const ano = Number(partes[2]);

    if (!dia || !mes || !ano) {
        return null;
    }

    return new Date(ano, mes - 1, dia);
}

function criarChaveData(data) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
}

function ehHoje(data) {
    const hoje = new Date();

    return (
        data.getDate() === hoje.getDate() &&
        data.getMonth() === hoje.getMonth() &&
        data.getFullYear() === hoje.getFullYear()
    );
}

function agruparTarefasPorData() {
    const tarefasPorData = new Map();

    bancoDeTarefas.forEach((tarefa) => {
        const dataTarefa = converterDataBR(tarefa.data);

        if (!dataTarefa) {
            return;
        }

        const chave = criarChaveData(dataTarefa);

        if (!tarefasPorData.has(chave)) {
            tarefasPorData.set(chave, []);
        }

        tarefasPorData.get(chave).push(tarefa);
    });

    return tarefasPorData;
}

function obterClasseEvento(tarefa) {
    if (tarefa.status === 'Concluída') {
        return 'event-green';
    }

    const classesPorPrioridade = {
        baixa: 'event-blue',
        media: 'event-yellow',
        alta: 'event-red'
    };

    return classesPorPrioridade[tarefa.prioridade] || 'event-blue';
}

function criarElementoEvento(tarefa) {
    const evento = document.createElement('div');

    evento.classList.add(
        'event',
        obterClasseEvento(tarefa)
    );

    evento.textContent = tarefa.titulo;
    evento.title = `${tarefa.titulo} — ${tarefa.status}`;

    evento.addEventListener('click', () => {
        window.location.href = './tarefas.html';
    });

    return evento;
}

function criarElementoDia(dataCelula, mesExibido, tarefasPorData) {
    const elementoDia = document.createElement('div');
    elementoDia.classList.add('day');

    if (dataCelula.getMonth() !== mesExibido) {
        elementoDia.classList.add('other-month');
    }

    if (ehHoje(dataCelula)) {
        elementoDia.classList.add('today');
    }

    const numeroDia = document.createElement('span');
    numeroDia.classList.add('day-number');
    numeroDia.textContent = dataCelula.getDate();

    elementoDia.appendChild(numeroDia);

    const chaveData = criarChaveData(dataCelula);
    const tarefasDoDia = tarefasPorData.get(chaveData) || [];

    tarefasDoDia.forEach((tarefa) => {
        const evento = criarElementoEvento(tarefa);
        elementoDia.appendChild(evento);
    });

    return elementoDia;
}

function atualizarTituloMes() {
    const formatador = new Intl.DateTimeFormat('pt-BR', {
        month: 'long',
        year: 'numeric'
    });

    let texto = formatador.format(dataExibida);

    texto = texto.charAt(0).toUpperCase() + texto.slice(1);

    tituloMes.textContent = texto;
}

function atualizarResumos() {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const anoExibido = dataExibida.getFullYear();
    const mesExibido = dataExibida.getMonth();

    const tarefasComData = bancoDeTarefas
        .map((tarefa) => ({
            ...tarefa,
            dataConvertida: converterDataBR(tarefa.data)
        }))
        .filter((tarefa) => tarefa.dataConvertida !== null);

    const tarefasDoMes = tarefasComData.filter((tarefa) => {
        return (
            tarefa.dataConvertida.getFullYear() === anoExibido &&
            tarefa.dataConvertida.getMonth() === mesExibido
        );
    });

    const tarefasHoje = tarefasComData.filter((tarefa) => {
        return ehHoje(tarefa.dataConvertida);
    });

    const proximosPrazos = tarefasComData.filter((tarefa) => {
        const dataTarefa = new Date(tarefa.dataConvertida);
        dataTarefa.setHours(0, 0, 0, 0);

        return (
            dataTarefa > hoje &&
            tarefa.status !== 'Concluída'
        );
    });

    const tarefasConcluidasNoMes = tarefasDoMes.filter((tarefa) => {
        return tarefa.status === 'Concluída';
    });

    resumoEventosMes.textContent = tarefasDoMes.length;
    resumoEventosHoje.textContent = tarefasHoje.length;
    resumoProximosPrazos.textContent = proximosPrazos.length;
    resumoConcluidos.textContent = tarefasConcluidasNoMes.length;
}

function renderizarCalendario() {
    containerCalendario.innerHTML = '';

    const ano = dataExibida.getFullYear();
    const mes = dataExibida.getMonth();

    atualizarTituloMes();
    atualizarResumos();

    const tarefasPorData = agruparTarefasPorData();
    const primeiroDiaSemana = new Date(ano, mes, 1).getDay();

    for (let indice = 0; indice < 42; indice++) {
        const numeroRelativo = 1 - primeiroDiaSemana + indice;
        const dataCelula = new Date(ano, mes, numeroRelativo);

        const elementoDia = criarElementoDia(
            dataCelula,
            mes,
            tarefasPorData
        );

        containerCalendario.appendChild(elementoDia);
    }
}

botaoAnterior.addEventListener('click', () => {
    dataExibida = new Date(
        dataExibida.getFullYear(),
        dataExibida.getMonth() - 1,
        1
    );

    renderizarCalendario();
});

botaoProximo.addEventListener('click', () => {
    dataExibida = new Date(
        dataExibida.getFullYear(),
        dataExibida.getMonth() + 1,
        1
    );

    renderizarCalendario();
});

botaoHoje.addEventListener('click', () => {
    const hoje = new Date();

    dataExibida = new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        1
    );

    renderizarCalendario();
});