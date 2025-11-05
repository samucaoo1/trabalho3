// ===================================
// SISTEMA DE VALIDAÇÃO AVANÇADA DE FORMULÁRIOS
// Verificação de consistência com avisos em tempo real
// ===================================

class FormValidator {
    constructor(formSelector, options = {}) {
        this.form = typeof formSelector === 'string' 
            ? document.querySelector(formSelector) 
            : formSelector;
        
        if (!this.form) {
            console.error('Formulário não encontrado');
            return;
        }

        this.options = {
            realTime: true,
            showErrors: true,
            errorClass: 'error',
            successClass: 'success',
            errorMessageClass: 'error-message',
            ...options
        };

        this.rules = {};
        this.customValidators = {};
        this.errors = {};
        
        this.init();
    }

    /**
     * Inicializa o validador
     */
    init() {
        // Prevenir submit padrão
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.validateAll();
        });

        // Validação em tempo real
        if (this.options.realTime) {
            this.setupRealTimeValidation();
        }

        // Adicionar atributo novalidate para desabilitar validação HTML5
        this.form.setAttribute('novalidate', 'novalidate');
    }

    /**
     * Configura validação em tempo real
     */
    setupRealTimeValidation() {
        const inputs = this.form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            // Validar ao sair do campo
            input.addEventListener('blur', () => {
                this.validateField(input);
            });

            // Limpar erro ao digitar
            input.addEventListener('input', () => {
                this.clearFieldError(input);
                
                // Validar enquanto digita (com debounce)
                clearTimeout(input.validationTimeout);
                input.validationTimeout = setTimeout(() => {
                    this.validateField(input);
                }, 500);
            });
        });
    }

    /**
     * Adiciona regra de validação para um campo
     * @param {string} fieldName - Nome do campo
     * @param {Array} rules - Array de regras
     */
    addRule(fieldName, rules) {
        this.rules[fieldName] = rules;
    }

    /**
     * Adiciona múltiplas regras de uma vez
     * @param {Object} rulesObject - Objeto com regras
     */
    addRules(rulesObject) {
        Object.assign(this.rules, rulesObject);
    }

    /**
     * Adiciona validador customizado
     * @param {string} name - Nome do validador
     * @param {Function} validator - Função validadora
     */
    addCustomValidator(name, validator) {
        this.customValidators[name] = validator;
    }

    /**
     * Valida um campo específico
     * @param {HTMLElement} field - Campo a validar
     * @returns {boolean} Se é válido
     */
    validateField(field) {
        const fieldName = field.name || field.id;
        const rules = this.rules[fieldName];

        if (!rules) return true;

        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Aplicar cada regra
        for (const rule of rules) {
            const result = this.applyRule(value, rule, field);
            
            if (!result.valid) {
                isValid = false;
                errorMessage = result.message;
                break;
            }
        }

        // Atualizar UI
        if (isValid) {
            this.showFieldSuccess(field);
            delete this.errors[fieldName];
        } else {
            this.showFieldError(field, errorMessage);
            this.errors[fieldName] = errorMessage;
        }

        return isValid;
    }

    /**
     * Aplica uma regra de validação
     * @param {string} value - Valor do campo
     * @param {Object|string} rule - Regra a aplicar
     * @param {HTMLElement} field - Campo sendo validado
     * @returns {Object} Resultado da validação
     */
    applyRule(value, rule, field) {
        // Se a regra é uma string, converter para objeto
        if (typeof rule === 'string') {
            rule = { type: rule };
        }

        const { type, message, ...params } = rule;

        // Validações built-in
        switch (type) {
            case 'required':
                if (!value) {
                    return { valid: false, message: message || 'Este campo é obrigatório' };
                }
                break;

            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (value && !emailRegex.test(value)) {
                    return { valid: false, message: message || 'Email inválido' };
                }
                break;

            case 'cpf':
                if (value && !this.validateCPF(value)) {
                    return { valid: false, message: message || 'CPF inválido' };
                }
                break;

            case 'phone':
                const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
                if (value && !phoneRegex.test(value)) {
                    return { valid: false, message: message || 'Telefone inválido' };
                }
                break;

            case 'cep':
                const cepRegex = /^\d{5}-\d{3}$/;
                if (value && !cepRegex.test(value)) {
                    return { valid: false, message: message || 'CEP inválido' };
                }
                break;

            case 'minLength':
                if (value && value.length < params.length) {
                    return { valid: false, message: message || `Mínimo de ${params.length} caracteres` };
                }
                break;

            case 'maxLength':
                if (value && value.length > params.length) {
                    return { valid: false, message: message || `Máximo de ${params.length} caracteres` };
                }
                break;

            case 'min':
                if (value && parseFloat(value) < params.value) {
                    return { valid: false, message: message || `Valor mínimo: ${params.value}` };
                }
                break;

            case 'max':
                if (value && parseFloat(value) > params.value) {
                    return { valid: false, message: message || `Valor máximo: ${params.value}` };
                }
                break;

            case 'pattern':
                const regex = new RegExp(params.pattern);
                if (value && !regex.test(value)) {
                    return { valid: false, message: message || 'Formato inválido' };
                }
                break;

            case 'match':
                const matchField = this.form.querySelector(`[name="${params.field}"]`);
                if (matchField && value !== matchField.value) {
                    return { valid: false, message: message || 'Os campos não coincidem' };
                }
                break;

            case 'date':
                if (value && !this.isValidDate(value)) {
                    return { valid: false, message: message || 'Data inválida' };
                }
                break;

            case 'minAge':
                if (value && !this.checkMinAge(value, params.age)) {
                    return { valid: false, message: message || `Idade mínima: ${params.age} anos` };
                }
                break;

            case 'custom':
                if (params.validator) {
                    const result = params.validator(value, field);
                    if (!result) {
                        return { valid: false, message: message || 'Valor inválido' };
                    }
                }
                break;

            default:
                // Verificar validadores customizados
                if (this.customValidators[type]) {
                    const result = this.customValidators[type](value, params, field);
                    if (!result) {
                        return { valid: false, message: message || 'Valor inválido' };
                    }
                }
        }

        return { valid: true };
    }

    /**
     * Valida todos os campos do formulário
     * @returns {boolean} Se o formulário é válido
     */
    validateAll() {
        this.errors = {};
        const fields = this.form.querySelectorAll('input, select, textarea');
        let isValid = true;

        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        // Disparar evento
        if (isValid) {
            this.form.dispatchEvent(new CustomEvent('formValid', { 
                detail: { data: this.getFormData() } 
            }));
        } else {
            this.form.dispatchEvent(new CustomEvent('formInvalid', { 
                detail: { errors: this.errors } 
            }));
        }

        return isValid;
    }

    /**
     * Mostra erro em um campo
     */
    showFieldError(field, message) {
        if (!this.options.showErrors) return;

        // Remover classes de sucesso
        field.classList.remove(this.options.successClass);
        
        // Adicionar classe de erro
        field.classList.add(this.options.errorClass);

        // Criar ou atualizar mensagem de erro
        let errorElement = field.parentElement.querySelector(`.${this.options.errorMessageClass}`);
        
        if (!errorElement) {
            errorElement = document.createElement('span');
            errorElement.className = this.options.errorMessageClass;
            field.parentElement.appendChild(errorElement);
        }

        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    /**
     * Mostra sucesso em um campo
     */
    showFieldSuccess(field) {
        field.classList.remove(this.options.errorClass);
        field.classList.add(this.options.successClass);
        this.clearFieldError(field);
    }

    /**
     * Limpa erro de um campo
     */
    clearFieldError(field) {
        field.classList.remove(this.options.errorClass);
        
        const errorElement = field.parentElement.querySelector(`.${this.options.errorMessageClass}`);
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }

    /**
     * Obtém dados do formulário
     */
    getFormData() {
        const formData = new FormData(this.form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        return data;
    }

    /**
     * Valida CPF
     */
    validateCPF(cpf) {
        cpf = cpf.replace(/\D/g, '');
        if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
        
        let sum = 0;
        for (let i = 0; i < 9; i++) sum += parseInt(cpf.charAt(i)) * (10 - i);
        let digit = 11 - (sum % 11);
        if (digit >= 10) digit = 0;
        if (digit !== parseInt(cpf.charAt(9))) return false;
        
        sum = 0;
        for (let i = 0; i < 10; i++) sum += parseInt(cpf.charAt(i)) * (11 - i);
        digit = 11 - (sum % 11);
        if (digit >= 10) digit = 0;
        
        return digit === parseInt(cpf.charAt(10));
    }

    /**
     * Verifica se é uma data válida
     */
    isValidDate(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    }

    /**
     * Verifica idade mínima
     */
    checkMinAge(dateString, minAge) {
        const birthDate = new Date(dateString);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age >= minAge;
    }

    /**
     * Reseta o formulário
     */
    reset() {
        this.form.reset();
        this.errors = {};
        
        const fields = this.form.querySelectorAll('input, select, textarea');
        fields.forEach(field => {
            this.clearFieldError(field);
            field.classList.remove(this.options.successClass);
        });
    }
}

// Exportar para uso global
window.FormValidator = FormValidator;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormValidator;
}

