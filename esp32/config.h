#ifndef CONFIG_H
#define CONFIG_H

// ========================================
// CONFIGURAÇÕES DE REDE
// ========================================
#define WIFI_SSID "SUA_REDE_WIFI"
#define WIFI_PASSWORD "SUA_SENHA_WIFI"

// ========================================
// CONFIGURAÇÕES DO SERVIDOR
// ========================================
#define SERVER_URL "http://192.168.1.100:3000"  // IP do seu servidor
#define API_KEY "esp32_temp_monitor_2024"       // Chave de API (deve ser igual à do servidor)

// ========================================
// CONFIGURAÇÕES DO SENSOR
// ========================================
#define DHT_PIN 4                    // Pino conectado ao sensor DHT
#define DHT_TYPE DHT22               // Tipo do sensor (DHT11 ou DHT22)
#define TEMP_OFFSET 0.0              // Offset de temperatura (correção)
#define HUMIDITY_OFFSET 0.0          // Offset de umidade (correção)

// ========================================
// CONFIGURAÇÕES DO SISTEMA
// ========================================
#define SALA_ID 1                    // ID da sala no sistema
#define LEITURA_INTERVALO 30000      // Intervalo entre leituras (ms) - 30 segundos
#define MAX_TENTATIVAS 3             // Máximo de tentativas de reconexão
#define LED_STATUS_PIN 2             // Pino do LED de status

// ========================================
// CONFIGURAÇÕES NTP
// ========================================
#define NTP_SERVER "pool.ntp.org"
#define GMT_OFFSET_SEC -10800        // GMT-3 (Brasil)
#define DAYLIGHT_OFFSET_SEC 0

// ========================================
// CONFIGURAÇÕES DO DISPLAY (se usado)
// ========================================
#define DISPLAY_WIDTH 128
#define DISPLAY_HEIGHT 64
#define DISPLAY_ADDRESS 0x3C

// ========================================
// CONFIGURAÇÕES DE DEBUG
// ========================================
#define DEBUG_SERIAL true            // Habilitar debug via Serial
#define DEBUG_DISPLAY true           // Habilitar debug no display
#define SERIAL_BAUD 115200           // Velocidade do Serial

// ========================================
// CONFIGURAÇÕES DE ALERTA
// ========================================
#define ALERTA_LED_PISCADAS 5        // Número de piscadas do LED em caso de alerta
#define ALERTA_LED_INTERVALO 200     // Intervalo entre piscadas (ms)

// ========================================
// CONFIGURAÇÕES DE MEMÓRIA
// ========================================
#define JSON_DOC_SIZE 200            // Tamanho do documento JSON
#define MAX_STRING_LENGTH 64         // Tamanho máximo de strings

// ========================================
// CONFIGURAÇÕES DE TEMPO
// ========================================
#define NTP_TIMEOUT 10000            // Timeout para sincronização NTP (ms)
#define DISPLAY_UPDATE_INTERVAL 5000 // Intervalo de atualização do display (ms)

#endif 