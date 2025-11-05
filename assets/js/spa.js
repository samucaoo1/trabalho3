// ===================================
// SISTEMA SPA (Single Page Application)
// Gerenciamento de rotas e navegação dinâmica
// ===================================

class SPA {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
        this.contentContainer = null;
        this.loadingElement = null;
        this.init();
    }

    /**
     * Inicializa o sistema SPA
     */
    init() {
        // Aguardar DOM estar pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    /**
     * Configuração inicial do SPA
     */
    setup() {
        // Criar container de conteúdo se não existir
        this.contentContainer = document.getElementById('spa-content');
        
        if (!this.contentContainer) {
            console.warn('SPA: Container #spa-content não encontrado. SPA desabilitado.');
            return;
        }

        // Criar elemento de loading
        this.createLoadingElement();

        // Interceptar cliques em links
        this.interceptLinks();

        // Gerenciar histórico do navegador
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.route) {
                this.navigateTo(e.state.route, false);
            }
        });

        // Carregar rota inicial
        const initialRoute = window.location.hash.slice(1) || '/';
        this.navigateTo(initialRoute, true);
    }

    /**
     * Cria elemento de loading
     */
    createLoadingElement() {
        this.loadingElement = document.createElement('div');
        this.loadingElement.className = 'spa-loading';
        this.loadingElement.innerHTML = `
            <div class="spinner"></div>
            <p>Carregando...</p>
        `;
        this.loadingElement.style.display = 'none';
        document.body.appendChild(this.loadingElement);
    }

    /**
     * Registra uma rota
     * @param {string} path - Caminho da rota
     * @param {Function} handler - Função que retorna o conteúdo HTML ou Promise
     */
    register(path, handler) {
        this.routes[path] = handler;
    }

    /**
     * Navega para uma rota
     * @param {string} route - Rota de destino
     * @param {boolean} pushState - Se deve adicionar ao histórico
     */
    async navigateTo(route, pushState = true) {
        // Verificar se a rota existe
        if (!this.routes[route]) {
            console.warn(`SPA: Rota "${route}" não encontrada`);
            route = '/404';
        }

        // Mostrar loading
        this.showLoading();

        try {
            // Executar handler da rota
            const content = await this.routes[route]();

            // Atualizar conteúdo
            if (this.contentContainer) {
                this.contentContainer.innerHTML = content;
                
                // Executar scripts inline se houver
                this.executeScripts(this.contentContainer);
            }

            // Atualizar histórico
            if (pushState) {
                window.history.pushState({ route }, '', `#${route}`);
            }

            // Atualizar rota atual
            this.currentRoute = route;

            // Scroll para o topo
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Disparar evento customizado
            window.dispatchEvent(new CustomEvent('spa:navigated', { 
                detail: { route } 
            }));

        } catch (error) {
            console.error('SPA: Erro ao navegar:', error);
            this.contentContainer.innerHTML = `
                <div class="error-message">
                    <h2>Erro ao carregar página</h2>
                    <p>${error.message}</p>
                </div>
            `;
        } finally {
            // Esconder loading
            this.hideLoading();
        }
    }

    /**
     * Intercepta cliques em links para navegação SPA
     */
    interceptLinks() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[data-spa-link]');
            
            if (link) {
                e.preventDefault();
                const route = link.getAttribute('href') || link.getAttribute('data-route');
                if (route) {
                    this.navigateTo(route);
                }
            }
        });
    }

    /**
     * Executa scripts dentro de um container
     * @param {HTMLElement} container 
     */
    executeScripts(container) {
        const scripts = container.querySelectorAll('script');
        scripts.forEach(script => {
            const newScript = document.createElement('script');
            newScript.textContent = script.textContent;
            script.parentNode.replaceChild(newScript, script);
        });
    }

    /**
     * Mostra indicador de loading
     */
    showLoading() {
        if (this.loadingElement) {
            this.loadingElement.style.display = 'flex';
        }
    }

    /**
     * Esconde indicador de loading
     */
    hideLoading() {
        if (this.loadingElement) {
            this.loadingElement.style.display = 'none';
        }
    }

    /**
     * Obtém a rota atual
     */
    getCurrentRoute() {
        return this.currentRoute;
    }

    /**
     * Volta para a página anterior
     */
    back() {
        window.history.back();
    }

    /**
     * Avança para a próxima página
     */
    forward() {
        window.history.forward();
    }
}

// Criar instância global do SPA
window.spa = new SPA();

// Exportar para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SPA;
}

