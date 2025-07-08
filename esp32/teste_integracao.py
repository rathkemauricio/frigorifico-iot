#!/usr/bin/env python3
"""
Script de teste para integração ESP32 com servidor de monitoramento de temperatura
"""

import requests
import json
import time
from datetime import datetime

class TesteIntegracaoESP32:
    def __init__(self, server_url, api_key):
        self.server_url = server_url
        self.api_key = api_key
        self.headers = {
            'Content-Type': 'application/json',
            'X-API-Key': api_key
        }
    
    def testar_status_servidor(self):
        """Testa se o servidor está online"""
        try:
            url = f"{self.server_url}/api/esp32/status?api_key={self.api_key}"
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Servidor online: {data['message']}")
                return True
            else:
                print(f"❌ Erro no servidor: {response.status_code}")
                return False
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Erro de conexão: {e}")
            return False
    
    def testar_listar_salas(self):
        """Testa listagem de salas disponíveis"""
        try:
            url = f"{self.server_url}/api/esp32/salas?api_key={self.api_key}"
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Salas encontradas: {len(data['data'])}")
                for sala in data['data']:
                    print(f"   - Sala {sala['id']}: {sala['nome']} ({sala['temperatura_ideal_min']}°C - {sala['temperatura_ideal_max']}°C)")
                return True
            else:
                print(f"❌ Erro ao listar salas: {response.status_code}")
                return False
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Erro de conexão: {e}")
            return False
    
    def testar_envio_dados(self, id_sala, temperatura, umidade=None):
        """Testa envio de dados de temperatura"""
        try:
            url = f"{self.server_url}/api/esp32/temperatura"
            
            payload = {
                "id_sala": id_sala,
                "temperatura": temperatura,
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
            
            if umidade is not None:
                payload["umidade"] = umidade
            
            response = requests.post(url, headers=self.headers, json=payload, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Dados enviados com sucesso!")
                print(f"   - Sala: {data['data']['sala']}")
                print(f"   - Temperatura: {data['data']['temperatura']}°C")
                print(f"   - Alerta: {'Sim' if data['data']['is_alerta'] else 'Não'}")
                return True
            else:
                print(f"❌ Erro ao enviar dados: {response.status_code}")
                print(f"   Resposta: {response.text}")
                return False
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Erro de conexão: {e}")
            return False
    
    def testar_dados_invalidos(self):
        """Testa envio de dados inválidos"""
        try:
            url = f"{self.server_url}/api/esp32/temperatura"
            
            # Teste 1: Sem temperatura
            payload1 = {"id_sala": 1}
            response1 = requests.post(url, headers=self.headers, json=payload1, timeout=10)
            print(f"Teste sem temperatura: {response1.status_code} - {'✅ OK' if response1.status_code == 400 else '❌ Falhou'}")
            
            # Teste 2: Sala inexistente
            payload2 = {"id_sala": 999, "temperatura": 25.0}
            response2 = requests.post(url, headers=self.headers, json=payload2, timeout=10)
            print(f"Teste sala inexistente: {response2.status_code} - {'✅ OK' if response2.status_code == 404 else '❌ Falhou'}")
            
            # Teste 3: Chave API inválida
            headers_invalidos = {'Content-Type': 'application/json', 'X-API-Key': 'chave_invalida'}
            payload3 = {"id_sala": 1, "temperatura": 25.0}
            response3 = requests.post(url, headers=headers_invalidos, json=payload3, timeout=10)
            print(f"Teste chave inválida: {response3.status_code} - {'✅ OK' if response3.status_code == 401 else '❌ Falhou'}")
            
        except requests.exceptions.RequestException as e:
            print(f"❌ Erro nos testes de validação: {e}")
    
    def simular_esp32(self, id_sala, intervalo=5):
        """Simula um ESP32 enviando dados periodicamente"""
        print(f"\n🔄 Simulando ESP32 para sala {id_sala} (intervalo: {intervalo}s)")
        print("Pressione Ctrl+C para parar")
        
        try:
            contador = 0
            while True:
                contador += 1
                
                # Simular temperatura variando entre 18-30°C
                import random
                temperatura = round(random.uniform(18, 30), 1)
                umidade = round(random.uniform(40, 80), 1)
                
                print(f"\n📊 Leitura #{contador}: {temperatura}°C, {umidade}%")
                
                sucesso = self.testar_envio_dados(id_sala, temperatura, umidade)
                
                if not sucesso:
                    print("⚠️ Falha no envio, tentando novamente em 10s...")
                    time.sleep(10)
                else:
                    time.sleep(intervalo)
                    
        except KeyboardInterrupt:
            print("\n🛑 Simulação interrompida pelo usuário")
    
    def executar_teste_completo(self):
        """Executa todos os testes"""
        print("🧪 INICIANDO TESTE COMPLETO DE INTEGRAÇÃO ESP32")
        print("=" * 50)
        
        # Teste 1: Status do servidor
        print("\n1️⃣ Testando status do servidor...")
        if not self.testar_status_servidor():
            print("❌ Servidor não está disponível. Abortando testes.")
            return False
        
        # Teste 2: Listar salas
        print("\n2️⃣ Testando listagem de salas...")
        if not self.testar_listar_salas():
            print("❌ Erro ao listar salas. Verifique a configuração.")
            return False
        
        # Teste 3: Envio de dados válidos
        print("\n3️⃣ Testando envio de dados válidos...")
        sucessos = 0
        for i in range(3):
            temperatura = 22.0 + i
            if self.testar_envio_dados(1, temperatura, 60.0):
                sucessos += 1
            time.sleep(1)
        
        print(f"✅ {sucessos}/3 envios bem-sucedidos")
        
        # Teste 4: Validação de dados
        print("\n4️⃣ Testando validação de dados...")
        self.testar_dados_invalidos()
        
        print("\n🎉 TESTE COMPLETO FINALIZADO!")
        return True

def main():
    # Configurações
    SERVER_URL = "http://localhost:3000"  # Altere para o IP do seu servidor
    API_KEY = "esp32_temp_monitor_2024"
    
    # Criar instância do teste
    teste = TesteIntegracaoESP32(SERVER_URL, API_KEY)
    
    import sys
    if len(sys.argv) > 1:
        comando = sys.argv[1]
        
        if comando == "status":
            teste.testar_status_servidor()
        elif comando == "salas":
            teste.testar_listar_salas()
        elif comando == "enviar":
            if len(sys.argv) >= 4:
                sala = int(sys.argv[2])
                temp = float(sys.argv[3])
                umid = float(sys.argv[4]) if len(sys.argv) > 4 else None
                teste.testar_envio_dados(sala, temp, umid)
            else:
                print("Uso: python teste_integracao.py enviar <sala> <temperatura> [umidade]")
        elif comando == "simular":
            sala = int(sys.argv[2]) if len(sys.argv) > 2 else 1
            intervalo = int(sys.argv[3]) if len(sys.argv) > 3 else 5
            teste.simular_esp32(sala, intervalo)
        else:
            print("Comandos disponíveis:")
            print("  status    - Testa status do servidor")
            print("  salas     - Lista salas disponíveis")
            print("  enviar    - Envia dados de teste")
            print("  simular   - Simula ESP32 enviando dados")
            print("  completo  - Executa todos os testes")
    else:
        # Executar teste completo
        teste.executar_teste_completo()

if __name__ == "__main__":
    main() 