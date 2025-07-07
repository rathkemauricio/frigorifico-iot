const express = require('express');
const moment = require('moment');

module.exports = function (db, io) {
    const router = express.Router();

    // POST /api/sensores/leitura - Receber dados do sensor
    router.post('/leitura', (req, res) => {
        const { id_sala, temperatura, data_hora } = req.body;

        // Validação dos dados
        if (!id_sala || temperatura === undefined || !data_hora) {
            return res.status(400).json({
                success: false,
                message: 'Dados obrigatórios: id_sala, temperatura, data_hora'
            });
        }

        // Verificar se a sala existe
        db.get('SELECT * FROM salas WHERE id = ?', [id_sala], (err, sala) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Erro ao verificar sala',
                    error: err.message
                });
            }

            if (!sala) {
                return res.status(404).json({
                    success: false,
                    message: 'Sala não encontrada'
                });
            }

            // Inserir leitura no banco
            const insertQuery = `
        INSERT INTO leituras (id_sala, temperatura, data_hora)
        VALUES (?, ?, ?)
      `;

            db.run(insertQuery, [id_sala, temperatura, data_hora], function (err) {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: 'Erro ao salvar leitura',
                        error: err.message
                    });
                }

                // Verificar se a temperatura está fora do ideal
                const isAlerta = temperatura < sala.temperatura_ideal_min ||
                    temperatura > sala.temperatura_ideal_max;

                // Preparar dados para Socket.IO
                const dadosLeitura = {
                    id: this.lastID,
                    id_sala,
                    nome_sala: sala.nome,
                    temperatura: parseFloat(temperatura),
                    data_hora,
                    temperatura_ideal_min: sala.temperatura_ideal_min,
                    temperatura_ideal_max: sala.temperatura_ideal_max,
                    is_alerta: isAlerta
                };

                // Emitir evento via Socket.IO para atualização em tempo real
                io.emit('nova_leitura', dadosLeitura);

                // Se for alerta, emitir evento específico
                if (isAlerta) {
                    io.emit('alerta_temperatura', {
                        ...dadosLeitura,
                        tipo: temperatura < sala.temperatura_ideal_min ? 'baixa' : 'alta',
                        mensagem: temperatura < sala.temperatura_ideal_min
                            ? `Temperatura muito baixa: ${temperatura}°C (mín: ${sala.temperatura_ideal_min}°C)`
                            : `Temperatura muito alta: ${temperatura}°C (máx: ${sala.temperatura_ideal_max}°C)`
                    });
                }

                res.json({
                    success: true,
                    message: 'Leitura salva com sucesso',
                    data: dadosLeitura
                });
            });
        });
    });

    // GET /api/sensores/leituras/:id_sala - Obter leituras de uma sala específica
    router.get('/leituras/:id_sala', (req, res) => {
        const { id_sala } = req.params;
        const { limite = 50 } = req.query;

        const query = `
      SELECT l.*, s.nome as nome_sala, s.temperatura_ideal_min, s.temperatura_ideal_max
      FROM leituras l
      JOIN salas s ON l.id_sala = s.id
      WHERE l.id_sala = ?
      ORDER BY l.data_hora DESC
      LIMIT ?
    `;

        db.all(query, [id_sala, limite], (err, leituras) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Erro ao buscar leituras',
                    error: err.message
                });
            }

            // Adicionar flag de alerta para cada leitura
            const leiturasComAlerta = leituras.map(leitura => ({
                ...leitura,
                is_alerta: leitura.temperatura < leitura.temperatura_ideal_min ||
                    leitura.temperatura > leitura.temperatura_ideal_max
            }));

            res.json({
                success: true,
                data: leiturasComAlerta
            });
        });
    });

    // GET /api/sensores/leituras - Obter todas as leituras recentes
    router.get('/leituras', (req, res) => {
        const { limite = 100, sala_id } = req.query;

        let query = `
      SELECT l.*, s.nome as nome_sala, s.temperatura_ideal_min, s.temperatura_ideal_max
      FROM leituras l
      JOIN salas s ON l.id_sala = s.id
    `;

        let params = [];

        if (sala_id) {
            query += ' WHERE l.id_sala = ?';
            params.push(sala_id);
        }

        query += ' ORDER BY l.data_hora DESC LIMIT ?';
        params.push(limite);

        db.all(query, params, (err, leituras) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Erro ao buscar leituras',
                    error: err.message
                });
            }

            // Adicionar flag de alerta para cada leitura
            const leiturasComAlerta = leituras.map(leitura => ({
                ...leitura,
                is_alerta: leitura.temperatura < leitura.temperatura_ideal_min ||
                    leitura.temperatura > leitura.temperatura_ideal_max
            }));

            res.json({
                success: true,
                data: leiturasComAlerta
            });
        });
    });

    // GET /api/sensores/alertas - Obter leituras com alerta
    router.get('/alertas', (req, res) => {
        const { limite = 20, data_inicio, data_fim } = req.query;

        let query = `
      SELECT l.*, s.nome as nome_sala, s.temperatura_ideal_min, s.temperatura_ideal_max
      FROM leituras l
      JOIN salas s ON l.id_sala = s.id
      WHERE (l.temperatura < s.temperatura_ideal_min OR l.temperatura > s.temperatura_ideal_max)
    `;

        let params = [];

        if (data_inicio) {
            query += ' AND l.data_hora >= ?';
            params.push(data_inicio);
        }

        if (data_fim) {
            query += ' AND l.data_hora <= ?';
            params.push(data_fim);
        }

        query += ' ORDER BY l.data_hora DESC LIMIT ?';
        params.push(limite);

        db.all(query, params, (err, alertas) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Erro ao buscar alertas',
                    error: err.message
                });
            }

            // Adicionar informações do alerta
            const alertasComInfo = alertas.map(alerta => ({
                ...alerta,
                tipo_alerta: alerta.temperatura < alerta.temperatura_ideal_min ? 'baixa' : 'alta',
                diferenca: alerta.temperatura < alerta.temperatura_ideal_min
                    ? alerta.temperatura_ideal_min - alerta.temperatura
                    : alerta.temperatura - alerta.temperatura_ideal_max
            }));

            res.json({
                success: true,
                data: alertasComInfo
            });
        });
    });

    return router;
}; 