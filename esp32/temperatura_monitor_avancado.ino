#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <time.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// Configurações WiFi
const char* ssid = "SUA_REDE_WIFI";
const char* password = "SUA_SENHA_WIFI";

// Configurações do servidor
const char* serverUrl = "http://192.168.1.100:3000"; // Altere para o IP do seu servidor
const char* apiKey = "esp32_temp_monitor_2024"; // Chave de API

// Configurações NTP
const char* ntpServer = "pool.ntp.org";
const long gmtOffset_sec = -10800; // GMT-3 (Brasil)
const int daylightOffset_sec = 0;

// Configurações do sensor DHT
#define DHTPIN 4
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

// Configurações do display OLED (128x64)
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
#define SCREEN_ADDRESS 0x3C
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// Configurações do sistema
const int idSala = 1;
const int intervaloLeitura = 30000; // 30 segundos
const int maxTentativas = 3;
const int ledStatus = 2; // LED de status

// Variáveis globais
unsigned long ultimaLeitura = 0;
int tentativasConexao = 0;
bool wifiConectado = false;
bool servidorOnline = false;
float ultimaTemperatura = 0;
float ultimaUmidade = 0;
int totalLeituras = 0;
int leiturasComErro = 0;

void setup() {
  Serial.begin(115200);
  pinMode(ledStatus, OUTPUT);
  
  // Inicializar display
  if(!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
    Serial.println(F("Falha no display SSD1306"));
  } else {
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(0,0);
    display.println(F("Iniciando..."));
    display.display();
  }
  
  // Inicializar sensor DHT
  dht.begin();
  
  Serial.println("=== Sistema Avançado de Monitoramento ESP32 ===");
  
  // Conectar ao WiFi
  conectarWiFi();
  
  // Configurar NTP
  configurarNTP();
  
  // Verificar status do servidor
  verificarStatusServidor();
  
  // Mostrar informações iniciais
  mostrarInfoInicial();
}

void loop() {
  unsigned long tempoAtual = millis();
  
  // Verificar conexão WiFi
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi desconectado. Tentando reconectar...");
    wifiConectado = false;
    servidorOnline = false;
    digitalWrite(ledStatus, LOW);
    conectarWiFi();
    return;
  }
  
  // Realizar leitura no intervalo definido
  if (tempoAtual - ultimaLeitura >= intervaloLeitura) {
    realizarLeitura();
    ultimaLeitura = tempoAtual;
  }
  
  // Atualizar display a cada 5 segundos
  static unsigned long ultimaAtualizacaoDisplay = 0;
  if (tempoAtual - ultimaAtualizacaoDisplay >= 5000) {
    atualizarDisplay();
    ultimaAtualizacaoDisplay = tempoAtual;
  }
  
  delay(1000);
}

void conectarWiFi() {
  mostrarMensagemDisplay("Conectando WiFi...");
  
  WiFi.begin(ssid, password);
  
  int tentativas = 0;
  while (WiFi.status() != WL_CONNECTED && tentativas < 20) {
    delay(500);
    Serial.print(".");
    digitalWrite(ledStatus, !digitalRead(ledStatus)); // Piscar LED
    tentativas++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.println("WiFi conectado!");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
    wifiConectado = true;
    tentativasConexao = 0;
    digitalWrite(ledStatus, HIGH);
    mostrarMensagemDisplay("WiFi OK!");
    delay(1000);
  } else {
    Serial.println();
    Serial.println("Falha na conexão WiFi!");
    tentativasConexao++;
    digitalWrite(ledStatus, LOW);
    
    if (tentativasConexao >= maxTentativas) {
      mostrarMensagemDisplay("Reiniciando...");
      delay(2000);
      ESP.restart();
    }
  }
}

void configurarNTP() {
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
  
  // Aguardar sincronização
  Serial.print("Sincronizando tempo...");
  int tentativas = 0;
  while (!getLocalTime(&timeinfo) && tentativas < 10) {
    Serial.print(".");
    delay(1000);
    tentativas++;
  }
  
  if (tentativas < 10) {
    Serial.println(" OK!");
    mostrarMensagemDisplay("Tempo sincronizado");
  } else {
    Serial.println(" Falha!");
    mostrarMensagemDisplay("Erro no tempo");
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
    servidorOnline = true;
    digitalWrite(ledStatus, HIGH);
  } else {
    Serial.printf("Erro ao verificar servidor. Código: %d\n", httpCode);
    servidorOnline = false;
    digitalWrite(ledStatus, LOW);
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
    leiturasComErro++;
    return;
  }
  
  ultimaTemperatura = temperatura;
  ultimaUmidade = umidade;
  totalLeituras++;
  
  Serial.printf("Temperatura: %.2f°C, Umidade: %.2f%%\n", temperatura, umidade);
  
  // Enviar dados para o servidor
  enviarDadosServidor(temperatura, umidade);
}

void enviarDadosServidor(float temperatura, float umidade) {
  if (!servidorOnline) {
    verificarStatusServidor();
    if (!servidorOnline) return;
  }
  
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
    
    // Parse da resposta
    StaticJsonDocument<200> resposta;
    deserializeJson(resposta, payload);
    
    if (resposta["data"]["is_alerta"]) {
      Serial.println("⚠️ ALERTA: Temperatura fora do ideal!");
      // Piscar LED rapidamente em caso de alerta
      for (int i = 0; i < 5; i++) {
        digitalWrite(ledStatus, LOW);
        delay(200);
        digitalWrite(ledStatus, HIGH);
        delay(200);
      }
    }
  } else {
    Serial.printf("Erro ao enviar dados. Código: %d\n", httpCode);
    String payload = http.getString();
    Serial.println("Resposta: " + payload);
    servidorOnline = false;
  }
  
  http.end();
}

String obterTimestamp() {
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    return "Erro no tempo";
  }
  
  char timeString[64];
  strftime(timeString, sizeof(timeString), "%Y-%m-%d %H:%M:%S", &timeinfo);
  return String(timeString);
}

void mostrarInfoInicial() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0,0);
  display.println(F("=== ESP32 Monitor ==="));
  display.println();
  display.printf("Sala ID: %d\n", idSala);
  display.printf("IP: %s\n", WiFi.localIP().toString().c_str());
  display.printf("MAC: %s\n", WiFi.macAddress().c_str());
  display.println();
  display.println("Aguardando leituras...");
  display.display();
}

void atualizarDisplay() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0,0);
  
  // Cabeçalho
  display.println(F("=== Monitor Temp ==="));
  
  // Status da conexão
  display.printf("WiFi: %s\n", wifiConectado ? "OK" : "OFF");
  display.printf("Server: %s\n", servidorOnline ? "OK" : "OFF");
  
  // Dados do sensor
  display.printf("Temp: %.1fC\n", ultimaTemperatura);
  display.printf("Umid: %.1f%%\n", ultimaUmidade);
  
  // Estatísticas
  display.printf("Leituras: %d\n", totalLeituras);
  display.printf("Erros: %d\n", leiturasComErro);
  
  // Tempo
  struct tm timeinfo;
  if (getLocalTime(&timeinfo)) {
    char timeStr[8];
    strftime(timeStr, sizeof(timeStr), "%H:%M:%S", &timeinfo);
    display.printf("Tempo: %s", timeStr);
  }
  
  display.display();
}

void mostrarMensagemDisplay(const char* mensagem) {
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0, SCREEN_HEIGHT/2 - 8);
  display.println(mensagem);
  display.display();
}

// Função para obter informações do sistema
void obterInfoSistema() {
  Serial.println("=== Informações do Sistema ===");
  Serial.printf("ID da Sala: %d\n", idSala);
  Serial.printf("Intervalo de Leitura: %d ms\n", intervaloLeitura);
  Serial.printf("Endereço MAC: %s\n", WiFi.macAddress().c_str());
  Serial.printf("Sinal WiFi (RSSI): %d dBm\n", WiFi.RSSI());
  Serial.printf("Total de Leituras: %d\n", totalLeituras);
  Serial.printf("Leituras com Erro: %d\n", leiturasComErro);
  Serial.println("==============================");
} 