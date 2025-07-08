const axios = require('axios');
const moment = require('moment');

// Configurar moment.js para português
require('moment/locale/pt-br');
moment.locale('pt-br');

// Configurações
const API_BASE_URL = 'http://localhost:3000/api';
const INTERVAL = 60000; // 1 minuto
const SALAS = [
    { id: 1, nome: 'Sala de Resfriamento 1', min: 1.0, max: 5.0 },
    { id: 2, nome: 'Sala de Congelamento 1', min: -18.0, max: -15.0 },
    { id: 3, nome: 'Sala de Resfriamento 2', min: 1.0, max: 5.0 },
    { id: 4, nome: 'Sala de Congelamento 2', min: -18.0, max: -15.0 },
    { id: 5, nome: 'Sala de Processamento', min: 2.0, max: 6.0 }
];

// Função para gerar temperatura aleatória dentro do intervalo
function gerarTemperatura(sala) {
    const baseTemp = (sala.min + sala.max) / 2;
    const variacao = (sala.max - sala.min) * 0.3; // 30% de variação
    const randomVariation = (Math.random() - 0.5) * variacao;

    // 10% de chance de gerar temperatura fora do ideal (para simular alertas)
    if (Math.random() < 0.1) {
        const isHigh = Math.random() > 0.5;
        if (isHigh) {
            return sala.max + Math.random() * 3; // Acima do máximo
        } else {
            return sala.min - Math.random() * 3; // Abaixo do mínimo
        }
    }

    return baseTemp + randomVariation;
}

// Função para enviar dados do sensor
async function enviarDadosSensor(sala) {
    try {
        const temperatura = gerarTemperatura(sala);
        const dataHora = moment().format('YYYY-MM-DD HH:mm:ss');

        const dados = {
            id_sala: sala.id,
            temperatura: parseFloat(temperatura.toFixed(2)),
            data_hora: dataHora
        };

        console.log(`[${moment().format('HH:mm:ss')}] ${sala.nome}: ${temperatura.toFixed(2)}°C`);

        const response = await axios.post(`${API_BASE_URL}/sensores/leitura`, dados);

        if (response.status === 200) {
            console.log(`✅ Dados enviados com sucesso para ${sala.nome}`);
        }
    } catch (error) {
        console.error(`❌ Erro ao enviar dados para ${sala.nome}:`, error.message);
    }
}

// Função para simular todos os sensores
async function simularSensores() {
    console.log('\n🌡️  Iniciando simulação de sensores...');
    console.log(`📡 Enviando dados a cada ${INTERVAL / 1000} segundos\n`);

    // Enviar dados iniciais
    for (const sala of SALAS) {
        await enviarDadosSensor(sala);
    }

    // Configurar intervalo para envio contínuo
    setInterval(async () => {
        console.log(`\n🔄 Nova leitura - ${moment().format('DD/MM/YYYY HH:mm:ss')}`);
        for (const sala of SALAS) {
            await enviarDadosSensor(sala);
        }
    }, INTERVAL);
}

// Função para simular um sensor específico
async function simularSensorEspecifico(salaId, intervalo = INTERVAL) {
    const sala = SALAS.find(s => s.id === salaId);
    if (!sala) {
        console.error(`❌ Sala com ID ${salaId} não encontrada`);
        return;
    }

    console.log(`\n🌡️  Simulando sensor da ${sala.nome}...`);
    console.log(`📡 Enviando dados a cada ${intervalo / 1000} segundos\n`);

    // Enviar dados inicial
    await enviarDadosSensor(sala);

    // Configurar intervalo
    setInterval(async () => {
        await enviarDadosSensor(sala);
    }, intervalo);
}

// Verificar se o servidor está rodando
async function verificarServidor() {
    try {
        await axios.get(`${API_BASE_URL}/dashboard/status`);
        return true;
    } catch (error) {
        return false;
    }
}

// Função principal
async function main() {
    console.log('🚀 Simulador de Sensores de Temperatura');
    console.log('=====================================\n');

    // Verificar se o servidor está rodando
    const servidorAtivo = await verificarServidor();
    if (!servidorAtivo) {
        console.error('❌ Servidor não está rodando!');
        console.log('💡 Execute: npm start ou npm run dev');
        process.exit(1);
    }

    console.log('✅ Servidor ativo! Iniciando simulação...\n');

    // Verificar argumentos da linha de comando
    const args = process.argv.slice(2);

    if (args.length > 0) {
        const salaId = parseInt(args[0]);
        const intervalo = args[1] ? parseInt(args[1]) * 1000 : INTERVAL;

        if (isNaN(salaId)) {
            console.error('❌ ID da sala deve ser um número');
            process.exit(1);
        }

        await simularSensorEspecifico(salaId, intervalo);
    } else {
        await simularSensores();
    }
}

// Tratamento de erros
process.on('SIGINT', () => {
    console.log('\n\n🛑 Simulação interrompida pelo usuário');
    process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Erro não tratado:', reason);
});

// Executar simulação
main().catch(console.error); 