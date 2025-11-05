// ===================================
// Máscaras de Input
// ===================================

// Máscara para CPF (000.000.000-00)
function maskCPF(value) {
    return value
        .replace(/\D/g, '') // Remove tudo que não é dígito
        .replace(/(\d{3})(\d)/, '$1.$2') // Coloca ponto após os 3 primeiros dígitos
        .replace(/(\d{3})(\d)/, '$1.$2') // Coloca ponto após os 6 primeiros dígitos
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2') // Coloca hífen antes dos 2 últimos dígitos
        .substring(0, 14); // Limita o tamanho
}

// Máscara para Telefone ((00) 00000-0000)
function maskPhone(value) {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .substring(0, 15);
}

// Máscara para CEP (00000-000)
function maskCEP(value) {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .substring(0, 9);
}

// Máscara para Data (DD/MM/AAAA)
function maskDate(value) {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '$1/$2')
        .replace(/(\d{2})(\d)/, '$1/$2')
        .substring(0, 10);
}

// ===================================
// Validações
// ===================================

// Validar CPF
function validateCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    
    if (cpf.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    // Validação do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cpf.charAt(9))) return false;
    
    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cpf.charAt(10))) return false;
    
    return true;
}

// Validar Email
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Validar Telefone
function validatePhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10 || cleaned.length === 11;
}

// Validar CEP
function validateCEP(cep) {
    const cleaned = cep.replace(/\D/g, '');
    return cleaned.length === 8;
}

// ===================================
// Buscar CEP via API ViaCEP
// ===================================
async function buscarCEP(cep) {
    const cepLimpo = cep.replace(/\D/g, '');
    
    if (cepLimpo.length !== 8) {
        return null;
    }
    
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await response.json();
        
        if (data.erro) {
            return null;
        }
        
        return data;
    } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        return null;
    }
}

// ===================================
// Event Listeners para Máscaras
// ===================================
document.addEventListener('DOMContentLoaded', function() {
    
    // Aplicar máscara de CPF
    const cpfInput = document.getElementById('cpf');
    if (cpfInput) {
        cpfInput.addEventListener('input', function(e) {
            e.target.value = maskCPF(e.target.value);
        });
        
        cpfInput.addEventListener('blur', function(e) {
            const cpf = e.target.value;
            if (cpf && !validateCPF(cpf)) {
                e.target.setCustomValidity('CPF inválido');
                e.target.reportValidity();
            } else {
                e.target.setCustomValidity('');
            }
        });
    }
    
    // Aplicar máscara de Telefone
    const phoneInput = document.getElementById('telefone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            e.target.value = maskPhone(e.target.value);
        });
    }
    
    // Aplicar máscara de CEP e buscar endereço
    const cepInput = document.getElementById('cep');
    if (cepInput) {
        cepInput.addEventListener('input', function(e) {
            e.target.value = maskCEP(e.target.value);
        });
        
        cepInput.addEventListener('blur', async function(e) {
            const cep = e.target.value;
            if (validateCEP(cep)) {
                const endereco = await buscarCEP(cep);
                if (endereco) {
                    // Preencher campos de endereço automaticamente
                    const enderecoInput = document.getElementById('endereco');
                    const cidadeInput = document.getElementById('cidade');
                    const estadoInput = document.getElementById('estado');
                    
                    if (enderecoInput && endereco.logradouro) {
                        enderecoInput.value = endereco.logradouro;
                    }
                    if (cidadeInput && endereco.localidade) {
                        cidadeInput.value = endereco.localidade;
                    }
                    if (estadoInput && endereco.uf) {
                        estadoInput.value = endereco.uf;
                    }
                }
            }
        });
    }
    
    // Validação de Email
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('blur', function(e) {
            const email = e.target.value;
            if (email && !validateEmail(email)) {
                e.target.setCustomValidity('Email inválido');
                e.target.reportValidity();
            } else {
                e.target.setCustomValidity('');
            }
        });
    }
    
    // Validação do formulário
    const form = document.getElementById('cadastroForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validar todos os campos
            let isValid = true;
            
            // Validar CPF
            const cpf = document.getElementById('cpf');
            if (cpf && !validateCPF(cpf.value)) {
                cpf.setCustomValidity('CPF inválido');
                cpf.reportValidity();
                isValid = false;
            }
            
            // Validar Email
            const email = document.getElementById('email');
            if (email && !validateEmail(email.value)) {
                email.setCustomValidity('Email inválido');
                email.reportValidity();
                isValid = false;
            }
            
            if (isValid) {
                // Coletar dados do formulário
                const novoUsuario = {
                    nome: document.getElementById('nome').value,
                    email: document.getElementById('email').value,
                    cpf: document.getElementById('cpf').value,
                    telefone: document.getElementById('telefone').value,
                    dataNascimento: document.getElementById('dataNascimento').value,
                    endereco: {
                        cep: document.getElementById('cep').value,
                        logradouro: document.getElementById('endereco').value,
                        numero: document.getElementById('numero').value,
                        complemento: document.getElementById('complemento').value,
                        cidade: document.getElementById('cidade').value,
                        estado: document.getElementById('estado').value
                    },
                    interesse: document.getElementById('interesse').value,
                    nivelConhecimento: document.getElementById('nivelConhecimento') ? document.getElementById('nivelConhecimento').value : '',
                    disponibilidade: document.getElementById('disponibilidade') ? document.getElementById('disponibilidade').value : '',
                    senha: 'voluntario123', // Senha padrão
                    tipo: 'voluntario',
                    ativo: true,
                    horasVoluntariado: 0,
                    projetosParticipados: 0,
                    dataCriacao: new Date().toISOString()
                };

                // Salvar no localStorage usando a API
                if (typeof createUsuario === 'function') {
                    const resultado = createUsuario(novoUsuario);

                    if (resultado.success) {
                        alert('✅ Cadastro realizado com sucesso!\n\nSua senha padrão é: voluntario123\n\nVocê já pode fazer login na Área Restrita.');
                        form.reset();

                        // Perguntar se deseja fazer login
                        if (confirm('Deseja fazer login agora?')) {
                            window.location.href = 'login.html';
                        }
                    } else {
                        alert('❌ Erro ao realizar cadastro: ' + resultado.message);
                    }
                } else {
                    // Fallback se a API não estiver carregada
                    alert('✅ Cadastro realizado com sucesso!\n\nObrigado por se juntar à nossa causa.\n\nPara acessar a área restrita, use a senha padrão: voluntario123');
                    form.reset();
                }
            }
        });
    }
    
    // Smooth scroll para links internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Adicionar classe active ao link do menu da página atual
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-menu a').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
});

// ===================================
// Animações ao Scroll
// ===================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observar elementos para animação
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.card, .info-box, .stat-box').forEach(el => {
        observer.observe(el);
    });
});

