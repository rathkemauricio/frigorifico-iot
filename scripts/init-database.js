const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Criar diretório database se não existir
const dbDir = path.join(__dirname, '..', 'database');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Conectar ao banco de dados
const db = new sqlite3.Database(path.join(dbDir, 'frigorifico.db'), (err) => {
    if (err) {
        console.error('Erro ao conectar com o banco de dados:', err.message);
        return;
    }
    console.log('Conectado ao banco de dados SQLite.');
});

// Criar tabelas
const createTables = () => {
    return new Promise((resolve, reject) => {
        // Tabela de salas
        const createSalasTable = `
      CREATE TABLE IF NOT EXISTS salas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL UNIQUE,
        tipo TEXT DEFAULT 'resfriamento',
        temperatura_ideal_min REAL NOT NULL DEFAULT 1.0,
        temperatura_ideal_max REAL NOT NULL DEFAULT 5.0,
        descricao TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

        // Tabela de leituras
        const createLeiturasTable = `
      CREATE TABLE IF NOT EXISTS leituras (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_sala INTEGER NOT NULL,
        temperatura REAL NOT NULL,
        data_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_sala) REFERENCES salas (id)
      )
    `;

        db.serialize(() => {
            db.run(createSalasTable, (err) => {
                if (err) {
                    console.error('Erro ao criar tabela salas:', err.message);
                    reject(err);
                    return;
                }
                console.log('Tabela salas criada com sucesso.');
            });

            db.run(createLeiturasTable, (err) => {
                if (err) {
                    console.error('Erro ao criar tabela leituras:', err.message);
                    reject(err);
                    return;
                }
                console.log('Tabela leituras criada com sucesso.');
            });

            // Inserir dados de exemplo
            insertSampleData().then(() => {
                resolve();
            }).catch(reject);
        });
    });
};

// Inserir dados de exemplo
const insertSampleData = () => {
    return new Promise((resolve, reject) => {
        const salas = [
            { nome: 'Sala de Resfriamento 1', tipo: 'resfriamento', temperatura_ideal_min: 1.0, temperatura_ideal_max: 5.0, descricao: 'Sala para resfriamento de produtos' },
            { nome: 'Sala de Congelamento 1', tipo: 'congelamento', temperatura_ideal_min: -18.0, temperatura_ideal_max: -15.0, descricao: 'Sala para congelamento de produtos' },
            { nome: 'Sala de Resfriamento 2', tipo: 'resfriamento', temperatura_ideal_min: 1.0, temperatura_ideal_max: 5.0, descricao: 'Sala para resfriamento de produtos' },
            { nome: 'Sala de Congelamento 2', tipo: 'congelamento', temperatura_ideal_min: -18.0, temperatura_ideal_max: -15.0, descricao: 'Sala para congelamento de produtos' },
            { nome: 'Sala de Processamento', tipo: 'processamento', temperatura_ideal_min: 2.0, temperatura_ideal_max: 6.0, descricao: 'Sala para processamento de produtos' }
        ];

        const insertSala = db.prepare(`
      INSERT OR IGNORE INTO salas (nome, tipo, temperatura_ideal_min, temperatura_ideal_max, descricao)
      VALUES (?, ?, ?, ?, ?)
    `);

        salas.forEach(sala => {
            insertSala.run(sala.nome, sala.tipo, sala.temperatura_ideal_min, sala.temperatura_ideal_max, sala.descricao, (err) => {
                if (err) {
                    console.error('Erro ao inserir sala:', err.message);
                }
            });
        });

        insertSala.finalize((err) => {
            if (err) {
                console.error('Erro ao finalizar inserção de salas:', err.message);
                reject(err);
                return;
            }
            console.log('Dados de exemplo inseridos com sucesso.');
            resolve();
        });
    });
};

// Executar inicialização
createTables()
    .then(() => {
        console.log('Banco de dados inicializado com sucesso!');
        db.close((err) => {
            if (err) {
                console.error('Erro ao fechar banco de dados:', err.message);
            } else {
                console.log('Conexão com banco de dados fechada.');
            }
        });
    })
    .catch((err) => {
        console.error('Erro na inicialização do banco de dados:', err);
        process.exit(1);
    }); 