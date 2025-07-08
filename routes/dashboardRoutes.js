const express = require('express');
const moment = require('moment');

// Configurar moment.js para português
require('moment/locale/pt-br');
moment.locale('pt-br');

module.exports = function (db) {
    const router = express.Router();

    // GET /api/dashboard/status - Status geral do sistema
    router.get('/status', (req, res) => {
        res.json({
            success: true,
            message: 'Sistema de Monitoramento de Temperatura',
            timestamp: new Date().toISOString(),
            status: 'online'
        });
    });

    // GET /api/dashboard/overview - Visão geral do sistema
    router.get('/overview', (req, res) => {
        const query = `
      SELECT 
        COUNT(DISTINCT s.id) as total_salas,
        COUNT(l.id) as total_leituras,
        COUNT(DISTINCT l.id_sala) as salas_com_dados,
        AVG(l.temperatura) as temperatura_media_geral,
        MAX(l.data_hora) as ultima_leitura_geral
      FROM salas s
      LEFT JOIN leituras l ON s.id = l.id_sala
    `;

        db.get(query, [], (err, overview) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Erro ao buscar dados gerais',
                    error: err.message
                });
            }

            res.json({
                success: true,
                data: overview
            });
        });
    });

    // GET /api/dashboard/alertas-recentes - Alertas recentes
    router.get('/alertas-recentes', (req, res) => {
        const { limite = 10 } = req.query;

        const query = `
      SELECT l.*, s.nome as nome_sala, s.temperatura_ideal_min, s.temperatura_ideal_max
      FROM leituras l
      JOIN salas s ON l.id_sala = s.id
      WHERE (l.temperatura < s.temperatura_ideal_min OR l.temperatura > s.temperatura_ideal_max)
      ORDER BY l.data_hora DESC
      LIMIT ?
    `;

        db.all(query, [limite], (err, alertas) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Erro ao buscar alertas',
                    error: err.message
                });
            }

            const alertasComInfo = alertas.map(alerta => ({
                ...alerta,
                tipo_alerta: alerta.temperatura < alerta.temperatura_ideal_min ? 'baixa' : 'alta',
                diferenca: alerta.temperatura < alerta.temperatura_ideal_min
                    ? alerta.temperatura_ideal_min - alerta.temperatura
                    : alerta.temperatura - alerta.temperatura_ideal_max,
                tempo_atras: moment(alerta.data_hora).fromNow()
            }));

            res.json({
                success: true,
                data: alertasComInfo
            });
        });
    });

    // GET /api/dashboard/temperaturas-atuais - Temperaturas atuais de todas as salas
    router.get('/temperaturas-atuais', (req, res) => {
        const query = `
      SELECT 
        s.id,
        s.nome,
        s.temperatura_ideal_min,
        s.temperatura_ideal_max,
        l.temperatura as temperatura_atual,
        l.data_hora as ultima_leitura,
        CASE 
          WHEN l.temperatura < s.temperatura_ideal_min THEN 'baixa'
          WHEN l.temperatura > s.temperatura_ideal_max THEN 'alta'
          ELSE 'normal'
        END as status
      FROM salas s
      LEFT JOIN leituras l ON s.id = l.id_sala
      WHERE l.id = (
        SELECT MAX(id) 
        FROM leituras 
        WHERE id_sala = s.id
      )
      OR l.id IS NULL
      ORDER BY s.nome
    `;

        db.all(query, [], (err, temperaturas) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Erro ao buscar temperaturas atuais',
                    error: err.message
                });
            }

            const temperaturasComInfo = temperaturas.map(temp => ({
                ...temp,
                is_alerta: temp.status !== 'normal',
                tempo_atras: temp.ultima_leitura ? moment(temp.ultima_leitura).fromNow() : 'Nunca'
            }));

            res.json({
                success: true,
                data: temperaturasComInfo
            });
        });
    });

    // GET /api/dashboard/grafico/:id_sala - Dados para gráfico de uma sala específica
    router.get('/grafico/:id_sala', (req, res) => {
        const { id_sala } = req.params;
        const { periodo = '24h', pontos = 50 } = req.query;

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
        l.temperatura,
        l.data_hora,
        s.temperatura_ideal_min,
        s.temperatura_ideal_max
      FROM leituras l
      JOIN salas s ON l.id_sala = s.id
      WHERE l.id_sala = ? AND l.data_hora >= ?
      ORDER BY l.data_hora ASC
      LIMIT ?
    `;

        db.all(query, [id_sala, dataInicio.toISOString(), pontos], (err, leituras) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Erro ao buscar dados do gráfico',
                    error: err.message
                });
            }

            // Buscar informações da sala
            db.get('SELECT * FROM salas WHERE id = ?', [id_sala], (err, sala) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: 'Erro ao buscar informações da sala',
                        error: err.message
                    });
                }

                const dadosGrafico = {
                    sala: sala,
                    periodo: periodo,
                    data_inicio: dataInicio.toISOString(),
                    pontos: leituras.map(leitura => ({
                        temperatura: leitura.temperatura,
                        data_hora: leitura.data_hora,
                        timestamp: new Date(leitura.data_hora).getTime(),
                        is_alerta: leitura.temperatura < leitura.temperatura_ideal_min ||
                            leitura.temperatura > leitura.temperatura_ideal_max
                    }))
                };

                res.json({
                    success: true,
                    data: dadosGrafico
                });
            });
        });
    });

    // GET /api/dashboard/estatisticas-gerais - Estatísticas gerais do sistema
    router.get('/estatisticas-gerais', (req, res) => {
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
        AVG(l.temperatura) as temperatura_media,
        MIN(l.temperatura) as temperatura_minima,
        MAX(l.temperatura) as temperatura_maxima,
        COUNT(CASE WHEN l.temperatura < s.temperatura_ideal_min 
                   OR l.temperatura > s.temperatura_ideal_max 
              THEN 1 END) as total_alertas,
        COUNT(DISTINCT l.id_sala) as salas_ativas
      FROM leituras l
      JOIN salas s ON l.id_sala = s.id
      WHERE l.data_hora >= ?
    `;

        db.get(query, [dataInicio.toISOString()], (err, estatisticas) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Erro ao buscar estatísticas',
                    error: err.message
                });
            }

            // Calcular percentual de alertas
            const percentualAlertas = estatisticas.total_leituras > 0
                ? ((estatisticas.total_alertas / estatisticas.total_leituras) * 100).toFixed(2)
                : 0;

            res.json({
                success: true,
                data: {
                    ...estatisticas,
                    periodo,
                    data_inicio: dataInicio.toISOString(),
                    percentual_alertas: parseFloat(percentualAlertas)
                }
            });
        });
    });

    // GET /api/dashboard/salas-status - Status de todas as salas
    router.get('/salas-status', (req, res) => {
        const query = `
      SELECT 
        s.id,
        s.nome,
        s.temperatura_ideal_min,
        s.temperatura_ideal_max,
        COUNT(l.id) as total_leituras,
        AVG(l.temperatura) as temperatura_media,
        MAX(l.data_hora) as ultima_leitura,
        COUNT(CASE WHEN l.temperatura < s.temperatura_ideal_min 
                   OR l.temperatura > s.temperatura_ideal_max 
              THEN 1 END) as alertas_count
      FROM salas s
      LEFT JOIN leituras l ON s.id = l.id_sala
      GROUP BY s.id
      ORDER BY s.nome
    `;

        db.all(query, [], (err, salas) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Erro ao buscar status das salas',
                    error: err.message
                });
            }

            const salasComStatus = salas.map(sala => ({
                ...sala,
                status: sala.alertas_count > 0 ? 'alerta' : 'normal',
                percentual_alertas: sala.total_leituras > 0
                    ? ((sala.alertas_count / sala.total_leituras) * 100).toFixed(2)
                    : 0,
                tempo_ultima_leitura: sala.ultima_leitura
                    ? moment(sala.ultima_leitura).fromNow()
                    : 'Nunca'
            }));

            res.json({
                success: true,
                data: salasComStatus
            });
        });
    });

    return router;
}; 