const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Conectar ao banco de dados
const db = new sqlite3.Database(path.join(__dirname, '..', 'database', 'frigorifico.db'), (err) => {
    if (err) {
        console.error('Erro ao conectar com o banco de dados:', err.message);
        return;
    }
    console.log('Conectado ao banco de dados SQLite.');
});

// Função para adicionar novos campos
const updateDatabase = () => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Adicionar campo tipo se não existir
            db.run("ALTER TABLE salas ADD COLUMN tipo TEXT DEFAULT 'resfriamento'", (err) => {
                if (err && !err.message.includes('duplicate column name')) {
                    console.error('Erro ao adicionar campo tipo:', err.message);
                } else {
                    console.log('Campo tipo adicionado ou já existe.');
                }
            });

            // Adicionar campo descricao se não existir
            db.run("ALTER TABLE salas ADD COLUMN descricao TEXT", (err) => {
                if (err && !err.message.includes('duplicate column name')) {
                    console.error('Erro ao adicionar campo descricao:', err.message);
                } else {
                    console.log('Campo descricao adicionado ou já existe.');
                }
            });

            // Atualizar dados existentes com valores padrão
            db.run("UPDATE salas SET tipo = 'resfriamento' WHERE tipo IS NULL", (err) => {
                if (err) {
                    console.error('Erro ao atualizar dados existentes:', err.message);
                } else {
                    console.log('Dados existentes atualizados com valores padrão.');
                }
            });

            resolve();
        });
    });
};

// Executar atualização
updateDatabase()
    .then(() => {
        console.log('Banco de dados atualizado com sucesso!');
        db.close((err) => {
            if (err) {
                console.error('Erro ao fechar banco de dados:', err.message);
            } else {
                console.log('Conexão com banco de dados fechada.');
            }
        });
    })
    .catch((err) => {
        console.error('Erro na atualização do banco de dados:', err);
        process.exit(1);
    }); 