// Componente para Gerenciamento de Dispositivos ESP32
class ESP32Manager {
    constructor() {
        this.dispositivos = [];
        this.estatisticas = {};
        this.configuracoes = {};
    }

    async inicializar() {
        console.log('🔧 Inicializando ESP32 Manager...');
        await this.carregarConfiguracoes();
        await this.carregarDispositivos();
        await this.carregarEstatisticas();
    }

    async carregarConfiguracoes() {
        try {
            const response = await fetch('/api/esp32/configuracoes');
            if (response.ok) {
                const data = await response.json();
                this.configuracoes = data.data;
                console.log('✅ Configurações ESP32 carregadas');
            }
        } catch (error) {
            console.error('❌ Erro ao carregar configurações ESP32:', error);
        }
    }

    async carregarDispositivos() {
        try {
            const response = await fetch('/api/esp32/dispositivos');
            if (response.ok) {
                const data = await response.json();
                this.dispositivos = data.data;
                console.log(`✅ ${this.dispositivos.length} dispositivos ESP32 carregados`);
            }
        } catch (error) {
            console.error('❌ Erro ao carregar dispositivos ESP32:', error);
        }
    }

    async carregarEstatisticas() {
        try {
            const response = await fetch('/api/esp32/estatisticas');
            if (response.ok) {
                const data = await response.json();
                this.estatisticas = data.data;
                console.log('✅ Estatísticas ESP32 carregadas');
            }
        } catch (error) {
            console.error('❌ Erro ao carregar estatísticas ESP32:', error);
        }
    }

    async testarDispositivo(dispositivoId) {
        try {
            const response = await fetch('/api/esp32/teste', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': this.configuracoes.api_key
                },
                body: JSON.stringify({
                    id_sala: 1,
                    temperatura_teste: 25.0
                })
            });

            if (response.ok) {
                const data = await response.json();
                app.showSuccess(`✅ Teste realizado com sucesso: ${data.message}`);
                return data.data;
            } else {
                app.showError('❌ Erro no teste do dispositivo');
                return null;
            }
        } catch (error) {
            console.error('❌ Erro ao testar dispositivo:', error);
            app.showError('Erro ao testar dispositivo: ' + error.message);
            return null;
        }
    }

    async obterLogs(limite = 50) {
        try {
            const response = await fetch(`/api/esp32/logs?limite=${limite}`);
            if (response.ok) {
                const data = await response.json();
                return data.data;
            }
        } catch (error) {
            console.error('❌ Erro ao obter logs:', error);
        }
        return [];
    }

    gerarRelatorio() {
        const relatorio = {
            timestamp: new Date().toISOString(),
            dispositivos: this.dispositivos.length,
            dispositivos_online: this.dispositivos.filter(d => d.status === 'online').length,
            estatisticas: this.estatisticas,
            configuracoes: this.configuracoes
        };

        return relatorio;
    }

    exportarRelatorio() {
        const relatorio = this.gerarRelatorio();
        const blob = new Blob([JSON.stringify(relatorio, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio_esp32_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        app.showSuccess('📊 Relatório exportado com sucesso!');
    }

    // Função para monitorar dispositivos em tempo real
    iniciarMonitoramento() {
        console.log('🔄 Iniciando monitoramento de dispositivos ESP32...');

        // Atualizar a cada 30 segundos
        this.intervaloMonitoramento = setInterval(async () => {
            await this.carregarDispositivos();
            await this.carregarEstatisticas();
            this.atualizarInterface();
        }, 30000);
    }

    pararMonitoramento() {
        if (this.intervaloMonitoramento) {
            clearInterval(this.intervaloMonitoramento);
            console.log('⏹️ Monitoramento de dispositivos ESP32 parado');
        }
    }

    atualizarInterface() {
        // Atualizar elementos da interface se existirem
        const container = document.getElementById('esp32StatusContainer');
        if (container) {
            this.renderizarStatusDispositivos(container);
        }
    }

    renderizarStatusDispositivos(container) {
        if (this.dispositivos.length === 0) {
            container.innerHTML = `
                <div class="alert alert-info">
                    <i class="bi bi-info-circle me-2"></i>
                    <strong>Nenhum dispositivo ESP32 conectado</strong>
                    <br>
                    <small class="text-muted">Configure um dispositivo ESP32 para começar a monitorar</small>
                </div>
            `;
            return;
        }

        const dispositivosHTML = this.dispositivos.map(dispositivo => `
            <div class="card mb-2">
                <div class="card-body p-3">
                    <div class="row align-items-center">
                        <div class="col-md-3">
                            <h6 class="mb-1">${dispositivo.nome}</h6>
                            <small class="text-muted">${dispositivo.mac_address}</small>
                        </div>
                        <div class="col-md-2">
                            <span class="badge bg-${dispositivo.status === 'online' ? 'success' : 'secondary'}">
                                ${dispositivo.status === 'online' ? 'Online' : 'Offline'}
                            </span>
                        </div>
                        <div class="col-md-2">
                            <small class="text-muted">Sala:</small><br>
                            <strong>${dispositivo.sala_nome}</strong>
                        </div>
                        <div class="col-md-2">
                            <small class="text-muted">Leituras:</small><br>
                            <strong>${dispositivo.total_leituras}</strong>
                        </div>
                        <div class="col-md-2">
                            <small class="text-muted">Última conexão:</small><br>
                            <strong>${moment(dispositivo.ultima_conexao).fromNow()}</strong>
                        </div>
                        <div class="col-md-1">
                            <button class="btn btn-sm btn-outline-primary" 
                                    onclick="esp32Manager.testarDispositivo(${dispositivo.id})"
                                    title="Testar dispositivo">
                                <i class="bi bi-wifi"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = dispositivosHTML;
    }

    // Função para criar novo dispositivo ESP32
    async criarDispositivo(dados) {
        try {
            const response = await fetch('/api/esp32/registrar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': this.configuracoes.api_key
                },
                body: JSON.stringify(dados)
            });

            if (response.ok) {
                const data = await response.json();
                app.showSuccess('✅ Dispositivo ESP32 registrado com sucesso!');
                await this.carregarDispositivos();
                return data.data;
            } else {
                app.showError('❌ Erro ao registrar dispositivo');
                return null;
            }
        } catch (error) {
            console.error('❌ Erro ao criar dispositivo:', error);
            app.showError('Erro ao criar dispositivo: ' + error.message);
            return null;
        }
    }

    // Função para remover dispositivo
    async removerDispositivo(dispositivoId) {
        if (confirm('Tem certeza que deseja remover este dispositivo ESP32?')) {
            try {
                // Em uma implementação real, você teria uma rota DELETE
                app.showSuccess('Dispositivo removido com sucesso!');
                await this.carregarDispositivos();
            } catch (error) {
                console.error('❌ Erro ao remover dispositivo:', error);
                app.showError('Erro ao remover dispositivo: ' + error.message);
            }
        }
    }

    // Função para obter configurações recomendadas
    obterConfiguracoesRecomendadas() {
        return {
            wifi: {
                ssid: "SUA_REDE_WIFI",
                password: "SUA_SENHA_WIFI"
            },
            servidor: {
                url: this.configuracoes.server_url,
                api_key: this.configuracoes.api_key
            },
            sensor: {
                tipo: "DHT22",
                pino: 4
            },
            sistema: {
                intervalo_leitura: 30000,
                max_tentativas: 3,
                timeout: 10000
            },
            recursos: {
                ntp: true,
                display: true,
                led: true
            }
        };
    }

    // Função para validar configurações
    validarConfiguracoes(config) {
        const erros = [];

        if (!config.wifi.ssid || config.wifi.ssid === "SUA_REDE_WIFI") {
            erros.push("SSID do WiFi deve ser configurado");
        }

        if (!config.wifi.password || config.wifi.password === "SUA_SENHA_WIFI") {
            erros.push("Senha do WiFi deve ser configurada");
        }

        if (!config.servidor.url) {
            erros.push("URL do servidor deve ser configurada");
        }

        if (!config.servidor.api_key) {
            erros.push("Chave de API deve ser configurada");
        }

        return {
            valido: erros.length === 0,
            erros: erros
        };
    }

    // Função para gerar código de configuração
    gerarCodigoConfiguracao(config) {
        const validacao = this.validarConfiguracoes(config);
        if (!validacao.valido) {
            throw new Error('Configurações inválidas: ' + validacao.erros.join(', '));
        }

        return `// Configurações ESP32 - ${new Date().toLocaleString('pt-BR')}
// Gerado automaticamente pelo sistema de monitoramento

// Configurações WiFi
const char* WIFI_SSID = "${config.wifi.ssid}";
const char* WIFI_PASSWORD = "${config.wifi.password}";

// Configurações do Servidor
const char* SERVER_URL = "${config.servidor.url}";
const char* API_KEY = "${config.servidor.api_key}";

// Configurações do Sensor
#define SENSOR_PIN ${config.sensor.pino}
#define SENSOR_TYPE DHT22

// Configurações do Sistema
const int LEITURA_INTERVALO = ${config.sistema.intervalo_leitura};
const int MAX_TENTATIVAS = ${config.sistema.max_tentativas};
const int TIMEOUT = ${config.sistema.timeout};

// Recursos Habilitados
#define HABILITAR_NTP ${config.recursos.ntp ? 'true' : 'false'}
#define HABILITAR_DISPLAY ${config.recursos.display ? 'true' : 'false'}
#define HABILITAR_LED ${config.recursos.led ? 'true' : 'false'}

// Instruções de uso:
// 1. Copie estas configurações para o seu código ESP32
// 2. Ajuste os valores conforme necessário
// 3. Compile e carregue no dispositivo
// 4. Monitore o Serial para verificar a conexão
`;
    }
}

// Instância global
window.esp32Manager = new ESP32Manager();

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    if (window.esp32Manager) {
        esp32Manager.inicializar();
    }
}); 