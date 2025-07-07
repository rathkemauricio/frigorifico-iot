# 📮 Guia Postman - Sistema de Monitoramento de Temperatura

Este guia fornece todas as informações necessárias para testar a API do Sistema de Monitoramento de Temperatura usando o Postman.

## 🚀 Configuração Inicial

### 1. Importar Collection
1. Abra o Postman
2. Clique em "Import"
3. Cole o JSON da collection (fornecido abaixo)
4. Clique em "Import"

### 2. Configurar Variáveis de Ambiente
Crie um ambiente no Postman com as seguintes variáveis:

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `base_url` | `http://localhost:3000` | URL base da API |
| `api_url` | `{{base_url}}/api` | URL da API |
| `sala_id` | `1` | ID da sala para testes |
| `temperatura` | `3.5` | Temperatura para testes |

## 📋 Collection JSON

```json
{
  "info": {
    "name": "Sistema Monitoramento Temperatura",
    "description": "API completa para sistema de monitoramento de temperatura em frigoríficos",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:3000"
    },
    {
      "key": "api_url",
      "value": "{{base_url}}/api"
    }
  ],
  "item": [
    {
      "name": "Dashboard",
      "item": [
        {
          "name": "Status do Sistema",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{api_url}}/dashboard/status",
              "host": ["{{api_url}}"],
              "path": ["dashboard", "status"]
            }
          }
        },
        {
          "name": "Visão Geral",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{api_url}}/dashboard/overview",
              "host": ["{{api_url}}"],
              "path": ["dashboard", "overview"]
            }
          }
        },
        {
          "name": "Temperaturas Atuais",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{api_url}}/dashboard/temperaturas-atuais",
              "host": ["{{api_url}}"],
              "path": ["dashboard", "temperaturas-atuais"]
            }
          }
        },
        {
          "name": "Alertas Recentes",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{api_url}}/dashboard/alertas-recentes?limite=10",
              "host": ["{{api_url}}"],
              "path": ["dashboard", "alertas-recentes"],
              "query": [
                {
                  "key": "limite",
                  "value": "10"
                }
              ]
            }
          }
        },
        {
          "name": "Estatísticas Gerais",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{api_url}}/dashboard/estatisticas-gerais?periodo=24h",
              "host": ["{{api_url}}"],
              "path": ["dashboard", "estatisticas-gerais"],
              "query": [
                {
                  "key": "periodo",
                  "value": "24h"
                }
              ]
            }
          }
        },
        {
          "name": "Status das Salas",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{api_url}}/dashboard/salas-status",
              "host": ["{{api_url}}"],
              "path": ["dashboard", "salas-status"]
            }
          }
        },
        {
          "name": "Dados para Gráfico",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{api_url}}/dashboard/grafico/{{sala_id}}?periodo=24h&pontos=50",
              "host": ["{{api_url}}"],
              "path": ["dashboard", "grafico", "{{sala_id}}"],
              "query": [
                {
                  "key": "periodo",
                  "value": "24h"
                },
                {
                  "key": "pontos",
                  "value": "50"
                }
              ]
            }
          }
        }
      ]
    },
    {
      "name": "Sensores",
      "item": [
        {
          "name": "Enviar Leitura",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"id_sala\": {{sala_id}},\n  \"temperatura\": {{temperatura}},\n  \"data_hora\": \"{{$timestamp}}\"\n}"
            },
            "url": {
              "raw": "{{api_url}}/sensores/leitura",
              "host": ["{{api_url}}"],
              "path": ["sensores", "leitura"]
            }
          }
        },
        {
          "name": "Listar Leituras",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{api_url}}/sensores/leituras?limite=100",
              "host": ["{{api_url}}"],
              "path": ["sensores", "leituras"],
              "query": [
                {
                  "key": "limite",
                  "value": "100"
                }
              ]
            }
          }
        },
        {
          "name": "Leituras por Sala",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{api_url}}/sensores/leituras/{{sala_id}}?limite=50",
              "host": ["{{api_url}}"],
              "path": ["sensores", "leituras", "{{sala_id}}"],
              "query": [
                {
                  "key": "limite",
                  "value": "50"
                }
              ]
            }
          }
        },
        {
          "name": "Listar Alertas",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{api_url}}/sensores/alertas?limite=20",
              "host": ["{{api_url}}"],
              "path": ["sensores", "alertas"],
              "query": [
                {
                  "key": "limite",
                  "value": "20"
                }
              ]
            }
          }
        }
      ]
    },
    {
      "name": "Salas",
      "item": [
        {
          "name": "Listar Salas",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{api_url}}/salas",
              "host": ["{{api_url}}"],
              "path": ["salas"]
            }
          }
        },
        {
          "name": "Obter Sala",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{api_url}}/salas/{{sala_id}}",
              "host": ["{{api_url}}"],
              "path": ["salas", "{{sala_id}}"]
            }
          }
        },
        {
          "name": "Criar Sala",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"nome\": \"Nova Sala de Teste\",\n  \"temperatura_ideal_min\": 1.0,\n  \"temperatura_ideal_max\": 5.0\n}"
            },
            "url": {
              "raw": "{{api_url}}/salas",
              "host": ["{{api_url}}"],
              "path": ["salas"]
            }
          }
        },
        {
          "name": "Atualizar Sala",
          "request": {
            "method": "PUT",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"nome\": \"Sala Atualizada\",\n  \"temperatura_ideal_min\": 2.0,\n  \"temperatura_ideal_max\": 6.0\n}"
            },
            "url": {
              "raw": "{{api_url}}/salas/{{sala_id}}",
              "host": ["{{api_url}}"],
              "path": ["salas", "{{sala_id}}"]
            }
          }
        },
        {
          "name": "Excluir Sala",
          "request": {
            "method": "DELETE",
            "header": [],
            "url": {
              "raw": "{{api_url}}/salas/{{sala_id}}",
              "host": ["{{api_url}}"],
              "path": ["salas", "{{sala_id}}"]
            }
          }
        },
        {
          "name": "Estatísticas da Sala",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{api_url}}/salas/{{sala_id}}/estatisticas?periodo=24h",
              "host": ["{{api_url}}"],
              "path": ["salas", "{{sala_id}}", "estatisticas"],
              "query": [
                {
                  "key": "periodo",
                  "value": "24h"
                }
              ]
            }
          }
        }
      ]
    }
  ]
}
```

## 🔧 Exemplos de Uso

### 1. Verificar Status do Sistema

**Request:**
```http
GET {{api_url}}/dashboard/status
```

**Response:**
```json
{
  "success": true,
  "message": "Sistema de Monitoramento de Temperatura",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": "online"
}
```

### 2. Enviar Leitura de Sensor

**Request:**
```http
POST {{api_url}}/sensores/leitura
Content-Type: application/json

{
  "id_sala": 1,
  "temperatura": 3.5,
  "data_hora": "2024-01-15 10:30:00"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Leitura salva com sucesso",
  "data": {
    "id": 123,
    "id_sala": 1,
    "nome_sala": "Sala de Resfriamento 1",
    "temperatura": 3.5,
    "data_hora": "2024-01-15 10:30:00",
    "temperatura_ideal_min": 1.0,
    "temperatura_ideal_max": 5.0,
    "is_alerta": false
  }
}
```

### 3. Criar Nova Sala

**Request:**
```http
POST {{api_url}}/salas
Content-Type: application/json

{
  "nome": "Sala de Congelamento 3",
  "temperatura_ideal_min": -18.0,
  "temperatura_ideal_max": -15.0
}
```

**Response:**
```json
{
  "success": true,
  "message": "Sala criada com sucesso",
  "data": {
    "id": 6,
    "nome": "Sala de Congelamento 3",
    "temperatura_ideal_min": -18.0,
    "temperatura_ideal_max": -15.0,
    "created_at": "2024-01-15 10:30:00"
  }
}
```

### 4. Obter Dados para Gráfico

**Request:**
```http
GET {{api_url}}/dashboard/grafico/1?periodo=24h&pontos=50
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sala": {
      "id": 1,
      "nome": "Sala de Resfriamento 1",
      "temperatura_ideal_min": 1.0,
      "temperatura_ideal_max": 5.0
    },
    "periodo": "24h",
    "data_inicio": "2024-01-14T10:30:00.000Z",
    "pontos": [
      {
        "temperatura": 3.2,
        "data_hora": "2024-01-15 10:00:00",
        "timestamp": 1705312800000,
        "is_alerta": false
      }
    ]
  }
}
```

## 🧪 Testes Automatizados

### 1. Teste de Temperatura Normal

```javascript
// Pre-request Script
pm.environment.set("temperatura", "3.5");

// Tests
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has success field", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
});

pm.test("Temperature is within range", function () {
    var jsonData = pm.response.json();
    var temp = jsonData.data.temperatura;
    pm.expect(temp).to.be.above(1.0);
    pm.expect(temp).to.be.below(5.0);
});
```

### 2. Teste de Alerta de Temperatura

```javascript
// Pre-request Script
pm.environment.set("temperatura", "7.0"); // Temperatura acima do limite

// Tests
pm.test("Alert is triggered", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.is_alerta).to.eql(true);
});

pm.test("Alert type is high", function () {
    var jsonData = pm.response.json();
    var temp = jsonData.data.temperatura;
    var maxTemp = jsonData.data.temperatura_ideal_max;
    pm.expect(temp).to.be.above(maxTemp);
});
```

### 3. Teste de Validação de Dados

```javascript
// Pre-request Script
// Enviar dados inválidos

// Tests
pm.test("Invalid data returns 400", function () {
    pm.response.to.have.status(400);
});

pm.test("Error message is present", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.message).to.include("Dados obrigatórios");
});
```

## 📊 Monitoramento de Performance

### 1. Teste de Tempo de Resposta

```javascript
pm.test("Response time is less than 200ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(200);
});
```

### 2. Teste de Tamanho da Resposta

```javascript
pm.test("Response size is reasonable", function () {
    pm.expect(pm.response.responseSize).to.be.below(10000);
});
```

## 🔄 Fluxos de Teste

### Fluxo 1: Ciclo Completo de Monitoramento

1. **Verificar Status**: `GET /api/dashboard/status`
2. **Criar Sala**: `POST /api/salas`
3. **Enviar Leitura Normal**: `POST /api/sensores/leitura`
4. **Verificar Temperatura**: `GET /api/dashboard/temperaturas-atuais`
5. **Enviar Leitura com Alerta**: `POST /api/sensores/leitura`
6. **Verificar Alertas**: `GET /api/sensores/alertas`
7. **Obter Gráfico**: `GET /api/dashboard/grafico/{id}`

### Fluxo 2: Gerenciamento de Salas

1. **Listar Salas**: `GET /api/salas`
2. **Criar Sala**: `POST /api/salas`
3. **Obter Sala**: `GET /api/salas/{id}`
4. **Atualizar Sala**: `PUT /api/salas/{id}`
5. **Verificar Estatísticas**: `GET /api/salas/{id}/estatisticas`

### Fluxo 3: Simulação de Sensores

1. **Enviar Múltiplas Leituras**: `POST /api/sensores/leitura` (várias vezes)
2. **Verificar Histórico**: `GET /api/sensores/leituras/{id_sala}`
3. **Analisar Alertas**: `GET /api/sensores/alertas`
4. **Visualizar Gráfico**: `GET /api/dashboard/grafico/{id}`

## 🚨 Cenários de Erro

### 1. Sala Inexistente

**Request:**
```http
GET {{api_url}}/salas/999
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Sala não encontrada"
}
```

### 2. Dados Inválidos

**Request:**
```http
POST {{api_url}}/sensores/leitura
Content-Type: application/json

{
  "id_sala": 1,
  "temperatura": "invalid"
}
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Dados obrigatórios: id_sala, temperatura, data_hora"
}
```

### 3. Temperatura Fora dos Limites

**Request:**
```http
POST {{api_url}}/salas
Content-Type: application/json

{
  "nome": "Sala Inválida",
  "temperatura_ideal_min": 10.0,
  "temperatura_ideal_max": 5.0
}
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Temperatura mínima deve ser menor que a máxima"
}
```

## 📈 Variáveis Dinâmicas

### Usando Timestamps

```javascript
// Pre-request Script
pm.environment.set("timestamp", new Date().toISOString());

// Body
{
  "id_sala": {{sala_id}},
  "temperatura": {{temperatura}},
  "data_hora": "{{timestamp}}"
}
```

### Usando IDs Dinâmicos

```javascript
// Tests
pm.test("Extract sala ID", function () {
    var jsonData = pm.response.json();
    if (jsonData.data && jsonData.data.id) {
        pm.environment.set("sala_id", jsonData.data.id);
    }
});
```

## 🔧 Configurações Avançadas

### Headers Personalizados

```javascript
// Pre-request Script
pm.request.headers.add({
    key: 'X-Test-Mode',
    value: 'true'
});
```

### Validação de Schema

```javascript
// Tests
pm.test("Schema is valid", function () {
    var schema = {
        "type": "object",
        "properties": {
            "success": {"type": "boolean"},
            "data": {"type": "object"}
        },
        "required": ["success"]
    };
    
    pm.response.to.have.jsonSchema(schema);
});
```

## 📝 Logs e Debugging

### Log de Requisições

```javascript
// Pre-request Script
console.log("Request URL:", pm.request.url);
console.log("Request Method:", pm.request.method);
console.log("Request Body:", pm.request.body.raw);
```

### Log de Respostas

```javascript
// Tests
console.log("Response Status:", pm.response.status);
console.log("Response Time:", pm.response.responseTime);
console.log("Response Body:", pm.response.text());
```

## 🎯 Dicas de Uso

1. **Use Variáveis de Ambiente**: Configure URLs e IDs como variáveis
2. **Teste Cenários de Erro**: Sempre teste casos de falha
3. **Monitore Performance**: Verifique tempos de resposta
4. **Valide Respostas**: Use assertions para validar dados
5. **Organize Collections**: Agrupe requests por funcionalidade
6. **Use Pre-request Scripts**: Para preparar dados dinâmicos
7. **Documente Testes**: Adicione descrições claras

## 🔗 Links Úteis

- [Documentação da API](README.md)
- [Postman Learning Center](https://learning.postman.com/)
- [JSON Schema Validator](https://json-schema.org/)
- [HTTP Status Codes](https://httpstatuses.com/)

---

**📮 Guia Postman - Sistema de Monitoramento de Temperatura**  
*Teste completo da API com Postman* 