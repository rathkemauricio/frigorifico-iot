class AlertCard {
    constructor(data) {
        this.data = data;
    }

    render() {
        const alertClass = this.getAlertClass();
        const alertIcon = this.getAlertIcon();
        const alertTitle = this.getAlertTitle();

        return `
            <div class="alert alert-card ${alertClass} mb-3" role="alert">
                <div class="d-flex align-items-start">
                    <div class="flex-shrink-0">
                        <i class="${alertIcon} fs-4"></i>
                    </div>
                    <div class="flex-grow-1 ms-3">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <h6 class="alert-heading mb-1">
                                    <i class="bi bi-box-fill"></i>
                                    ${this.data.nome_sala}
                                </h6>
                                <p class="mb-1">
                                    <strong>${alertTitle}</strong>: ${this.data.temperatura.toFixed(1)}°C
                                </p>
                                <p class="mb-1 small">
                                    <strong>Limite:</strong> ${this.data.temperatura_ideal_min}°C - ${this.data.temperatura_ideal_max}°C
                                    <span class="badge ${this.getBadgeClass()} ms-2">
                                        Diferença: ${Math.abs(this.data.diferenca).toFixed(1)}°C
                                    </span>
                                </p>
                                <p class="mb-0 small text-muted">
                                    <i class="bi bi-clock me-1"></i>
                                    ${this.data.tempo_atras}
                                </p>
                            </div>
                            <div class="text-end">
                                <div class="temperature-display ${this.getTemperatureClass()}">
                                    ${this.data.temperatura.toFixed(1)}°C
                                </div>
                                <small class="text-muted">
                                    ${this.data.tipo_alerta === 'baixa' ? 'Abaixo do mínimo' : 'Acima do máximo'}
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getAlertClass() {
        if (this.data.tipo_alerta === 'baixa') {
            return 'alert-warning';
        }
        return 'alert-danger';
    }

    getAlertIcon() {
        if (this.data.tipo_alerta === 'baixa') {
            return 'bi bi-thermometer-snow text-warning';
        }
        return 'bi bi-thermometer-sun text-danger';
    }

    getAlertTitle() {
        if (this.data.tipo_alerta === 'baixa') {
            return 'Temperatura Muito Baixa';
        }
        return 'Temperatura Muito Alta';
    }

    getBadgeClass() {
        if (this.data.tipo_alerta === 'baixa') {
            return 'bg-warning text-dark';
        }
        return 'bg-danger';
    }

    getTemperatureClass() {
        if (this.data.tipo_alerta === 'baixa') {
            return 'status-warning';
        }
        return 'status-alert';
    }

    static renderAll(alertas) {
        const container = document.getElementById('alertasRecentes');
        if (!container) return;

        if (!alertas || alertas.length === 0) {
            container.innerHTML = `
                <div class="alert alert-success text-center">
                    <i class="bi bi-check-circle me-2"></i>
                    <strong>Nenhum alerta ativo!</strong> Todas as temperaturas estão dentro dos limites ideais.
                </div>
            `;
            return;
        }

        const cardsHTML = alertas.map(alerta => {
            const card = new AlertCard(alerta);
            return card.render();
        }).join('');

        container.innerHTML = cardsHTML;
    }

    static addAlert(alerta) {
        const container = document.getElementById('alertasRecentes');
        if (!container) return;

        // Remover mensagem de "nenhum alerta" se existir
        const noAlertsMessage = container.querySelector('.alert-success');
        if (noAlertsMessage) {
            noAlertsMessage.remove();
        }

        // Criar novo card de alerta
        const card = new AlertCard(alerta);
        const alertHTML = card.render();

        // Adicionar no topo da lista
        container.insertAdjacentHTML('afterbegin', alertHTML);

        // Limitar a 10 alertas
        const alerts = container.querySelectorAll('.alert-card');
        if (alerts.length > 10) {
            alerts[alerts.length - 1].remove();
        }

        // Adicionar animação
        const newAlert = container.querySelector('.alert-card');
        if (newAlert) {
            newAlert.style.animation = 'fadeIn 0.5s ease-in';
        }
    }

    static updateAlert(salaId, novaTemperatura) {
        const alertElement = document.querySelector(`[data-sala-id="${salaId}"]`);
        if (alertElement) {
            const card = new AlertCard(novaTemperatura);
            alertElement.outerHTML = card.render();
        }
    }

    static removeAlert(salaId) {
        const alertElement = document.querySelector(`[data-sala-id="${salaId}"]`);
        if (alertElement) {
            alertElement.remove();
        }
    }
}

// Adicionar CSS para animação
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .alert-card {
        transition: all 0.3s ease;
    }
    
    .alert-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
`;
document.head.appendChild(style); 