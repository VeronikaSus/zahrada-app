# 🔌 API Endpoint Documentation

## `/api/receive-from-n8n`

API endpoint pro komunikaci s n8n workflow v Next.js App Router aplikaci.

### 📍 Dostupnost
- **Lokálně:** `http://localhost:3000/api/receive-from-n8n`
- **Přes ngrok:** `https://[ngrok-url]/api/receive-from-n8n`

---

## 🔧 Metody

### POST - Přijímání dat z n8n

**Popis:** Přijímá data z n8n workflow, loguje je do konzole a vrací potvrzení.

**Request:**
```http
POST /api/receive-from-n8n
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "message": "Zahradní report",
  "timestamp": "2025-08-07T19:30:00.000Z",
  "data": {
    "type": "garden_report",
    "plants": [...],
    "weather": {...}
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Data úspěšně přijata",
  "requestId": 1,
  "timestamp": "2025-08-07T19:30:31.468Z",
  "totalRecords": 1,
  "webhookUrl": "https://c079f14c427b.ngrok-free.app/api/receive-from-n8n"
}
```

**Console Logs:**
```
[2025-08-07T19:30:31.468Z] 📥 Přijat POST request #1 z n8n
[2025-08-07T19:30:31.468Z] 📋 Data z n8n: {...}
[2025-08-07T19:30:31.468Z] ✅ Data úspěšně uložena. Celkem záznamů: 1
```

---

### GET - Testování endpointu

**Popis:** Vrací potvrzení, že endpoint funguje, a volitelně i přijatá data.

**Request:**
```http
GET /api/receive-from-n8n
```

**Query Parameters:**
- `data=true` - Přidá přijatá data do response
- `limit=10` - Omezí počet vrácených záznamů (default: 10)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "API endpoint funguje správně",
  "timestamp": "2025-08-07T19:30:37.103Z",
  "endpoint": "/api/receive-from-n8n",
  "methods": ["POST", "GET"],
  "stats": {
    "totalRequests": 1,
    "totalRecords": 1,
    "lastRequest": "2025-08-07T19:30:31.468Z"
  }
}
```

**S daty (`?data=true`):**
```json
{
  "success": true,
  "message": "API endpoint funguje správně",
  "timestamp": "2025-08-07T19:30:37.103Z",
  "endpoint": "/api/receive-from-n8n",
  "methods": ["POST", "GET"],
  "stats": {
    "totalRequests": 1,
    "totalRecords": 1,
    "lastRequest": "2025-08-07T19:30:31.468Z"
  },
  "data": [
    {
      "id": 1754595031469,
      "timestamp": "2025-08-07T19:30:31.468Z",
      "data": {...},
      "requestId": 1,
      "source": "n8n"
    }
  ]
}
```

**Console Logs:**
```
[2025-08-07T19:30:37.103Z] 🔍 Přijat GET request - testování endpointu
[2025-08-07T19:30:37.103Z] ✅ GET request úspěšně zpracován
```

---

## 🧪 Testování

### cURL Testy

**1. Test GET requestu:**
```bash
curl http://localhost:3000/api/receive-from-n8n
```

**2. Test POST requestu:**
```bash
curl -X POST http://localhost:3000/api/receive-from-n8n \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Test zpráva z n8n",
    "data": {
      "test": true,
      "value": "example"
    }
  }'
```

**3. Test GET s daty:**
```bash
curl "http://localhost:3000/api/receive-from-n8n?data=true&limit=5"
```

### n8n Konfigurace

**HTTP Request Node:**
- **Metoda:** POST
- **URL:** `https://c079f14c427b.ngrok-free.app/api/receive-from-n8n`
- **Headers:** 
  - `Content-Type: application/json`
- **Body (JSON):**
```json
{
  "message": "{{ $json.message }}",
  "timestamp": "{{ $json.timestamp }}",
  "data": {{ $json.data }}
}
```

---

## 🛡️ Error Handling

### Chybové Response (500 Internal Server Error)
```json
{
  "success": false,
  "error": "Internal server error",
  "message": "Error details"
}
```

### Console Logs pro chyby:
```
[timestamp] ❌ Chyba při zpracování POST requestu: Error details
[timestamp] ❌ Chyba při zpracování GET requestu: Error details
```

---

## 📊 Funkce

### Interní funkce (pro použití v jiných souborech)

```javascript
import { getReceivedData, getRequestCount, clearReceivedData } from './app/api/receive-from-n8n/route.js';

// Získat přijatá data
const data = getReceivedData();

// Získat počet requestů
const count = getRequestCount();

// Vyčistit historii
clearReceivedData();
```

---

## 🔍 Console Logs

Endpoint loguje všechny operace s emoji pro snadné sledování:

- 📥 Přijat POST request
- 📋 Data z n8n
- ✅ Úspěšné zpracování
- 🔍 GET request pro testování
- ❌ Chyby
- 🗑️ Vyčištění historie

---

## 📝 Poznámky

- Data jsou uložena v paměti (reset při restartu)
- Maximálně 50 záznamů v historii
- Timestamp v ISO formátu
- Request ID pro tracking
- Automatické logování všech operací 