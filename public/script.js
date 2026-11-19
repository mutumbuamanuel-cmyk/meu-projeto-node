document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskTableBody = document.getElementById('task-table-body');

    // Função para obter o ícone correto de acordo com os ficheiros estado-red, estado-yellow e estado-verde
    function obterIconeEstado(estado) {
        switch (estado) {
            case 'Concluído':
                return '<img src="img/estado-verde.png" alt="Concluído" title="Concluído" style="width: 28px; height: 28px; vertical-align: middle;">';
            case 'Em Andamento':
                return '<img src="img/estado-yellow.png" alt="Em Andamento" title="Em Andamento" style="width: 28px; height: 28px; vertical-align: middle;">';
            case 'Pendente':
            default:
                return '<img src="img/estado-red.png" alt="Pendente" title="Pendente" style="width: 28px; height: 28px; vertical-align: middle;">';
        }
    }

    // Função para carregar e listar as tarefas do SQLite
    async function carregarTarefas() {
        try {
            const response = await fetch('/api/tasks');
            const tarefas = await response.json();

            taskTableBody.innerHTML = '';

            if (tarefas.length === 0) {
                taskTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #64748b;">Nenhuma tarefa registada ainda.</td></tr>`;
                return;
            }

            tarefas.forEach(tarefa => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="text-align: center;">${obterIconeEstado(tarefa.estado)}</td>
                    <td><strong>${tarefa.titulo}</strong></td>
                    <td>${tarefa.descricao || ''}</td>
                    <td>${tarefa.data}</td>
                    <td><button class="btn-excluir" onclick="excluirTarefa(${tarefa.id})">Excluir</button></td>
                `;
                taskTableBody.appendChild(tr);
            });
        } catch (error) {
            console.error('Erro ao carregar tarefas:', error);
        }
    }

    // Evento para submeter o formulário de nova tarefa
    if (taskForm) {
        taskForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const novaTarefa = {
                titulo: document.getElementById('titulo').value,
                descricao: document.getElementById('descricao').value,
                data: document.getElementById('data').value,
                estado: document.getElementById('estado').value
            };

            try {
                const response = await fetch('/api/tasks', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(novaTarefa)
                });

                if (response.ok) {
                    taskForm.reset();
                    carregarTarefas();
                } else {
                    alert('Erro ao guardar a tarefa.');
                }
            } catch (error) {
                console.error('Erro ao enviar tarefa:', error);
            }
        });
    }

    // Carregar as tarefas assim que a página abrir
    carregarTarefas();
});

// Função global para excluir tarefa por id
async function excluirTarefa(id) {
    if (!confirm('Tens a certeza que pretendes excluir esta tarefa?')) return;

    try {
        const response = await fetch(`/api/tasks/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            location.reload();
        } else {
            alert('Erro ao excluir a tarefa.');
        }
    } catch (error) {
        console.error('Erro ao excluir tarefa:', error);
    }
}
