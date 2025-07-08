#!/bin/bash

# Script de instalação rápida para integração ESP32
# Sistema de Monitoramento de Temperatura

echo "🚀 Instalando dependências para integração ESP32..."

# Verificar se Python está instalado
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 não encontrado. Instale o Python 3.7+ primeiro."
    exit 1
fi

# Verificar se pip está instalado
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 não encontrado. Instale o pip primeiro."
    exit 1
fi

# Instalar dependências Python
echo "📦 Instalando dependências Python..."
pip3 install -r requirements.txt

# Verificar se o servidor está rodando
echo "🔍 Verificando se o servidor está rodando..."
if curl -s http://localhost:3000/api/esp32/status?api_key=esp32_temp_monitor_2024 > /dev/null; then
    echo "✅ Servidor está rodando!"
else
    echo "⚠️ Servidor não está rodando. Inicie o servidor primeiro:"
    echo "   cd .. && npm start"
    echo ""
fi

# Criar arquivo de configuração de exemplo
echo "⚙️ Criando arquivo de configuração de exemplo..."
cat > config_exemplo.py << 'EOF'
# Configuração de exemplo para teste ESP32
# Copie este arquivo para config.py e ajuste conforme necessário

# Configurações do servidor
SERVER_URL = "http://localhost:3000"  # Altere para o IP do seu servidor
API_KEY = "esp32_temp_monitor_2024"   # Chave de API

# Configurações de teste
SALA_TESTE = 1                        # ID da sala para testes
INTERVALO_TESTE = 5                   # Intervalo entre testes (segundos)
EOF

echo "✅ Instalação concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure o ESP32 com o código em temperatura_monitor_avancado.ino"
echo "2. Ajuste as configurações WiFi e servidor no código"
echo "3. Teste a integração: python3 teste_integracao.py completo"
echo "4. Monte o hardware conforme diagrama_conexao.md"
echo ""
echo "📚 Documentação completa: README-ESP32-INTEGRACAO.md" 