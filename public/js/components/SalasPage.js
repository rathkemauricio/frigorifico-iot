// Componente da Página de Salas
class SalasPage {
    constructor() {
        this.salas = [];
        this.currentSala = null;
        this.isEditing = false;
    }

    async render() {
        console.log('🏢 Renderizando página de Salas...');

        const container = document.getElementById('outrasSecoes');
        if (!container) {
            console.error('Container para salas não encontrado');
            return;
        }

        // Carregar dados das salas
        try {
            const dados = await API.carregarDadosSalas();
            this.salas = dados.salas || [];

            container.innerHTML = this.getHTML();
            this.setupEventHandlers();
            this.renderSalasTable();

        } catch (error) {
            console.error('Erro ao carregar dados das salas:', error);
            container.innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    Erro ao carregar dados das salas: ${error.message}
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
                            <i class="bi bi-box-fill"></i>
                            Gerenciamento de Salas
                        </h2>
                        <button class="btn btn-primary" onclick="salasPage.showAddSalaModal()">
                            <i class="bi bi-plus-circle me-2"></i>
                            Nova Sala
                        </button>
                    </div>
                </div>
            </div>

            <!-- Cards de Resumo -->
            <div class="row mb-4">
                <div class="col-md-3">
                    <div class="card bg-primary text-white">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h4 class="card-title" id="totalSalasCount">0</h4>
                                    <p class="card-text">Total de Salas</p>
                                </div>
                                <div>
                                    <i class="bi bi-box-fill"></i>
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
                                    <h4 class="card-title" id="salasAtivasCount">0</h4>
                                    <p class="card-text">Salas Ativas</p>
                                </div>
                                <div>
                                    <i class="bi bi-check-circle fa-2x"></i>
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
                                    <h4 class="card-title" id="salasComAlertaCount">0</h4>
                                    <p class="card-text">Com Alertas</p>
                                </div>
                                <div>
                                    <i class="bi bi-exclamation-triangle fa-2x"></i>
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
                                    <h4 class="card-title" id="tempMediaGeral">0°C</h4>
                                    <p class="card-text">Temp. Média</p>
                                </div>
                                <div>
                                    <i class="bi bi-thermometer-half fa-2x"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tabela de Salas -->
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0">
                                <i class="bi bi-table me-2"></i>
                                Lista de Salas
                            </h5>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-striped table-hover" id="salasTable">
                                    <thead class="table-dark">
                                        <tr>
                                            <th>ID</th>
                                            <th>Nome</th>
                                            <th>Tipo</th>
                                            <th>Temp. Atual</th>
                                            <th>Limites</th>
                                            <th>Status</th>
                                            <th>Última Leitura</th>
                                            <th>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody id="salasTableBody">
                                        <!-- Dados serão inseridos aqui -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal para Adicionar/Editar Sala -->
            <div class="modal fade" id="salaModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="salaModalTitle">Nova Sala</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="salaForm">
                                <div class="mb-3">
                                    <label for="salaNome" class="form-label">Nome da Sala</label>
                                    <input type="text" class="form-control" id="salaNome" required>
                                </div>
                                <div class="mb-3">
                                    <label for="salaTipo" class="form-label">Tipo</label>
                                    <select class="form-select" id="salaTipo" required>
                                        <option value="">Selecione...</option>
                                        <option value="resfriamento">Resfriamento</option>
                                        <option value="congelamento">Congelamento</option>
                                        <option value="processamento">Processamento</option>
                                        <option value="armazenamento">Armazenamento</option>
                                    </select>
                                </div>
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="salaTempMin" class="form-label">Temperatura Mínima (°C)</label>
                                            <input type="number" class="form-control" id="salaTempMin" step="0.1" required>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="salaTempMax" class="form-label">Temperatura Máxima (°C)</label>
                                            <input type="number" class="form-control" id="salaTempMax" step="0.1" required>
                                        </div>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label for="salaDescricao" class="form-label">Descrição</label>
                                    <textarea class="form-control" id="salaDescricao" rows="3"></textarea>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary" onclick="salasPage.saveSala()">Salvar</button>
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
        // Atualizar contadores
        this.updateCounters();

        // Configurar modal de confirmação
        const confirmModal = document.getElementById('confirmModal');
        if (confirmModal) {
            confirmModal.addEventListener('hidden.bs.modal', () => {
                document.getElementById('confirmAction').onclick = null;
            });
        }
    }

    renderSalasTable() {
        const tbody = document.getElementById('salasTableBody');
        if (!tbody) return;

        tbody.innerHTML = this.salas.map(sala => `
            <tr>
                <td>${sala.id}</td>
                <td>
                    <strong>${sala.nome}</strong>
                    ${sala.descricao ? `<br><small class="text-muted">${sala.descricao}</small>` : ''}
                </td>
                <td>
                    <span class="badge bg-${this.getTipoBadgeColor(sala.tipo)}">
                        ${this.getTipoDisplayName(sala.tipo)}
                    </span>
                </td>
                <td>
                    <span class="temperature-display ${this.getTemperatureClass(sala.temperatura_atual, sala.temperatura_ideal_min, sala.temperatura_ideal_max)}">
                        ${sala.temperatura_atual ? sala.temperatura_atual.toFixed(1) + '°C' : 'N/A'}
                    </span>
                </td>
                <td>
                    <small>
                        ${sala.temperatura_ideal_min}°C - ${sala.temperatura_ideal_max}°C
                    </small>
                </td>
                <td>
                    ${this.getStatusBadge(sala)}
                </td>
                <td>
                    <small>
                        ${sala.ultima_leitura ? new Date(sala.ultima_leitura).toLocaleString('pt-BR') : 'N/A'}
                    </small>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="salasPage.editSala(${sala.id})" title="Editar">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="salasPage.deleteSala(${sala.id})" title="Excluir">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    updateCounters() {
        const totalSalas = this.salas.length;
        const salasAtivas = this.salas.filter(s => s.status === 'ativo').length;
        const salasComAlerta = this.salas.filter(s => s.temperatura_atual &&
            (s.temperatura_atual < s.temperatura_ideal_min || s.temperatura_atual > s.temperatura_ideal_max)).length;

        const tempMedia = this.salas
            .filter(s => s.temperatura_atual)
            .reduce((sum, s) => sum + s.temperatura_atual, 0) /
            this.salas.filter(s => s.temperatura_atual).length;

        document.getElementById('totalSalasCount').textContent = totalSalas;
        document.getElementById('salasAtivasCount').textContent = salasAtivas;
        document.getElementById('salasComAlertaCount').textContent = salasComAlerta;
        document.getElementById('tempMediaGeral').textContent = isNaN(tempMedia) ? '0°C' : tempMedia.toFixed(1) + '°C';
    }

    getTipoBadgeColor(tipo) {
        const colors = {
            'resfriamento': 'info',
            'congelamento': 'primary',
            'processamento': 'success',
            'armazenamento': 'secondary'
        };
        return colors[tipo] || 'secondary';
    }

    getTipoDisplayName(tipo) {
        const names = {
            'resfriamento': 'Resfriamento',
            'congelamento': 'Congelamento',
            'processamento': 'Processamento',
            'armazenamento': 'Armazenamento'
        };
        return names[tipo] || tipo;
    }

    getTemperatureClass(temp, min, max) {
        if (!temp) return '';
        if (temp < min) return 'status-alert';
        if (temp > max) return 'status-alert';
        return 'status-normal';
    }

    getStatusBadge(sala) {
        if (sala.temperatura_atual === null || sala.temperatura_atual === undefined) {
            return '<span class="badge bg-secondary">Sem Dados</span>';
        }

        if (sala.temperatura_atual < sala.temperatura_ideal_min || sala.temperatura_atual > sala.temperatura_ideal_max) {
            return '<span class="badge bg-danger">Alerta</span>';
        }

        return '<span class="badge bg-success">Normal</span>';
    }

    showAddSalaModal() {
        this.isEditing = false;
        this.currentSala = null;
        document.getElementById('salaModalTitle').textContent = 'Nova Sala';
        document.getElementById('salaForm').reset();

        const modal = new bootstrap.Modal(document.getElementById('salaModal'));
        modal.show();
    }

    async editSala(salaId) {
        try {
            const response = await API.getSala(salaId);
            this.currentSala = response.data;
            this.isEditing = true;

            document.getElementById('salaModalTitle').textContent = 'Editar Sala';
            document.getElementById('salaNome').value = this.currentSala.nome;
            document.getElementById('salaTipo').value = this.currentSala.tipo || '';
            document.getElementById('salaTempMin').value = this.currentSala.temperatura_ideal_min;
            document.getElementById('salaTempMax').value = this.currentSala.temperatura_ideal_max;
            document.getElementById('salaDescricao').value = this.currentSala.descricao || '';

            const modal = new bootstrap.Modal(document.getElementById('salaModal'));
            modal.show();

        } catch (error) {
            console.error('Erro ao carregar dados da sala:', error);
            app.showError('Erro ao carregar dados da sala: ' + error.message);
        }
    }

    async saveSala() {
        const form = document.getElementById('salaForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const salaData = {
            nome: document.getElementById('salaNome').value,
            tipo: document.getElementById('salaTipo').value,
            temperatura_ideal_min: parseFloat(document.getElementById('salaTempMin').value),
            temperatura_ideal_max: parseFloat(document.getElementById('salaTempMax').value),
            descricao: document.getElementById('salaDescricao').value
        };

        try {
            if (this.isEditing) {
                await API.atualizarSala(this.currentSala.id, salaData);
                app.showSuccess('Sala atualizada com sucesso!');
            } else {
                await API.criarSala(salaData);
                app.showSuccess('Sala criada com sucesso!');
            }

            // Fechar modal e recarregar dados
            bootstrap.Modal.getInstance(document.getElementById('salaModal')).hide();
            await this.render();

        } catch (error) {
            console.error('Erro ao salvar sala:', error);
            app.showError('Erro ao salvar sala: ' + error.message);
        }
    }

    async deleteSala(salaId) {
        const sala = this.salas.find(s => s.id === salaId);
        if (!sala) return;

        document.getElementById('confirmMessage').textContent =
            `Tem certeza que deseja excluir a sala "${sala.nome}"? Esta ação não pode ser desfeita.`;

        const confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
        confirmModal.show();

        document.getElementById('confirmAction').onclick = async () => {
            try {
                await API.excluirSala(salaId);
                app.showSuccess('Sala excluída com sucesso!');
                confirmModal.hide();
                await this.render();
            } catch (error) {
                console.error('Erro ao excluir sala:', error);
                app.showError('Erro ao excluir sala: ' + error.message);
            }
        };
    }

    async viewSalaDetails(salaId) {
        try {
            const response = await API.getSala(salaId);
            const sala = response.data;

            // Aqui você pode implementar uma visualização detalhada
            // Por enquanto, vamos mostrar um alerta com as informações
            const details = `
                Sala: ${sala.nome}
                Tipo: ${this.getTipoDisplayName(sala.tipo)}
                Temperatura Atual: ${sala.temperatura_atual ? sala.temperatura_atual.toFixed(1) + '°C' : 'N/A'}
                Limites: ${sala.temperatura_ideal_min}°C - ${sala.temperatura_ideal_max}°C
                Status: ${this.getStatusBadge(sala).replace(/<[^>]*>/g, '')}
                Última Leitura: ${sala.ultima_leitura ? new Date(sala.ultima_leitura).toLocaleString('pt-BR') : 'N/A'}
            `;

            alert(details);

        } catch (error) {
            console.error('Erro ao carregar detalhes da sala:', error);
            app.showError('Erro ao carregar detalhes da sala: ' + error.message);
        }
    }
}

// Instância global
window.salasPage = new SalasPage();

// Função global para renderizar página de salas
window.renderPaginaSalas = function (dados) {
    salasPage.render();
}; 