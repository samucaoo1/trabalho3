// ===================================
// APLICAÇÃO PRINCIPAL
// Integração de SPA, Templates e Validação
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    
    // ===================================
    // INICIALIZAÇÃO DO VALIDADOR DE FORMULÁRIOS
    // ===================================
    
    // Validador para formulário de cadastro
    const cadastroForm = document.getElementById('cadastroForm');
    if (cadastroForm) {
        const validator = new FormValidator('#cadastroForm', {
            realTime: true,
            showErrors: true
        });

        // Definir regras de validação
        validator.addRules({
            'nome': [
                { type: 'required', message: '⚠️ Nome é obrigatório' },
                { type: 'minLength', length: 3, message: '⚠️ Nome deve ter no mínimo 3 caracteres' },
                { type: 'pattern', pattern: '^[a-zA-ZÀ-ÿ\\s]+$', message: '⚠️ Nome deve conter apenas letras' }
            ],
            'email': [
                { type: 'required', message: '⚠️ Email é obrigatório' },
                { type: 'email', message: '⚠️ Email inválido' }
            ],
            'cpf': [
                { type: 'required', message: '⚠️ CPF é obrigatório' },
                { type: 'cpf', message: '⚠️ CPF inválido' }
            ],
            'telefone': [
                { type: 'required', message: '⚠️ Telefone é obrigatório' },
                { type: 'phone', message: '⚠️ Telefone inválido. Use o formato (00) 00000-0000' }
            ],
            'dataNascimento': [
                { type: 'required', message: '⚠️ Data de nascimento é obrigatória' },
                { type: 'date', message: '⚠️ Data inválida' },
                { type: 'minAge', age: 16, message: '⚠️ Você deve ter no mínimo 16 anos' }
            ],
            'cep': [
                { type: 'required', message: '⚠️ CEP é obrigatório' },
                { type: 'cep', message: '⚠️ CEP inválido. Use o formato 00000-000' }
            ],
            'endereco': [
                { type: 'required', message: '⚠️ Endereço é obrigatório' }
            ],
            'cidade': [
                { type: 'required', message: '⚠️ Cidade é obrigatória' }
            ],
            'estado': [
                { type: 'required', message: '⚠️ Estado é obrigatório' }
            ],
            'interesse': [
                { type: 'required', message: '⚠️ Selecione uma área de interesse' }
            ],
            'termos': [
                { 
                    type: 'custom', 
                    validator: (value, field) => field.checked,
                    message: '⚠️ Você deve aceitar os termos de uso' 
                }
            ]
        });

        // Validador customizado para verificar email duplicado
        validator.addCustomValidator('uniqueEmail', (value) => {
            const usuarios = getUsuarios();
            return !usuarios.some(u => u.email === value);
        });

        // Adicionar validação de email único
        const emailField = cadastroForm.querySelector('#email');
        if (emailField) {
            emailField.addEventListener('blur', function() {
                const usuarios = getUsuarios();
                const emailExiste = usuarios.some(u => u.email === this.value);
                
                if (emailExiste) {
                    validator.showFieldError(this, '⚠️ Este email já está cadastrado');
                }
            });
        }

        // Evento quando formulário é válido
        cadastroForm.addEventListener('formValid', function(e) {
            const dados = e.detail.data;
            
            // Criar objeto de usuário
            const novoUsuario = {
                nome: dados.nome,
                email: dados.email,
                cpf: dados.cpf,
                telefone: dados.telefone,
                dataNascimento: dados.dataNascimento,
                endereco: {
                    cep: dados.cep,
                    logradouro: dados.endereco,
                    numero: dados.numero,
                    complemento: dados.complemento,
                    cidade: dados.cidade,
                    estado: dados.estado
                },
                interesse: dados.interesse,
                nivelConhecimento: dados.nivelConhecimento || '',
                disponibilidade: dados.disponibilidade || '',
                mensagem: dados.mensagem || '',
                senha: 'voluntario123',
                tipo: 'voluntario',
                ativo: true,
                horasVoluntariado: 0,
                projetosParticipados: 0
            };

            // Salvar usuário
            const resultado = createUsuario(novoUsuario);

            if (resultado.success) {
                // Mostrar mensagem de sucesso
                showToast(
                    'Cadastro Realizado!',
                    'Seu cadastro foi realizado com sucesso. Sua senha padrão é: voluntario123',
                    'success',
                    8000
                );

                // Resetar formulário
                validator.reset();

                // Perguntar se deseja fazer login
                setTimeout(() => {
                    if (confirm('Deseja fazer login agora?')) {
                        window.location.href = 'login.html';
                    }
                }, 2000);
            } else {
                showToast('Erro', 'Erro ao realizar cadastro: ' + resultado.message, 'error');
            }
        });

        // Evento quando formulário é inválido
        cadastroForm.addEventListener('formInvalid', function(e) {
            showToast(
                'Formulário Inválido',
                'Por favor, corrija os erros antes de continuar',
                'error',
                5000
            );
        });
    }

    // ===================================
    // VALIDAÇÃO DO FORMULÁRIO DE LOGIN
    // ===================================
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        const loginValidator = new FormValidator('#loginForm', {
            realTime: true,
            showErrors: true
        });

        loginValidator.addRules({
            'email': [
                { type: 'required', message: '⚠️ Email é obrigatório' },
                { type: 'email', message: '⚠️ Email inválido' }
            ],
            'senha': [
                { type: 'required', message: '⚠️ Senha é obrigatória' },
                { type: 'minLength', length: 6, message: '⚠️ Senha deve ter no mínimo 6 caracteres' }
            ]
        });
    }

    // ===================================
    // RENDERIZAÇÃO DINÂMICA COM TEMPLATES
    // ===================================
    
    // Renderizar projetos na página de projetos
    const projetosContainer = document.getElementById('projetos-container');
    if (projetosContainer) {
        renderizarProjetos();
    }

    // Renderizar voluntários no painel admin
    const voluntariosContainer = document.getElementById('voluntarios-container');
    if (voluntariosContainer) {
        renderizarVoluntarios();
    }

    // ===================================
    // CONTADOR DE CARACTERES EM TEXTAREA
    // ===================================
    
    const textareas = document.querySelectorAll('textarea[maxlength]');
    textareas.forEach(textarea => {
        const maxLength = textarea.getAttribute('maxlength');
        
        // Criar contador
        const counter = document.createElement('small');
        counter.className = 'char-counter';
        counter.style.display = 'block';
        counter.style.marginTop = '0.25rem';
        counter.style.color = '#666';
        textarea.parentElement.appendChild(counter);
        
        // Atualizar contador
        const updateCounter = () => {
            const remaining = maxLength - textarea.value.length;
            counter.textContent = `${textarea.value.length}/${maxLength} caracteres`;
            
            if (remaining < 50) {
                counter.style.color = '#e74c3c';
            } else {
                counter.style.color = '#666';
            }
        };
        
        textarea.addEventListener('input', updateCounter);
        updateCounter();
    });

    // ===================================
    // CONFIRMAÇÃO ANTES DE SAIR COM DADOS NÃO SALVOS
    // ===================================
    
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        let formModified = false;
        
        form.addEventListener('input', () => {
            formModified = true;
        });
        
        form.addEventListener('submit', () => {
            formModified = false;
        });
        
        window.addEventListener('beforeunload', (e) => {
            if (formModified) {
                e.preventDefault();
                e.returnValue = '';
                return 'Você tem alterações não salvas. Deseja realmente sair?';
            }
        });
    });

    // ===================================
    // PREVIEW DE IMAGEM (se houver upload)
    // ===================================
    
    const imageInputs = document.querySelectorAll('input[type="file"][accept*="image"]');
    imageInputs.forEach(input => {
        input.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    let preview = input.parentElement.querySelector('.image-preview');
                    if (!preview) {
                        preview = document.createElement('img');
                        preview.className = 'image-preview';
                        preview.style.maxWidth = '200px';
                        preview.style.marginTop = '1rem';
                        input.parentElement.appendChild(preview);
                    }
                    preview.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    });
});

// ===================================
// FUNÇÕES AUXILIARES
// ===================================

/**
 * Renderiza lista de projetos usando templates
 */
function renderizarProjetos() {
    const container = document.getElementById('projetos-container');
    if (!container) return;

    const projetos = getProjetos();
    const html = templateEngine.renderList('projectCard', projetos);
    container.innerHTML = html;
}

/**
 * Renderiza lista de voluntários usando templates
 */
function renderizarVoluntarios() {
    const container = document.getElementById('voluntarios-container');
    if (!container) return;

    const voluntarios = getVoluntarios();
    const html = templateEngine.renderList('voluntarioCard', voluntarios);
    container.innerHTML = html;
}

/**
 * Renderiza tabela de acessos
 */
function renderizarAcessos() {
    const tbody = document.querySelector('#acessos-table tbody');
    if (!tbody) return;

    const acessos = getAcessosRecentes(20);
    const html = templateEngine.renderList('acessoRow', acessos);
    tbody.innerHTML = html;
}

/**
 * Mostra detalhes de um projeto
 */
function verDetalhes(projetoId) {
    const projeto = getProjetoById(projetoId);
    if (!projeto) return;

    const modalContent = `
        <h3>${projeto.titulo}</h3>
        <p><strong>Categoria:</strong> ${projeto.categoria}</p>
        <p><strong>Descrição:</strong> ${projeto.descricao}</p>
        <p><strong>Responsável:</strong> ${projeto.responsavel}</p>
        <p><strong>Status:</strong> ${projeto.status}</p>
        <p><strong>Voluntários:</strong> ${projeto.voluntarios}</p>
        <p><strong>Beneficiados:</strong> ${projeto.beneficiados}</p>
        <p><strong>Meta Financeira:</strong> ${formatarMoeda(projeto.metaFinanceira)}</p>
        <p><strong>Arrecadado:</strong> ${formatarMoeda(projeto.arrecadado)}</p>
        <p><strong>Impacto:</strong> ${projeto.impacto}</p>
    `;

    const modal = templateEngine.render('modal', {
        id: 'modal-projeto',
        title: 'Detalhes do Projeto',
        content: modalContent,
        active: true,
        footer: '<button class="btn" onclick="closeModal(\'modal-projeto\')">Fechar</button>'
    });

    // Adicionar modal ao body
    const modalDiv = document.createElement('div');
    modalDiv.innerHTML = modal;
    document.body.appendChild(modalDiv.firstElementChild);
}

/**
 * Fecha um modal
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

/**
 * Edita um voluntário
 */
function editarVoluntario(id) {
    const voluntario = getUsuarioById(id);
    if (!voluntario) return;

    alert(`Editar voluntário: ${voluntario.nome}\n(Funcionalidade em desenvolvimento)`);
}

/**
 * Remove um voluntário
 */
function removerVoluntario(id) {
    if (!confirm('Tem certeza que deseja remover este voluntário?')) return;

    const resultado = deleteUsuario(id);
    if (resultado.success) {
        showToast('Sucesso', 'Voluntário removido com sucesso', 'success');
        renderizarVoluntarios();
    } else {
        showToast('Erro', resultado.message, 'error');
    }
}

