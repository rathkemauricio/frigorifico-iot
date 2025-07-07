// Componente da Página de Configurações
class ConfiguracoesPage {
    constructor() {
        this.configuracoes = {
            autoRefresh: true,
            refreshInterval: 30000,
            alertas: {
                email: false,
                som: true,
                popup: true
            },
            graficos: {
                tema: 'light',
                animacoes: true,
                pontosMaximos: 100
            },
            sistema: {
                timezone: 'America/Sao_Paulo',
                idioma: 'pt-BR',
                formatoData: 'DD/MM/YYYY HH:mm'
            }
        };
    }

    async render() {
        console.log('⚙️ Renderizando página de Configurações...');

        const container = document.getElementById('outrasSecoes');
        if (!container) {
            console.error('Container para configurações não encontrado');
            return;
        }

        // Carregar configurações salvas
        this.carregarConfiguracoes();

        container.innerHTML = this.getHTML();
        this.setupEventHandlers();
        this.aplicarConfiguracoes();
    }

    getHTML() {
        return `
            <div class="row">
                <div class="col-12">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h2>
                            <i class="bi bi-gear text-primary"></i>
                            Configurações do Sistema
                        </h2>
                        <div class="btn-group">
                            <button class="btn btn-outline-secondary" onclick="configuracoesPage.resetarConfiguracoes()">
                                <i class="bi bi-arrow-clockwise me-2"></i>
                                Restaurar Padrão
                            </button>
                            <button class="btn btn-primary" onclick="configuracoesPage.salvarConfiguracoes()">
                                <i class="bi bi-check-circle me-2"></i>
                                Salvar Configurações
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Configurações Gerais -->
            <div class="row mb-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0">
                                <i class="bi bi-sliders me-2"></i>
                                Configurações Gerais
                            </h5>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <div class="form-check form-switch">
                                            <input class="form-check-input" type="checkbox" id="autoRefresh" checked>
                                            <label class="form-check-label" for="autoRefresh">
                                                Atualização Automática
                                            </label>
                                        </div>
                                        <small class="text-muted">Atualiza dados automaticamente em intervalos regulares</small>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="refreshInterval" class="form-label">Intervalo de Atualização</label>
                                        <select class="form-select" id="refreshInterval">
                                            <option value="10000">10 segundos</option>
                                            <option value="30000" selected>30 segundos</option>
                                            <option value="60000">1 minuto</option>
                                            <option value="300000">5 minutos</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="timezone" class="form-label">Fuso Horário</label>
                                        <select class="form-select" id="timezone">
                                            <option value="America/Sao_Paulo" selected>Brasília (GMT-3)</option>
                                            <option value="America/Manaus">Manaus (GMT-4)</option>
                                            <option value="America/Belem">Belém (GMT-3)</option>
                                            <option value="America/Fortaleza">Fortaleza (GMT-3)</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="idioma" class="form-label">Idioma</label>
                                        <select class="form-select" id="idioma">
                                            <option value="pt-BR" selected>Português (Brasil)</option>
                                            <option value="en-US">English (US)</option>
                                            <option value="es-ES">Español</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Configurações de Alertas -->
            <div class="row mb-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0">
                                <i class="bi bi-bell me-2"></i>
                                Configurações de Alertas
                            </h5>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <div class="form-check form-switch">
                                            <input class="form-check-input" type="checkbox" id="alertasEmail">
                                            <label class="form-check-label" for="alertasEmail">
                                                Notificações por Email
                                            </label>
                                        </div>
                                        <small class="text-muted">Envia alertas por email</small>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <div class="form-check form-switch">
                                            <input class="form-check-input" type="checkbox" id="alertasSom" checked>
                                            <label class="form-check-label" for="alertasSom">
                                                Som de Alerta
                                            </label>
                                        </div>
                                        <small class="text-muted">Reproduz som quando há alertas</small>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <div class="form-check form-switch">
                                            <input class="form-check-input" type="checkbox" id="alertasPopup" checked>
                                            <label class="form-check-label" for="alertasPopup">
                                                Pop-ups de Alerta
                                            </label>
                                        </div>
                                        <small class="text-muted">Mostra pop-ups para alertas críticos</small>
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="limiteAlertas" class="form-label">Limite de Alertas na Tela</label>
                                        <select class="form-select" id="limiteAlertas">
                                            <option value="5">5 alertas</option>
                                            <option value="10" selected>10 alertas</option>
                                            <option value="20">20 alertas</option>
                                            <option value="50">50 alertas</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="tempoAlerta" class="form-label">Tempo de Exibição (segundos)</label>
                                        <select class="form-select" id="tempoAlerta">
                                            <option value="3">3 segundos</option>
                                            <option value="5" selected>5 segundos</option>
                                            <option value="10">10 segundos</option>
                                            <option value="0">Até fechar manualmente</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Configurações de Gráficos -->
            <div class="row mb-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0">
                                <i class="bi bi-graph-up me-2"></i>
                                Configurações de Gráficos
                            </h5>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <label for="temaGrafico" class="form-label">Tema dos Gráficos</label>
                                        <select class="form-select" id="temaGrafico">
                                            <option value="light" selected>Claro</option>
                                            <option value="dark">Escuro</option>
                                            <option value="auto">Automático</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <div class="form-check form-switch">
                                            <input class="form-check-input" type="checkbox" id="animacoesGrafico" checked>
                                            <label class="form-check-label" for="animacoesGrafico">
                                                Animações
                                            </label>
                                        </div>
                                        <small class="text-muted">Habilita animações nos gráficos</small>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <label for="pontosMaximos" class="form-label">Máximo de Pontos</label>
                                        <select class="form-select" id="pontosMaximos">
                                            <option value="50">50 pontos</option>
                                            <option value="100" selected>100 pontos</option>
                                            <option value="200">200 pontos</option>
                                            <option value="500">500 pontos</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="periodoGrafico" class="form-label">Período Padrão</label>
                                        <select class="form-select" id="periodoGrafico">
                                            <option value="1">1 hora</option>
                                            <option value="6" selected>6 horas</option>
                                            <option value="24">24 horas</option>
                                            <option value="168">7 dias</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <div class="form-check form-switch">
                                            <input class="form-check-input" type="checkbox" id="linhasLimite" checked>
                                            <label class="form-check-label" for="linhasLimite">
                                                Mostrar Linhas de Limite
                                            </label>
                                        </div>
                                        <small class="text-muted">Exibe linhas de temperatura mínima e máxima</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Configurações de Sistema -->
            <div class="row mb-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0">
                                <i class="bi bi-cpu me-2"></i>
                                Configurações de Sistema
                            </h5>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="formatoData" class="form-label">Formato de Data/Hora</label>
                                        <select class="form-select" id="formatoData">
                                            <option value="DD/MM/YYYY HH:mm" selected>DD/MM/YYYY HH:mm</option>
                                            <option value="MM/DD/YYYY HH:mm">MM/DD/YYYY HH:mm</option>
                                            <option value="YYYY-MM-DD HH:mm">YYYY-MM-DD HH:mm</option>
                                            <option value="DD/MM/YYYY HH:mm:ss">DD/MM/YYYY HH:mm:ss</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="unidadeTemperatura" class="form-label">Unidade de Temperatura</label>
                                        <select class="form-select" id="unidadeTemperatura">
                                            <option value="C" selected>Celsius (°C)</option>
                                            <option value="F">Fahrenheit (°F)</option>
                                            <option value="K">Kelvin (K)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <div class="form-check form-switch">
                                            <input class="form-check-input" type="checkbox" id="logDetalhado">
                                            <label class="form-check-label" for="logDetalhado">
                                                Log Detalhado
                                            </label>
                                        </div>
                                        <small class="text-muted">Registra logs detalhados do sistema</small>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <div class="form-check form-switch">
                                            <input class="form-check-input" type="checkbox" id="backupAutomatico" checked>
                                            <label class="form-check-label" for="backupAutomatico">
                                                Backup Automático
                                            </label>
                                        </div>
                                        <small class="text-muted">Faz backup automático dos dados</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Informações do Sistema -->
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0">
                                <i class="bi bi-info-circle me-2"></i>
                                Informações do Sistema
                            </h5>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <table class="table table-sm">
                                        <tr><td><strong>Versão:</strong></td><td>1.0.0</td></tr>
                                        <tr><td><strong>Última Atualização:</strong></td><td>${new Date().toLocaleDateString('pt-BR')}</td></tr>
                                        <tr><td><strong>Status:</strong></td><td><span class="badge bg-success">Online</span></td></tr>
                                        <tr><td><strong>Banco de Dados:</strong></td><td>SQLite</td></tr>
                                    </table>
                                </div>
                                <div class="col-md-6">
                                    <table class="table table-sm">
                                        <tr><td><strong>Total de Salas:</strong></td><td id="infoTotalSalas">-</td></tr>
                                        <tr><td><strong>Total de Leituras:</strong></td><td id="infoTotalLeituras">-</td></tr>
                                        <tr><td><strong>Alertas Ativos:</strong></td><td id="infoAlertasAtivos">-</td></tr>
                                        <tr><td><strong>Uptime:</strong></td><td id="infoUptime">-</td></tr>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventHandlers() {
        // Carregar informações do sistema
        this.carregarInformacoesSistema();

        // Configurar listeners para mudanças
        document.getElementById('autoRefresh').addEventListener('change', (e) => {
            this.configuracoes.autoRefresh = e.target.checked;
            this.aplicarConfiguracoes();
        });

        document.getElementById('refreshInterval').addEventListener('change', (e) => {
            this.configuracoes.refreshInterval = parseInt(e.target.value);
            this.aplicarConfiguracoes();
        });
    }

    async carregarInformacoesSistema() {
        try {
            // Carregar estatísticas do sistema
            const [overview, alertas] = await Promise.all([
                API.getOverview(),
                API.getAlertasRecentes(1)
            ]);

            document.getElementById('infoTotalSalas').textContent = overview.data?.total_salas || 0;
            document.getElementById('infoTotalLeituras').textContent = overview.data?.total_leituras || 0;
            document.getElementById('infoAlertasAtivos').textContent = alertas.data?.length || 0;
            document.getElementById('infoUptime').textContent = this.calcularUptime();

        } catch (error) {
            console.error('Erro ao carregar informações do sistema:', error);
        }
    }

    calcularUptime() {
        // Simular uptime - em produção seria obtido do servidor
        const inicio = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 horas atrás
        const agora = new Date();
        const diff = agora - inicio;
        const horas = Math.floor(diff / (1000 * 60 * 60));
        const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${horas}h ${minutos}m`;
    }

    carregarConfiguracoes() {
        const saved = localStorage.getItem('sistemaConfiguracoes');
        if (saved) {
            try {
                this.configuracoes = { ...this.configuracoes, ...JSON.parse(saved) };
            } catch (error) {
                console.error('Erro ao carregar configurações:', error);
            }
        }
    }

    aplicarConfiguracoes() {
        // Aplicar configurações aos elementos da interface
        document.getElementById('autoRefresh').checked = this.configuracoes.autoRefresh;
        document.getElementById('refreshInterval').value = this.configuracoes.refreshInterval;
        document.getElementById('alertasEmail').checked = this.configuracoes.alertas.email;
        document.getElementById('alertasSom').checked = this.configuracoes.alertas.som;
        document.getElementById('alertasPopup').checked = this.configuracoes.alertas.popup;
        document.getElementById('temaGrafico').value = this.configuracoes.graficos.tema;
        document.getElementById('animacoesGrafico').checked = this.configuracoes.graficos.animacoes;
        document.getElementById('pontosMaximos').value = this.configuracoes.graficos.pontosMaximos;
        document.getElementById('timezone').value = this.configuracoes.sistema.timezone;
        document.getElementById('idioma').value = this.configuracoes.sistema.idioma;
        document.getElementById('formatoData').value = this.configuracoes.sistema.formatoData;

        // Aplicar configurações ao sistema
        if (window.app) {
            app.autoRefreshEnabled = this.configuracoes.autoRefresh;
            app.refreshIntervalMs = this.configuracoes.refreshInterval;
            app.setupAutoRefresh();
        }
    }

    salvarConfiguracoes() {
        try {
            // Coletar configurações dos elementos
            this.configuracoes.autoRefresh = document.getElementById('autoRefresh').checked;
            this.configuracoes.refreshInterval = parseInt(document.getElementById('refreshInterval').value);
            this.configuracoes.alertas.email = document.getElementById('alertasEmail').checked;
            this.configuracoes.alertas.som = document.getElementById('alertasSom').checked;
            this.configuracoes.alertas.popup = document.getElementById('alertasPopup').checked;
            this.configuracoes.graficos.tema = document.getElementById('temaGrafico').value;
            this.configuracoes.graficos.animacoes = document.getElementById('animacoesGrafico').checked;
            this.configuracoes.graficos.pontosMaximos = parseInt(document.getElementById('pontosMaximos').value);
            this.configuracoes.sistema.timezone = document.getElementById('timezone').value;
            this.configuracoes.sistema.idioma = document.getElementById('idioma').value;
            this.configuracoes.sistema.formatoData = document.getElementById('formatoData').value;

            // Salvar no localStorage
            localStorage.setItem('sistemaConfiguracoes', JSON.stringify(this.configuracoes));

            // Aplicar configurações
            this.aplicarConfiguracoes();

            app.showSuccess('Configurações salvas com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
            app.showError('Erro ao salvar configurações: ' + error.message);
        }
    }

    resetarConfiguracoes() {
        if (confirm('Tem certeza que deseja restaurar as configurações padrão? Todas as configurações personalizadas serão perdidas.')) {
            try {
                localStorage.removeItem('sistemaConfiguracoes');
                this.configuracoes = {
                    autoRefresh: true,
                    refreshInterval: 30000,
                    alertas: {
                        email: false,
                        som: true,
                        popup: true
                    },
                    graficos: {
                        tema: 'light',
                        animacoes: true,
                        pontosMaximos: 100
                    },
                    sistema: {
                        timezone: 'America/Sao_Paulo',
                        idioma: 'pt-BR',
                        formatoData: 'DD/MM/YYYY HH:mm'
                    }
                };

                this.aplicarConfiguracoes();
                app.showSuccess('Configurações restauradas para o padrão!');
            } catch (error) {
                console.error('Erro ao resetar configurações:', error);
                app.showError('Erro ao resetar configurações: ' + error.message);
            }
        }
    }
}

// Instância global
window.configuracoesPage = new ConfiguracoesPage();

// Função global para renderizar página de configurações
window.renderPaginaConfiguracoes = function () {
    configuracoesPage.render();
}; 