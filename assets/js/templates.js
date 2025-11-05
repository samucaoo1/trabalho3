// ===================================
// SISTEMA DE TEMPLATES JAVASCRIPT
// Renderização dinâmica de componentes
// ===================================

class TemplateEngine {
    constructor() {
        this.templates = {};
        this.components = {};
        this.cache = {};
    }

    /**
     * Registra um template
     * @param {string} name - Nome do template
     * @param {string|Function} template - String HTML ou função que retorna HTML
     */
    register(name, template) {
        this.templates[name] = template;
    }

    /**
     * Renderiza um template com dados
     * @param {string} name - Nome do template
     * @param {Object} data - Dados para interpolação
     * @returns {string} HTML renderizado
     */
    render(name, data = {}) {
        const template = this.templates[name];
        
        if (!template) {
            console.error(`Template "${name}" não encontrado`);
            return '';
        }

        // Se for função, executar
        if (typeof template === 'function') {
            return template(data);
        }

        // Interpolar variáveis no template
        return this.interpolate(template, data);
    }

    /**
     * Interpola variáveis em uma string template
     * @param {string} template - String com placeholders {{variavel}}
     * @param {Object} data - Dados para interpolação
     * @returns {string} String interpolada
     */
    interpolate(template, data) {
        return template.replace(/\{\{(\s*[\w\.]+\s*)\}\}/g, (match, key) => {
            key = key.trim();
            const value = this.getNestedValue(data, key);
            return value !== undefined ? value : '';
        });
    }

    /**
     * Obtém valor aninhado de um objeto usando notação de ponto
     * @param {Object} obj - Objeto
     * @param {string} path - Caminho (ex: "usuario.nome")
     * @returns {*} Valor encontrado
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => 
            current && current[key] !== undefined ? current[key] : undefined, obj);
    }

    /**
     * Renderiza uma lista de itens usando um template
     * @param {string} templateName - Nome do template
     * @param {Array} items - Array de dados
     * @returns {string} HTML concatenado
     */
    renderList(templateName, items) {
        return items.map(item => this.render(templateName, item)).join('');
    }

    /**
     * Renderiza template diretamente no DOM
     * @param {string} selector - Seletor CSS do elemento alvo
     * @param {string} templateName - Nome do template
     * @param {Object} data - Dados para renderização
     */
    renderTo(selector, templateName, data) {
        const element = document.querySelector(selector);
        if (element) {
            element.innerHTML = this.render(templateName, data);
        }
    }

    /**
     * Cria um componente reutilizável
     * @param {string} name - Nome do componente
     * @param {Function} component - Função que retorna HTML
     */
    component(name, component) {
        this.components[name] = component;
    }

    /**
     * Renderiza um componente
     * @param {string} name - Nome do componente
     * @param {Object} props - Propriedades do componente
     * @returns {string} HTML do componente
     */
    renderComponent(name, props = {}) {
        const component = this.components[name];
        
        if (!component) {
            console.error(`Componente "${name}" não encontrado`);
            return '';
        }

        return component(props);
    }
}

// Criar instância global
window.templateEngine = new TemplateEngine();

// ===================================
// TEMPLATES PRÉ-DEFINIDOS
// ===================================

// Template de Card de Projeto
templateEngine.register('projectCard', (projeto) => `
    <div class="card project-card" data-id="${projeto.id}">
        <div class="card-header">
            <h3>${projeto.titulo}</h3>
            <span class="badge badge-${projeto.status === 'ativo' ? 'success' : 'secondary'}">
                ${projeto.status === 'ativo' ? 'Ativo' : 'Concluído'}
            </span>
        </div>
        <div class="card-body">
            <p class="category">${projeto.categoria}</p>
            <p class="description">${projeto.descricao}</p>
            <div class="project-stats">
                <div class="stat">
                    <span class="label">Voluntários:</span>
                    <span class="value">${projeto.voluntarios}</span>
                </div>
                <div class="stat">
                    <span class="label">Beneficiados:</span>
                    <span class="value">${projeto.beneficiados}</span>
                </div>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${(projeto.arrecadado / projeto.metaFinanceira * 100).toFixed(1)}%"></div>
            </div>
            <p class="progress-text">
                ${formatarMoeda(projeto.arrecadado)} de ${formatarMoeda(projeto.metaFinanceira)}
            </p>
        </div>
        <div class="card-footer">
            <button class="btn btn-sm" onclick="verDetalhes(${projeto.id})">Ver Detalhes</button>
        </div>
    </div>
`);

// Template de Card de Voluntário
templateEngine.register('voluntarioCard', (voluntario) => `
    <div class="card voluntario-card" data-id="${voluntario.id}">
        <div class="card-header">
            <h3>${voluntario.nome}</h3>
            <span class="badge badge-${voluntario.ativo ? 'success' : 'danger'}">
                ${voluntario.ativo ? 'Ativo' : 'Inativo'}
            </span>
        </div>
        <div class="card-body">
            <p><strong>Email:</strong> ${voluntario.email}</p>
            <p><strong>Telefone:</strong> ${voluntario.telefone}</p>
            <p><strong>Área:</strong> ${voluntario.interesse || 'Não especificado'}</p>
            <p><strong>Nível:</strong> ${voluntario.nivelConhecimento || 'Não especificado'}</p>
            <div class="stats-row">
                <div class="stat">
                    <span class="value">${voluntario.horasVoluntariado || 0}h</span>
                    <span class="label">Horas</span>
                </div>
                <div class="stat">
                    <span class="value">${voluntario.projetosParticipados || 0}</span>
                    <span class="label">Projetos</span>
                </div>
            </div>
        </div>
        <div class="card-footer">
            <button class="btn btn-sm btn-secondary" onclick="editarVoluntario(${voluntario.id})">Editar</button>
            <button class="btn btn-sm btn-danger" onclick="removerVoluntario(${voluntario.id})">Remover</button>
        </div>
    </div>
`);

// Template de Linha de Tabela de Acessos
templateEngine.register('acessoRow', (acesso) => `
    <tr>
        <td>${acesso.id}</td>
        <td>${acesso.usuarioNome}</td>
        <td><span class="badge badge-${acesso.tipo === 'admin' ? 'primary' : 'info'}">${acesso.tipo}</span></td>
        <td>${formatarDataHora(acesso.dataHora)}</td>
        <td>${acesso.ip}</td>
        <td><span class="badge badge-${acesso.acao === 'login' ? 'success' : 'warning'}">${acesso.acao}</span></td>
    </tr>
`);

// Template de Alerta
templateEngine.register('alert', (data) => `
    <div class="alert alert-${data.type || 'info'} ${data.dismissible ? 'alert-dismissible' : ''}" role="alert">
        ${data.dismissible ? '<button class="alert-close" onclick="this.parentElement.remove()">×</button>' : ''}
        ${data.title ? `<strong>${data.title}</strong>` : ''}
        ${data.message}
    </div>
`);

// Template de Modal
templateEngine.register('modal', (data) => `
    <div class="modal ${data.active ? 'active' : ''}" id="${data.id}">
        <div class="modal-backdrop" onclick="closeModal('${data.id}')"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2>${data.title}</h2>
                <button class="modal-close" onclick="closeModal('${data.id}')">×</button>
            </div>
            <div class="modal-body">
                ${data.content}
            </div>
            ${data.footer ? `<div class="modal-footer">${data.footer}</div>` : ''}
        </div>
    </div>
`);

// Template de Estatística
templateEngine.register('statBox', (data) => `
    <div class="stat-box">
        <div class="stat-icon">${data.icon || '📊'}</div>
        <div class="stat-content">
            <span class="stat-value">${data.value}</span>
            <span class="stat-label">${data.label}</span>
        </div>
    </div>
`);

// Template de Formulário de Projeto
templateEngine.register('projetoForm', (projeto = {}) => `
    <form id="projetoForm" class="form">
        <input type="hidden" id="projetoId" value="${projeto.id || ''}">
        
        <div class="form-group">
            <label for="titulo">Título do Projeto *</label>
            <input type="text" id="titulo" name="titulo" value="${projeto.titulo || ''}" required>
        </div>
        
        <div class="form-group">
            <label for="categoria">Categoria *</label>
            <select id="categoria" name="categoria" required>
                <option value="">Selecione</option>
                <option value="Educação" ${projeto.categoria === 'Educação' ? 'selected' : ''}>Educação</option>
                <option value="Capacitação Profissional" ${projeto.categoria === 'Capacitação Profissional' ? 'selected' : ''}>Capacitação Profissional</option>
                <option value="Educação Básica" ${projeto.categoria === 'Educação Básica' ? 'selected' : ''}>Educação Básica</option>
                <option value="Infraestrutura" ${projeto.categoria === 'Infraestrutura' ? 'selected' : ''}>Infraestrutura</option>
                <option value="Preservação de Conhecimento" ${projeto.categoria === 'Preservação de Conhecimento' ? 'selected' : ''}>Preservação de Conhecimento</option>
            </select>
        </div>
        
        <div class="form-group">
            <label for="descricao">Descrição *</label>
            <textarea id="descricao" name="descricao" rows="4" required>${projeto.descricao || ''}</textarea>
        </div>
        
        <div class="form-row">
            <div class="form-group">
                <label for="responsavel">Responsável *</label>
                <input type="text" id="responsavel" name="responsavel" value="${projeto.responsavel || ''}" required>
            </div>
            
            <div class="form-group">
                <label for="status">Status *</label>
                <select id="status" name="status" required>
                    <option value="ativo" ${projeto.status === 'ativo' ? 'selected' : ''}>Ativo</option>
                    <option value="concluido" ${projeto.status === 'concluido' ? 'selected' : ''}>Concluído</option>
                    <option value="pausado" ${projeto.status === 'pausado' ? 'selected' : ''}>Pausado</option>
                </select>
            </div>
        </div>
        
        <div class="form-actions">
            <button type="submit" class="btn">Salvar</button>
            <button type="button" class="btn btn-secondary" onclick="cancelarForm()">Cancelar</button>
        </div>
    </form>
`);

// ===================================
// COMPONENTES REUTILIZÁVEIS
// ===================================

// Componente de Loading Spinner
templateEngine.component('loadingSpinner', (props) => `
    <div class="loading-spinner ${props.size || ''}" style="${props.style || ''}">
        <div class="spinner"></div>
        ${props.text ? `<p>${props.text}</p>` : ''}
    </div>
`);

// Componente de Badge
templateEngine.component('badge', (props) => `
    <span class="badge badge-${props.type || 'primary'} ${props.className || ''}">
        ${props.text}
    </span>
`);

// Componente de Botão
templateEngine.component('button', (props) => `
    <button 
        class="btn ${props.variant ? 'btn-' + props.variant : ''} ${props.size ? 'btn-' + props.size : ''} ${props.className || ''}"
        ${props.onclick ? `onclick="${props.onclick}"` : ''}
        ${props.disabled ? 'disabled' : ''}
        ${props.type ? `type="${props.type}"` : 'type="button"'}
    >
        ${props.icon ? `<span class="icon">${props.icon}</span>` : ''}
        ${props.text}
    </button>
`);

// Exportar para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TemplateEngine;
}

