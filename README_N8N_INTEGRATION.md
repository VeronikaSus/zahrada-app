# 🤖 n8n Data Receiver - Kompletní řešení

Webová aplikace pro příjem a zobrazení dat z n8n workflow s real-time updates.

## ✅ Implementované funkce

### API Endpoint
- **POST /api/receive-from-n8n** - Příjem dat z n8n
- **GET /api/receive-from-n8n** - Získání historie dat
- Logování všech requestů do konzole
- HTTP 200 response pro n8n
- Ukládání dat do paměti (max 50 záznamů)

### Frontend
- Real-time zobrazení dat z n8n
- Automatické obnovování každých 3 sekund
- ngrok URL s možností kopírování
- Statistiky requestů a záznamů
- Timestamp pro každý záznam
- Loading states a error handling
- Responsive design s Tailwind CSS

## 🚀 Rychlý start

### 1. Spuštění aplikace
```bash
npm run dev
```
Aplikace bude dostupná na: http://localhost:3000

### 2. ngrok tunel
```bash
ngrok http 3000
```
Získáte veřejnou URL pro n8n webhook.

### 3. Testování
```bash
# Test POST request
curl -X POST http://localhost:3000/api/receive-from-n8n \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Test zpráva",
    "timestamp": "2025-08-07T19:28:00.000Z",
    "data": {
      "test": true,
      "value": "example"
    }
  }'

# Test GET request
curl http://localhost:3000/api/receive-from-n8n
```

## 🔧 API Endpointy

### POST /api/receive-from-n8n
Přijímá data z n8n workflow.

**Request:**
```json
{
  "message": "Zahradní report",
  "timestamp": "2025-08-07T19:28:00.000Z",
  "data": {
    "type": "garden_report",
    "plants": [...],
    "weather": {...}
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Data úspěšně přijata",
  "requestId": 1,
  "timestamp": "2025-08-07T19:28:59.589Z",
  "totalRecords": 1,
  "webhookUrl": "https://c079f14c427b.ngrok-free.app/receive-from-n8n"
}
```

### GET /api/receive-from-n8n
Získává historii přijatých dat.

**Query parameters:**
- `limit` - Počet záznamů (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1754594939590,
      "timestamp": "2025-08-07T19:28:59.589Z",
      "data": {...},
      "requestId": 1,
      "source": "n8n"
    }
  ],
  "totalRecords": 1,
  "requestCount": 1
}
```

## 🌐 n8n Konfigurace

### 1. HTTP Request Node
- **Metoda:** POST
- **URL:** `https://c079f14c427b.ngrok-free.app/receive-from-n8n`
- **Headers:** 
  - `Content-Type: application/json`

### 2. Body (JSON):
```json
{
  "message": "{{ $json.message }}",
  "timestamp": "{{ $json.timestamp }}",
  "data": {{ $json.data }}
}
```

### 3. Příklad workflow:
```
[Trigger] → [Data Processing] → [HTTP Request] → [Response Handling]
```

## 📊 Console Logs

Aplikace loguje všechny requesty do konzole:
```
[2025-08-07T19:28:59.589Z] 📥 Přijat POST request #1 z n8n
[2025-08-07T19:28:59.589Z] 📋 Data z n8n: {...}
[2025-08-07T19:28:59.589Z] ✅ Data úspěšně uložena. Celkem záznamů: 1
💾 Ukládám data do paměti: 1 záznamů
```

## 🎯 Frontend Features

### Real-time Updates
- Automatické obnovování každých 3 sekund
- Loading indikátory
- Error handling
- Status indikátory (Online/Načítání)

### UI Komponenty
- ngrok URL s kopírováním
- Statistiky requestů
- Seznam přijatých zpráv
- Timestamp formátování
- JSON formátování dat

### Responsive Design
- Mobilní friendly
- Desktop optimalizované
- Tailwind CSS styling

## 🔒 Bezpečnost

### Produkční nasazení
1. Přidejte autentifikaci
2. Implementujte rate limiting
3. Použijte HTTPS
4. Přidejte CORS konfiguraci
5. Logujte requesty do souboru

### ngrok Bezpečnost
- Používejte ngrok s autentifikací
- Nastavte whitelist pro IP adresy
- Používejte HTTPS URL

## 🐛 Troubleshooting

### Časté problémy

**1. ngrok URL nefunguje**
- Zkontrolujte, zda ngrok běží
- Ověřte správnost URL
- Zkontrolujte firewall

**2. Data se nezobrazují**
- Zkontrolujte konzoli pro chyby
- Ověřte formát JSON dat
- Zkontrolujte CORS nastavení

**3. Aplikace nereaguje**
- Restartujte Next.js server
- Zkontrolujte port 3000
- Ověřte npm dependencies

### Debug kroky
1. Zkontrolujte konzoli pro chyby
2. Otestujte API endpointy
3. Zkontrolujte ngrok status
4. Ověřte n8n workflow

## 📝 Poznámky

- Data jsou uložena v paměti (reset při restartu)
- Maximálně 50 záznamů v historii
- Automatické obnovování každých 3 sekund
- Timestamp v ISO formátu
- Request ID pro tracking

## 🔄 Aktualizace

Pro aktualizaci aplikace:
1. Zastavte server (Ctrl+C)
2. Stáhněte nové změny
3. Restartujte: `npm run dev`
4. Restartujte ngrok tunel

## 📞 Support

Pro technickou podporu:
- Zkontrolujte console logy
- Ověřte API endpointy
- Testujte s cURL
- Zkontrolujte n8n workflow 