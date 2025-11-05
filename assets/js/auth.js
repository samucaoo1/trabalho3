// ===================================
// Sistema de Autenticação
// ===================================

// Inicializar dados do sistema (simulando YAML)
function initializeData() {
    // Verifica se já existem dados no localStorage
    if (!localStorage.getItem('usuarios')) {
        const usuarios = [
            {
                id: 1,
                nome: "Maria Silva Santos",
                email: "admin@clegacy.org",
                senha: "admin123",
                tipo: "admin",
                cpf: "123.456.789-00",
                telefone: "(11) 98765-4321",
                dataCriacao: "2024-01-15",
                ultimoAcesso: new Date().toISOString(),
                ativo: true
            },
            {
                id: 2,
                nome: "João Pedro Oliveira",
                email: "joao.oliveira@email.com",
                senha: "voluntario123",
                tipo: "voluntario",
                cpf: "234.567.890-11",
                telefone: "(11) 97654-3210",
                dataNascimento: "1995-03-20",
                endereco: {
                    cep: "01310-100",
                    logradouro: "Av. Paulista",
                    numero: "1000",
                    complemento: "Apto 101",
                    cidade: "São Paulo",
                    estado: "SP"
                },
                interesse: "voluntario-instrutor",
                nivelConhecimento: "avancado",
                disponibilidade: "8h",
                dataCriacao: "2024-02-10",
                ultimoAcesso: "2025-10-28",
                ativo: true,
                horasVoluntariado: 120,
                projetosParticipados: 5
            },
            {
                id: 3,
                nome: "Ana Carolina Ferreira",
                email: "ana.ferreira@email.com",
                senha: "voluntario123",
                tipo: "voluntario",
                cpf: "345.678.901-22",
                telefone: "(21) 96543-2109",
                dataNascimento: "1992-07-15",
                endereco: {
                    cep: "20040-020",
                    logradouro: "Av. Rio Branco",
                    numero: "156",
                    complemento: "",
                    cidade: "Rio de Janeiro",
                    estado: "RJ"
                },
                interesse: "voluntario-mentor",
                nivelConhecimento: "expert",
                disponibilidade: "12h",
                dataCriacao: "2024-03-05",
                ultimoAcesso: "2025-10-29",
                ativo: true,
                horasVoluntariado: 200,
                projetosParticipados: 8
            },
            {
                id: 4,
                nome: "Carlos Eduardo Lima",
                email: "carlos.lima@email.com",
                senha: "voluntario123",
                tipo: "voluntario",
                cpf: "456.789.012-33",
                telefone: "(31) 95432-1098",
                dataNascimento: "1998-11-30",
                endereco: {
                    cep: "30130-010",
                    logradouro: "Av. Afonso Pena",
                    numero: "867",
                    complemento: "Sala 5",
                    cidade: "Belo Horizonte",
                    estado: "MG"
                },
                interesse: "voluntario-conteudo",
                nivelConhecimento: "intermediario",
                disponibilidade: "4h",
                dataCriacao: "2024-04-20",
                ultimoAcesso: "2025-10-27",
                ativo: true,
                horasVoluntariado: 80,
                projetosParticipados: 3
            },
            {
                id: 5,
                nome: "Beatriz Souza Costa",
                email: "beatriz.costa@email.com",
                senha: "voluntario123",
                tipo: "voluntario",
                cpf: "567.890.123-44",
                telefone: "(41) 94321-0987",
                dataNascimento: "1990-05-08",
                endereco: {
                    cep: "80010-000",
                    logradouro: "Rua XV de Novembro",
                    numero: "500",
                    complemento: "",
                    cidade: "Curitiba",
                    estado: "PR"
                },
                interesse: "voluntario-suporte",
                nivelConhecimento: "avancado",
                disponibilidade: "8h",
                dataCriacao: "2024-05-12",
                ultimoAcesso: "2025-10-29",
                ativo: true,
                horasVoluntariado: 150,
                projetosParticipados: 6
            },
            {
                id: 6,
                nome: "Rafael Almeida Santos",
                email: "rafael.santos@email.com",
                senha: "voluntario123",
                tipo: "voluntario",
                cpf: "678.901.234-55",
                telefone: "(85) 93210-9876",
                dataNascimento: "1994-09-25",
                endereco: {
                    cep: "60060-440",
                    logradouro: "Av. Beira Mar",
                    numero: "3000",
                    complemento: "Bloco A",
                    cidade: "Fortaleza",
                    estado: "CE"
                },
                interesse: "voluntario-instrutor",
                nivelConhecimento: "avancado",
                disponibilidade: "12h",
                dataCriacao: "2024-06-18",
                ultimoAcesso: "2025-10-26",
                ativo: true,
                horasVoluntariado: 180,
                projetosParticipados: 7
            }
        ];
        
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
    }
    
    // Inicializar acessos
    if (!localStorage.getItem('acessos')) {
        localStorage.setItem('acessos', JSON.stringify([]));
    }
}

// Fazer login
function login(email, senha) {
    initializeData();
    
    const usuarios = JSON.parse(localStorage.getItem('usuarios'));
    const usuario = usuarios.find(u => u.email === email && u.senha === senha && u.ativo);
    
    if (usuario) {
        // Atualizar último acesso
        usuario.ultimoAcesso = new Date().toISOString();
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
        
        // Salvar sessão
        const sessao = {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            tipo: usuario.tipo,
            loginTime: new Date().toISOString()
        };
        localStorage.setItem('sessao', JSON.stringify(sessao));
        
        // Registrar acesso
        registrarAcesso(usuario.id, usuario.nome, usuario.tipo, 'login');
        
        return { success: true, usuario: sessao };
    }
    
    return { success: false, message: 'Email ou senha inválidos' };
}

// Fazer logout
function logout() {
    const sessao = getSessao();
    if (sessao) {
        registrarAcesso(sessao.id, sessao.nome, sessao.tipo, 'logout');
    }
    localStorage.removeItem('sessao');
    window.location.href = 'login.html';
}

// Obter sessão atual
function getSessao() {
    const sessao = localStorage.getItem('sessao');
    return sessao ? JSON.parse(sessao) : null;
}

// Verificar se está autenticado
function isAuthenticated() {
    return getSessao() !== null;
}

// Verificar se é admin
function isAdmin() {
    const sessao = getSessao();
    return sessao && sessao.tipo === 'admin';
}

// Verificar se é voluntário
function isVoluntario() {
    const sessao = getSessao();
    return sessao && sessao.tipo === 'voluntario';
}

// Proteger página (redirecionar se não autenticado)
function protegerPagina(tipoRequerido = null) {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return false;
    }
    
    const sessao = getSessao();
    
    if (tipoRequerido && sessao.tipo !== tipoRequerido) {
        alert('Você não tem permissão para acessar esta página');
        if (sessao.tipo === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'voluntario.html';
        }
        return false;
    }
    
    return true;
}

// Registrar acesso
function registrarAcesso(usuarioId, usuarioNome, tipo, acao) {
    const acessos = JSON.parse(localStorage.getItem('acessos') || '[]');
    
    const novoAcesso = {
        id: acessos.length + 1,
        usuarioId: usuarioId,
        usuarioNome: usuarioNome,
        tipo: tipo,
        dataHora: new Date().toISOString(),
        ip: '192.168.1.100', // Simulado
        navegador: navigator.userAgent.split(' ').slice(-2).join(' '),
        acao: acao
    };
    
    acessos.push(novoAcesso);
    localStorage.setItem('acessos', JSON.stringify(acessos));
}

// Obter todos os acessos
function getAcessos() {
    return JSON.parse(localStorage.getItem('acessos') || '[]');
}

// Obter acessos recentes (últimos N)
function getAcessosRecentes(limite = 10) {
    const acessos = getAcessos();
    return acessos.slice(-limite).reverse();
}

