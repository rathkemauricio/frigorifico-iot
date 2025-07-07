# Scripts de Dados - Sistema de Monitoramento de Temperatura

Este documento descreve os diferentes scripts disponíveis para gerar dados de exemplo no sistema de monitoramento de temperatura.

## 📋 Scripts Disponíveis

### 1. `npm run seed` - Dados Históricos Realistas
**Arquivo:** `scripts/seed-data.js`

Gera dados históricos realistas para os últimos 7 dias com:
- **Dados a cada 5 minutos** para os últimos 7 dias
- **Dados detalhados a cada 1 minuto** para hoje
- **Variações realistas** baseadas em ciclos diários
- **Alertas esporádicos** (5% de chance)
- **Total:** ~16.000 leituras

**Características:**
- Simula variações de temperatura baseadas no horário do dia
- Inclui variações aleatórias e tendências graduais
- Gera alertas realistas quando temperaturas saem dos limites
- Ideal para visualizar tendências de longo prazo

### 2. `npm run demo` - Dados de Demonstração
**Arquivo:** `scripts/demo-data.js`

Cria cenários específicos para demonstração com:
- **Cenário 1:** Dados normais (últimas 2 horas)
- **Cenário 2:** Alertas esporádicos (última hora)
- **Cenário 3:** Falha de sistema (últimos 30 minutos)
- **Cenário 4:** Dados em tempo real (últimos 5 minutos)
- **Total:** ~1.100 leituras

**Cenários Específicos:**
- **Sala de Resfriamento 1:** Alerta alto aos 45 min atrás
- **Sala de Resfriamento 2:** Alerta baixo aos 30 min atrás
- **Sala de Processamento:** Alerta alto aos 15 min atrás
- **Sala de Congelamento 1:** Falha crítica entre 20-10 min atrás, recuperação gradual
- **Alertas em tempo real:** Sala 4 (3 min atrás) e Sala 1 (1 min atrás)

### 3. `npm run seed-continuous` - Dados Contínuos
**Arquivo:** `scripts/continuous-seed.js`

Gera dados em tempo real continuamente:
- **Intervalo:** A cada 30 segundos
- **Estatísticas:** Mostradas a cada 5 minutos
- **Alertas:** 3% de chance por leitura
- **Execução:** Contínua até interrompida (Ctrl+C)

**Características:**
- Ideal para demonstrações ao vivo
- Mostra estatísticas em tempo real
- Simula ambiente de produção
- Pode ser executado em paralelo com a aplicação

### 4. `npm run simulate-sensors` - Simulação de Sensores
**Arquivo:** `scripts/simulate-sensors.js`

Simula sensores reais enviando dados via API:
- **Intervalo:** A cada 60 segundos
- **Método:** POST para `/api/sensor/data`
- **Dados:** Temperaturas realistas com alertas
- **Execução:** Contínua até interrompida

**Características:**
- Testa a API de recebimento de dados
- Simula comportamento de sensores reais
- Integra com o sistema de WebSocket
- Ideal para testar funcionalidades em tempo real

## 🎯 Quando Usar Cada Script

### Para Desenvolvimento e Testes
```bash
npm run demo
```
- Dados rápidos para testar funcionalidades
- Cenários controlados e previsíveis
- Ideal para desenvolvimento

### Para Demonstrações
```bash
npm run seed
npm run seed-continuous
```
- Dados históricos realistas
- Continuação em tempo real
- Mostra o sistema completo

### Para Testes de API
```bash
npm run simulate-sensors
```
- Testa endpoints da API
- Simula sensores reais
- Valida integração WebSocket

## 📊 Estrutura dos Dados Gerados

### Salas Disponíveis
1. **Sala de Resfriamento 1** - Limites: 1.0°C a 5.0°C
2. **Sala de Congelamento 1** - Limites: -18.0°C a -15.0°C
3. **Sala de Resfriamento 2** - Limites: 1.0°C a 5.0°C
4. **Sala de Congelamento 2** - Limites: -18.0°C a -15.0°C
5. **Sala de Processamento** - Limites: 2.0°C a 6.0°C

### Tipos de Variação
- **Ciclo Diário:** Variações baseadas na hora do dia
- **Aleatória:** Flutuações naturais do sistema
- **Tendência:** Mudanças graduais ao longo do tempo
- **Alertas:** Temperaturas fora dos limites seguros

## 🔧 Comandos Úteis

### Limpar Dados Existentes
```bash
# Todos os scripts limpam dados automaticamente
# Para limpeza manual, edite o banco diretamente
```

### Executar Múltiplos Scripts
```bash
# Terminal 1: Servidor
npm start

# Terminal 2: Dados históricos
npm run seed

# Terminal 3: Dados contínuos
npm run seed-continuous

# Terminal 4: Simulação de sensores
npm run simulate-sensors
```

### Verificar Dados no Banco
```bash
# Usar SQLite CLI ou ferramenta de banco
sqlite3 database/frigorifico.db
SELECT COUNT(*) FROM leituras;
SELECT * FROM leituras ORDER BY data_hora DESC LIMIT 10;
```

## 📈 Visualização dos Dados

Após executar qualquer script:

1. **Acesse a aplicação:** `http://localhost:3000`
2. **Dashboard:** Visualize cards de temperatura e alertas
3. **Gráficos:** Clique nos cards para ver gráficos detalhados
4. **Alertas:** Observe notificações em tempo real
5. **Tabelas:** Veja dados históricos organizados

## ⚠️ Observações Importantes

- Todos os scripts são **independentes** e podem ser executados separadamente
- Os dados são **realistas** mas **simulados** para demonstração
- O banco de dados é **limpo** antes de cada execução (exceto seed-continuous)
- Os scripts podem ser **interrompidos** com Ctrl+C
- **Backup** do banco é recomendado antes de executar scripts

## 🚀 Próximos Passos

1. Execute `npm run demo` para dados de demonstração
2. Acesse `http://localhost:3000` para visualizar
3. Experimente diferentes scripts para diferentes cenários
4. Use `npm run seed-continuous` para dados em tempo real
5. Teste a API com `npm run simulate-sensors` 