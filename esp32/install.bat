@echo off
REM Script de instalação rápida para integração ESP32 - Windows
REM Sistema de Monitoramento de Temperatura

echo 🚀 Instalando dependências para integração ESP32...

REM Verificar se Python está instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python não encontrado. Instale o Python 3.7+ primeiro.
    pause
    exit /b 1
)

REM Verificar se pip está instalado
pip --version >nul 2>&1
if errorlevel 1 (
    echo ❌ pip não encontrado. Instale o pip primeiro.
    pause
    exit /b 1
)

REM Instalar dependências Python
echo 📦 Instalando dependências Python...
pip install -r requirements.txt

REM Verificar se o servidor está rodando
echo 🔍 Verificando se o servidor está rodando...
curl -s http://localhost:3000/api/esp32/status?api_key=esp32_temp_monitor_2024 >nul 2>&1
if errorlevel 1 (
    echo ⚠️ Servidor não está rodando. Inicie o servidor primeiro:
    echo    cd .. ^&^& npm start
    echo.
) else (
    echo ✅ Servidor está rodando!
)

REM Criar arquivo de configuração de exemplo
echo ⚙️ Criando arquivo de configuração de exemplo...
(
echo # Configuração de exemplo para teste ESP32
echo # Copie este arquivo para config.py e ajuste conforme necessário
echo.
echo # Configurações do servidor
echo SERVER_URL = "http://localhost:3000"  # Altere para o IP do seu servidor
echo API_KEY = "esp32_temp_monitor_2024"   # Chave de API
echo.
echo # Configurações de teste
echo SALA_TESTE = 1                        # ID da sala para testes
echo INTERVALO_TESTE = 5                   # Intervalo entre testes ^(segundos^)
) > config_exemplo.py

echo ✅ Instalação concluída!
echo.
echo 📋 Próximos passos:
echo 1. Configure o ESP32 com o código em temperatura_monitor_avancado.ino
echo 2. Ajuste as configurações WiFi e servidor no código
echo 3. Teste a integração: python teste_integracao.py completo
echo 4. Monte o hardware conforme diagrama_conexao.md
echo.
echo 📚 Documentação completa: README-ESP32-INTEGRACAO.md
pause 