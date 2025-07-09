const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Conectar ao banco
const dbPath = path.join(__dirname, 'database', 'frigorifico.db');
const db = new sqlite3.Database(dbPath);

console.log('=== VERIFICAÇÃO DO BANCO DE DADOS ===\n');

// Verificar dados das leituras
db.all('SELECT MIN(data_hora) as min_data, MAX(data_hora) as max_data, COUNT(*) as total FROM leituras', (err, rows) => {
    if (err) {
        console.error('Erro ao consultar leituras:', err);
        return;
    }
    
    console.log('📊 DADOS DAS LEITURAS:');
    console.log('Total de leituras:', rows[0].total);
    console.log('Data mais antiga:', rows[0].min_data);
    console.log('Data mais recente:', rows[0].max_data);
    console.log('');

    // Verificar algumas leituras de exemplo
    db.all('SELECT id_sala, temperatura, data_hora FROM leituras ORDER BY data_hora DESC LIMIT 5', (err, leituras) => {
        if (err) {
            console.error('Erro ao consultar leituras de exemplo:', err);
            return;
        }
        
        console.log('📋 ÚLTIMAS 5 LEITURAS:');
        leituras.forEach((leitura, index) => {
            console.log(`${index + 1}. Sala ${leitura.id_sala} - ${leitura.temperatura}°C - ${leitura.data_hora}`);
        });
        console.log('');

        // Verificar salas
        db.all('SELECT id, nome, temperatura_ideal_min, temperatura_ideal_max FROM salas', (err, salas) => {
            if (err) {
                console.error('Erro ao consultar salas:', err);
                return;
            }
            
            console.log('🏢 SALAS CADASTRADAS:');
            salas.forEach(sala => {
                console.log(`ID ${sala.id}: ${sala.nome} (${sala.temperatura_ideal_min}°C a ${sala.temperatura_ideal_max}°C)`);
            });
            console.log('');

            // Testar filtro de data
            const agora = new Date();
            const data24h = new Date(agora.getTime() - 24 * 60 * 60 * 1000);
            const data7d = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
            
            console.log('🔍 TESTE DE FILTROS DE DATA:');
            console.log('Data atual:', agora.toISOString());
            console.log('Data 24h atrás:', data24h.toISOString());
            console.log('Data 7d atrás:', data7d.toISOString());
            console.log('');

            // Testar query com filtro de 24h
            db.all('SELECT COUNT(*) as count FROM leituras WHERE data_hora >= ?', [data24h.toISOString()], (err, result) => {
                if (err) {
                    console.error('Erro ao testar filtro 24h:', err);
                    return;
                }
                console.log('📈 Leituras nas últimas 24h:', result[0].count);

                // Testar query com filtro de 7d
                db.all('SELECT COUNT(*) as count FROM leituras WHERE data_hora >= ?', [data7d.toISOString()], (err, result) => {
                    if (err) {
                        console.error('Erro ao testar filtro 7d:', err);
                        return;
                    }
                    console.log('📈 Leituras na última semana:', result[0].count);
                    console.log('');

                    // Fechar conexão
                    db.close();
                    console.log('✅ Verificação concluída!');
                });
            });
        });
    });
}); 