# 🤖 n8n Data Receiver

Webová aplikace pro příjem a zobrazení dat z n8n workflow.

## 🚀 Rychlý start

### 1. Spuštění aplikace
```bash
npm run dev
```
Aplikace bude dostupná na: http://localhost:3000/n8n-receiver

### 2. ngrok tunel
```bash
ngrok http 3000
```
Získáte veřejnou URL pro n8n webhook.

### 3. Testování
```bash
node test-n8n-receiver.js
```

## 📋 Funkce

### ✅ Implementované
- **POST /api/receive-from-n8n** - Příjem dat z n8n
- **GET /api/receive-from-n8n** - Získání historie dat
- **POST /api/clear-history** - Vyčištění historie
- Real-time zobrazení nových dat
- Automatické obnovování každých 5 sekund
- Debug panel s statistikami
- Kopírování ngrok URL
- Loading states a error handling
- Timestamp pro každý request
- Historie posledních 50 záznamů

### 🎯 Frontend Features
- Moderní UI s Tailwind CSS
- Responsive design
- Real-time status indikátory
- JSON formátování dat
- Request ID tracking
- Timestamp formátování

## 🔧 API Endpointy

### POST /api/receive-from-n8n
Přijímá data z n8n workflow.

**Request:**
```json
{
  "message": "Zahradní report",
  "timestamp": "2025-08-07T13:30:00.000Z",
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
  "timestamp": "2025-08-07T13:30:00.000Z",
  "totalRecords": 1
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
  "data": [...],
  "totalRecords": 5,
  "requestCount": 5
}
```

### POST /api/clear-history
Vyčistí historii přijatých dat.

**Response:**
```json
{
  "success": true,
  "message": "Historie byla vyčištěna",
  "timestamp": "2025-08-07T13:30:00.000Z"
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

## 🧪 Testování

### 1. Lokální test
```bash
node test-n8n-receiver.js
```

### 2. cURL test
```bash
curl -X POST http://localhost:3000/api/receive-from-n8n \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Test zpráva",
    "timestamp": "2025-08-07T13:30:00.000Z",
    "data": {
      "test": true,
      "value": "example"
    }
  }'
```

### 3. Postman test
- **Method:** POST
- **URL:** `http://localhost:3000/api/receive-from-n8n`
- **Headers:** `Content-Type: application/json`
- **Body:** JSON s test daty

## 📊 Debug Informace

### Console Logs
Aplikace loguje všechny requesty do konzole:
```
[2025-08-07T13:30:00.000Z] 📥 Přijat POST request #1 z n8n
[2025-08-07T13:30:00.000Z] 📋 Data z n8n: {...}
[2025-08-07T13:30:00.000Z] ✅ Data úspěšně uložena. Celkem záznamů: 1
```

### Frontend Debug Panel
- Celkový počet requestů
- Aktuální počet záznamů
- Poslední aktualizace
- Seznam endpointů
- Test data příklady

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
- Automatické obnovování každých 5 sekund
- Timestamp v ISO formátu
- Request ID pro tracking

## 🔄 Aktualizace

Pro aktualizaci aplikace:
1. Zastavte server (Ctrl+C)
2. Stáhněte nové změny
3. Restartujte: `npm run dev`
4. Restartujte ngrok tunel 