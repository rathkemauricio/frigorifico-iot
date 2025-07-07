// Utilitários auxiliares para o sistema de monitoramento

class Helpers {
    // Formatação de data/hora
    static formatDateTime(dateTime) {
        if (!dateTime) return 'N/A';

        const date = new Date(dateTime);
        return date.toLocaleString('pt-BR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }

    static formatDate(dateTime) {
        if (!dateTime) return 'N/A';

        const date = new Date(dateTime);
        return date.toLocaleDateString('pt-BR');
    }

    static formatTime(dateTime) {
        if (!dateTime) return 'N/A';

        const date = new Date(dateTime);
        return date.toLocaleTimeString('pt-BR');
    }

    // Formatação de temperatura
    static formatTemperature(temp) {
        if (temp === null || temp === undefined) return 'N/A';
        return `${parseFloat(temp).toFixed(1)}°C`;
    }

    static formatTemperatureRange(min, max) {
        if (min === null || max === null) return 'N/A';
        return `${parseFloat(min).toFixed(1)}°C - ${parseFloat(max).toFixed(1)}°C`;
    }

    // Formatação de tempo relativo
    static timeAgo(dateTime) {
        if (!dateTime) return 'Nunca';

        const now = new Date();
        const date = new Date(dateTime);
        const diffMs = now - date;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);

        if (diffSec < 60) return 'Agora';
        if (diffMin < 60) return `${diffMin} min atrás`;
        if (diffHour < 24) return `${diffHour}h atrás`;
        if (diffDay < 7) return `${diffDay} dias atrás`;

        return this.formatDate(dateTime);
    }

    // Validação de dados
    static isValidTemperature(temp) {
        return !isNaN(temp) && temp >= -50 && temp <= 50;
    }

    static isValidSalaId(id) {
        return !isNaN(id) && id > 0;
    }

    static isValidDate(dateTime) {
        const date = new Date(dateTime);
        return !isNaN(date.getTime());
    }

    // Verificação de status
    static getTemperatureStatus(temp, min, max) {
        if (!this.isValidTemperature(temp)) return 'unknown';
        if (temp < min) return 'low';
        if (temp > max) return 'high';
        return 'normal';
    }

    static getStatusClass(status) {
        const classes = {
            normal: 'success',
            low: 'warning',
            high: 'danger',
            unknown: 'secondary'
        };
        return classes[status] || 'secondary';
    }

    static getStatusIcon(status) {
        const icons = {
            normal: 'bi-check-circle',
            low: 'bi-thermometer-snow',
            high: 'bi-thermometer-sun',
            unknown: 'bi-question-circle'
        };
        return icons[status] || 'bi-question-circle';
    }

    // Formatação de números
    static formatNumber(num, decimals = 2) {
        if (num === null || num === undefined) return 'N/A';
        return parseFloat(num).toFixed(decimals);
    }

    static formatPercentage(num, total) {
        if (total === 0) return '0%';
        const percentage = (num / total) * 100;
        return `${percentage.toFixed(1)}%`;
    }

    // Geração de cores
    static getTemperatureColor(temp, min, max) {
        const status = this.getTemperatureStatus(temp, min, max);
        const colors = {
            normal: '#28a745',
            low: '#ffc107',
            high: '#dc3545',
            unknown: '#6c757d'
        };
        return colors[status] || '#6c757d';
    }

    static getGradientColor(temp, min, max) {
        if (!this.isValidTemperature(temp)) return '#6c757d';

        const range = max - min;
        const position = (temp - min) / range;

        // Cores: azul (frio) -> verde (normal) -> vermelho (quente)
        if (position < 0.3) {
            // Azul para verde
            const factor = position / 0.3;
            return this.interpolateColor('#007bff', '#28a745', factor);
        } else if (position < 0.7) {
            // Verde para amarelo
            const factor = (position - 0.3) / 0.4;
            return this.interpolateColor('#28a745', '#ffc107', factor);
        } else {
            // Amarelo para vermelho
            const factor = (position - 0.7) / 0.3;
            return this.interpolateColor('#ffc107', '#dc3545', factor);
        }
    }

    static interpolateColor(color1, color2, factor) {
        const r1 = parseInt(color1.slice(1, 3), 16);
        const g1 = parseInt(color1.slice(3, 5), 16);
        const b1 = parseInt(color1.slice(5, 7), 16);

        const r2 = parseInt(color2.slice(1, 3), 16);
        const g2 = parseInt(color2.slice(3, 5), 16);
        const b2 = parseInt(color2.slice(5, 7), 16);

        const r = Math.round(r1 + (r2 - r1) * factor);
        const g = Math.round(g1 + (g2 - g1) * factor);
        const b = Math.round(b1 + (b2 - b1) * factor);

        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    // Manipulação de arrays e objetos
    static groupBy(array, key) {
        return array.reduce((groups, item) => {
            const group = item[key];
            groups[group] = groups[group] || [];
            groups[group].push(item);
            return groups;
        }, {});
    }

    static sortBy(array, key, order = 'asc') {
        return array.sort((a, b) => {
            let aVal = a[key];
            let bVal = b[key];

            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }

            if (order === 'desc') {
                return bVal > aVal ? 1 : -1;
            }
            return aVal > bVal ? 1 : -1;
        });
    }

    static filterBy(array, key, value) {
        return array.filter(item => item[key] === value);
    }

    // Debounce para otimização de performance
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Throttle para limitar frequência de execução
    static throttle(func, limit) {
        let inThrottle;
        return function () {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Local Storage helpers
    static setLocalStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Erro ao salvar no localStorage:', error);
        }
    }

    static getLocalStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Erro ao ler do localStorage:', error);
            return defaultValue;
        }
    }

    static removeLocalStorage(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Erro ao remover do localStorage:', error);
        }
    }

    // URL helpers
    static getUrlParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    static setUrlParameter(name, value) {
        const url = new URL(window.location);
        url.searchParams.set(name, value);
        window.history.pushState({}, '', url);
    }

    // Notificação helpers
    static showNotification(title, message, type = 'info', duration = 5000) {
        if (typeof app !== 'undefined' && app.showToast) {
            app.showToast(title, message, type);
        } else {
            // Fallback para notificação simples
            this.showSimpleNotification(title, message, type, duration);
        }
    }

    static showSimpleNotification(title, message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = `
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
        `;

        notification.innerHTML = `
            <strong>${title}</strong><br>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, duration);
    }

    // Data validation helpers
    static validateSalaData(data) {
        const errors = [];

        if (!data.nome || data.nome.trim() === '') {
            errors.push('Nome da sala é obrigatório');
        }

        if (data.temperatura_ideal_min === undefined || data.temperatura_ideal_min === null) {
            errors.push('Temperatura mínima é obrigatória');
        } else if (!this.isValidTemperature(data.temperatura_ideal_min)) {
            errors.push('Temperatura mínima inválida');
        }

        if (data.temperatura_ideal_max === undefined || data.temperatura_ideal_max === null) {
            errors.push('Temperatura máxima é obrigatória');
        } else if (!this.isValidTemperature(data.temperatura_ideal_max)) {
            errors.push('Temperatura máxima inválida');
        }

        if (data.temperatura_ideal_min >= data.temperatura_ideal_max) {
            errors.push('Temperatura mínima deve ser menor que a máxima');
        }

        return errors;
    }

    static validateLeituraData(data) {
        const errors = [];

        if (!this.isValidSalaId(data.id_sala)) {
            errors.push('ID da sala é obrigatório e deve ser um número válido');
        }

        if (!this.isValidTemperature(data.temperatura)) {
            errors.push('Temperatura é obrigatória e deve ser um número válido');
        }

        if (!this.isValidDate(data.data_hora)) {
            errors.push('Data/hora é obrigatória e deve ser um formato válido');
        }

        return errors;
    }

    // Chart helpers
    static prepareChartData(leituras, sala) {
        if (!leituras || leituras.length === 0) {
            return {
                labels: [],
                datasets: []
            };
        }

        const labels = leituras.map(l => new Date(l.data_hora));
        const temperaturas = leituras.map(l => l.temperatura);
        const alertas = leituras.map(l => l.is_alerta);

        const datasets = [{
            label: 'Temperatura Atual',
            data: leituras.map(l => ({
                x: new Date(l.data_hora),
                y: l.temperatura
            })),
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.1)',
            borderWidth: 2,
            fill: false
        }];

        // Adicionar linhas de limite se disponível
        if (sala) {
            if (sala.temperatura_ideal_min !== undefined) {
                datasets.push({
                    label: 'Temperatura Mínima Ideal',
                    data: labels.map(() => sala.temperatura_ideal_min),
                    borderColor: 'rgba(255, 193, 7, 0.8)',
                    backgroundColor: 'rgba(255, 193, 7, 0.1)',
                    borderWidth: 1,
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 0
                });
            }

            if (sala.temperatura_ideal_max !== undefined) {
                datasets.push({
                    label: 'Temperatura Máxima Ideal',
                    data: labels.map(() => sala.temperatura_ideal_max),
                    borderColor: 'rgba(255, 193, 7, 0.8)',
                    backgroundColor: 'rgba(255, 193, 7, 0.1)',
                    borderWidth: 1,
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 0
                });
            }
        }

        // Adicionar pontos de alerta
        const alertaPoints = leituras
            .filter(l => l.is_alerta)
            .map(l => ({
                x: new Date(l.data_hora),
                y: l.temperatura
            }));

        if (alertaPoints.length > 0) {
            datasets.push({
                label: 'Alertas',
                data: alertaPoints,
                backgroundColor: 'rgba(220, 53, 69, 0.8)',
                borderColor: 'rgba(220, 53, 69, 1)',
                borderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8,
                type: 'scatter'
            });
        }

        return {
            labels: labels,
            datasets: datasets
        };
    }
}

// Exportar para uso global
window.Helpers = Helpers; 