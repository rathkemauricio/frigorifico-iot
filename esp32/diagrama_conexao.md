# Diagrama de Conexão - ESP32 + Sensor DHT + Display OLED

## Componentes Necessários

- ESP32 (qualquer modelo)
- Sensor DHT22 (ou DHT11)
- Display OLED SSD1306 128x64 (opcional)
- LED (para status)
- Resistor 220Ω (para o LED)
- Protoboard
- Cabos jumper

## Conexões

### Sensor DHT22/DHT11
```
DHT22/11    ESP32
--------    -----
VCC    -->  3.3V
GND    -->  GND
DATA   -->  GPIO4 (configurável)
```

### Display OLED SSD1306
```
OLED        ESP32
-----       -----
VCC    -->  3.3V
GND    -->  GND
SCL    -->  GPIO22 (I2C SCL)
SDA    -->  GPIO21 (I2C SDA)
```

### LED de Status
```
LED         ESP32
---         -----
Anodo   -->  GPIO2 (via resistor 220Ω)
Catodo  -->  GND
```

## Diagrama Visual

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

## Configuração dos Pinos

No arquivo `config.h`, você pode alterar os pinos:

```cpp
#define DHT_PIN 4                    // Pino do sensor DHT
#define LED_STATUS_PIN 2             // Pino do LED de status
#define DISPLAY_ADDRESS 0x3C         // Endereço I2C do display
```

## Notas Importantes

1. **Alimentação**: Use sempre 3.3V para o ESP32
2. **Pull-up**: O sensor DHT22 já possui resistor pull-up interno
3. **I2C**: O display OLED usa I2C, pinos padrão são GPIO21 (SDA) e GPIO22 (SCL)
4. **LED**: Sempre use um resistor em série com o LED (220Ω é adequado)
5. **Distância**: Mantenha os cabos curtos para evitar interferência

## Teste de Conexão

Após montar o circuito:

1. Carregue o código no ESP32
2. Abra o Monitor Serial (115200 baud)
3. Verifique se as mensagens aparecem corretamente
4. Se usar display, verifique se as informações são exibidas
5. Teste a conexão WiFi e envio de dados

## Solução de Problemas

### Sensor DHT não funciona:
- Verifique as conexões VCC, GND e DATA
- Teste com um novo sensor
- Verifique se o pino está correto no código

### Display não funciona:
- Verifique as conexões I2C (SDA e SCL)
- Teste o endereço I2C (geralmente 0x3C ou 0x3D)
- Verifique se as bibliotecas estão instaladas

### WiFi não conecta:
- Verifique SSID e senha
- Teste a distância do roteador
- Verifique se a rede está 2.4GHz (ESP32 não suporta 5GHz)

### Servidor não responde:
- Verifique o IP do servidor no código
- Teste se o servidor está rodando
- Verifique se a chave de API está correta 