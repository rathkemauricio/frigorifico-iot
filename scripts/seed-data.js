const sqlite3 = require('sqlite3').verbose();
const moment = require('moment');
const path = require('path');

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

    // 5% de chance de gerar alerta
    if (Math.random() < 0.05) {
        if (Math.random() > 0.5) {
            temperatura = sala.max + Math.random() * 2; // Acima do máximo
        } else {
            temperatura = sala.min - Math.random() * 2; // Abaixo do mínimo
        }
    }

    return parseFloat(temperatura.toFixed(2));
}

// Função para gerar dados para uma sala
function gerarDadosSala(sala, dataInicio, dataFim, intervaloMinutos = 5) {
    const dados = [];
    let timestamp = moment(dataInicio);

    while (timestamp.isBefore(dataFim)) {
        const temperatura = gerarTemperaturaRealista(sala, timestamp);

        dados.push({
            id_sala: sala.id,
            temperatura: temperatura,
            data_hora: timestamp.format('YYYY-MM-DD HH:mm:ss')
        });

        timestamp.add(intervaloMinutos, 'minutes');
    }

    return dados;
}

// Função para inserir dados no banco
function inserirDados(dados) {
    return new Promise((resolve, reject) => {
        const insertQuery = `
      INSERT INTO leituras (id_sala, temperatura, data_hora)
      VALUES (?, ?, ?)
    `;

        const stmt = db.prepare(insertQuery);
        let inseridos = 0;

        dados.forEach((dado, index) => {
            stmt.run([dado.id_sala, dado.temperatura, dado.data_hora], function (err) {
                if (err) {
                    console.error(`Erro ao inserir dado ${index}:`, err.message);
                } else {
                    inseridos++;
                }

                if (index === dados.length - 1) {
                    stmt.finalize((err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(inseridos);
                        }
                    });
                }
            });
        });
    });
}

// Função principal
async function seedData() {
    try {
        console.log('🌱 Iniciando seed de dados...\n');

        // Limpar dados existentes (opcional)
        console.log('🧹 Limpando dados existentes...');
        await new Promise((resolve, reject) => {
            db.run('DELETE FROM leituras', (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        // Gerar dados para os últimos 7 dias
        const dataFim = moment();
        const dataInicio = moment().subtract(7, 'days');

        console.log(`📅 Gerando dados de ${dataInicio.format('DD/MM/YYYY HH:mm')} até ${dataFim.format('DD/MM/YYYY HH:mm')}\n`);

        let totalInseridos = 0;

        // Gerar dados para cada sala
        for (const sala of SALAS) {
            console.log(`🌡️  Gerando dados para ${sala.nome}...`);

            // Dados a cada 5 minutos para os últimos 7 dias
            const dadosSala = gerarDadosSala(sala, dataInicio, dataFim, 5);

            console.log(`   📊 ${dadosSala.length} leituras geradas`);

            // Inserir dados
            const inseridos = await inserirDados(dadosSala);
            totalInseridos += inseridos;

            console.log(`   ✅ ${inseridos} leituras inseridas\n`);
        }

        // Gerar dados extras para hoje (a cada 1 minuto)
        console.log('🔄 Gerando dados detalhados para hoje...');
        const hojeInicio = moment().startOf('day');
        const hojeFim = moment();

        for (const sala of SALAS) {
            console.log(`   🌡️  ${sala.nome} - dados detalhados...`);

            const dadosDetalhados = gerarDadosSala(sala, hojeInicio, hojeFim, 1);

            console.log(`   📊 ${dadosDetalhados.length} leituras detalhadas geradas`);

            const inseridos = await inserirDados(dadosDetalhados);
            totalInseridos += inseridos;

            console.log(`   ✅ ${inseridos} leituras detalhadas inseridas`);
        }

        console.log(`\n🎉 Seed concluído com sucesso!`);
        console.log(`📈 Total de leituras inseridas: ${totalInseridos}`);

        // Mostrar estatísticas
        console.log('\n📊 Estatísticas geradas:');

        for (const sala of SALAS) {
            await new Promise((resolve) => {
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
                        console.log('');
                    }
                    resolve();
                });
            });
        }

        // Fechar conexão
        db.close((err) => {
            if (err) {
                console.error('Erro ao fechar banco de dados:', err.message);
            } else {
                console.log('✅ Conexão com banco de dados fechada.');
            }
        });

    } catch (error) {
        console.error('❌ Erro durante o seed:', error);
        process.exit(1);
    }
}

// Executar seed
seedData(); 