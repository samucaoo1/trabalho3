// ===================================
// API Simulada para CRUD de Dados
// ===================================

// Inicializar projetos
function initializeProjetos() {
    if (!localStorage.getItem('projetos')) {
        const projetos = [
            {
                id: 1,
                titulo: "C para Todos",
                categoria: "Educação",
                descricao: "Curso gratuito de programação em C para iniciantes, com foco em comunidades de baixa renda.",
                status: "ativo",
                dataInicio: "2024-01-15",
                dataFim: null,
                responsavel: "João Pedro Oliveira",
                voluntarios: 15,
                beneficiados: 2000,
                metaFinanceira: 50000,
                arrecadado: 42000,
                impacto: "85% dos formados conseguiram emprego na área de TI"
            },
            {
                id: 2,
                titulo: "Bootcamp Avançado",
                categoria: "Capacitação Profissional",
                descricao: "Programa intensivo de 12 semanas focado em sistemas embarcados, drivers e programação de baixo nível.",
                status: "ativo",
                dataInicio: "2024-03-01",
                dataFim: null,
                responsavel: "Ana Carolina Ferreira",
                voluntarios: 8,
                beneficiados: 150,
                metaFinanceira: 80000,
                arrecadado: 75000,
                impacto: "150 profissionais formados em 2024"
            },
            {
                id: 3,
                titulo: "C nas Escolas",
                categoria: "Educação Básica",
                descricao: "Parceria com escolas públicas para introduzir programação no ensino médio.",
                status: "ativo",
                dataInicio: "2024-02-10",
                dataFim: null,
                responsavel: "Carlos Eduardo Lima",
                voluntarios: 25,
                beneficiados: 1500,
                metaFinanceira: 120000,
                arrecadado: 95000,
                impacto: "30 escolas atendidas, 1.500 estudantes"
            },
            {
                id: 4,
                titulo: "Laboratórios Comunitários",
                categoria: "Infraestrutura",
                descricao: "Criação de espaços equipados com computadores e internet em comunidades carentes.",
                status: "ativo",
                dataInicio: "2024-04-05",
                dataFim: null,
                responsavel: "Beatriz Souza Costa",
                voluntarios: 12,
                beneficiados: 800,
                metaFinanceira: 200000,
                arrecadado: 150000,
                impacto: "8 laboratórios ativos em 5 estados"
            },
            {
                id: 5,
                titulo: "Biblioteca Digital C",
                categoria: "Preservação de Conhecimento",
                descricao: "Digitalização e disponibilização gratuita de livros clássicos sobre C e documentação histórica.",
                status: "ativo",
                dataInicio: "2024-01-20",
                dataFim: null,
                responsavel: "Rafael Almeida Santos",
                voluntarios: 6,
                beneficiados: 5000,
                metaFinanceira: 30000,
                arrecadado: 28000,
                impacto: "Mais de 500 recursos disponíveis"
            }
        ];
        
        localStorage.setItem('projetos', JSON.stringify(projetos));
    }
}

// ===================================
// CRUD de Usuários/Voluntários
// ===================================

function getUsuarios() {
    return JSON.parse(localStorage.getItem('usuarios') || '[]');
}

function getUsuarioById(id) {
    const usuarios = getUsuarios();
    return usuarios.find(u => u.id === parseInt(id));
}

function getVoluntarios() {
    const usuarios = getUsuarios();
    return usuarios.filter(u => u.tipo === 'voluntario');
}

function updateUsuario(id, dadosAtualizados) {
    const usuarios = getUsuarios();
    const index = usuarios.findIndex(u => u.id === parseInt(id));
    
    if (index !== -1) {
        usuarios[index] = { ...usuarios[index], ...dadosAtualizados };
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
        
        // Registrar ação
        const sessao = getSessao();
        if (sessao) {
            registrarAcesso(sessao.id, sessao.nome, sessao.tipo, 'editou_usuario');
        }
        
        return { success: true, usuario: usuarios[index] };
    }
    
    return { success: false, message: 'Usuário não encontrado' };
}

function deleteUsuario(id) {
    const usuarios = getUsuarios();
    const index = usuarios.findIndex(u => u.id === parseInt(id));
    
    if (index !== -1) {
        const usuarioRemovido = usuarios[index];
        usuarios.splice(index, 1);
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
        
        // Registrar ação
        const sessao = getSessao();
        if (sessao) {
            registrarAcesso(sessao.id, sessao.nome, sessao.tipo, 'deletou_usuario');
        }
        
        return { success: true, usuario: usuarioRemovido };
    }
    
    return { success: false, message: 'Usuário não encontrado' };
}

function createUsuario(novoUsuario) {
    const usuarios = getUsuarios();
    const maxId = Math.max(...usuarios.map(u => u.id), 0);
    
    novoUsuario.id = maxId + 1;
    novoUsuario.dataCriacao = new Date().toISOString().split('T')[0];
    novoUsuario.ativo = true;
    
    usuarios.push(novoUsuario);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    
    // Registrar ação
    const sessao = getSessao();
    if (sessao) {
        registrarAcesso(sessao.id, sessao.nome, sessao.tipo, 'criou_usuario');
    }
    
    return { success: true, usuario: novoUsuario };
}

// ===================================
// CRUD de Projetos
// ===================================

function getProjetos() {
    initializeProjetos();
    return JSON.parse(localStorage.getItem('projetos') || '[]');
}

function getProjetoById(id) {
    const projetos = getProjetos();
    return projetos.find(p => p.id === parseInt(id));
}

function createProjeto(novoProjeto) {
    const projetos = getProjetos();
    const maxId = Math.max(...projetos.map(p => p.id), 0);
    
    novoProjeto.id = maxId + 1;
    novoProjeto.dataInicio = novoProjeto.dataInicio || new Date().toISOString().split('T')[0];
    novoProjeto.status = novoProjeto.status || 'ativo';
    
    projetos.push(novoProjeto);
    localStorage.setItem('projetos', JSON.stringify(projetos));
    
    // Registrar ação
    const sessao = getSessao();
    if (sessao) {
        registrarAcesso(sessao.id, sessao.nome, sessao.tipo, 'adicionou_projeto');
    }
    
    return { success: true, projeto: novoProjeto };
}

function updateProjeto(id, dadosAtualizados) {
    const projetos = getProjetos();
    const index = projetos.findIndex(p => p.id === parseInt(id));
    
    if (index !== -1) {
        projetos[index] = { ...projetos[index], ...dadosAtualizados };
        localStorage.setItem('projetos', JSON.stringify(projetos));
        
        // Registrar ação
        const sessao = getSessao();
        if (sessao) {
            registrarAcesso(sessao.id, sessao.nome, sessao.tipo, 'editou_projeto');
        }
        
        return { success: true, projeto: projetos[index] };
    }
    
    return { success: false, message: 'Projeto não encontrado' };
}

function deleteProjeto(id) {
    const projetos = getProjetos();
    const index = projetos.findIndex(p => p.id === parseInt(id));
    
    if (index !== -1) {
        const projetoRemovido = projetos[index];
        projetos.splice(index, 1);
        localStorage.setItem('projetos', JSON.stringify(projetos));
        
        // Registrar ação
        const sessao = getSessao();
        if (sessao) {
            registrarAcesso(sessao.id, sessao.nome, sessao.tipo, 'deletou_projeto');
        }
        
        return { success: true, projeto: projetoRemovido };
    }
    
    return { success: false, message: 'Projeto não encontrado' };
}

// ===================================
// Estatísticas
// ===================================

function getEstatisticas() {
    const usuarios = getUsuarios();
    const voluntarios = getVoluntarios();
    const projetos = getProjetos();
    const acessos = getAcessos();
    
    const totalBeneficiados = projetos.reduce((sum, p) => sum + (p.beneficiados || 0), 0);
    const totalArrecadado = projetos.reduce((sum, p) => sum + (p.arrecadado || 0), 0);
    const totalMetaFinanceira = projetos.reduce((sum, p) => sum + (p.metaFinanceira || 0), 0);
    const totalHorasVoluntariado = voluntarios.reduce((sum, v) => sum + (v.horasVoluntariado || 0), 0);
    
    return {
        totalUsuarios: usuarios.length,
        totalVoluntarios: voluntarios.length,
        totalAdmins: usuarios.filter(u => u.tipo === 'admin').length,
        totalProjetos: projetos.length,
        projetosAtivos: projetos.filter(p => p.status === 'ativo').length,
        projetosConcluidos: projetos.filter(p => p.status === 'concluido').length,
        totalBeneficiados: totalBeneficiados,
        totalArrecadado: totalArrecadado,
        totalMetaFinanceira: totalMetaFinanceira,
        percentualArrecadacao: totalMetaFinanceira > 0 ? ((totalArrecadado / totalMetaFinanceira) * 100).toFixed(1) : 0,
        totalHorasVoluntariado: totalHorasVoluntariado,
        totalAcessos: acessos.length,
        acessosHoje: acessos.filter(a => {
            const hoje = new Date().toISOString().split('T')[0];
            return a.dataHora.startsWith(hoje);
        }).length
    };
}

// Formatar moeda
function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

// Formatar data
function formatarData(dataISO) {
    if (!dataISO) return '-';
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR');
}

// Formatar data e hora
function formatarDataHora(dataISO) {
    if (!dataISO) return '-';
    const data = new Date(dataISO);
    return data.toLocaleString('pt-BR');
}

