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
            },
            esp32: {
                apiKey: 'esp32_temp_monitor_2024',
                intervaloLeitura: 30000,
                maxTentativas: 3,
                timeout: 10000,
                habilitarNTP: true,
                habilitarDisplay: true,
                habilitarLED: true,
                logDetalhado: false
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

            <!-- Configurações ESP32 -->
            <div class="row mb-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">
                                <i class="bi bi-wifi me-2"></i>
                                Configurações ESP32
                            </h5>
                            <div class="btn-group">
                                <button class="btn btn-sm btn-outline-primary" onclick="configuracoesPage.testarConexaoESP32()">
                                    <i class="bi bi-wifi me-1"></i>
                                    Testar Conexão
                                </button>
                                <button class="btn btn-sm btn-outline-success" onclick="configuracoesPage.gerarCodigoESP32()">
                                    <i class="bi bi-code-slash me-1"></i>
                                    Gerar Código
                                </button>
                                <button class="btn btn-sm btn-outline-info" onclick="configuracoesPage.mostrarQRCode()">
                                    <i class="bi bi-qr-code me-1"></i>
                                    QR Code
                                </button>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="esp32ApiKey" class="form-label">Chave de API ESP32</label>
                                        <div class="input-group">
                                            <input type="text" class="form-control" id="esp32ApiKey" value="esp32_temp_monitor_2024">
                                            <button class="btn btn-outline-secondary" type="button" onclick="configuracoesPage.gerarNovaChaveAPI()">
                                                <i class="bi bi-arrow-clockwise"></i>
                                            </button>
                                        </div>
                                        <small class="text-muted">Chave de autenticação para dispositivos ESP32</small>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="esp32Intervalo" class="form-label">Intervalo de Leitura (ms)</label>
                                        <select class="form-select" id="esp32Intervalo">
                                            <option value="10000">10 segundos</option>
                                            <option value="30000" selected>30 segundos</option>
                                            <option value="60000">1 minuto</option>
                                            <option value="300000">5 minutos</option>
                                        </select>
                                        <small class="text-muted">Intervalo entre leituras de temperatura</small>
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="esp32MaxTentativas" class="form-label">Máximo de Tentativas</label>
                                        <select class="form-select" id="esp32MaxTentativas">
                                            <option value="1">1 tentativa</option>
                                            <option value="3" selected>3 tentativas</option>
                                            <option value="5">5 tentativas</option>
                                            <option value="10">10 tentativas</option>
                                        </select>
                                        <small class="text-muted">Tentativas de reconexão em caso de falha</small>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="esp32Timeout" class="form-label">Timeout (ms)</label>
                                        <select class="form-select" id="esp32Timeout">
                                            <option value="5000">5 segundos</option>
                                            <option value="10000" selected>10 segundos</option>
                                            <option value="15000">15 segundos</option>
                                            <option value="30000">30 segundos</option>
                                        </select>
                                        <small class="text-muted">Tempo limite para conexões HTTP</small>
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <div class="form-check form-switch">
                                            <input class="form-check-input" type="checkbox" id="esp32NTP" checked>
                                            <label class="form-check-label" for="esp32NTP">
                                                Sincronização NTP
                                            </label>
                                        </div>
                                        <small class="text-muted">Sincronizar tempo via NTP</small>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <div class="form-check form-switch">
                                            <input class="form-check-input" type="checkbox" id="esp32Display" checked>
                                            <label class="form-check-label" for="esp32Display">
                                                Display OLED
                                            </label>
                                        </div>
                                        <small class="text-muted">Habilitar display OLED</small>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <div class="form-check form-switch">
                                            <input class="form-check-input" type="checkbox" id="esp32LED" checked>
                                            <label class="form-check-label" for="esp32LED">
                                                LED de Status
                                            </label>
                                        </div>
                                        <small class="text-muted">Habilitar LED indicador</small>
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-12">
                                    <div class="mb-3">
                                        <div class="form-check form-switch">
                                            <input class="form-check-input" type="checkbox" id="esp32LogDetalhado">
                                            <label class="form-check-label" for="esp32LogDetalhado">
                                                Log Detalhado ESP32
                                            </label>
                                        </div>
                                        <small class="text-muted">Registrar logs detalhados das operações ESP32</small>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Status dos Dispositivos ESP32 -->
                            <div class="row mt-3">
                                <div class="col-12">
                                    <h6 class="text-muted mb-3">
                                        <i class="bi bi-device-hdd me-2"></i>
                                        Status dos Dispositivos
                                    </h6>
                                    <div id="esp32StatusContainer">
                                        <div class="text-center text-muted">
                                            <i class="bi bi-hourglass-split"></i>
                                            Carregando status dos dispositivos...
                                        </div>
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

        // Aplicar configurações ESP32
        if (this.configuracoes.esp32) {
            document.getElementById('esp32ApiKey').value = this.configuracoes.esp32.apiKey;
            document.getElementById('esp32Intervalo').value = this.configuracoes.esp32.intervaloLeitura;
            document.getElementById('esp32MaxTentativas').value = this.configuracoes.esp32.maxTentativas;
            document.getElementById('esp32Timeout').value = this.configuracoes.esp32.timeout;
            document.getElementById('esp32NTP').checked = this.configuracoes.esp32.habilitarNTP;
            document.getElementById('esp32Display').checked = this.configuracoes.esp32.habilitarDisplay;
            document.getElementById('esp32LED').checked = this.configuracoes.esp32.habilitarLED;
            document.getElementById('esp32LogDetalhado').checked = this.configuracoes.esp32.logDetalhado;
        }

        // Aplicar configurações ao sistema
        if (window.app) {
            app.autoRefreshEnabled = this.configuracoes.autoRefresh;
            app.refreshIntervalMs = this.configuracoes.refreshInterval;
            app.setupAutoRefresh();
        }

        // Carregar status ESP32
        this.carregarStatusESP32();
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
            this.configuracoes.alertas.animacoes = document.getElementById('animacoesGrafico').checked;
            this.configuracoes.graficos.pontosMaximos = parseInt(document.getElementById('pontosMaximos').value);
            this.configuracoes.sistema.timezone = document.getElementById('timezone').value;
            this.configuracoes.sistema.idioma = document.getElementById('idioma').value;
            this.configuracoes.sistema.formatoData = document.getElementById('formatoData').value;

            // Coletar configurações ESP32
            this.configuracoes.esp32.apiKey = document.getElementById('esp32ApiKey').value;
            this.configuracoes.esp32.intervaloLeitura = parseInt(document.getElementById('esp32Intervalo').value);
            this.configuracoes.esp32.maxTentativas = parseInt(document.getElementById('esp32MaxTentativas').value);
            this.configuracoes.esp32.timeout = parseInt(document.getElementById('esp32Timeout').value);
            this.configuracoes.esp32.habilitarNTP = document.getElementById('esp32NTP').checked;
            this.configuracoes.esp32.habilitarDisplay = document.getElementById('esp32Display').checked;
            this.configuracoes.esp32.habilitarLED = document.getElementById('esp32LED').checked;
            this.configuracoes.esp32.logDetalhado = document.getElementById('esp32LogDetalhado').checked;

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
                    },
                    esp32: {
                        apiKey: 'esp32_temp_monitor_2024',
                        intervaloLeitura: 30000,
                        maxTentativas: 3,
                        timeout: 10000,
                        habilitarNTP: true,
                        habilitarDisplay: true,
                        habilitarLED: true,
                        logDetalhado: false
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

    // ========================================
    // FUNÇÕES ESP32
    // ========================================

    async testarConexaoESP32() {
        try {
            const apiKey = document.getElementById('esp32ApiKey').value;
            const response = await fetch(`/api/esp32/status?api_key=${apiKey}`);

            if (response.ok) {
                const data = await response.json();
                app.showSuccess('✅ Conexão ESP32 OK: ' + data.message);
            } else {
                app.showError('❌ Erro na conexão ESP32: ' + response.status);
            }
        } catch (error) {
            console.error('Erro ao testar conexão ESP32:', error);
            app.showError('Erro ao testar conexão ESP32: ' + error.message);
        }
    }

    gerarNovaChaveAPI() {
        const novaChave = 'esp32_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
        document.getElementById('esp32ApiKey').value = novaChave;
        this.configuracoes.esp32.apiKey = novaChave;
        app.showSuccess('Nova chave de API gerada!');
    }

    async gerarCodigoESP32() {
        try {
            const config = this.obterConfiguracoesESP32();
            const codigo = this.gerarCodigoArduino(config);

            // Criar modal com o código
            const modal = document.createElement('div');
            modal.className = 'modal fade';
            modal.id = 'codigoESP32Modal';
            modal.innerHTML = `
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="bi bi-code-slash me-2"></i>
                                Código ESP32 Gerado
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <div class="btn-group">
                                    <button class="btn btn-sm btn-outline-primary" onclick="configuracoesPage.copiarCodigo()">
                                        <i class="bi bi-clipboard me-1"></i>
                                        Copiar Código
                                    </button>
                                    <button class="btn btn-sm btn-outline-success" onclick="configuracoesPage.downloadCodigo()">
                                        <i class="bi bi-download me-1"></i>
                                        Download
                                    </button>
                                </div>
                            </div>
                            <pre><code class="language-cpp">${codigo}</code></pre>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            const modalInstance = new bootstrap.Modal(modal);
            modalInstance.show();

            // Remover modal após fechar
            modal.addEventListener('hidden.bs.modal', () => {
                document.body.removeChild(modal);
            });

        } catch (error) {
            console.error('Erro ao gerar código ESP32:', error);
            app.showError('Erro ao gerar código: ' + error.message);
        }
    }

    obterConfiguracoesESP32() {
        return {
            apiKey: document.getElementById('esp32ApiKey').value,
            intervaloLeitura: parseInt(document.getElementById('esp32Intervalo').value),
            maxTentativas: parseInt(document.getElementById('esp32MaxTentativas').value),
            timeout: parseInt(document.getElementById('esp32Timeout').value),
            habilitarNTP: document.getElementById('esp32NTP').checked,
            habilitarDisplay: document.getElementById('esp32Display').checked,
            habilitarLED: document.getElementById('esp32LED').checked,
            logDetalhado: document.getElementById('esp32LogDetalhado').checked,
            serverUrl: window.location.origin
        };
    }

    gerarCodigoArduino(config) {
        return `// Código ESP32 gerado automaticamente
// Sistema de Monitoramento de Temperatura
// Gerado em: ${new Date().toLocaleString('pt-BR')}

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
${config.habilitarNTP ? '#include <time.h>' : ''}
${config.habilitarDisplay ? '#include <Wire.h>\n#include <Adafruit_GFX.h>\n#include <Adafruit_SSD1306.h>' : ''}

// ========================================
// CONFIGURAÇÕES AUTOMÁTICAS
// ========================================
const char* ssid = "SUA_REDE_WIFI";           // Altere para sua rede
const char* password = "SUA_SENHA_WIFI";      // Altere para sua senha
const char* serverUrl = "${config.serverUrl}";
const char* apiKey = "${config.apiKey}";

// Configurações do sensor
#define DHTPIN 4
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

// Configurações do sistema
const int idSala = 1;                         // Altere para o ID da sala
const int intervaloLeitura = ${config.intervaloLeitura};
const int maxTentativas = ${config.maxTentativas};
const int timeout = ${config.timeout};

${config.habilitarDisplay ? `
// Configurações do display OLED
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
#define SCREEN_ADDRESS 0x3C
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);` : ''}

${config.habilitarLED ? 'const int ledStatus = 2;' : ''}

// Variáveis globais
unsigned long ultimaLeitura = 0;
int tentativasConexao = 0;
bool wifiConectado = false;
bool servidorOnline = false;

void setup() {
    Serial.begin(115200);
    ${config.habilitarLED ? 'pinMode(ledStatus, OUTPUT);' : ''}
    
    ${config.habilitarDisplay ? `
    // Inicializar display
    if(!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
        Serial.println(F("Falha no display SSD1306"));
    }` : ''}
    
    // Inicializar sensor DHT
    dht.begin();
    
    Serial.println("=== Sistema de Monitoramento ESP32 ===");
    
    // Conectar ao WiFi
    conectarWiFi();
    
    ${config.habilitarNTP ? `
    // Configurar NTP
    configurarNTP();` : ''}
    
    // Verificar status do servidor
    verificarStatusServidor();
}

void loop() {
    unsigned long tempoAtual = millis();
    
    // Verificar conexão WiFi
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("WiFi desconectado. Tentando reconectar...");
        wifiConectado = false;
        servidorOnline = false;
        ${config.habilitarLED ? 'digitalWrite(ledStatus, LOW);' : ''}
        conectarWiFi();
        return;
    }
    
    // Realizar leitura no intervalo definido
    if (tempoAtual - ultimaLeitura >= intervaloLeitura) {
        realizarLeitura();
        ultimaLeitura = tempoAtual;
    }
    
    ${config.habilitarDisplay ? `
    // Atualizar display a cada 5 segundos
    static unsigned long ultimaAtualizacaoDisplay = 0;
    if (tempoAtual - ultimaAtualizacaoDisplay >= 5000) {
        atualizarDisplay();
        ultimaAtualizacaoDisplay = tempoAtual;
    }` : ''}
    
    delay(1000);
}

void conectarWiFi() {
    Serial.print("Conectando ao WiFi: ");
    Serial.println(ssid);
    
    WiFi.begin(ssid, password);
    
    int tentativas = 0;
    while (WiFi.status() != WL_CONNECTED && tentativas < 20) {
        delay(500);
        Serial.print(".");
        ${config.habilitarLED ? 'digitalWrite(ledStatus, !digitalRead(ledStatus));' : ''}
        tentativas++;
    }
    
    if (WiFi.status() == WL_CONNECTED) {
        Serial.println();
        Serial.println("WiFi conectado!");
        Serial.print("IP: ");
        Serial.println(WiFi.localIP());
        wifiConectado = true;
        tentativasConexao = 0;
        ${config.habilitarLED ? 'digitalWrite(ledStatus, HIGH);' : ''}
    } else {
        Serial.println();
        Serial.println("Falha na conexão WiFi!");
        tentativasConexao++;
        ${config.habilitarLED ? 'digitalWrite(ledStatus, LOW);' : ''}
        
        if (tentativasConexao >= maxTentativas) {
            Serial.println("Máximo de tentativas atingido. Reiniciando...");
            ESP.restart();
        }
    }
}

${config.habilitarNTP ? `
void configurarNTP() {
    configTime(-10800, 0, "pool.ntp.org");
    
    Serial.print("Sincronizando tempo...");
    int tentativas = 0;
    while (!getLocalTime(&timeinfo) && tentativas < 10) {
        Serial.print(".");
        delay(1000);
        tentativas++;
    }
    
    if (tentativas < 10) {
        Serial.println(" OK!");
    } else {
        Serial.println(" Falha!");
    }
}` : ''}

void verificarStatusServidor() {
    if (!wifiConectado) return;
    
    HTTPClient http;
    String url = String(serverUrl) + "/api/esp32/status?api_key=" + String(apiKey);
    
    http.begin(url);
    http.setTimeout(timeout);
    
    int httpCode = http.GET();
    
    if (httpCode == HTTP_CODE_OK) {
        String payload = http.getString();
        Serial.println("Servidor online: " + payload);
        servidorOnline = true;
        ${config.habilitarLED ? 'digitalWrite(ledStatus, HIGH);' : ''}
    } else {
        Serial.printf("Erro ao verificar servidor. Código: %d\\n", httpCode);
        servidorOnline = false;
        ${config.habilitarLED ? 'digitalWrite(ledStatus, LOW);' : ''}
    }
    
    http.end();
}

void realizarLeitura() {
    if (!wifiConectado) return;
    
    // Ler dados do sensor
    float temperatura = dht.readTemperature();
    float umidade = dht.readHumidity();
    
    // Verificar se a leitura foi bem-sucedida
    if (isnan(temperatura) || isnan(umidade)) {
        Serial.println("Erro na leitura do sensor DHT!");
        return;
    }
    
    Serial.printf("Temperatura: %.2f°C, Umidade: %.2f%%\\n", temperatura, umidade);
    
    // Enviar dados para o servidor
    enviarDadosServidor(temperatura, umidade);
}

void enviarDadosServidor(float temperatura, float umidade) {
    if (!servidorOnline) {
        verificarStatusServidor();
        if (!servidorOnline) return;
    }
    
    HTTPClient http;
    String url = String(serverUrl) + "/api/esp32/temperatura";
    
    http.begin(url);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("X-API-Key", apiKey);
    http.setTimeout(timeout);
    
    // Criar JSON com os dados
    StaticJsonDocument<200> doc;
    doc["id_sala"] = idSala;
    doc["temperatura"] = temperatura;
    doc["umidade"] = umidade;
    ${config.habilitarNTP ? 'doc["timestamp"] = obterTimestamp();' : ''}
    
    String jsonString;
    serializeJson(doc, jsonString);
    
    Serial.println("Enviando dados: " + jsonString);
    
    int httpCode = http.POST(jsonString);
    
    if (httpCode == HTTP_CODE_OK) {
        String payload = http.getString();
        Serial.println("Dados enviados com sucesso: " + payload);
        
        // Parse da resposta
        StaticJsonDocument<200> resposta;
        deserializeJson(resposta, payload);
        
        if (resposta["data"]["is_alerta"]) {
            Serial.println("⚠️ ALERTA: Temperatura fora do ideal!");
            ${config.habilitarLED ? `
            // Piscar LED rapidamente em caso de alerta
            for (int i = 0; i < 5; i++) {
                digitalWrite(ledStatus, LOW);
                delay(200);
                digitalWrite(ledStatus, HIGH);
                delay(200);
            }` : ''}
        }
    } else {
        Serial.printf("Erro ao enviar dados. Código: %d\\n", httpCode);
        String payload = http.getString();
        Serial.println("Resposta: " + payload);
        servidorOnline = false;
    }
    
    http.end();
}

${config.habilitarNTP ? `
String obterTimestamp() {
    struct tm timeinfo;
    if (!getLocalTime(&timeinfo)) {
        return "Erro no tempo";
    }
    
    char timeString[64];
    strftime(timeString, sizeof(timeString), "%Y-%m-%d %H:%M:%S", &timeinfo);
    return String(timeString);
}` : ''}

${config.habilitarDisplay ? `
void atualizarDisplay() {
    display.clearDisplay();
    display.setTextSize(1);
    display.setCursor(0,0);
    
    // Cabeçalho
    display.println(F("=== Monitor Temp ==="));
    
    // Status da conexão
    display.printf("WiFi: %s\\n", wifiConectado ? "OK" : "OFF");
    display.printf("Server: %s\\n", servidorOnline ? "OK" : "OFF");
    
    // Dados do sensor (simulados)
    display.printf("Temp: %.1fC\\n", 24.5);
    display.printf("Umid: %.1f%%\\n", 65.0);
    
    display.display();
}` : ''}
`;
    }

    copiarCodigo() {
        const pre = document.querySelector('#codigoESP32Modal pre code');
        if (pre) {
            navigator.clipboard.writeText(pre.textContent).then(() => {
                app.showSuccess('Código copiado para a área de transferência!');
            }).catch(() => {
                app.showError('Erro ao copiar código');
            });
        }
    }

    downloadCodigo() {
        const config = this.obterConfiguracoesESP32();
        const codigo = this.gerarCodigoArduino(config);

        const blob = new Blob([codigo], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `esp32_temperatura_${new Date().toISOString().split('T')[0]}.ino`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        app.showSuccess('Código baixado com sucesso!');
    }

    mostrarQRCode() {
        const config = this.obterConfiguracoesESP32();
        const dados = {
            ssid: "SUA_REDE_WIFI",
            password: "SUA_SENHA_WIFI",
            serverUrl: config.serverUrl,
            apiKey: config.apiKey,
            salaId: 1
        };

        const qrData = JSON.stringify(dados);
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`;

        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'qrCodeModal';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="bi bi-qr-code me-2"></i>
                            QR Code para Configuração ESP32
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body text-center">
                        <p class="text-muted mb-3">
                            Escaneie este QR Code com um app ESP32 para configurar automaticamente
                        </p>
                        <img src="${qrUrl}" alt="QR Code ESP32" class="img-fluid border">
                        <div class="mt-3">
                            <small class="text-muted">
                                Dados: ${qrData}
                            </small>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();

        modal.addEventListener('hidden.bs.modal', () => {
            document.body.removeChild(modal);
        });
    }

    async carregarStatusESP32() {
        try {
            const apiKey = document.getElementById('esp32ApiKey').value;
            const response = await fetch(`/api/esp32/status?api_key=${apiKey}`);

            const container = document.getElementById('esp32StatusContainer');
            if (response.ok) {
                container.innerHTML = `
                    <div class="alert alert-success">
                        <i class="bi bi-check-circle me-2"></i>
                        <strong>Servidor Online</strong> - ESP32 pode se conectar
                    </div>
                `;
            } else {
                container.innerHTML = `
                    <div class="alert alert-warning">
                        <i class="bi bi-exclamation-triangle me-2"></i>
                        <strong>Servidor Offline</strong> - Verifique se o servidor está rodando
                    </div>
                `;
            }
        } catch (error) {
            const container = document.getElementById('esp32StatusContainer');
            container.innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-x-circle me-2"></i>
                    <strong>Erro de Conexão</strong> - ${error.message}
                </div>
            `;
        }
    }
}

// Instância global
window.configuracoesPage = new ConfiguracoesPage();

// Função global para renderizar página de configurações
window.renderPaginaConfiguracoes = function () {
    configuracoesPage.render();
}; 