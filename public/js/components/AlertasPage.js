// Componente da Página de Alertas
class AlertasPage {
    constructor() {
        this.alertas = [];
        this.filtros = {
            status: 'todos',
            sala: 'todas',
            dataInicio: null,
            dataFim: null
        };
    }

    async render() {
        console.log('⚠️ Renderizando página de Alertas...');

        const container = document.getElementById('outrasSecoes');
        if (!container) {
            console.error('Container para alertas não encontrado');
            return;
        }

        // Carregar dados de alertas
        try {
            const dados = await API.carregarDadosAlertas();
            this.alertas = dados.alertas || [];

            container.innerHTML = this.getHTML();
            this.setupEventHandlers();
            this.renderAlertasTable();
            this.updateCounters();

        } catch (error) {
            console.error('Erro ao carregar dados de alertas:', error);
            container.innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    Erro ao carregar dados de alertas: ${error.message}
                </div>
            `;
        }
    }

    getHTML() {
        return `
            <div class="row">
                <div class="col-12">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h2>
                            <i class="bi bi-exclamation-triangle text-warning"></i>
                            Gerenciamento de Alertas
                        </h2>
                        <div class="btn-group">
                            <button class="btn btn-outline-secondary" onclick="alertasPage.exportarAlertas()">
                                <i class="bi bi-download me-2"></i>
                                Exportar
                            </button>
                            <button class="btn btn-outline-danger" onclick="alertasPage.limparAlertas()">
                                <i class="bi bi-trash me-2"></i>
                                Limpar Todos
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Cards de Resumo -->
            <div class="row mb-4">
                <div class="col-md-3">
                    <div class="card bg-danger text-white">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h4 class="card-title" id="totalAlertasCount">0</h4>
                                    <p class="card-text">Total de Alertas</p>
                                </div>
                                <div>
                                    <i class="bi bi-exclamation-triangle fa-2x"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-warning text-white">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h4 class="card-title" id="alertasAtivosCount">0</h4>
                                    <p class="card-text">Alertas Ativos</p>
                                </div>
                                <div>
                                    <i class="bi bi-clock fa-2x"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-success text-white">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h4 class="card-title" id="alertasResolvidosCount">0</h4>
                                    <p class="card-text">Resolvidos</p>
                                </div>
                                <div>
                                    <i class="bi bi-check-circle fa-2x"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-info text-white">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h4 class="card-title" id="salasComAlertaCount">0</h4>
                                    <p class="card-text">Salas Afetadas</p>
                                </div>
                                <div>
                                    <i class="bi bi-building fa-2x"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Filtros -->
            <div class="row mb-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h6 class="mb-0">
                                <i class="bi bi-funnel me-2"></i>
                                Filtros
                            </h6>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-3">
                                    <label for="filtroStatus" class="form-label">Status</label>
                                    <select class="form-select" id="filtroStatus" onchange="alertasPage.aplicarFiltros()">
                                        <option value="todos">Todos</option>
                                        <option value="ativo">Ativos</option>
                                        <option value="resolvido">Resolvidos</option>
                                    </select>
                                </div>
                                <div class="col-md-3">
                                    <label for="filtroSala" class="form-label">Sala</label>
                                    <select class="form-select" id="filtroSala" onchange="alertasPage.aplicarFiltros()">
                                        <option value="todas">Todas as Salas</option>
                                        <!-- Opções serão carregadas dinamicamente -->
                                    </select>
                                </div>
                                <div class="col-md-3">
                                    <label for="filtroDataInicio" class="form-label">Data Início</label>
                                    <input type="datetime-local" class="form-control" id="filtroDataInicio" onchange="alertasPage.aplicarFiltros()">
                                </div>
                                <div class="col-md-3">
                                    <label for="filtroDataFim" class="form-label">Data Fim</label>
                                    <input type="datetime-local" class="form-control" id="filtroDataFim" onchange="alertasPage.aplicarFiltros()">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tabela de Alertas -->
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0">
                                <i class="bi bi-table me-2"></i>
                                Lista de Alertas
                            </h5>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-striped table-hover" id="alertasTable">
                                    <thead class="table-dark">
                                        <tr>
                                            <th>ID</th>
                                            <th>Sala</th>
                                            <th>Tipo</th>
                                            <th>Temperatura</th>
                                            <th>Limites</th>
                                            <th>Data/Hora</th>
                                            <th>Status</th>
                                            <th>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody id="alertasTableBody">
                                        <!-- Dados serão inseridos aqui -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal de Detalhes do Alerta -->
            <div class="modal fade" id="alertaModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Detalhes do Alerta</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body" id="alertaModalBody">
                            <!-- Conteúdo será carregado dinamicamente -->
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                            <button type="button" class="btn btn-success" id="resolverAlertaBtn">Marcar como Resolvido</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal de Confirmação -->
            <div class="modal fade" id="confirmModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Confirmar Ação</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <p id="confirmMessage">Tem certeza que deseja realizar esta ação?</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-danger" id="confirmAction">Confirmar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventHandlers() {
        // Carregar opções de salas no filtro
        this.carregarOpcoesSalas();

        // Configurar modal de confirmação
        const confirmModal = document.getElementById('confirmModal');
        if (confirmModal) {
            confirmModal.addEventListener('hidden.bs.modal', () => {
                document.getElementById('confirmAction').onclick = null;
            });
        }
    }

    async carregarOpcoesSalas() {
        try {
            const response = await API.getSalas();
            const salas = response.data;

            const select = document.getElementById('filtroSala');
            if (select) {
                salas.forEach(sala => {
                    const option = document.createElement('option');
                    option.value = sala.id;
                    option.textContent = sala.nome;
                    select.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Erro ao carregar salas para filtro:', error);
        }
    }

    renderAlertasTable() {
        const tbody = document.getElementById('alertasTableBody');
        if (!tbody) return;

        const alertasFiltrados = this.filtrarAlertas();

        tbody.innerHTML = alertasFiltrados.map(alerta => `
            <tr class="${alerta.status === 'ativo' ? 'table-danger' : 'table-success'}">
                <td>${alerta.id}</td>
                <td>
                    <strong>${alerta.sala_nome || 'Sala ' + alerta.id_sala}</strong>
                </td>
                <td>
                    <span class="badge bg-${this.getTipoAlertaBadgeColor(alerta.tipo)}">
                        ${this.getTipoAlertaDisplayName(alerta.tipo)}
                    </span>
                </td>
                <td>
                    <span class="temperature-display ${this.getTemperatureClass(alerta.temperatura, alerta.temperatura_min, alerta.temperatura_max)}">
                        ${alerta.temperatura.toFixed(1)}°C
                    </span>
                </td>
                <td>
                    <small>
                        ${alerta.temperatura_min}°C - ${alerta.temperatura_max}°C
                    </small>
                </td>
                <td>
                    <small>
                        ${new Date(alerta.data_hora).toLocaleString('pt-BR')}
                    </small>
                </td>
                <td>
                    ${this.getStatusBadge(alerta.status)}
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-info" onclick="alertasPage.viewAlertaDetails(${alerta.id})" title="Detalhes">
                            <i class="bi bi-eye"></i>
                        </button>
                        ${alerta.status === 'ativo' ? `
                            <button class="btn btn-outline-success" onclick="alertasPage.resolverAlerta(${alerta.id})" title="Resolver">
                                <i class="bi bi-check-circle"></i>
                            </button>
                        ` : ''}
                        <button class="btn btn-outline-danger" onclick="alertasPage.deleteAlerta(${alerta.id})" title="Excluir">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Mostrar mensagem se não houver alertas
        if (alertasFiltrados.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center text-muted py-4">
                        <i class="bi bi-inbox fa-2x mb-2"></i>
                        <br>
                        Nenhum alerta encontrado com os filtros aplicados.
                    </td>
                </tr>
            `;
        }
    }

    filtrarAlertas() {
        let alertasFiltrados = [...this.alertas];

        // Filtro por status
        if (this.filtros.status !== 'todos') {
            alertasFiltrados = alertasFiltrados.filter(a => a.status === this.filtros.status);
        }

        // Filtro por sala
        if (this.filtros.sala !== 'todas') {
            alertasFiltrados = alertasFiltrados.filter(a => a.id_sala == this.filtros.sala);
        }

        // Filtro por data
        if (this.filtros.dataInicio) {
            alertasFiltrados = alertasFiltrados.filter(a =>
                new Date(a.data_hora) >= new Date(this.filtros.dataInicio)
            );
        }

        if (this.filtros.dataFim) {
            alertasFiltrados = alertasFiltrados.filter(a =>
                new Date(a.data_hora) <= new Date(this.filtros.dataFim)
            );
        }

        return alertasFiltrados;
    }

    aplicarFiltros() {
        this.filtros.status = document.getElementById('filtroStatus').value;
        this.filtros.sala = document.getElementById('filtroSala').value;
        this.filtros.dataInicio = document.getElementById('filtroDataInicio').value;
        this.filtros.dataFim = document.getElementById('filtroDataFim').value;

        this.renderAlertasTable();
    }

    updateCounters() {
        const totalAlertas = this.alertas.length;
        const alertasAtivos = this.alertas.filter(a => a.status === 'ativo').length;
        const alertasResolvidos = this.alertas.filter(a => a.status === 'resolvido').length;
        const salasComAlerta = new Set(this.alertas.map(a => a.id_sala)).size;

        document.getElementById('totalAlertasCount').textContent = totalAlertas;
        document.getElementById('alertasAtivosCount').textContent = alertasAtivos;
        document.getElementById('alertasResolvidosCount').textContent = alertasResolvidos;
        document.getElementById('salasComAlertaCount').textContent = salasComAlerta;
    }

    getTipoAlertaBadgeColor(tipo) {
        const colors = {
            'temperatura_alta': 'danger',
            'temperatura_baixa': 'warning',
            'falha_sensor': 'secondary',
            'falha_sistema': 'dark'
        };
        return colors[tipo] || 'danger';
    }

    getTipoAlertaDisplayName(tipo) {
        const names = {
            'temperatura_alta': 'Temp. Alta',
            'temperatura_baixa': 'Temp. Baixa',
            'falha_sensor': 'Falha Sensor',
            'falha_sistema': 'Falha Sistema'
        };
        return names[tipo] || tipo;
    }

    getTemperatureClass(temp, min, max) {
        if (temp < min) return 'status-alert';
        if (temp > max) return 'status-alert';
        return 'status-normal';
    }

    getStatusBadge(status) {
        if (status === 'ativo') {
            return '<span class="badge bg-danger">Ativo</span>';
        } else {
            return '<span class="badge bg-success">Resolvido</span>';
        }
    }

    async viewAlertaDetails(alertaId) {
        try {
            const alerta = this.alertas.find(a => a.id === alertaId);
            if (!alerta) return;

            const modalBody = document.getElementById('alertaModalBody');
            modalBody.innerHTML = `
                <div class="row">
                    <div class="col-md-6">
                        <h6>Informações do Alerta</h6>
                        <table class="table table-sm">
                            <tr><td><strong>ID:</strong></td><td>${alerta.id}</td></tr>
                            <tr><td><strong>Sala:</strong></td><td>${alerta.sala_nome || 'Sala ' + alerta.id_sala}</td></tr>
                            <tr><td><strong>Tipo:</strong></td><td>${this.getTipoAlertaDisplayName(alerta.tipo)}</td></tr>
                            <tr><td><strong>Status:</strong></td><td>${this.getStatusBadge(alerta.status)}</td></tr>
                            <tr><td><strong>Data/Hora:</strong></td><td>${new Date(alerta.data_hora).toLocaleString('pt-BR')}</td></tr>
                        </table>
                    </div>
                    <div class="col-md-6">
                        <h6>Dados de Temperatura</h6>
                        <table class="table table-sm">
                            <tr><td><strong>Temperatura:</strong></td><td>${alerta.temperatura.toFixed(1)}°C</td></tr>
                            <tr><td><strong>Limite Mínimo:</strong></td><td>${alerta.temperatura_min}°C</td></tr>
                            <tr><td><strong>Limite Máximo:</strong></td><td>${alerta.temperatura_max}°C</td></tr>
                            <tr><td><strong>Diferença:</strong></td><td>${this.calcularDiferenca(alerta)}</td></tr>
                        </table>
                    </div>
                </div>
                ${alerta.descricao ? `
                    <div class="row mt-3">
                        <div class="col-12">
                            <h6>Descrição</h6>
                            <p class="text-muted">${alerta.descricao}</p>
                        </div>
                    </div>
                ` : ''}
            `;

            // Configurar botão de resolver
            const resolverBtn = document.getElementById('resolverAlertaBtn');
            if (alerta.status === 'ativo') {
                resolverBtn.style.display = 'block';
                resolverBtn.onclick = () => this.resolverAlerta(alerta.id);
            } else {
                resolverBtn.style.display = 'none';
            }

            const modal = new bootstrap.Modal(document.getElementById('alertaModal'));
            modal.show();

        } catch (error) {
            console.error('Erro ao carregar detalhes do alerta:', error);
            app.showError('Erro ao carregar detalhes do alerta: ' + error.message);
        }
    }

    calcularDiferenca(alerta) {
        if (alerta.temperatura > alerta.temperatura_max) {
            return `+${(alerta.temperatura - alerta.temperatura_max).toFixed(1)}°C (acima do máximo)`;
        } else if (alerta.temperatura < alerta.temperatura_min) {
            return `${(alerta.temperatura - alerta.temperatura_min).toFixed(1)}°C (abaixo do mínimo)`;
        }
        return '0°C (dentro dos limites)';
    }

    async resolverAlerta(alertaId) {
        try {
            // Aqui você implementaria a API para resolver o alerta
            // Por enquanto, vamos apenas marcar como resolvido localmente
            const alerta = this.alertas.find(a => a.id === alertaId);
            if (alerta) {
                alerta.status = 'resolvido';
                app.showSuccess('Alerta marcado como resolvido!');
                this.renderAlertasTable();
                this.updateCounters();

                // Fechar modal se estiver aberto
                const modal = bootstrap.Modal.getInstance(document.getElementById('alertaModal'));
                if (modal) modal.hide();
            }
        } catch (error) {
            console.error('Erro ao resolver alerta:', error);
            app.showError('Erro ao resolver alerta: ' + error.message);
        }
    }

    async deleteAlerta(alertaId) {
        const alerta = this.alertas.find(a => a.id === alertaId);
        if (!alerta) return;

        document.getElementById('confirmMessage').textContent =
            `Tem certeza que deseja excluir este alerta? Esta ação não pode ser desfeita.`;

        const confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
        confirmModal.show();

        document.getElementById('confirmAction').onclick = async () => {
            try {
                // Aqui você implementaria a API para excluir o alerta
                this.alertas = this.alertas.filter(a => a.id !== alertaId);
                app.showSuccess('Alerta excluído com sucesso!');
                confirmModal.hide();
                this.renderAlertasTable();
                this.updateCounters();
            } catch (error) {
                console.error('Erro ao excluir alerta:', error);
                app.showError('Erro ao excluir alerta: ' + error.message);
            }
        };
    }

    async limparAlertas() {
        document.getElementById('confirmMessage').textContent =
            `Tem certeza que deseja limpar todos os alertas? Esta ação não pode ser desfeita.`;

        const confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
        confirmModal.show();

        document.getElementById('confirmAction').onclick = async () => {
            try {
                // Aqui você implementaria a API para limpar todos os alertas
                this.alertas = [];
                app.showSuccess('Todos os alertas foram limpos!');
                confirmModal.hide();
                this.renderAlertasTable();
                this.updateCounters();
            } catch (error) {
                console.error('Erro ao limpar alertas:', error);
                app.showError('Erro ao limpar alertas: ' + error.message);
            }
        };
    }

    exportarAlertas() {
        try {
            const alertasFiltrados = this.filtrarAlertas();

            if (alertasFiltrados.length === 0) {
                app.showWarning('Não há alertas para exportar.');
                return;
            }

            const csvContent = this.gerarCSV(alertasFiltrados);
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');

            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', `alertas_${new Date().toISOString().split('T')[0]}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }

            app.showSuccess('Alertas exportados com sucesso!');
        } catch (error) {
            console.error('Erro ao exportar alertas:', error);
            app.showError('Erro ao exportar alertas: ' + error.message);
        }
    }

    gerarCSV(alertas) {
        const headers = ['ID', 'Sala', 'Tipo', 'Temperatura', 'Limite Mínimo', 'Limite Máximo', 'Status', 'Data/Hora'];
        const rows = alertas.map(alerta => [
            alerta.id,
            alerta.sala_nome || 'Sala ' + alerta.id_sala,
            this.getTipoAlertaDisplayName(alerta.tipo),
            alerta.temperatura.toFixed(1) + '°C',
            alerta.temperatura_min + '°C',
            alerta.temperatura_max + '°C',
            alerta.status === 'ativo' ? 'Ativo' : 'Resolvido',
            new Date(alerta.data_hora).toLocaleString('pt-BR')
        ]);

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
}

// Instância global
window.alertasPage = new AlertasPage();

// Função global para renderizar página de alertas
window.renderPaginaAlertas = function (dados) {
    alertasPage.render();
}; 