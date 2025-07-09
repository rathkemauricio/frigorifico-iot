class ChartComponent {
    constructor(canvasId, options = {}) {
        this.canvasId = canvasId;
        this.chart = null;
        this.options = {
            responsive: true,
            maintainAspectRatio: false,
            ...options
        };
    }

    createChart(data) {
        // Verificar se Chart.js está disponível
        if (typeof Chart === 'undefined') {
            console.error('Chart.js não está carregado');
            return;
        }

        const ctx = document.getElementById(this.canvasId);
        if (!ctx) {
            console.error(`Canvas com ID '${this.canvasId}' não encontrado`);
            return;
        }

        // Destruir gráfico existente se houver
        if (this.chart) {
            this.chart.destroy();
        }

        // Verificar se já existe um gráfico no canvas e destruí-lo
        const existingChart = Chart.getChart(ctx);
        if (existingChart) {
            existingChart.destroy();
        }

        // Verificar se há dados para mostrar
        if (!data || !data.pontos || data.pontos.length === 0) {
            console.warn('Nenhum dado disponível para o gráfico');
            ctx.innerHTML = '<div class="alert alert-info">Nenhum dado disponível para o período selecionado</div>';
            return;
        }

        const chartData = this.prepareChartData(data);

        this.chart = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: {
                ...this.options,
                plugins: {
                    title: {
                        display: true,
                        text: `Temperatura - ${data.sala?.nome || 'Sala'}`
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            title: function (context) {
                                const dataIndex = context[0].dataIndex;
                                const dataHora = data.pontos[dataIndex]?.data_hora;
                                if (dataHora) {
                                    return new Date(dataHora).toLocaleString('pt-BR');
                                }
                                return 'Horário desconhecido';
                            },
                            label: function (context) {
                                if (context.parsed.y !== null) {
                                    return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}°C`;
                                }
                                return null;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'category',
                        title: {
                            display: true,
                            text: 'Horário'
                        },
                        ticks: {
                            maxTicksLimit: 10,
                            callback: function (value, index, values) {
                                if (index % Math.ceil(values.length / 10) === 0) {
                                    return new Date(value).toLocaleTimeString('pt-BR', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    });
                                }
                                return '';
                            }
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Temperatura (°C)'
                        },
                        ticks: {
                            callback: function (value) {
                                return value.toFixed(1) + '°C';
                            }
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                },
                elements: {
                    point: {
                        radius: 4,
                        hoverRadius: 6
                    },
                    line: {
                        tension: 0.1
                    }
                }
            }
        });

        return this.chart;
    }

    prepareChartData(data) {
        if (!data.pontos || data.pontos.length === 0) {
            return {
                labels: [],
                datasets: []
            };
        }

        const labels = data.pontos.map(ponto => ponto.data_hora);
        const temperaturas = data.pontos.map(ponto => ponto.temperatura);
        const alertas = data.pontos.map(ponto => ponto.is_alerta);

        // Criar dataset principal
        const datasets = [{
            label: 'Temperatura Atual',
            data: temperaturas,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.1)',
            borderWidth: 2,
            fill: false
        }];

        // Adicionar linha de temperatura mínima ideal
        if (data.sala?.temperatura_ideal_min !== undefined) {
            datasets.push({
                label: 'Temperatura Mínima Ideal',
                data: labels.map(() => data.sala.temperatura_ideal_min),
                borderColor: 'rgba(255, 193, 7, 0.8)',
                backgroundColor: 'rgba(255, 193, 7, 0.1)',
                borderWidth: 1,
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0
            });
        }

        // Adicionar linha de temperatura máxima ideal
        if (data.sala?.temperatura_ideal_max !== undefined) {
            datasets.push({
                label: 'Temperatura Máxima Ideal',
                data: labels.map(() => data.sala.temperatura_ideal_max),
                borderColor: 'rgba(255, 193, 7, 0.8)',
                backgroundColor: 'rgba(255, 193, 7, 0.1)',
                borderWidth: 1,
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0
            });
        }

        // Adicionar pontos de alerta
        const alertaIndices = data.pontos
            .map((ponto, index) => ponto.is_alerta ? index : -1)
            .filter(index => index !== -1);

        if (alertaIndices.length > 0) {
            datasets.push({
                label: 'Alertas',
                data: temperaturas.map((temp, index) =>
                    alertaIndices.includes(index) ? temp : null
                ),
                backgroundColor: 'rgba(220, 53, 69, 0.8)',
                borderColor: 'rgba(220, 53, 69, 1)',
                borderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: 'rgba(220, 53, 69, 1)',
                pointBorderColor: 'rgba(220, 53, 69, 1)'
            });
        }

        return {
            labels: labels,
            datasets: datasets
        };
    }

    updateChart(newData) {
        if (!this.chart) {
            return this.createChart(newData);
        }

        const chartData = this.prepareChartData(newData);
        this.chart.data = chartData;
        this.chart.update('none'); // Atualizar sem animação para melhor performance
    }

    addDataPoint(timestamp, temperatura, isAlerta = false) {
        if (!this.chart) return;

        const newPoint = {
            x: new Date(timestamp),
            y: temperatura
        };

        // Adicionar ao dataset principal
        this.chart.data.datasets[0].data.push(newPoint);

        // Adicionar ao dataset de alertas se necessário
        if (isAlerta) {
            const alertaDataset = this.chart.data.datasets.find(ds => ds.label === 'Alertas');
            if (alertaDataset) {
                alertaDataset.data.push(newPoint);
            }
        }

        // Remover pontos antigos se houver muitos
        const maxPoints = 100;
        if (this.chart.data.datasets[0].data.length > maxPoints) {
            this.chart.data.datasets.forEach(dataset => {
                if (dataset.data.length > maxPoints) {
                    dataset.data.shift();
                }
            });
        }

        this.chart.update('none');
    }

    destroy() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
    }

    // Método para criar gráfico de comparação entre salas
    static createComparisonChart(canvasId, salasData) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        const datasets = [];
        const colors = [
            'rgb(75, 192, 192)',
            'rgb(255, 99, 132)',
            'rgb(54, 162, 235)',
            'rgb(255, 205, 86)',
            'rgb(153, 102, 255)'
        ];

        salasData.forEach((salaData, index) => {
            if (salaData.pontos && salaData.pontos.length > 0) {
                datasets.push({
                    label: salaData.sala.nome,
                    data: salaData.pontos.map(ponto => ({
                        x: new Date(ponto.data_hora),
                        y: ponto.temperatura
                    })),
                    borderColor: colors[index % colors.length],
                    backgroundColor: colors[index % colors.length].replace('rgb', 'rgba').replace(')', ', 0.1)'),
                    borderWidth: 2,
                    fill: false
                });
            }
        });

        return new Chart(ctx, {
            type: 'line',
            data: { datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Comparação de Temperaturas - Todas as Salas'
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'hour'
                        },
                        title: {
                            display: true,
                            text: 'Horário'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Temperatura (°C)'
                        }
                    }
                }
            }
        });
    }
}

// Função global para mostrar gráfico em modal
// Variável global para gerenciar gráficos
let currentModalChart = null;

function showGraficoSala(salaId) {
    // Verificar se Chart.js está disponível
    if (typeof Chart === 'undefined') {
        console.error('Chart.js não está carregado');
        alert('Erro: Chart.js não está carregado. Tente recarregar a página.');
        return;
    }

    const modalElement = document.getElementById('graficoModal');
    const modal = new bootstrap.Modal(modalElement);

    // Destruir gráfico anterior se existir
    if (currentModalChart) {
        currentModalChart.destroy();
        currentModalChart = null;
    }

    // Limpar canvas
    const canvas = document.getElementById('graficoTemperatura');
    if (canvas) {
        canvas.innerHTML = '';
    }

    // Adicionar listener para destruir gráfico quando modal for fechado
    const handleModalHidden = () => {
        if (currentModalChart) {
            currentModalChart.destroy();
            currentModalChart = null;
        }
        modalElement.removeEventListener('hidden.bs.modal', handleModalHidden);
    };

    modalElement.addEventListener('hidden.bs.modal', handleModalHidden);

    modal.show();

    // Carregar dados da sala
    console.log('Carregando dados do gráfico para sala:', salaId);
    API.getGraficoSala(salaId)
        .then(data => {
            console.log('Dados recebidos:', data);
            // Pequeno delay para garantir que o modal esteja completamente carregado
            setTimeout(() => {
                console.log('Criando gráfico...');
                currentModalChart = new ChartComponent('graficoTemperatura');
                currentModalChart.createChart(data);
                console.log('Gráfico criado com sucesso');
            }, 100);
        })
        .catch(error => {
            console.error('Erro ao carregar dados do gráfico:', error);
            const canvas = document.getElementById('graficoTemperatura');
            if (canvas) {
                canvas.innerHTML = '<div class="alert alert-danger">Erro ao carregar dados do gráfico</div>';
            }
        });
}

// Função global para renderizar página de gráficos
window.renderPaginaGraficos = function (salas) {
    console.log('🎨 [DEBUG] Renderizando página de gráficos...');

    const container = document.getElementById('outrasSecoes');
    if (!container) {
        console.error('[DEBUG] Container para gráficos não encontrado');
        return;
    }

    // Gerar checkboxes das salas
    const salasCheckboxes = salas.map((sala, index) => `
        <div class="form-check form-check-inline">
            <input class="form-check-input sala-checkbox" type="checkbox" id="sala${sala.id}" value="${sala.id}">
            <label class="form-check-label" for="sala${sala.id}" style="color: ${getCorSala(index)};">
                <i class="bi bi-circle-fill me-1"></i>
                ${sala.nome}
            </label>
        </div>
    `).join('');

    // Gerar cards das salas individuais
    const salasCards = salas.map((sala, index) => `
        <div class="col-lg-6 col-xl-4 mb-4">
            <div class="card">
                <div class="card-header">
                    <h6 class="mb-0">
                        <i class="bi bi-box-fill" style="color: ${getCorSala(index)};"></i>
                        ${sala.nome}
                    </h6>
                </div>
                <div class="card-body">
                    <canvas id="graficoSala${sala.id}" width="300" height="150"></canvas>
                </div>
            </div>
        </div>
    `).join('');

    container.innerHTML = `
        <div class="row">
            <div class="col-12">
                <h2 class="mb-4">
                    <i class="bi bi-graph-up text-primary"></i>
                    Gráficos de Temperatura
                </h2>
            </div>
        </div>
        
        <div class="row">
            ${salasCards}
        </div>
    `;

    // Event listeners para filtros de tempo
    document.querySelectorAll('.filtro-tempo').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.classList.contains('active')) return;
            document.querySelectorAll('.filtro-tempo').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const periodo = this.dataset.periodo;
            console.log('[DEBUG] Filtro de período selecionado:', periodo);
            renderizarGraficoGeral(salas, periodo);
        });
    });

   
    document.querySelectorAll('.sala-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const periodoAtivo = document.querySelector('.filtro-tempo.active').dataset.periodo;
            console.log('[DEBUG] Salas selecionadas alteradas');
            renderizarGraficoGeral(salas, periodoAtivo);
        });
    });

    // Renderizar gráficos após o DOM ser atualizado
    setTimeout(() => {
        renderizarGraficoGeral(salas, '24h');
        salas.forEach(sala => {
            renderizarGraficoSala(sala);
        });
    }, 100);
};

// Variáveis globais para instâncias dos gráficos
window.chartGeralInstance = null;
window.chartSalaInstances = {};

function renderizarGraficoGeral(salas, periodo = '24h') {
    console.log('[DEBUG] Renderizando gráfico geral para período:', periodo);
    const ctx = document.getElementById('graficoGeral');
    const loadingElement = document.getElementById('loadingGraficoGeral');
    const alertaSemSalas = document.getElementById('alertaSemSalas');
    if (!ctx) return;

    // Destruir instância global se existir
    if (window.chartGeralInstance) {
        console.log('[DEBUG] Destruindo instância global do gráfico geral');
        window.chartGeralInstance.destroy();
        window.chartGeralInstance = null;
    }
    ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);

    // Obter salas selecionadas
    const salasSelecionadas = Array.from(document.querySelectorAll('.sala-checkbox:checked'))
        .map(checkbox => parseInt(checkbox.value))
        .map(salaId => salas.find(sala => sala.id === salaId))
        .filter(sala => sala);
    console.log('[DEBUG] Salas selecionadas:', salasSelecionadas.map(s => s.nome));

    if (salasSelecionadas.length === 0) {
        if (loadingElement) loadingElement.style.display = 'none';
        ctx.style.display = 'none';
        if (alertaSemSalas) alertaSemSalas.style.display = 'block';
        return;
    }
    if (alertaSemSalas) alertaSemSalas.style.display = 'none';
    if (loadingElement) loadingElement.style.display = 'block';
    ctx.style.display = 'none';

    let tituloGrafico;
    switch (periodo) {
        case '24h':
            tituloGrafico = 'Temperaturas - Últimas 24 Horas';
            break;
        case '7d':
            tituloGrafico = 'Temperaturas - Última Semana';
            break;
        case '30d':
            tituloGrafico = 'Temperaturas - Último Mês';
            break;
        default:
            tituloGrafico = `Temperaturas - Período: ${periodo}`;
    }

    Promise.all(salasSelecionadas.map(sala =>
        API.getGraficoSala(sala.id, periodo, 100)
    )).then(responses => {
        const datasets = responses.map((response, index) => {
            const sala = salasSelecionadas[index];
            const dadosGrafico = response.data || {};
            const pontos = dadosGrafico.pontos || [];
            console.log(`[DEBUG] Sala ${sala.nome} - pontos:`, pontos);
            const salaIndex = salas.findIndex(s => s.id === sala.id);
            return {
                label: sala.nome,
                data: pontos.map(ponto => ({
                    x: new Date(ponto.data_hora),
                    y: ponto.temperatura
                })),
                borderColor: getCorSala(salaIndex),
                backgroundColor: getCorSala(salaIndex, 0.1),
                borderWidth: 2,
                fill: false,
                tension: 0.4,
                pointRadius: 3,
                pointHoverRadius: 6
            };
        }).filter(ds => ds.data.length > 0);

        if (loadingElement) loadingElement.style.display = 'none';

        if (datasets.length === 0) {
            ctx.style.display = 'block';
            ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
            ctx.getContext('2d').fillStyle = '#dc3545';
            ctx.getContext('2d').font = '16px Arial';
            ctx.getContext('2d').textAlign = 'center';
            ctx.getContext('2d').fillText('Nenhum dado disponível para o período selecionado', ctx.width / 2, ctx.height / 2);
            return;
        }

        ctx.style.display = 'block';
        console.log('[DEBUG] Criando nova instância global do gráfico geral');
        window.chartGeralInstance = new Chart(ctx, {
            type: 'line',
            data: { datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: tituloGrafico,
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        position: 'top',
                        labels: { usePointStyle: true, padding: 20 }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            title: function (context) {
                                if (context[0]) {
                                    return new Date(context[0].parsed.x).toLocaleString('pt-BR');
                                }
                                return '';
                            },
                            label: function (context) {
                                return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}°C`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: periodo === '24h' ? 'hour' : 'day',
                            displayFormats: { hour: 'HH:mm', day: 'dd/MM' }
                        },
                        title: { display: true, text: 'Horário' },
                        ticks: { maxTicksLimit: 10 }
                    },
                    y: {
                        title: { display: true, text: 'Temperatura (°C)' },
                        ticks: {
                            callback: function (value) {
                                return value.toFixed(1) + '°C';
                            }
                        }
                    }
                },
                interaction: { mode: 'nearest', axis: 'x', intersect: false },
                elements: {
                    point: { radius: 3, hoverRadius: 6 },
                    line: { tension: 0.4 }
                }
            }
        });
    }).catch(error => {
        console.error('[DEBUG] Erro ao carregar dados para gráfico geral:', error);
        if (loadingElement) loadingElement.style.display = 'none';
        ctx.style.display = 'block';
        ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
        ctx.getContext('2d').fillStyle = '#dc3545';
        ctx.getContext('2d').font = '16px Arial';
        ctx.getContext('2d').textAlign = 'center';
        ctx.getContext('2d').fillText('Erro ao carregar dados do gráfico', ctx.width / 2, ctx.height / 2);
    });
}

function renderizarGraficoSala(sala) {
    const ctx = document.getElementById(`graficoSala${sala.id}`);
    if (!ctx) return;

    // Destruir instância global se existir
    if (window.chartSalaInstances[sala.id]) {
        console.log(`[DEBUG] Destruindo instância global do gráfico da sala ${sala.nome}`);
        window.chartSalaInstances[sala.id].destroy();
        window.chartSalaInstances[sala.id] = null;
    }
    ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);

    // Buscar dados das últimas 6 horas
    API.getLeiturasSala(sala.id, 6).then(response => {
        const data = response.data || [];
        const chartData = {
            labels: data.map(leitura => {
                const date = new Date(leitura.data_hora);
                return date.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }),
            datasets: [{
                label: 'Temperatura',
                data: data.map(leitura => leitura.temperatura),
                borderColor: getCorSala(sala.id - 1),
                backgroundColor: getCorSala(sala.id - 1, 0.2),
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        };

        // Adicionar linhas de limite
        if (sala.temperatura_ideal_min !== null && sala.temperatura_ideal_max !== null) {
            chartData.datasets.push({
                label: 'Limite Mínimo',
                data: new Array(data.length).fill(sala.temperatura_ideal_min),
                borderColor: '#dc3545',
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0
            });

            chartData.datasets.push({
                label: 'Limite Máximo',
                data: new Array(data.length).fill(sala.temperatura_ideal_max),
                borderColor: '#dc3545',
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0
            });
        }

        if (data.length === 0) {
            ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
            ctx.getContext('2d').fillStyle = '#dc3545';
            ctx.getContext('2d').font = '16px Arial';
            ctx.getContext('2d').textAlign = 'center';
            ctx.getContext('2d').fillText('Nenhum dado disponível', ctx.width / 2, ctx.height / 2);
            return;
        }

        console.log(`[DEBUG] Criando nova instância global do gráfico da sala ${sala.nome}`);
        window.chartSalaInstances[sala.id] = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `${sala.nome} - Últimas 6 Horas`
                    },
                    legend: {
                        position: 'top',
                        labels: {
                            boxWidth: 12
                        }
                    }
                },
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: 'Temperatura (°C)'
                        }
                    }
                }
            }
        });
    }).catch(error => {
        console.error(`[DEBUG] Erro ao carregar dados para sala ${sala.id}:`, error);
        ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
        ctx.getContext('2d').fillStyle = '#dc3545';
        ctx.getContext('2d').font = '16px Arial';
        ctx.getContext('2d').textAlign = 'center';
        ctx.getContext('2d').fillText('Erro ao carregar dados', ctx.width / 2, ctx.height / 2);
    });
}

// Função para obter cores das salas
function getCorSala(index, alpha = 1) {
    const cores = [
        `rgba(52, 152, 219, ${alpha})`,   // Azul
        `rgba(231, 76, 60, ${alpha})`,    // Vermelho
        `rgba(46, 204, 113, ${alpha})`,   // Verde
        `rgba(155, 89, 182, ${alpha})`,   // Roxo
        `rgba(241, 196, 15, ${alpha})`,   // Amarelo
        `rgba(230, 126, 34, ${alpha})`,   // Laranja
        `rgba(26, 188, 156, ${alpha})`,   // Turquesa
        `rgba(149, 165, 166, ${alpha})`   // Cinza
    ];

    return cores[index % cores.length];
} 