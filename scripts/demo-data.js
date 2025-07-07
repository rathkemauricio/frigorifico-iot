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

// Cenários de demonstração
const CENARIOS = {
    NORMAL: 'normal',
    ALERTA_ALTO: 'alerta_alto',
    ALERTA_BAIXO: 'alerta_baixo',
    FALHA_SISTEMA: 'falha_sistema',
    RECUPERACAO: 'recuperacao'
};

// Função para gerar temperatura baseada no cenário
function gerarTemperaturaCenario(sala, timestamp, cenario) {
    const baseTemp = (sala.min + sala.max) / 2;
    const range = sala.max - sala.min;

    let temperatura;

    switch (cenario) {
        case CENARIOS.NORMAL:
            // Temperatura normal com pequenas variações
            const variacao = (Math.random() - 0.5) * (range * 0.2);
            temperatura = baseTemp + variacao;
            break;

        case CENARIOS.ALERTA_ALTO:
            // Temperatura acima do máximo
            temperatura = sala.max + 1 + Math.random() * 3;
            break;

        case CENARIOS.ALERTA_BAIXO:
            // Temperatura abaixo do mínimo
            temperatura = sala.min - 1 - Math.random() * 3;
            break;

        case CENARIOS.FALHA_SISTEMA:
            // Falha crítica - temperatura muito alta
            temperatura = sala.max + 5 + Math.random() * 5;
            break;

        case CENARIOS.RECUPERACAO:
            // Recuperação gradual
            const progresso = Math.random(); // 0 a 1
            const tempAlerta = sala.max + 2;
            const tempNormal = baseTemp;
            temperatura = tempAlerta - (tempAlerta - tempNormal) * progresso;
            break;

        default:
            temperatura = baseTemp;
    }

    return parseFloat(temperatura.toFixed(2));
}

// Função para inserir dados
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

// Função para gerar dados de demonstração
async function gerarDadosDemo() {
    console.log('🎭 Gerando dados de demonstração...\n');

    const dados = [];
    const agora = moment();

    // Cenário 1: Dados normais (últimas 2 horas)
    console.log('📊 Cenário 1: Dados normais (últimas 2 horas)');
    for (let i = 120; i >= 0; i--) {
        const timestamp = moment(agora).subtract(i, 'minutes');

        SALAS.forEach(sala => {
            const temperatura = gerarTemperaturaCenario(sala, timestamp, CENARIOS.NORMAL);
            dados.push({
                id_sala: sala.id,
                temperatura: temperatura,
                data_hora: timestamp.format('YYYY-MM-DD HH:mm:ss')
            });
        });
    }

    // Cenário 2: Alertas esporádicos (última hora)
    console.log('⚠️  Cenário 2: Alertas esporádicos (última hora)');
    for (let i = 60; i >= 0; i--) {
        const timestamp = moment(agora).subtract(i, 'minutes');

        SALAS.forEach((sala, index) => {
            let cenario = CENARIOS.NORMAL;

            // Gerar alertas em momentos específicos
            if (i === 45 && index === 0) cenario = CENARIOS.ALERTA_ALTO; // Sala 1 - 45 min atrás
            if (i === 30 && index === 2) cenario = CENARIOS.ALERTA_BAIXO; // Sala 3 - 30 min atrás
            if (i === 15 && index === 4) cenario = CENARIOS.ALERTA_ALTO; // Sala 5 - 15 min atrás

            const temperatura = gerarTemperaturaCenario(sala, timestamp, cenario);
            dados.push({
                id_sala: sala.id,
                temperatura: temperatura,
                data_hora: timestamp.format('YYYY-MM-DD HH:mm:ss')
            });
        });
    }

    // Cenário 3: Falha de sistema (últimos 30 minutos)
    console.log('🚨 Cenário 3: Falha de sistema (últimos 30 minutos)');
    for (let i = 30; i >= 0; i--) {
        const timestamp = moment(agora).subtract(i, 'minutes');

        SALAS.forEach((sala, index) => {
            let cenario = CENARIOS.NORMAL;

            // Falha crítica na sala 2 entre 20 e 10 minutos atrás
            if (index === 1 && i <= 20 && i >= 10) {
                cenario = CENARIOS.FALHA_SISTEMA;
            }

            // Recuperação gradual na sala 2 nos últimos 10 minutos
            if (index === 1 && i < 10) {
                cenario = CENARIOS.RECUPERACAO;
            }

            const temperatura = gerarTemperaturaCenario(sala, timestamp, cenario);
            dados.push({
                id_sala: sala.id,
                temperatura: temperatura,
                data_hora: timestamp.format('YYYY-MM-DD HH:mm:ss')
            });
        });
    }

    // Cenário 4: Dados em tempo real (últimos 5 minutos)
    console.log('🔄 Cenário 4: Dados em tempo real (últimos 5 minutos)');
    for (let i = 5; i >= 0; i--) {
        const timestamp = moment(agora).subtract(i, 'minutes');

        SALAS.forEach((sala, index) => {
            let cenario = CENARIOS.NORMAL;

            // Pequenos alertas em tempo real
            if (i === 3 && index === 3) cenario = CENARIOS.ALERTA_BAIXO;
            if (i === 1 && index === 0) cenario = CENARIOS.ALERTA_ALTO;

            const temperatura = gerarTemperaturaCenario(sala, timestamp, cenario);
            dados.push({
                id_sala: sala.id,
                temperatura: temperatura,
                data_hora: timestamp.format('YYYY-MM-DD HH:mm:ss')
            });
        });
    }

    return dados;
}

// Função principal
async function executarDemo() {
    try {
        console.log('🎬 Iniciando geração de dados de demonstração...\n');

        // Limpar dados existentes
        console.log('🧹 Limpando dados existentes...');
        await new Promise((resolve, reject) => {
            db.run('DELETE FROM leituras', (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        // Gerar dados de demonstração
        const dados = await gerarDadosDemo();

        console.log(`\n📈 Total de leituras geradas: ${dados.length}`);

        // Inserir dados
        console.log('\n💾 Inserindo dados no banco...');
        const inseridos = await inserirDados(dados);
        console.log(`✅ ${inseridos} leituras inseridas com sucesso!`);

        // Mostrar resumo dos cenários
        console.log('\n📋 Resumo dos cenários criados:');
        console.log('   📊 Dados normais: Últimas 2 horas');
        console.log('   ⚠️  Alertas esporádicos: Última hora');
        console.log('   🚨 Falha de sistema: Últimos 30 minutos (Sala de Congelamento 1)');
        console.log('   🔄 Dados em tempo real: Últimos 5 minutos');

        // Mostrar estatísticas
        console.log('\n📊 Estatísticas finais:');

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

        console.log('🎉 Dados de demonstração criados com sucesso!');
        console.log('🌐 Acesse a aplicação para visualizar os gráficos e alertas.');

        // Fechar conexão
        db.close((err) => {
            if (err) {
                console.error('Erro ao fechar banco de dados:', err.message);
            } else {
                console.log('✅ Conexão com banco de dados fechada.');
            }
        });

    } catch (error) {
        console.error('❌ Erro durante geração de dados:', error);
        process.exit(1);
    }
}

// Executar demo
executarDemo(); 