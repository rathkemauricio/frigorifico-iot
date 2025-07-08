const express = require('express');
const moment = require('moment');

module.exports = function (db, io) {
    const router = express.Router();

    // Chave de API para autenticação do ESP32 (em produção, use variáveis de ambiente)
    const ESP32_API_KEY = process.env.ESP32_API_KEY || 'esp32_temp_monitor_2024';

    // Middleware para autenticação do ESP32
    const authenticateESP32 = (req, res, next) => {
        const apiKey = req.headers['x-api-key'] || req.query.api_key;

        if (!apiKey || apiKey !== ESP32_API_KEY) {
            return res.status(401).json({
                success: false,
                message: 'Chave de API inválida ou ausente'
            });
        }

        next();
    };

    // POST /api/esp32/temperatura - Endpoint principal para ESP32 enviar dados
    router.post('/temperatura', authenticateESP32, (req, res) => {
        const { id_sala, temperatura, umidade, timestamp } = req.body;

        // Validação dos dados
        if (!id_sala || temperatura === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Dados obrigatórios: id_sala, temperatura'
            });
        }

        // Usar timestamp do ESP32 ou timestamp atual
        const data_hora = timestamp || moment().format('YYYY-MM-DD HH:mm:ss');

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
                    umidade: umidade ? parseFloat(umidade) : null,
                    data_hora,
                    temperatura_ideal_min: sala.temperatura_ideal_min,
                    temperatura_ideal_max: sala.temperatura_ideal_max,
                    is_alerta: isAlerta,
                    fonte: 'ESP32'
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
                    message: 'Dados recebidos e salvos com sucesso',
                    data: {
                        id_leitura: this.lastID,
                        sala: sala.nome,
                        temperatura: parseFloat(temperatura),
                        data_hora,
                        is_alerta: isAlerta
                    }
                });
            });
        });
    });

    // GET /api/esp32/status - Verificar status da conexão
    router.get('/status', authenticateESP32, (req, res) => {
        res.json({
            success: true,
            message: 'ESP32 conectado com sucesso',
            timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
            server_status: 'online'
        });
    });

    // GET /api/esp32/salas - Listar salas disponíveis
    router.get('/salas', authenticateESP32, (req, res) => {
        db.all('SELECT id, nome, temperatura_ideal_min, temperatura_ideal_max FROM salas ORDER BY nome', (err, salas) => {
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

    // POST /api/esp32/registrar - Registrar novo ESP32 (opcional)
    router.post('/registrar', authenticateESP32, (req, res) => {
        const { nome_dispositivo, mac_address, sala_padrao } = req.body;

        // Aqui você pode implementar um registro de dispositivos ESP32
        // Por enquanto, apenas retorna sucesso
        res.json({
            success: true,
            message: 'ESP32 registrado com sucesso',
            data: {
                nome_dispositivo: nome_dispositivo || 'ESP32_Temp_Sensor',
                mac_address: mac_address || 'N/A',
                sala_padrao: sala_padrao || null,
                timestamp_registro: moment().format('YYYY-MM-DD HH:mm:ss')
            }
        });
    });

    // ========================================
    // NOVAS ROTAS PARA CONFIGURAÇÕES
    // ========================================

    // GET /api/esp32/configuracoes - Obter configurações do sistema
    router.get('/configuracoes', (req, res) => {
        res.json({
            success: true,
            data: {
                api_key: ESP32_API_KEY,
                server_url: `${req.protocol}://${req.get('host')}`,
                endpoints: {
                    status: '/api/esp32/status',
                    temperatura: '/api/esp32/temperatura',
                    salas: '/api/esp32/salas',
                    registrar: '/api/esp32/registrar'
                },
                configuracoes_padrao: {
                    intervalo_leitura: 30000,
                    max_tentativas: 3,
                    timeout: 10000,
                    habilitar_ntp: true,
                    habilitar_display: true,
                    habilitar_led: true
                }
            }
        });
    });

    // GET /api/esp32/dispositivos - Listar dispositivos ESP32 conectados
    router.get('/dispositivos', (req, res) => {
        // Em uma implementação real, você teria uma tabela de dispositivos
        // Por enquanto, retornamos dados simulados
        res.json({
            success: true,
            data: [
                {
                    id: 1,
                    nome: 'ESP32_Sala_Principal',
                    mac_address: 'AA:BB:CC:DD:EE:FF',
                    sala_id: 1,
                    sala_nome: 'Sala Principal',
                    ultima_conexao: moment().subtract(5, 'minutes').format('YYYY-MM-DD HH:mm:ss'),
                    status: 'online',
                    total_leituras: 1250,
                    versao_firmware: '1.0.0'
                }
            ]
        });
    });

    // GET /api/esp32/estatisticas - Estatísticas dos dispositivos ESP32
    router.get('/estatisticas', (req, res) => {
        // Buscar estatísticas das leituras ESP32
        const query = `
            SELECT 
                COUNT(*) as total_leituras,
                COUNT(DISTINCT id_sala) as salas_ativas,
                AVG(temperatura) as temperatura_media,
                MIN(temperatura) as temperatura_min,
                MAX(temperatura) as temperatura_max,
                COUNT(CASE WHEN data_hora >= datetime('now', '-1 hour') THEN 1 END) as leituras_ultima_hora
            FROM leituras 
            WHERE data_hora >= datetime('now', '-24 hours')
        `;

        db.get(query, (err, stats) => {
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
                    ...stats,
                    dispositivos_online: 1,
                    uptime_servidor: moment.duration(process.uptime(), 'seconds').humanize(),
                    versao_api: '1.0.0'
                }
            });
        });
    });

    // POST /api/esp32/teste - Testar conexão e configurações
    router.post('/teste', authenticateESP32, (req, res) => {
        const { id_sala, temperatura_teste } = req.body;

        // Simular uma leitura de teste
        const temperatura = temperatura_teste || 25.0;
        const data_hora = moment().format('YYYY-MM-DD HH:mm:ss');

        res.json({
            success: true,
            message: 'Teste de conexão realizado com sucesso',
            data: {
                temperatura_teste: temperatura,
                timestamp: data_hora,
                sala_id: id_sala || 1,
                conexao_ok: true,
                servidor_online: true
            }
        });
    });

    // GET /api/esp32/logs - Obter logs de dispositivos ESP32
    router.get('/logs', (req, res) => {
        const { limite = 50, dispositivo } = req.query;

        // Em uma implementação real, você teria uma tabela de logs
        // Por enquanto, retornamos logs simulados
        const logs = [
            {
                id: 1,
                dispositivo: 'ESP32_Sala_Principal',
                tipo: 'info',
                mensagem: 'Dispositivo conectado com sucesso',
                timestamp: moment().subtract(2, 'minutes').format('YYYY-MM-DD HH:mm:ss')
            },
            {
                id: 2,
                dispositivo: 'ESP32_Sala_Principal',
                tipo: 'data',
                mensagem: 'Leitura enviada: 24.5°C, 65%',
                timestamp: moment().subtract(1, 'minute').format('YYYY-MM-DD HH:mm:ss')
            }
        ];

        res.json({
            success: true,
            data: logs.slice(0, parseInt(limite))
        });
    });

    return router;
}; 