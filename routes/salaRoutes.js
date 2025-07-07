const express = require('express');

module.exports = function (db) {
    const router = express.Router();

    // GET /api/salas - Listar todas as salas
    router.get('/', (req, res) => {
        const query = `
      SELECT s.*, 
             COUNT(l.id) as total_leituras,
             AVG(l.temperatura) as temperatura_media,
             MAX(l.data_hora) as ultima_leitura,
             (SELECT temperatura FROM leituras WHERE id_sala = s.id ORDER BY data_hora DESC LIMIT 1) as temperatura_atual
      FROM salas s
      LEFT JOIN leituras l ON s.id = l.id_sala
      GROUP BY s.id
      ORDER BY s.nome
    `;

        db.all(query, [], (err, salas) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Erro ao buscar salas',
                    error: err.message
                });
            }

            res.json({
                success: true,
                data: salas
            });
        });
    });

    // GET /api/salas/:id - Obter sala específica
    router.get('/:id', (req, res) => {
        const { id } = req.params;

        const query = `
      SELECT s.*, 
             COUNT(l.id) as total_leituras,
             AVG(l.temperatura) as temperatura_media,
             MAX(l.data_hora) as ultima_leitura,
             (SELECT temperatura FROM leituras WHERE id_sala = s.id ORDER BY data_hora DESC LIMIT 1) as temperatura_atual
      FROM salas s
      LEFT JOIN leituras l ON s.id = l.id_sala
      WHERE s.id = ?
      GROUP BY s.id
    `;

        db.get(query, [id], (err, sala) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Erro ao buscar sala',
                    error: err.message
                });
            }

            if (!sala) {
                return res.status(404).json({
                    success: false,
                    message: 'Sala não encontrada'
                });
            }

            res.json({
                success: true,
                data: sala
            });
        });
    });

    // POST /api/salas - Criar nova sala
    router.post('/', (req, res) => {
        const { nome, tipo, temperatura_ideal_min, temperatura_ideal_max, descricao } = req.body;

        // Validação
        if (!nome || temperatura_ideal_min === undefined || temperatura_ideal_max === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Dados obrigatórios: nome, temperatura_ideal_min, temperatura_ideal_max'
            });
        }

        if (temperatura_ideal_min >= temperatura_ideal_max) {
            return res.status(400).json({
                success: false,
                message: 'Temperatura mínima deve ser menor que a máxima'
            });
        }

        const query = `
      INSERT INTO salas (nome, tipo, temperatura_ideal_min, temperatura_ideal_max, descricao)
      VALUES (?, ?, ?, ?, ?)
    `;

        db.run(query, [nome, tipo || 'resfriamento', temperatura_ideal_min, temperatura_ideal_max, descricao || null], function (err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(409).json({
                        success: false,
                        message: 'Já existe uma sala com este nome'
                    });
                }
                return res.status(500).json({
                    success: false,
                    message: 'Erro ao criar sala',
                    error: err.message
                });
            }

            // Buscar a sala criada
            db.get('SELECT * FROM salas WHERE id = ?', [this.lastID], (err, sala) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: 'Erro ao buscar sala criada',
                        error: err.message
                    });
                }

                res.status(201).json({
                    success: true,
                    message: 'Sala criada com sucesso',
                    data: sala
                });
            });
        });
    });

    // PUT /api/salas/:id - Atualizar sala
    router.put('/:id', (req, res) => {
        const { id } = req.params;
        const { nome, tipo, temperatura_ideal_min, temperatura_ideal_max, descricao } = req.body;

        // Verificar se a sala existe
        db.get('SELECT * FROM salas WHERE id = ?', [id], (err, sala) => {
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

            // Validação
            if (temperatura_ideal_min !== undefined && temperatura_ideal_max !== undefined) {
                if (temperatura_ideal_min >= temperatura_ideal_max) {
                    return res.status(400).json({
                        success: false,
                        message: 'Temperatura mínima deve ser menor que a máxima'
                    });
                }
            }

            // Construir query de atualização
            const updates = [];
            const values = [];

            if (nome !== undefined) {
                updates.push('nome = ?');
                values.push(nome);
            }

            if (tipo !== undefined) {
                updates.push('tipo = ?');
                values.push(tipo);
            }

            if (temperatura_ideal_min !== undefined) {
                updates.push('temperatura_ideal_min = ?');
                values.push(temperatura_ideal_min);
            }

            if (temperatura_ideal_max !== undefined) {
                updates.push('temperatura_ideal_max = ?');
                values.push(temperatura_ideal_max);
            }

            if (descricao !== undefined) {
                updates.push('descricao = ?');
                values.push(descricao);
            }

            if (updates.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Nenhum campo para atualizar'
                });
            }

            values.push(id);
            const query = `UPDATE salas SET ${updates.join(', ')} WHERE id = ?`;

            db.run(query, values, function (err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(409).json({
                            success: false,
                            message: 'Já existe uma sala com este nome'
                        });
                    }
                    return res.status(500).json({
                        success: false,
                        message: 'Erro ao atualizar sala',
                        error: err.message
                    });
                }

                // Buscar a sala atualizada
                db.get('SELECT * FROM salas WHERE id = ?', [id], (err, salaAtualizada) => {
                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: 'Erro ao buscar sala atualizada',
                            error: err.message
                        });
                    }

                    res.json({
                        success: true,
                        message: 'Sala atualizada com sucesso',
                        data: salaAtualizada
                    });
                });
            });
        });
    });

    // DELETE /api/salas/:id - Excluir sala
    router.delete('/:id', (req, res) => {
        const { id } = req.params;

        // Verificar se a sala existe
        db.get('SELECT * FROM salas WHERE id = ?', [id], (err, sala) => {
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

            // Verificar se há leituras associadas
            db.get('SELECT COUNT(*) as count FROM leituras WHERE id_sala = ?', [id], (err, result) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: 'Erro ao verificar leituras',
                        error: err.message
                    });
                }

                if (result.count > 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Não é possível excluir uma sala que possui leituras registradas'
                    });
                }

                // Excluir a sala
                db.run('DELETE FROM salas WHERE id = ?', [id], function (err) {
                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: 'Erro ao excluir sala',
                            error: err.message
                        });
                    }

                    res.json({
                        success: true,
                        message: 'Sala excluída com sucesso'
                    });
                });
            });
        });
    });

    // GET /api/salas/:id/estatisticas - Obter estatísticas da sala
    router.get('/:id/estatisticas', (req, res) => {
        const { id } = req.params;
        const { periodo = '24h' } = req.query;

        let dataInicio;
        switch (periodo) {
            case '1h':
                dataInicio = new Date(Date.now() - 60 * 60 * 1000);
                break;
            case '6h':
                dataInicio = new Date(Date.now() - 6 * 60 * 60 * 1000);
                break;
            case '24h':
                dataInicio = new Date(Date.now() - 24 * 60 * 60 * 1000);
                break;
            case '7d':
                dataInicio = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                break;
            default:
                dataInicio = new Date(Date.now() - 24 * 60 * 60 * 1000);
        }

        const query = `
      SELECT 
        COUNT(*) as total_leituras,
        AVG(temperatura) as temperatura_media,
        MIN(temperatura) as temperatura_minima,
        MAX(temperatura) as temperatura_maxima,
        COUNT(CASE WHEN temperatura < (SELECT temperatura_ideal_min FROM salas WHERE id = ?) 
                   OR temperatura > (SELECT temperatura_ideal_max FROM salas WHERE id = ?) 
              THEN 1 END) as alertas_count
      FROM leituras 
      WHERE id_sala = ? AND data_hora >= ?
    `;

        db.get(query, [id, id, id, dataInicio.toISOString()], (err, estatisticas) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Erro ao buscar estatísticas',
                    error: err.message
                });
            }

            res.json({
                success: true,
                data: {
                    ...estatisticas,
                    periodo,
                    data_inicio: dataInicio.toISOString()
                }
            });
        });
    });

    return router;
}; 