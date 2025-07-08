class TemperatureCard {
    constructor(data) {
        this.data = data;
    }

    render() {
        const statusClass = this.getStatusClass();
        const statusIcon = this.getStatusIcon();
        const statusText = this.getStatusText();

        return `
            <div class="col-lg-4 col-md-6 mb-3">
                <div class="card alert-card h-100 ${statusClass}">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h6 class="mb-0">
                            <i class="bi bi-box-fill"></i>
                            ${this.data.nome}
                        </h6>
                        <span class="badge ${this.getBadgeClass()}">${statusText}</span>
                    </div>
                    <div class="card-body text-center">
                        <div class="temperature-display ${this.getTemperatureClass()}">
                            ${this.data.temperatura_atual ? this.data.temperatura_atual.toFixed(1) + '°C' : 'N/A'}
                        </div>
                        <div class="mt-2">
                            <small class="text-muted">
                                Ideal: ${this.data.temperatura_ideal_min}°C - ${this.data.temperatura_ideal_max}°C
                            </small>
                        </div>
                        <div class="mt-2">
                            <small class="text-muted">
                                <i class="bi bi-clock me-1"></i>
                                ${this.data.tempo_atras || 'Nunca'}
                            </small>
                        </div>
                    </div>
                    <div class="card-footer">
                      
                    </div>
                </div>
            </div>
        `;
    }

    getStatusClass() {
        if (!this.data.temperatura_atual) return 'border-warning';

        if (this.data.is_alerta) {
            return 'border-danger';
        }
        return 'border-success';
    }

    getStatusIcon() {
        if (!this.data.temperatura_atual) return 'bi-question-circle';

        if (this.data.is_alerta) {
            return 'bi-exclamation-triangle';
        }
        return 'bi-check-circle';
    }

    getStatusText() {
        if (!this.data.temperatura_atual) return 'Sem dados';

        if (this.data.is_alerta) {
            return 'Alerta';
        }
        return 'Normal';
    }

    getBadgeClass() {
        if (!this.data.temperatura_atual) return 'bg-warning text-dark';

        if (this.data.is_alerta) {
            return 'bg-danger';
        }
        return 'bg-success';
    }

    getTemperatureClass() {
        if (!this.data.temperatura_atual) return 'text-muted';

        if (this.data.is_alerta) {
            return 'status-alert';
        }
        return 'status-normal';
    }

    static renderAll(temperaturas) {
        const container = document.getElementById('temperaturasAtuais');
        if (!container) return;

        if (!temperaturas || temperaturas.length === 0) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-info text-center">
                        <i class="bi bi-info-circle me-2"></i>
                        Nenhuma temperatura disponível no momento.
                    </div>
                </div>
            `;
            return;
        }

        const cardsHTML = temperaturas.map(temp => {
            const card = new TemperatureCard(temp);
            return card.render();
        }).join('');

        container.innerHTML = cardsHTML;
    }

    static updateCard(salaId, novaTemperatura) {
        const cardElement = document.querySelector(`[data-sala-id="${salaId}"]`);
        if (cardElement) {
            const card = new TemperatureCard(novaTemperatura);
            cardElement.outerHTML = card.render();
        }
    }
}

// Funções globais para interação
function showGraficoSala(salaId) {
    // Implementar abertura do modal com gráfico
    console.log('Mostrar gráfico da sala:', salaId);
    // TODO: Implementar modal de gráfico
}

function showDetalhesSala(salaId) {
    // Implementar exibição de detalhes da sala
    console.log('Mostrar detalhes da sala:', salaId);
    // TODO: Implementar modal de detalhes
} 