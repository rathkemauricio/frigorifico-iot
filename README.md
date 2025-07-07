# 🌡️ Sistema de Monitoramento de Temperatura - Frigorífico

Sistema completo de monitoramento de temperatura em tempo real para ambientes de refrigeração em frigoríficos, com controle e visualização via aplicação web.

## 📋 Descrição

Este projeto implementa um sistema IoT para monitoramento de temperatura em frigoríficos, simulando sensores que enviam dados a cada minuto. O sistema inclui:

- **Backend**: Node.js com Express e SQLite
- **Frontend**: Interface web responsiva com Bootstrap e Chart.js
- **Tempo Real**: Comunicação via Socket.IO
- **Alertas**: Notificações automáticas quando temperaturas saem do padrão ideal
- **Gráficos**: Visualização temporal das temperaturas
- **Simulação**: Script para simular sensores IoT

## 🏗️ Arquitetura do Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Bootstrap)   │◄──►│   (Node.js)     │◄──►│   (SQLite)      │
│   + Chart.js    │    │   + Express     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                       ▲
         │                       │
    Socket.IO              Simulador de
   (Tempo Real)            Sensores IoT
```

## 🚀 Instalação e Configuração

### Pré-requisitos

- Node.js (versão 14 ou superior)
- npm ou yarn

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd sistema-monitoramento-temperatura
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Inicialize o banco de dados

```bash
npm run init-db
```

### 4. Inicie o servidor

```bash
# Desenvolvimento (com auto-reload)
npm run dev

# Produção
npm start
```

### 5. Acesse a aplicação

Abra seu navegador e acesse: `http://localhost:3000`

## 📊 Estrutura do Projeto

```
sistema-monitoramento-temperatura/
├── 📁 public/                    # Frontend estático
│   ├── 📁 js/
│   │   ├── 📁 components/        # Componentes reutilizáveis
│   │   │   ├── TemperatureCard.js
│   │   │   ├── AlertCard.js
│   │   │   ├── ChartComponent.js
│   │   │   └── StatusBar.js
│   │   ├── 📁 pages/            # Páginas da aplicação
│   │   │   ├── Dashboard.js
│   │   │   ├── Salas.js
│   │   │   ├── Alertas.js
│   │   │   └── Graficos.js
│   │   ├── 📁 utils/            # Utilitários
│   │   │   ├── api.js
│   │   │   ├── socket.js
│   │   │   └── helpers.js
│   │   └── app.js               # Aplicação principal
│   └── index.html               # Página principal
├── 📁 routes/                   # Rotas da API
│   ├── sensorRoutes.js
│   ├── salaRoutes.js
│   └── dashboardRoutes.js
├── 📁 scripts/                  # Scripts utilitários
│   ├── init-database.js
│   └── simulate-sensors.js
├── 📁 database/                 # Banco de dados SQLite
│   └── frigorifico.db
├── server.js                    # Servidor principal
├── package.json
└── README.md
```

## 🗄️ Estrutura do Banco de Dados

### Tabela: `salas`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INTEGER | Chave primária |
| nome | TEXT | Nome da sala |
| temperatura_ideal_min | REAL | Temperatura mínima ideal |
| temperatura_ideal_max | REAL | Temperatura máxima ideal |
| created_at | DATETIME | Data de criação |

### Tabela: `leituras`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INTEGER | Chave primária |
| id_sala | INTEGER | ID da sala (FK) |
| temperatura | REAL | Temperatura lida |
| data_hora | DATETIME | Data/hora da leitura |

## 🔌 API Endpoints

### Dashboard
- `GET /api/dashboard/status` - Status do sistema
- `GET /api/dashboard/overview` - Visão geral
- `GET /api/dashboard/temperaturas-atuais` - Temperaturas atuais
- `GET /api/dashboard/alertas-recentes` - Alertas recentes
- `GET /api/dashboard/estatisticas-gerais` - Estatísticas gerais
- `GET /api/dashboard/salas-status` - Status das salas
- `GET /api/dashboard/grafico/:id_sala` - Dados para gráfico

### Sensores
- `POST /api/sensores/leitura` - Receber leitura de sensor
- `GET /api/sensores/leituras` - Listar leituras
- `GET /api/sensores/leituras/:id_sala` - Leituras de uma sala
- `GET /api/sensores/alertas` - Listar alertas

### Salas
- `GET /api/salas` - Listar salas
- `GET /api/salas/:id` - Obter sala específica
- `POST /api/salas` - Criar nova sala
- `PUT /api/salas/:id` - Atualizar sala
- `DELETE /api/salas/:id` - Excluir sala
- `GET /api/salas/:id/estatisticas` - Estatísticas da sala

## 🎮 Simulação de Sensores

### Simular todos os sensores
```bash
npm run simulate-sensors
```

### Simular sensor específico
```bash
# Simular sensor da sala 1
node scripts/simulate-sensors.js 1

# Simular sensor da sala 2 com intervalo de 30 segundos
node scripts/simulate-sensors.js 2 30
```

### Enviar leitura manual via Postman
```http
POST http://localhost:3000/api/sensores/leitura
Content-Type: application/json

{
  "id_sala": 1,
  "temperatura": 3.5,
  "data_hora": "2024-01-15 10:30:00"
}
```

## 🎨 Funcionalidades do Frontend

### Dashboard Principal
- **Cards de Overview**: Total de salas, temperatura média, alertas ativos
- **Cards de Temperatura**: Status em tempo real de cada sala
- **Alertas Recentes**: Lista dos últimos alertas
- **Atualização Automática**: Dados atualizados a cada 30 segundos

### Navegação
- **Dashboard**: Visão geral do sistema
- **Salas**: Gerenciamento de salas e configurações
- **Alertas**: Histórico e detalhes de alertas
- **Gráficos**: Visualização temporal das temperaturas

### Recursos Avançados
- **Socket.IO**: Atualizações em tempo real
- **Notificações**: Alertas desktop e sonoros
- **Responsivo**: Interface adaptável para mobile
- **Teclas de Atalho**: Navegação rápida (Ctrl+1-4)

## 🔧 Configuração de Temperaturas

### Salas de Resfriamento
- **Temperatura Ideal**: 1°C a 5°C
- **Alerta**: Abaixo de 1°C ou acima de 5°C

### Salas de Congelamento
- **Temperatura Ideal**: -18°C a -15°C
- **Alerta**: Abaixo de -18°C ou acima de -15°C

### Sala de Processamento
- **Temperatura Ideal**: 2°C a 6°C
- **Alerta**: Abaixo de 2°C ou acima de 6°C

## 📱 Componentes Reutilizáveis

### TemperatureCard
Exibe temperatura atual de uma sala com:
- Status visual (normal/alerta)
- Temperatura atual
- Limites ideais
- Tempo da última leitura
- Botões de ação

### AlertCard
Exibe alertas de temperatura com:
- Tipo de alerta (baixa/alta)
- Diferença da temperatura ideal
- Tempo do alerta
- Ações rápidas

### ChartComponent
Gráficos interativos com:
- Linha temporal de temperaturas
- Limites ideais
- Pontos de alerta
- Zoom e pan
- Tooltips informativos

## 🔄 Comunicação em Tempo Real

### Socket.IO Events
- `nova_leitura`: Nova leitura de temperatura
- `alerta_temperatura`: Alerta de temperatura fora do ideal
- `atualizacao_geral`: Atualização geral do sistema

### Recursos de Tempo Real
- Atualização automática de cards
- Notificações instantâneas
- Reconexão automática
- Status de conectividade

## 🛠️ Desenvolvimento

### Scripts Disponíveis
```bash
npm start          # Iniciar servidor
npm run dev        # Desenvolvimento com nodemon
npm run init-db    # Inicializar banco de dados
npm run simulate-sensors  # Simular sensores
```

### Estrutura de Componentes
O frontend utiliza uma arquitetura modular com:
- **Componentes**: Reutilizáveis e independentes
- **Utilitários**: Funções auxiliares e comunicação
- **Páginas**: Organização por funcionalidade
- **App Principal**: Orquestração geral

### Padrões Utilizados
- **MVC**: Separação de responsabilidades
- **Component-Based**: Componentes reutilizáveis
- **Event-Driven**: Comunicação via eventos
- **RESTful API**: Endpoints padronizados

## 🚨 Sistema de Alertas

### Tipos de Alerta
1. **Temperatura Baixa**: Abaixo do limite mínimo
2. **Temperatura Alta**: Acima do limite máximo

### Notificações
- **Desktop**: Notificações do navegador
- **Som**: Alerta sonoro
- **Visual**: Cards destacados em vermelho
- **Toast**: Mensagens temporárias

### Configuração de Alertas
- Limites configuráveis por sala
- Diferentes tipos de notificação
- Histórico de alertas
- Estatísticas de ocorrências

## 📈 Gráficos e Visualizações

### Tipos de Gráfico
- **Linha Temporal**: Evolução da temperatura
- **Comparativo**: Múltiplas salas
- **Estatísticas**: Média, mínima, máxima

### Recursos dos Gráficos
- Zoom e pan
- Tooltips informativos
- Legendas interativas
- Exportação de dados
- Períodos configuráveis

## 🔒 Segurança e Performance

### Segurança
- Validação de dados de entrada
- Sanitização de parâmetros
- Controle de acesso (preparado para implementação)
- Logs de auditoria

### Performance
- Cache de dados frequentes
- Paginação de resultados
- Otimização de consultas SQL
- Compressão de respostas

## 🧪 Testes

### Testes Manuais
1. **Simulação de Sensores**: Verificar envio de dados
2. **Alertas**: Testar limites de temperatura
3. **Interface**: Navegação e responsividade
4. **Tempo Real**: Atualizações via Socket.IO

### Cenários de Teste
- Temperatura normal
- Temperatura acima do limite
- Temperatura abaixo do limite
- Falha de conexão
- Reconexão automática

## 📝 Logs e Monitoramento

### Logs do Sistema
- Inicialização do servidor
- Conexões de clientes
- Leituras de sensores
- Alertas gerados
- Erros e exceções

### Monitoramento
- Status de conectividade
- Performance da API
- Uso de recursos
- Alertas de sistema

## 🔮 Próximas Funcionalidades

### Planejadas
- [ ] Autenticação de usuários
- [ ] Relatórios em PDF
- [ ] Exportação de dados
- [ ] Configurações avançadas
- [ ] API para dispositivos IoT reais
- [ ] Dashboard mobile nativo
- [ ] Integração com sistemas externos

### Melhorias
- [ ] Cache Redis
- [ ] Load balancing
- [ ] Backup automático
- [ ] Métricas avançadas
- [ ] Machine Learning para predição

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👥 Autores

- **Sistema de Monitoramento** - *Desenvolvimento inicial*

## 🙏 Agradecimentos

- Bootstrap para o framework CSS
- Chart.js para os gráficos
- Socket.IO para comunicação em tempo real
- SQLite para o banco de dados
- Node.js e Express para o backend

---

**🌡️ Sistema de Monitoramento de Temperatura - Frigorífico**  
*Monitoramento inteligente para ambientes de refrigeração* 