class SocketManager {
    constructor() {
        this.socket = null;
        this.connected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.eventHandlers = new Map();
    }

    connect() {
        try {
            this.socket = io();
            this.setupEventListeners();
            console.log('Socket.IO conectando...');
        } catch (error) {
            console.error('Erro ao conectar Socket.IO:', error);
        }
    }

    setupEventListeners() {
        if (!this.socket) return;

        // Evento de conexão
        this.socket.on('connect', () => {
            console.log('Socket.IO conectado!');
            this.connected = true;
            this.reconnectAttempts = 0;
            this.updateStatusBar('online');
            this.emit('user_connected', { timestamp: new Date().toISOString() });
        });

        // Evento de desconexão
        this.socket.on('disconnect', (reason) => {
            console.log('Socket.IO desconectado:', reason);
            this.connected = false;
            this.updateStatusBar('offline');

            if (reason === 'io server disconnect') {
                // Desconexão iniciada pelo servidor
                this.reconnect();
            }
        });

        // Evento de reconexão
        this.socket.on('reconnect', (attemptNumber) => {
            console.log('Socket.IO reconectado após', attemptNumber, 'tentativas');
            this.connected = true;
            this.updateStatusBar('online');
        });

        // Evento de erro de reconexão
        this.socket.on('reconnect_failed', () => {
            console.error('Falha na reconexão Socket.IO');
            this.updateStatusBar('error');
        });

        // Eventos de dados em tempo real
        this.socket.on('nova_leitura', (data) => {
            console.log('Nova leitura recebida:', data);
            this.handleNovaLeitura(data);
        });

        this.socket.on('alerta_temperatura', (data) => {
            console.log('Alerta de temperatura recebido:', data);
            this.handleAlertaTemperatura(data);
        });

        // Evento de atualização geral
        this.socket.on('atualizacao_geral', (data) => {
            console.log('Atualização geral recebida:', data);
            this.handleAtualizacaoGeral(data);
        });
    }

    reconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Número máximo de tentativas de reconexão atingido');
            return;
        }

        this.reconnectAttempts++;
        console.log(`Tentativa de reconexão ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);

        setTimeout(() => {
            if (this.socket) {
                this.socket.connect();
            }
        }, this.reconnectDelay * this.reconnectAttempts);
    }

    emit(event, data) {
        if (this.socket && this.connected) {
            this.socket.emit(event, data);
        } else {
            console.warn('Socket não conectado, não foi possível emitir evento:', event);
        }
    }

    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event).push(handler);
    }

    off(event, handler) {
        if (this.eventHandlers.has(event)) {
            const handlers = this.eventHandlers.get(event);
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }

    // Handlers específicos para eventos de temperatura
    handleNovaLeitura(data) {
        // Atualizar cards de temperatura
        TemperatureCard.updateCard(data.id_sala, {
            id: data.id_sala,
            nome: data.nome_sala,
            temperatura_atual: data.temperatura,
            temperatura_ideal_min: data.temperatura_ideal_min,
            temperatura_ideal_max: data.temperatura_ideal_max,
            is_alerta: data.is_alerta,
            ultima_leitura: data.data_hora,
            tempo_atras: 'Agora'
        });

        // Atualizar estatísticas gerais
        this.atualizarEstatisticas();

        // Executar handlers customizados
        this.executeHandlers('nova_leitura', data);
    }

    handleAlertaTemperatura(data) {
        // Adicionar novo alerta
        AlertCard.addAlert({
            id_sala: data.id_sala,
            nome_sala: data.nome_sala,
            temperatura: data.temperatura,
            temperatura_ideal_min: data.temperatura_ideal_min,
            temperatura_ideal_max: data.temperatura_ideal_max,
            tipo_alerta: data.tipo,
            diferenca: data.tipo === 'baixa'
                ? data.temperatura_ideal_min - data.temperatura
                : data.temperatura - data.temperatura_ideal_max,
            data_hora: data.data_hora,
            tempo_atras: 'Agora'
        });

        // Mostrar notificação
        this.mostrarNotificacao(data);

        // Executar handlers customizados
        this.executeHandlers('alerta_temperatura', data);
    }

    handleAtualizacaoGeral(data) {
        // Atualizar dashboard completo
        if (typeof window.atualizarDashboard === 'function') {
            window.atualizarDashboard();
        }

        // Executar handlers customizados
        this.executeHandlers('atualizacao_geral', data);
    }

    executeHandlers(event, data) {
        if (this.eventHandlers.has(event)) {
            this.eventHandlers.get(event).forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`Erro no handler do evento ${event}:`, error);
                }
            });
        }
    }

    atualizarEstatisticas() {
        // Atualizar contadores do dashboard
        API.getOverview().then(response => {
            const overview = response.data;

            const totalSalasEl = document.getElementById('totalSalas');
            const tempMediaEl = document.getElementById('tempMedia');
            const alertasAtivosEl = document.getElementById('alertasAtivos');
            const ultimaAtualizacaoEl = document.getElementById('ultimaAtualizacao');

            if (totalSalasEl) totalSalasEl.textContent = overview.total_salas || 0;
            if (tempMediaEl) tempMediaEl.textContent = overview.temperatura_media_geral ? overview.temperatura_media_geral.toFixed(1) + '°C' : 'N/A';
            if (alertasAtivosEl) alertasAtivosEl.textContent = 'Calculando...';
            if (ultimaAtualizacaoEl) ultimaAtualizacaoEl.textContent = 'Agora';

            // Buscar alertas ativos
            API.getAlertasRecentes(1).then(alertasResponse => {
                if (alertasAtivosEl) {
                    alertasAtivosEl.textContent = alertasResponse.data.length;
                }
            });
        }).catch(error => {
            console.error('Erro ao atualizar estatísticas:', error);
        });
    }

    mostrarNotificacao(data) {
        // Verificar se o navegador suporta notificações
        if (!('Notification' in window)) {
            console.log('Este navegador não suporta notificações desktop');
            return;
        }

        // Solicitar permissão se necessário
        if (Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    this.criarNotificacao(data);
                }
            });
        } else if (Notification.permission === 'granted') {
            this.criarNotificacao(data);
        }
    }

    criarNotificacao(data) {
        const titulo = `Alerta de Temperatura - ${data.nome_sala}`;
        const mensagem = data.mensagem || `Temperatura: ${data.temperatura}°C`;

        const notification = new Notification(titulo, {
            body: mensagem,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: `alerta_${data.id_sala}`,
            requireInteraction: true
        });

        // Fechar notificação após 10 segundos
        setTimeout(() => {
            notification.close();
        }, 10000);

        // Adicionar som de alerta (se disponível)
        this.tocarSomAlerta();
    }

    tocarSomAlerta() {
        // Criar elemento de áudio para som de alerta
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
        audio.volume = 0.3;
        audio.play().catch(error => {
            console.log('Não foi possível tocar som de alerta:', error);
        });
    }

    updateStatusBar(status) {
        const statusBar = document.getElementById('statusBar');
        if (!statusBar) return;

        const statusClasses = {
            online: 'alert-info',
            offline: 'alert-warning',
            error: 'alert-danger'
        };

        const statusMessages = {
            online: '<i class="bi bi-info-circle me-2"></i><div><strong>Sistema Online</strong> - Monitorando temperaturas em tempo real</div>',
            offline: '<i class="bi bi-exclamation-triangle me-2"></i><div><strong>Sistema Offline</strong> - Tentando reconectar...</div>',
            error: '<i class="bi bi-x-circle me-2"></i><div><strong>Erro de Conexão</strong> - Verifique sua conexão com a internet</div>'
        };

        // Remover classes anteriores
        Object.values(statusClasses).forEach(className => {
            statusBar.classList.remove(className);
        });

        // Adicionar nova classe e mensagem
        statusBar.classList.add(statusClasses[status]);
        statusBar.innerHTML = statusMessages[status];
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.connected = false;
    }

    isConnected() {
        return this.connected;
    }
}

// Criar instância global
const socketManager = new SocketManager();

// Função global para inicializar socket
function inicializarSocket() {
    socketManager.connect();
}

// Função global para verificar status da conexão
function verificarConexaoSocket() {
    return socketManager.isConnected();
}

// Exportar para uso global
window.socketManager = socketManager;
window.inicializarSocket = inicializarSocket;
window.verificarConexaoSocket = verificarConexaoSocket; 