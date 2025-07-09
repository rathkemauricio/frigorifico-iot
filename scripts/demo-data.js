// Script para popular o banco de dados com leituras de teste para todas as salas
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/frigorifico.db');

// IDs das salas para popular (adicione aqui todos os IDs que desejar)
const salas = [1, 2, 3, 4, 5, 8];

// Função para gerar uma data/hora de leitura
function gerarDataHora(base, minutosAntes) {
    const d = new Date(base.getTime() - minutosAntes * 60000);
    return d.toISOString().slice(0, 19).replace('T', ' ');
}

// Função para gerar temperatura de teste
function gerarTemperatura(idSala) {
    switch (idSala) {
        case 1: return 3.5 + Math.random(); // Resfriamento
        case 2: return -16 + Math.random(); // Congelamento
        case 3: return 2.5 + Math.random(); // Resfriamento
        case 4: return -17 + Math.random(); // Congelamento
        case 5: return 4 + Math.random(); // Processamento
        case 8: return 3 + Math.random(); // Teste
        default: return 5 + Math.random();
    }
}

function inserirLeiturasParaSala(idSala, callback) {
    const now = new Date();
    const leituras = [];
    for (let i = 0; i < 24; i++) { // 24 leituras, uma por hora
        const data_hora = gerarDataHora(now, i * 60);
        const temperatura = gerarTemperatura(idSala);
        leituras.push({ idSala, temperatura, data_hora });
    }
    let inseridas = 0;
    leituras.forEach(leitura => {
        db.run(
            'INSERT INTO leituras (id_sala, temperatura, data_hora) VALUES (?, ?, ?)',
            [leitura.idSala, leitura.temperatura, leitura.data_hora],
            err => {
                if (err) console.error('Erro ao inserir leitura:', err);
                inseridas++;
                if (inseridas === leituras.length) callback();
            }
        );
    });
}

function popularTodasSalas() {
    let feitas = 0;
    salas.forEach(idSala => {
        inserirLeiturasParaSala(idSala, () => {
            feitas++;
            console.log(`Leituras inseridas para sala ${idSala}`);
            if (feitas === salas.length) {
                console.log('População concluída!');
                db.close();
            }
        });
    });
}

popularTodasSalas(); 