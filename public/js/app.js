// Aplicação Principal - Sistema de Monitoramento de Temperatura
class App {
    constructor() {
        this.currentPage = 'dashboard';
        this.isInitialized = false;
        this.refreshInterval = null;
        this.autoRefreshEnabled = true;
        this.refreshIntervalMs = 30000; // 30 segundos
    }

    async init() {
        try {
            console.log('🚀 Inicializando Sistema de Monitoramento de Temperatura...');

            // Verificar conectividade com a API
            const isConnected = await API.verificarConexao();
            if (!isConnected) {
                this.showError('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
                return;
            }

            // Inicializar Socket.IO
            inicializarSocket();

            // Carregar dados iniciais
            await this.carregarDadosIniciais();

            // Configurar navegação
            this.setupNavigation();

            // Configurar auto-refresh
            this.setupAutoRefresh();

            // Configurar handlers de eventos
            this.setupEventHandlers();

            // Restaurar estado da sidebar
            this.restoreSidebarState();

            // Marcar como inicializado
            this.isInitialized = true;

            console.log('✅ Sistema inicializado com sucesso!');

            // Mostrar dashboard inicial
            this.showDashboard();

        } catch (error) {
            console.error('❌ Erro na inicialização:', error);
            this.showError('Erro ao inicializar o sistema: ' + error.message);
        }
    }

    async carregarDadosIniciais() {
        try {
            const dados = await API.carregarDadosIniciais();

            // Atualizar cards de overview
            this.atualizarOverviewCards(dados.overview);

            // Renderizar cards de temperatura
            TemperatureCard.renderAll(dados.temperaturas);

            // Renderizar alertas recentes
            AlertCard.renderAll(dados.alertas);

            console.log('📊 Dados iniciais carregados com sucesso');
        } catch (error) {
            console.error('Erro ao carregar dados iniciais:', error);
            throw error;
        }
    }

    atualizarOverviewCards(overview) {
        const totalSalasEl = document.getElementById('totalSalas');
        const tempMediaEl = document.getElementById('tempMedia');
        const alertasAtivosEl = document.getElementById('alertasAtivos');
        const ultimaAtualizacaoEl = document.getElementById('ultimaAtualizacao');

        if (totalSalasEl) totalSalasEl.textContent = overview.total_salas || 0;
        if (tempMediaEl) tempMediaEl.textContent = overview.temperatura_media_geral ? overview.temperatura_media_geral.toFixed(1) + '°C' : 'N/A';
        if (alertasAtivosEl) alertasAtivosEl.textContent = 'Calculando...';
        if (ultimaAtualizacaoEl) ultimaAtualizacaoEl.textContent = 'Agora';

        // Buscar alertas ativos
        API.getAlertasRecentes(1).then(response => {
            if (alertasAtivosEl) {
                alertasAtivosEl.textContent = response.data.length;
            }
        }).catch(error => {
            console.error('Erro ao buscar alertas ativos:', error);
            if (alertasAtivosEl) alertasAtivosEl.textContent = '0';
        });
    }

    setupNavigation() {
        // Configurar links de navegação
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();

                // Remover classe active de todos os links
                navLinks.forEach(l => l.classList.remove('active'));

                // Adicionar classe active ao link clicado
                link.classList.add('active');

                // Determinar qual página mostrar
                const href = link.getAttribute('href');
                if (href === '#') {
                    const onclick = link.getAttribute('onclick');
                    if (onclick) {
                        // Executar função onclick
                        eval(onclick);
                    }
                }
            });
        });
    }

    setupAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }

        if (this.autoRefreshEnabled) {
            this.refreshInterval = setInterval(() => {
                this.refreshData();
            }, this.refreshIntervalMs);
        }
    }

    setupEventHandlers() {
        // Handler para botão de refresh
        const refreshBtn = document.querySelector('button[onclick="refreshData()"]');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.refreshData();
            });
        }

        // Handler para mudança de página
        window.addEventListener('popstate', (event) => {
            this.handlePageChange(event.state?.page || 'dashboard');
        });

        // Handler para teclas de atalho
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Handler para sidebar toggle
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.toggleSidebar();
            }
        });
    }

    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + R para refresh
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            this.refreshData();
        }

        // F5 para refresh
        if (e.key === 'F5') {
            e.preventDefault();
            this.refreshData();
        }

        // Ctrl/Cmd + 1-4 para navegação
        if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '4') {
            e.preventDefault();
            const pages = ['dashboard', 'salas', 'alertas', 'graficos'];
            const pageIndex = parseInt(e.key) - 1;
            if (pages[pageIndex]) {
                this.navigateToPage(pages[pageIndex]);
            }
        }
    }

    async refreshData() {
        if (!this.isInitialized) return;

        try {
            console.log('🔄 Atualizando dados...');

            const dados = await API.carregarDadosDashboard();

            // Atualizar dados baseado na página atual
            switch (this.currentPage) {
                case 'dashboard':
                    this.atualizarOverviewCards(dados.overview);
                    TemperatureCard.renderAll(dados.temperaturas);
                    AlertCard.renderAll(dados.alertas);
                    break;
                case 'salas':
                    if (typeof window.atualizarPaginaSalas === 'function') {
                        window.atualizarPaginaSalas();
                    }
                    break;
                case 'alertas':
                    if (typeof window.atualizarPaginaAlertas === 'function') {
                        window.atualizarPaginaAlertas();
                    }
                    break;
                case 'graficos':
                    if (typeof window.atualizarPaginaGraficos === 'function') {
                        window.atualizarPaginaGraficos();
                    }
                    break;
            }

            // Atualizar timestamp da última atualização
            const ultimaAtualizacaoEl = document.getElementById('ultimaAtualizacao');
            if (ultimaAtualizacaoEl) {
                ultimaAtualizacaoEl.textContent = 'Agora';
            }

            console.log('✅ Dados atualizados com sucesso');
        } catch (error) {
            console.error('❌ Erro ao atualizar dados:', error);
            this.showError('Erro ao atualizar dados: ' + error.message);
        }
    }

    navigateToPage(page) {
        this.currentPage = page;

        // Atualizar URL sem recarregar a página
        const url = new URL(window.location);
        url.searchParams.set('page', page);
        window.history.pushState({ page }, '', url);

        // Mostrar página correspondente
        this.handlePageChange(page);
    }

    handlePageChange(page) {
        this.currentPage = page;

        // Esconder todas as seções
        document.getElementById('dashboardContent').style.display = 'none';
        document.getElementById('outrasSecoes').style.display = 'none';

        // Mostrar seção correspondente
        switch (page) {
            case 'dashboard':
                document.getElementById('dashboardContent').style.display = 'block';
                this.showDashboard();
                break;
            case 'salas':
                document.getElementById('outrasSecoes').style.display = 'block';
                this.showSalas();
                break;
            case 'alertas':
                document.getElementById('outrasSecoes').style.display = 'block';
                this.showAlertas();
                break;
            case 'graficos':
                document.getElementById('outrasSecoes').style.display = 'block';
                this.showGraficos();
                break;
            case 'configuracoes':
                document.getElementById('outrasSecoes').style.display = 'block';
                this.showConfiguracoes();
                break;
            default:
                document.getElementById('dashboardContent').style.display = 'block';
                this.showDashboard();
        }
    }

    showDashboard() {
        // Não chamar navigateToPage para evitar recursão
        // Apenas carregar dados do dashboard
        this.refreshData();
    }

    showSalas() {
        // Renderizar página de salas
        if (typeof window.renderPaginaSalas === 'function') {
            window.renderPaginaSalas();
        } else {
            this.showError('Componente de salas não encontrado');
        }
    }

    showAlertas() {
        // Renderizar página de alertas
        if (typeof window.renderPaginaAlertas === 'function') {
            window.renderPaginaAlertas();
        } else {
            this.showError('Componente de alertas não encontrado');
        }
    }

    showGraficos() {
        // Carregar dados para gráficos
        API.getSalas().then(response => {
            const salas = response.data;
            // Renderizar página de gráficos
            if (typeof window.renderPaginaGraficos === 'function') {
                window.renderPaginaGraficos(salas);
            }
        }).catch(error => {
            console.error('Erro ao carregar dados para gráficos:', error);
            this.showError('Erro ao carregar dados para gráficos: ' + error.message);
        });
    }

    showConfiguracoes() {
        // Renderizar página de configurações
        if (typeof window.renderPaginaConfiguracoes === 'function') {
            window.renderPaginaConfiguracoes();
        } else {
            this.showError('Componente de configurações não encontrado');
        }
    }

    showError(message) {
        const statusBar = document.getElementById('statusBar');
        if (statusBar) {
            statusBar.className = 'alert alert-danger d-flex align-items-center';
            statusBar.innerHTML = `
                <i class="bi bi-exclamation-triangle me-2"></i>
                <div>
                    <strong>Erro:</strong> ${message}
                </div>
            `;
        }

        // Mostrar toast de erro
        this.showToast('Erro', message, 'danger');
    }

    showSuccess(message) {
        this.showToast('Sucesso', message, 'success');
    }

    showWarning(message) {
        this.showToast('Aviso', message, 'warning');
    }

    showInfo(message) {
        this.showToast('Informação', message, 'info');
    }

    showToast(title, message, type = 'info') {
        // Criar toast dinamicamente
        const toastContainer = document.getElementById('toastContainer') || this.createToastContainer();

        const toastId = 'toast-' + Date.now();
        const toastHTML = `
            <div class="toast" id="${toastId}" role="alert">
                <div class="toast-header">
                    <i class="bi bi-${this.getToastIcon(type)} text-${type} me-2"></i>
                    <strong class="me-auto">${title}</strong>
                    <small>Agora</small>
                    <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
                </div>
                <div class="toast-body">
                    ${message}
                </div>
            </div>
        `;

        toastContainer.insertAdjacentHTML('beforeend', toastHTML);

        const toastElement = document.getElementById(toastId);
        const toast = new bootstrap.Toast(toastElement);
        toast.show();

        // Remover toast após ser fechado
        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });
    }

    createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
        return container;
    }

    getToastIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-triangle',
            warning: 'exclamation-triangle',
            info: 'info-circle',
            danger: 'x-circle'
        };
        return icons[type] || 'info-circle';
    }

    toggleAutoRefresh() {
        this.autoRefreshEnabled = !this.autoRefreshEnabled;
        this.setupAutoRefresh();

        const message = this.autoRefreshEnabled
            ? 'Auto-refresh ativado'
            : 'Auto-refresh desativado';
        this.showInfo(message);
    }

    setRefreshInterval(intervalMs) {
        this.refreshIntervalMs = intervalMs;
        this.setupAutoRefresh();
        this.showInfo(`Intervalo de atualização alterado para ${intervalMs / 1000} segundos`);
    }

    destroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }

        if (socketManager) {
            socketManager.disconnect();
        }

        console.log('🛑 Aplicação finalizada');
    }

    // Função para toggle da sidebar
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.querySelector('.main-content');
        const toggleBtn = document.getElementById('sidebarToggle');

        if (sidebar) {
            sidebar.classList.toggle('collapsed');

            // Atualizar ícone do botão
            if (toggleBtn) {
                const icon = toggleBtn.querySelector('i');
                if (sidebar.classList.contains('collapsed')) {
                    icon.className = 'bi bi-list';
                    document.body.classList.add('sidebar-collapsed');
                } else {
                    icon.className = 'bi bi-x';
                    document.body.classList.remove('sidebar-collapsed');
                }
            }

            // Salvar estado no localStorage
            localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
        }
    }

    // Função para restaurar estado da sidebar
    restoreSidebarState() {
        const sidebar = document.getElementById('sidebar');
        const toggleBtn = document.getElementById('sidebarToggle');

        if (sidebar) {
            const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
            if (isCollapsed) {
                sidebar.classList.add('collapsed');
                if (toggleBtn) {
                    const icon = toggleBtn.querySelector('i');
                    icon.className = 'bi bi-list';
                }
                document.body.classList.add('sidebar-collapsed');
            } else {
                document.body.classList.remove('sidebar-collapsed');
            }
        }
    }
}

// Criar instância global da aplicação
const app = new App();

// Funções globais para navegação
function showDashboard() {
    app.navigateToPage('dashboard');
}

function showSalas() {
    app.navigateToPage('salas');
}

function showAlertas() {
    app.navigateToPage('alertas');
}

function showGraficos() {
    app.navigateToPage('graficos');
}

function showConfiguracoes() {
    app.navigateToPage('configuracoes');
}

function refreshData() {
    app.refreshData();
}

function showConfiguracoes() {
    app.showInfo('Funcionalidade de configurações será implementada em breve.');
}

function showSimulador() {
    app.showInfo('Simulador de sensores disponível via linha de comando: npm run simulate-sensors');
}

// Função global para toggle da sidebar
function toggleSidebar() {
    app.toggleSidebar();
}



// Função global para atualizar dashboard
window.atualizarDashboard = function () {
    app.refreshData();
};

// Inicializar aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});

// Limpar recursos quando a página for fechada
window.addEventListener('beforeunload', () => {
    app.destroy();
});

// Exportar para uso global
window.app = app; 