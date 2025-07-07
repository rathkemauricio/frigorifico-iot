const sqlite3 = require('sqlite3').verbose();
const moment = require('moment');

// Conectar ao banco de dados
const db = new sqlite3.Database('./database/frigorifico.db', (err) => {
    if (err) {
        console.error('Erro ao conectar com o banco de dados:', err.message);
        process.exit(1);
    }
    console.log('Conectado ao banco de dados SQLite.');
});

// Configurações das salas
const SALAS = [
    { id: 1, nome: 'Sala de Resfriamento 1', min: 1.0, max: 5.0 },
    { id: 2, nome: 'Sala de Congelamento 1', min: -18.0, max: -15.0 },
    { id: 3, nome: 'Sala de Resfriamento 2', min: 1.0, max: 5.0 },
    { id: 4, nome: 'Sala de Congelamento 2', min: -18.0, max: -15.0 },
    { id: 5, nome: 'Sala de Processamento', min: 2.0, max: 6.0 }
];

// Função para gerar temperatura realista
function gerarTemperaturaRealista(sala, timestamp) {
    const baseTemp = (sala.min + sala.max) / 2;
    const range = sala.max - sala.min;

    // Variação baseada no tempo (ciclo diário)
    const hora = moment(timestamp).hour();
    const variacaoCiclo = Math.sin((hora - 6) * Math.PI / 12) * (range * 0.2);

    // Variação aleatória
    const variacaoAleatoria = (Math.random() - 0.5) * (range * 0.3);

    // Variação de tendência (simulando mudanças graduais)
    const minutos = moment(timestamp).minutes();
    const variacaoTendencia = Math.sin(minutos * Math.PI / 30) * (range * 0.1);

    let temperatura = baseTemp + variacaoCiclo + variacaoAleatoria + variacaoTendencia;

    // 3% de chance de gerar alerta
    if (Math.random() < 0.03) {
        if (Math.random() > 0.5) {
            temperatura = sala.max + Math.random() * 3; // Acima do máximo
        } else {
            temperatura = sala.min - Math.random() * 3; // Abaixo do mínimo
        }
    }

    return parseFloat(temperatura.toFixed(2));
}

// Função para inserir uma leitura
function inserirLeitura(sala, temperatura, dataHora) {
    return new Promise((resolve, reject) => {
        const query = `
      INSERT INTO leituras (id_sala, temperatura, data_hora)
      VALUES (?, ?, ?)
    `;

        db.run(query, [sala.id, temperatura, dataHora], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
}

// Função para gerar e inserir dados para todas as salas
async function gerarDadosTempoReal() {
    const agora = moment();

    console.log(`\n🕐 ${agora.format('DD/MM/YYYY HH:mm:ss')} - Gerando leituras...`);

    for (const sala of SALAS) {
        try {
            const temperatura = gerarTemperaturaRealista(sala, agora);
            const dataHora = agora.format('YYYY-MM-DD HH:mm:ss');

            await inserirLeitura(sala, temperatura, dataHora);

            // Verificar se é um alerta
            const isAlerta = temperatura < sala.min || temperatura > sala.max;
            const status = isAlerta ? '⚠️  ALERTA' : '✅ Normal';

            console.log(`   ${sala.nome}: ${temperatura}°C ${status}`);

        } catch (error) {
            console.error(`   ❌ Erro ao inserir dados para ${sala.nome}:`, error.message);
        }
    }
}

// Função para mostrar estatísticas
function mostrarEstatisticas() {
    console.log('\n📊 Estatísticas atuais:');

    SALAS.forEach((sala, index) => {
        db.get(`
      SELECT 
        COUNT(*) as total,
        AVG(temperatura) as media,
        MIN(temperatura) as minima,
        MAX(temperatura) as maxima,
        COUNT(CASE WHEN temperatura < ? OR temperatura > ? THEN 1 END) as alertas
      FROM leituras 
      WHERE id_sala = ?
      AND data_hora >= datetime('now', '-1 hour')
    `, [sala.min, sala.max, sala.id], (err, stats) => {
            if (!err && stats) {
                console.log(`   ${sala.nome} (última hora):`);
                console.log(`     📊 Total: ${stats.total} leituras`);
                console.log(`     🌡️  Média: ${stats.media ? stats.media.toFixed(2) + '°C' : 'N/A'}`);
                console.log(`     ❄️  Mínima: ${stats.minima ? stats.minima.toFixed(2) + '°C' : 'N/A'}`);
                console.log(`     🔥 Máxima: ${stats.maxima ? stats.maxima.toFixed(2) + '°C' : 'N/A'}`);
                console.log(`     ⚠️  Alertas: ${stats.alertas}`);
                console.log('');
            }
        });
    });
}

// Função principal
async function iniciarSeedContinuo() {
    console.log('🚀 Iniciando seed contínuo de dados...');
    console.log('📝 Pressione Ctrl+C para parar\n');

    // Gerar dados iniciais
    await gerarDadosTempoReal();

    // Mostrar estatísticas iniciais
    setTimeout(mostrarEstatisticas, 2000);

    // Configurar intervalo para gerar dados a cada 30 segundos
    const intervalo = setInterval(async () => {
        try {
            await gerarDadosTempoReal();
        } catch (error) {
            console.error('❌ Erro durante geração de dados:', error);
        }
    }, 30000); // 30 segundos

    // Mostrar estatísticas a cada 5 minutos
    const estatisticasIntervalo = setInterval(() => {
        mostrarEstatisticas();
    }, 300000); // 5 minutos

    // Tratamento de interrupção
    process.on('SIGINT', () => {
        console.log('\n\n🛑 Parando seed contínuo...');
        clearInterval(intervalo);
        clearInterval(estatisticasIntervalo);

        // Mostrar estatísticas finais
        setTimeout(() => {
            console.log('\n📊 Estatísticas finais:');
            SALAS.forEach((sala) => {
                db.get(`
          SELECT 
            COUNT(*) as total,
            AVG(temperatura) as media,
            MIN(temperatura) as minima,
            MAX(temperatura) as maxima,
            COUNT(CASE WHEN temperatura < ? OR temperatura > ? THEN 1 END) as alertas
          FROM leituras 
          WHERE id_sala = ?
        `, [sala.min, sala.max, sala.id], (err, stats) => {
                    if (!err && stats) {
                        console.log(`   ${sala.nome}:`);
                        console.log(`     📊 Total: ${stats.total} leituras`);
                        console.log(`     🌡️  Média: ${stats.media ? stats.media.toFixed(2) + '°C' : 'N/A'}`);
                        console.log(`     ❄️  Mínima: ${stats.minima ? stats.minima.toFixed(2) + '°C' : 'N/A'}`);
                        console.log(`     🔥 Máxima: ${stats.maxima ? stats.maxima.toFixed(2) + '°C' : 'N/A'}`);
                        console.log(`     ⚠️  Alertas: ${stats.alertas}`);
                    }

                    // Fechar conexão após mostrar todas as estatísticas
                    if (sala.id === SALAS[SALAS.length - 1].id) {
                        setTimeout(() => {
                            db.close((err) => {
                                if (err) {
                                    console.error('Erro ao fechar banco de dados:', err.message);
                                } else {
                                    console.log('\n✅ Conexão com banco de dados fechada.');
                                    console.log('👋 Seed contínuo finalizado!');
                                }
                                process.exit(0);
                            });
                        }, 1000);
                    }
                });
            });
        }, 1000);
    });
}

// Executar seed contínuo
iniciarSeedContinuo(); 