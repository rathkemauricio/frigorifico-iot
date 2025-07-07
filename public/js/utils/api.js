class API {
    static baseURL = '/api';

    static async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Dashboard endpoints
    static async getStatus() {
        return this.request('/dashboard/status');
    }

    static async getOverview() {
        return this.request('/dashboard/overview');
    }

    static async getTemperaturasAtuais() {
        return this.request('/dashboard/temperaturas-atuais');
    }

    static async getAlertasRecentes(limite = 10) {
        return this.request(`/dashboard/alertas-recentes?limite=${limite}`);
    }

    static async getEstatisticasGerais(periodo = '24h') {
        return this.request(`/dashboard/estatisticas-gerais?periodo=${periodo}`);
    }

    static async getSalasStatus() {
        return this.request('/dashboard/salas-status');
    }

    // Sensores endpoints
    static async getLeituras(salaId = null, limite = 100) {
        const params = new URLSearchParams({ limite });
        if (salaId) {
            params.append('sala_id', salaId);
        }
        return this.request(`/sensores/leituras?${params}`);
    }

    static async getLeiturasSala(salaId, limite = 50) {
        return this.request(`/sensores/leituras/${salaId}?limite=${limite}`);
    }

    static async getAlertas(limite = 20, dataInicio = null, dataFim = null) {
        const params = new URLSearchParams({ limite });
        if (dataInicio) params.append('data_inicio', dataInicio);
        if (dataFim) params.append('data_fim', dataFim);
        return this.request(`/sensores/alertas?${params}`);
    }

    static async enviarLeitura(dados) {
        return this.request('/sensores/leitura', {
            method: 'POST',
            body: JSON.stringify(dados)
        });
    }

    // Salas endpoints
    static async getSalas() {
        return this.request('/salas');
    }

    static async getSala(id) {
        return this.request(`/salas/${id}`);
    }

    static async criarSala(dados) {
        return this.request('/salas', {
            method: 'POST',
            body: JSON.stringify(dados)
        });
    }

    static async atualizarSala(id, dados) {
        return this.request(`/salas/${id}`, {
            method: 'PUT',
            body: JSON.stringify(dados)
        });
    }

    static async excluirSala(id) {
        return this.request(`/salas/${id}`, {
            method: 'DELETE'
        });
    }

    static async getEstatisticasSala(id, periodo = '24h') {
        return this.request(`/salas/${id}/estatisticas?periodo=${periodo}`);
    }

    // Gráficos endpoints
    static async getGraficoSala(salaId, periodo = '24h', pontos = 50) {
        const params = new URLSearchParams({
            periodo,
            pontos
        });
        return this.request(`/dashboard/grafico/${salaId}?${params}`);
    }

    // Métodos utilitários
    static async carregarDadosIniciais() {
        try {
            const [overview, temperaturas, alertas] = await Promise.all([
                this.getOverview(),
                this.getTemperaturasAtuais(),
                this.getAlertasRecentes()
            ]);

            return {
                overview: overview.data,
                temperaturas: temperaturas.data,
                alertas: alertas.data
            };
        } catch (error) {
            console.error('Erro ao carregar dados iniciais:', error);
            throw error;
        }
    }

    static async carregarDadosDashboard() {
        try {
            const [overview, temperaturas, alertas, estatisticas] = await Promise.all([
                this.getOverview(),
                this.getTemperaturasAtuais(),
                this.getAlertasRecentes(),
                this.getEstatisticasGerais()
            ]);

            return {
                overview: overview.data,
                temperaturas: temperaturas.data,
                alertas: alertas.data,
                estatisticas: estatisticas.data
            };
        } catch (error) {
            console.error('Erro ao carregar dados do dashboard:', error);
            throw error;
        }
    }

    static async carregarDadosSalas() {
        try {
            const [salas, salasStatus] = await Promise.all([
                this.getSalas(),
                this.getSalasStatus()
            ]);

            return {
                salas: salas.data,
                salasStatus: salasStatus.data
            };
        } catch (error) {
            console.error('Erro ao carregar dados das salas:', error);
            throw error;
        }
    }

    static async carregarDadosAlertas() {
        try {
            const [alertas, estatisticas] = await Promise.all([
                this.getAlertas(),
                this.getEstatisticasGerais()
            ]);

            return {
                alertas: alertas.data,
                estatisticas: estatisticas.data
            };
        } catch (error) {
            console.error('Erro ao carregar dados de alertas:', error);
            throw error;
        }
    }

    // Método para simular envio de dados (para testes)
    static async simularLeitura(salaId, temperatura) {
        const dados = {
            id_sala: salaId,
            temperatura: temperatura,
            data_hora: new Date().toISOString()
        };

        return this.enviarLeitura(dados);
    }

    // Método para verificar conectividade
    static async verificarConexao() {
        try {
            const response = await this.getStatus();
            return response.success;
        } catch (error) {
            return false;
        }
    }
}

// Exportar para uso global
window.API = API; 