#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

// Configurações WiFi
const char* ssid = "SUA_REDE_WIFI";
const char* password = "SUA_SENHA_WIFI";

// Configurações do servidor
const char* serverUrl = "http://192.168.1.100:3000"; // Altere para o IP do seu servidor
const char* apiKey = "esp32_temp_monitor_2024"; // Chave de API (deve ser igual à do servidor)

// Configurações do sensor DHT
#define DHTPIN 4        // Pino conectado ao sensor DHT
#define DHTTYPE DHT22   // Tipo do sensor (DHT11 ou DHT22)
DHT dht(DHTPIN, DHTTYPE);

// Configurações do sistema
const int idSala = 1;           // ID da sala no sistema (altere conforme necessário)
const int intervaloLeitura = 30000; // Intervalo entre leituras (30 segundos)
const int maxTentativas = 3;    // Máximo de tentativas de reconexão

// Variáveis globais
unsigned long ultimaLeitura = 0;
int tentativasConexao = 0;
bool wifiConectado = false;

void setup() {
  Serial.begin(115200);
  
  // Inicializar sensor DHT
  dht.begin();
  
  Serial.println("=== Sistema de Monitoramento de Temperatura ESP32 ===");
  
  // Conectar ao WiFi
  conectarWiFi();
  
  // Verificar status do servidor
  verificarStatusServidor();
}

void loop() {
  unsigned long tempoAtual = millis();
  
  // Verificar conexão WiFi
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi desconectado. Tentando reconectar...");
    wifiConectado = false;
    conectarWiFi();
    return;
  }
  
  // Realizar leitura no intervalo definido
  if (tempoAtual - ultimaLeitura >= intervaloLeitura) {
    realizarLeitura();
    ultimaLeitura = tempoAtual;
  }
  
  delay(1000); // Pequena pausa para não sobrecarregar
}

void conectarWiFi() {
  Serial.print("Conectando ao WiFi: ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  int tentativas = 0;
  while (WiFi.status() != WL_CONNECTED && tentativas < 20) {
    delay(500);
    Serial.print(".");
    tentativas++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.println("WiFi conectado!");
    Serial.print("Endereço IP: ");
    Serial.println(WiFi.localIP());
    wifiConectado = true;
    tentativasConexao = 0;
  } else {
    Serial.println();
    Serial.println("Falha na conexão WiFi!");
    tentativasConexao++;
    
    if (tentativasConexao >= maxTentativas) {
      Serial.println("Máximo de tentativas atingido. Reiniciando...");
      ESP.restart();
    }
  }
}

void verificarStatusServidor() {
  if (!wifiConectado) return;
  
  HTTPClient http;
  String url = String(serverUrl) + "/api/esp32/status?api_key=" + String(apiKey);
  
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  
  int httpCode = http.GET();
  
  if (httpCode == HTTP_CODE_OK) {
    String payload = http.getString();
    Serial.println("Servidor online: " + payload);
  } else {
    Serial.printf("Erro ao verificar servidor. Código: %d\n", httpCode);
  }
  
  http.end();
}

void realizarLeitura() {
  if (!wifiConectado) return;
  
  // Ler dados do sensor
  float temperatura = dht.readTemperature();
  float umidade = dht.readHumidity();
  
  // Verificar se a leitura foi bem-sucedida
  if (isnan(temperatura) || isnan(umidade)) {
    Serial.println("Erro na leitura do sensor DHT!");
    return;
  }
  
  Serial.printf("Temperatura: %.2f°C, Umidade: %.2f%%\n", temperatura, umidade);
  
  // Enviar dados para o servidor
  enviarDadosServidor(temperatura, umidade);
}

void enviarDadosServidor(float temperatura, float umidade) {
  HTTPClient http;
  String url = String(serverUrl) + "/api/esp32/temperatura";
  
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-API-Key", apiKey);
  
  // Criar JSON com os dados
  StaticJsonDocument<200> doc;
  doc["id_sala"] = idSala;
  doc["temperatura"] = temperatura;
  doc["umidade"] = umidade;
  doc["timestamp"] = obterTimestamp();
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  Serial.println("Enviando dados: " + jsonString);
  
  int httpCode = http.POST(jsonString);
  
  if (httpCode == HTTP_CODE_OK) {
    String payload = http.getString();
    Serial.println("Dados enviados com sucesso: " + payload);
    
    // Parse da resposta para verificar se há alerta
    StaticJsonDocument<200> resposta;
    deserializeJson(resposta, payload);
    
    if (resposta["data"]["is_alerta"]) {
      Serial.println("⚠️ ALERTA: Temperatura fora do ideal!");
    }
  } else {
    Serial.printf("Erro ao enviar dados. Código: %d\n", httpCode);
    String payload = http.getString();
    Serial.println("Resposta: " + payload);
  }
  
  http.end();
}

String obterTimestamp() {
  // Em uma implementação real, você pode usar um RTC ou NTP
  // Por enquanto, retornamos um timestamp simples
  unsigned long tempo = millis() / 1000; // Tempo em segundos desde o início
  return String(tempo);
}

// Função para obter informações do sistema
void obterInfoSistema() {
  Serial.println("=== Informações do Sistema ===");
  Serial.printf("ID da Sala: %d\n", idSala);
  Serial.printf("Intervalo de Leitura: %d ms\n", intervaloLeitura);
  Serial.printf("Endereço MAC: %s\n", WiFi.macAddress().c_str());
  Serial.printf("Sinal WiFi (RSSI): %d dBm\n", WiFi.RSSI());
  Serial.println("==============================");
} 