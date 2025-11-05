// ===================================
// Dashboard Administrativo
// ===================================

// Proteger página (apenas admin)
protegerPagina('admin');

// Carregar dados ao iniciar
document.addEventListener('DOMContentLoaded', function() {
    const sessao = getSessao();
    document.getElementById('nomeUsuario').textContent = sessao.nome;
    
    carregarEstatisticas();
    carregarAcessos();
    carregarVoluntarios();
    carregarProjetos();
    
    // Busca de voluntários
    document.getElementById('searchVoluntarios').addEventListener('input', function(e) {
        filtrarVoluntarios(e.target.value);
    });
});

// Trocar tabs
function switchTab(tabName) {
    // Remover active de todos os botões e conteúdos
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Adicionar active ao selecionado
    event.target.classList.add('active');
    document.getElementById('tab-' + tabName).classList.add('active');
}

// Carregar estatísticas
function carregarEstatisticas() {
    const stats = getEstatisticas();
    
    document.getElementById('statVoluntarios').textContent = stats.totalVoluntarios;
    document.getElementById('statProjetos').textContent = stats.projetosAtivos;
    document.getElementById('statBeneficiados').textContent = stats.totalBeneficiados.toLocaleString('pt-BR');
    document.getElementById('statArrecadado').textContent = formatarMoeda(stats.totalArrecadado);
}

// Carregar acessos
function carregarAcessos() {
    const acessos = getAcessosRecentes(20);
    const tbody = document.querySelector('#tabelaAcessos tbody');
    
    tbody.innerHTML = '';
    
    acessos.forEach(acesso => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatarDataHora(acesso.dataHora)}</td>
            <td>${acesso.usuarioNome}</td>
            <td><span class="badge ${acesso.tipo}">${acesso.tipo}</span></td>
            <td>${acesso.acao}</td>
            <td>${acesso.navegador}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Carregar voluntários
function carregarVoluntarios() {
    const voluntarios = getVoluntarios();
    renderizarVoluntarios(voluntarios);
}

function renderizarVoluntarios(voluntarios) {
    const tbody = document.querySelector('#tabelaVoluntarios tbody');
    tbody.innerHTML = '';
    
    voluntarios.forEach(vol => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${vol.id}</td>
            <td>${vol.nome}</td>
            <td>${vol.email}</td>
            <td>${vol.telefone || '-'}</td>
            <td>${vol.interesse || '-'}</td>
            <td>${vol.horasVoluntariado || 0}h</td>
            <td><span class="badge ${vol.ativo ? 'ativo' : 'inativo'}">${vol.ativo ? 'Ativo' : 'Inativo'}</span></td>
            <td>
                <div class="action-buttons">
                    <button onclick="editarVoluntario(${vol.id})" class="btn btn-small btn-edit">Editar</button>
                    <button onclick="confirmarExclusaoVoluntario(${vol.id}, '${vol.nome}')" class="btn btn-small btn-delete">Excluir</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function filtrarVoluntarios(termo) {
    const voluntarios = getVoluntarios();
    const termoLower = termo.toLowerCase();
    
    const filtrados = voluntarios.filter(vol => 
        vol.nome.toLowerCase().includes(termoLower) ||
        vol.email.toLowerCase().includes(termoLower) ||
        (vol.cpf && vol.cpf.includes(termo))
    );
    
    renderizarVoluntarios(filtrados);
}

// Editar voluntário
function editarVoluntario(id) {
    const voluntario = getUsuarioById(id);
    
    if (!voluntario) {
        alert('Voluntário não encontrado');
        return;
    }
    
    document.getElementById('edit_id').value = voluntario.id;
    document.getElementById('edit_nome').value = voluntario.nome;
    document.getElementById('edit_email').value = voluntario.email;
    document.getElementById('edit_telefone').value = voluntario.telefone || '';
    document.getElementById('edit_horasVoluntariado').value = voluntario.horasVoluntariado || 0;
    document.getElementById('edit_ativo').value = voluntario.ativo.toString();
    
    abrirModal('modalEditarVoluntario');
}

// Salvar edição de voluntário
document.getElementById('formEditarVoluntario').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const id = document.getElementById('edit_id').value;
    const dadosAtualizados = {
        nome: document.getElementById('edit_nome').value,
        email: document.getElementById('edit_email').value,
        telefone: document.getElementById('edit_telefone').value,
        horasVoluntariado: parseInt(document.getElementById('edit_horasVoluntariado').value) || 0,
        ativo: document.getElementById('edit_ativo').value === 'true'
    };
    
    const resultado = updateUsuario(id, dadosAtualizados);
    
    if (resultado.success) {
        alert('Voluntário atualizado com sucesso!');
        fecharModal('modalEditarVoluntario');
        carregarVoluntarios();
        carregarEstatisticas();
    } else {
        alert('Erro ao atualizar voluntário: ' + resultado.message);
    }
});

// Confirmar exclusão de voluntário
function confirmarExclusaoVoluntario(id, nome) {
    if (confirm(`Tem certeza que deseja excluir o voluntário "${nome}"?\n\nEsta ação não pode ser desfeita.`)) {
        const resultado = deleteUsuario(id);
        
        if (resultado.success) {
            alert('Voluntário excluído com sucesso!');
            carregarVoluntarios();
            carregarEstatisticas();
        } else {
            alert('Erro ao excluir voluntário: ' + resultado.message);
        }
    }
}

// Carregar projetos
function carregarProjetos() {
    const projetos = getProjetos();
    const tbody = document.querySelector('#tabelaProjetos tbody');
    
    tbody.innerHTML = '';
    
    projetos.forEach(proj => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${proj.id}</td>
            <td>${proj.titulo}</td>
            <td>${proj.categoria}</td>
            <td>${proj.responsavel || '-'}</td>
            <td>${proj.voluntarios || 0}</td>
            <td>${proj.beneficiados || 0}</td>
            <td><span class="badge ${proj.status === 'ativo' ? 'ativo' : 'inativo'}">${proj.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button onclick="verDetalhesProjeto(${proj.id})" class="btn btn-small">Ver</button>
                    <button onclick="confirmarExclusaoProjeto(${proj.id}, '${proj.titulo}')" class="btn btn-small btn-delete">Excluir</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Abrir modal novo projeto
function abrirModalNovoProjeto() {
    document.getElementById('formNovoProjeto').reset();
    abrirModal('modalNovoProjeto');
}

// Criar novo projeto
document.getElementById('formNovoProjeto').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const novoProjeto = {
        titulo: document.getElementById('novo_titulo').value,
        categoria: document.getElementById('novo_categoria').value,
        descricao: document.getElementById('novo_descricao').value,
        responsavel: document.getElementById('novo_responsavel').value,
        dataInicio: document.getElementById('novo_dataInicio').value || new Date().toISOString().split('T')[0],
        metaFinanceira: parseFloat(document.getElementById('novo_metaFinanceira').value) || 0,
        beneficiados: parseInt(document.getElementById('novo_beneficiados').value) || 0,
        arrecadado: 0,
        voluntarios: 0,
        status: 'ativo',
        impacto: 'Projeto em andamento'
    };
    
    const resultado = createProjeto(novoProjeto);
    
    if (resultado.success) {
        alert('Projeto criado com sucesso!');
        fecharModal('modalNovoProjeto');
        carregarProjetos();
        carregarEstatisticas();
    } else {
        alert('Erro ao criar projeto: ' + resultado.message);
    }
});

// Ver detalhes do projeto
function verDetalhesProjeto(id) {
    const projeto = getProjetoById(id);
    
    if (!projeto) {
        alert('Projeto não encontrado');
        return;
    }
    
    const percentual = projeto.metaFinanceira > 0 
        ? ((projeto.arrecadado / projeto.metaFinanceira) * 100).toFixed(1) 
        : 0;
    
    const detalhes = `
DETALHES DO PROJETO

Título: ${projeto.titulo}
Categoria: ${projeto.categoria}
Status: ${projeto.status}

Descrição:
${projeto.descricao}

Responsável: ${projeto.responsavel || 'Não definido'}
Data de Início: ${formatarData(projeto.dataInicio)}
Data de Fim: ${projeto.dataFim ? formatarData(projeto.dataFim) : 'Em andamento'}

Números:
- Voluntários: ${projeto.voluntarios || 0}
- Beneficiados: ${projeto.beneficiados || 0}
- Meta Financeira: ${formatarMoeda(projeto.metaFinanceira || 0)}
- Arrecadado: ${formatarMoeda(projeto.arrecadado || 0)} (${percentual}%)

Impacto:
${projeto.impacto || 'Não informado'}
    `;
    
    alert(detalhes);
}

// Confirmar exclusão de projeto
function confirmarExclusaoProjeto(id, titulo) {
    if (confirm(`Tem certeza que deseja excluir o projeto "${titulo}"?\n\nEsta ação não pode ser desfeita.`)) {
        const resultado = deleteProjeto(id);
        
        if (resultado.success) {
            alert('Projeto excluído com sucesso!');
            carregarProjetos();
            carregarEstatisticas();
        } else {
            alert('Erro ao excluir projeto: ' + resultado.message);
        }
    }
}

// Funções de modal
function abrirModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function fecharModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Fechar modal ao clicar fora
window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

