# Integração ESP32 - Sistema de Monitoramento de Temperatura

Este documento fornece instruções completas para integrar um ESP32 ao sistema de monitoramento de temperatura, permitindo que o dispositivo envie dados de temperatura e umidade via WiFi para o servidor.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Componentes Necessários](#componentes-necessários)
3. [Configuração do Servidor](#configuração-do-servidor)
4. [Montagem do Hardware](#montagem-do-hardware)
5. [Configuração do ESP32](#configuração-do-esp32)
6. [Teste da Integração](#teste-da-integração)
7. [Solução de Problemas](#solução-de-problemas)
8. [API Reference](#api-reference)

## 🎯 Visão Geral

A integração ESP32 permite:
- ✅ Monitoramento automático de temperatura e umidade
- ✅ Envio de dados via WiFi para o servidor
- ✅ Detecção automática de alertas
- ✅ Display OLED para visualização local (opcional)
- ✅ Sincronização de tempo via NTP
- ✅ Reconexão automática em caso de falha

## 🔧 Componentes Necessários

### Hardware
- **ESP32** (qualquer modelo)
- **Sensor DHT22** (ou DHT11)
- **Display OLED SSD1306 128x64** (opcional)
- **LED** (para status)
- **Resistor 220Ω** (para o LED)
- **Protoboard**
- **Cabos jumper**

### Software
- **Arduino IDE** ou **PlatformIO**
- **Bibliotecas Arduino**:
  - `WiFi`
  - `HTTPClient`
  - `ArduinoJson`
  - `DHT sensor library`
  - `Adafruit GFX Library`
  - `Adafruit SSD1306`

## 🖥️ Configuração do Servidor

### 1. Verificar se o servidor está rodando

```bash
# No diretório do projeto
npm start
# ou
node server.js
```

### 2. Verificar as rotas ESP32

O servidor já inclui as rotas ESP32 em `/api/esp32/`:

- `GET /api/esp32/status` - Verificar status
- `GET /api/esp32/salas` - Listar salas disponíveis
- `POST /api/esp32/temperatura` - Enviar dados de temperatura
- `POST /api/esp32/registrar` - Registrar dispositivo

### 3. Configurar chave de API

A chave padrão é `esp32_temp_monitor_2024`. Para alterar:

```bash
# Definir variável de ambiente
export ESP32_API_KEY="sua_chave_personalizada"
```

## 🔌 Montagem do Hardware

### Diagrama de Conexão

```
ESP32
+------------------+
|                  |
|  3.3V -------- VCC (DHT22)
|                  |
|  GND -------- GND (DHT22)
|                  |
|  GPIO4 ----- DATA (DHT22)
|                  |
|  3.3V -------- VCC (OLED)
|                  |
|  GND -------- GND (OLED)
|                  |
|  GPIO22 ----- SCL (OLED)
|                  |
|  GPIO21 ----- SDA (OLED)
|                  |
|  GPIO2 ----- LED (via 220Ω)
|                  |
+------------------+
```

### Passos de Montagem

1. **Conectar sensor DHT22**:
   - VCC → 3.3V
   - GND → GND
   - DATA → GPIO4

2. **Conectar display OLED** (opcional):
   - VCC → 3.3V
   - GND → GND
   - SCL → GPIO22
   - SDA → GPIO21

3. **Conectar LED de status**:
   - Anodo → GPIO2 (via resistor 220Ω)
   - Catodo → GND

## ⚙️ Configuração do ESP32

### 1. Instalar Bibliotecas

No Arduino IDE:
1. **Sketch** → **Include Library** → **Manage Libraries**
2. Instalar as seguintes bibliotecas:
   - `DHT sensor library` (por Adafruit)
   - `ArduinoJson` (por Benoit Blanchon)
   - `Adafruit GFX Library`
   - `Adafruit SSD1306`

### 2. Configurar o Código

#### Opção A: Código Básico
Use o arquivo `esp32/temperatura_monitor.ino`

#### Opção B: Código Avançado (Recomendado)
Use o arquivo `esp32/temperatura_monitor_avancado.ino`

### 3. Personalizar Configurações

Edite o arquivo `esp32/config.h` ou as constantes no código:

```cpp
// Configurações de rede
#define WIFI_SSID "SUA_REDE_WIFI"
#define WIFI_PASSWORD "SUA_SENHA_WIFI"

// Configurações do servidor
#define SERVER_URL "http://192.168.1.100:3000"  // IP do seu servidor
#define API_KEY "esp32_temp_monitor_2024"

// Configurações do sistema
#define SALA_ID 1                    // ID da sala no sistema
#define LEITURA_INTERVALO 30000      // 30 segundos
```

### 4. Carregar o Código

1. Conectar ESP32 ao computador
2. Selecionar a placa correta no Arduino IDE
3. Selecionar a porta COM
4. Clicar em **Upload**

## 🧪 Teste da Integração

### 1. Teste Manual

```bash
# Testar status do servidor
python esp32/teste_integracao.py status

# Listar salas disponíveis
python esp32/teste_integracao.py salas

# Enviar dados de teste
python esp32/teste_integracao.py enviar 1 25.5 60.0

# Simular ESP32
python esp32/teste_integracao.py simular 1 10
```

### 2. Teste Completo

```bash
python esp32/teste_integracao.py completo
```

### 3. Verificar no Monitor Serial

Abra o Monitor Serial (115200 baud) e verifique:

```
=== Sistema Avançado de Monitoramento ESP32 ===
Conectando WiFi: SUA_REDE_WIFI
WiFi conectado!
IP: 192.168.1.101
Sincronizando tempo... OK!
Servidor online: {"success":true,"message":"ESP32 conectado com sucesso"}
Temperatura: 24.50°C, Umidade: 65.20%
Enviando dados: {"id_sala":1,"temperatura":24.5,"umidade":65.2,"timestamp":"2024-01-15 14:30:25"}
Dados enviados com sucesso: {"success":true,"message":"Dados recebidos e salvos com sucesso"}
```

### 4. Verificar no Frontend

1. Acesse o sistema web
2. Vá para o Dashboard
3. Verifique se os dados aparecem em tempo real
4. Teste os gráficos e alertas

## 🔧 Solução de Problemas

### Problema: WiFi não conecta
**Sintomas**: LED piscando, mensagem "Falha na conexão WiFi"

**Soluções**:
- Verificar SSID e senha
- Testar distância do roteador
- Verificar se a rede é 2.4GHz (ESP32 não suporta 5GHz)
- Reiniciar o roteador

### Problema: Servidor não responde
**Sintomas**: "Erro ao verificar servidor"

**Soluções**:
- Verificar se o servidor está rodando
- Verificar IP do servidor no código
- Testar conectividade de rede
- Verificar firewall

### Problema: Sensor não lê dados
**Sintomas**: "Erro na leitura do sensor DHT"

**Soluções**:
- Verificar conexões VCC, GND e DATA
- Testar com novo sensor
- Verificar se o pino está correto
- Verificar alimentação 3.3V

### Problema: Display não funciona
**Sintomas**: Tela em branco ou "Falha no display"

**Soluções**:
- Verificar conexões I2C (SDA e SCL)
- Testar endereço I2C (0x3C ou 0x3D)
- Verificar se as bibliotecas estão instaladas
- Testar com multímetro

## 📚 API Reference

### Endpoints ESP32

#### GET /api/esp32/status
Verifica se o servidor está online.

**Headers**:
```
X-API-Key: esp32_temp_monitor_2024
```

**Resposta**:
```json
{
  "success": true,
  "message": "ESP32 conectado com sucesso",
  "timestamp": "2024-01-15 14:30:25",
  "server_status": "online"
}
```

#### GET /api/esp32/salas
Lista todas as salas disponíveis.

**Headers**:
```
X-API-Key: esp32_temp_monitor_2024
```

**Resposta**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nome": "Sala Principal",
      "temperatura_ideal_min": 18.0,
      "temperatura_ideal_max": 25.0
    }
  ]
}
```

#### POST /api/esp32/temperatura
Envia dados de temperatura e umidade.

**Headers**:
```
Content-Type: application/json
X-API-Key: esp32_temp_monitor_2024
```

**Body**:
```json
{
  "id_sala": 1,
  "temperatura": 24.5,
  "umidade": 65.2,
  "timestamp": "2024-01-15 14:30:25"
}
```

**Resposta**:
```json
{
  "success": true,
  "message": "Dados recebidos e salvos com sucesso",
  "data": {
    "id_leitura": 123,
    "sala": "Sala Principal",
    "temperatura": 24.5,
    "data_hora": "2024-01-15 14:30:25",
    "is_alerta": false
  }
}
```

### Códigos de Erro

- `400` - Dados inválidos (temperatura ou id_sala ausente)
- `401` - Chave de API inválida
- `404` - Sala não encontrada
- `500` - Erro interno do servidor

## 🚀 Próximos Passos

### Melhorias Sugeridas

1. **Segurança**:
   - Implementar HTTPS
   - Usar certificados SSL
   - Implementar autenticação mais robusta

2. **Funcionalidades**:
   - Configuração via WiFi Manager
   - OTA (Over-The-Air) updates
   - Armazenamento local em caso de falha de rede
   - Múltiplos sensores por ESP32

3. **Monitoramento**:
   - Dashboard específico para ESP32
   - Logs detalhados
   - Métricas de performance

### Configuração Avançada

Para configuração em produção:

1. **Variáveis de Ambiente**:
```bash
export ESP32_API_KEY="chave_super_secreta_2024"
export NODE_ENV="production"
```

2. **Firewall**:
```bash
# Permitir apenas conexões ESP32
iptables -A INPUT -p tcp --dport 3000 -s 192.168.1.0/24 -j ACCEPT
```

3. **Monitoramento**:
```bash
# Logs do sistema
pm2 logs temperatura-monitor
```

## 📞 Suporte

Para dúvidas ou problemas:

1. Verifique os logs do servidor
2. Teste com o script de teste
3. Verifique o Monitor Serial do ESP32
4. Consulte a seção de solução de problemas

---

**Nota**: Esta integração foi testada com ESP32 DevKit v1, sensor DHT22 e display OLED SSD1306. Outros modelos podem requerer ajustes nas configurações. 