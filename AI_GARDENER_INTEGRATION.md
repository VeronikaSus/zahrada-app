# 🌱 AI Doporučení Zahradníka - n8n Integrace

## Přehled

Tato aplikace přijímá AI doporučení zahradníka z n8n workflow a zobrazuje je v reálném čase na webové stránce.

## API Endpoint

### POST /api/receive-from-n8n

**URL:** `https://c079f14c427b.ngrok-free.app/api/receive-from-n8n`

**Metoda:** POST

**Content-Type:** `application/json`

### Formát dat

```json
{
  "recommendation": "Dnes je ideální čas na zalévání rajčat. Teplota je optimální a půda je suchá. Doporučuji zalít 2 litry vody na rostlinu.",
  "plants": ["rajčata", "papriky"],
  "action": "zalévání",
  "priority": "vysoká",
  "weather": "slunečno",
  "temperature": "22°C"
}
```

### Povinná pole

- `recommendation` (string): Textové AI doporučení zahradníka

### Volitelná pole

- `plants` (array): Seznam rostlin, kterých se doporučení týká
- `action` (string): Typ akce (zalévání, okopání, sklizeň, atd.)
- `priority` (string): Priorita doporučení (nízká, střední, vysoká)
- `weather` (string): Aktuální počasí
- `temperature` (string): Aktuální teplota
- `soil_condition` (string): Stav půdy
- `ripeness` (string): Zralost plodů

### Response

```json
{
  "success": true,
  "message": "AI doporučení zahradníka úspěšně přijato",
  "requestId": 1,
  "timestamp": "2025-08-07T20:26:37.882Z",
  "totalRecommendations": 1,
  "webhookUrl": "https://c079f14c427b.ngrok-free.app/api/receive-from-n8n"
}
```

## n8n Workflow Konfigurace

### 1. HTTP Request Node

**Metoda:** POST

**URL:** `https://c079f14c427b.ngrok-free.app/api/receive-from-n8n`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "recommendation": "{{ $json.aiRecommendation }}",
  "plants": "{{ $json.plants }}",
  "action": "{{ $json.action }}",
  "priority": "{{ $json.priority }}",
  "weather": "{{ $json.weather }}",
  "temperature": "{{ $json.temperature }}"
}
```

### 2. Příklad workflow

```
[AI Model] → [Code Node] → [HTTP Request] → [Success/Error]
```

**Code Node (JavaScript):**
```javascript
// Zpracování AI výstupu a vytvoření doporučení
const aiOutput = $input.first().json;

const recommendation = {
  recommendation: aiOutput.recommendation,
  plants: aiOutput.plants || [],
  action: aiOutput.action || "obecné",
  priority: aiOutput.priority || "střední",
  weather: aiOutput.weather || "neznámé",
  temperature: aiOutput.temperature || "neznámé"
};

return recommendation;
```

## Testování

### 1. Test GET request

```bash
curl -X GET "http://localhost:3002/api/receive-from-n8n"
```

### 2. Test POST request

```bash
curl -X POST "http://localhost:3002/api/receive-from-n8n" \
  -H "Content-Type: application/json" \
  -d '{
    "recommendation": "Dnes je ideální čas na zalévání rajčat. Teplota je optimální a půda je suchá. Doporučuji zalít 2 litry vody na rostlinu.",
    "plants": ["rajčata", "papriky"],
    "action": "zalévání",
    "priority": "vysoká"
  }'
```

### 3. Test s daty

```bash
curl -X GET "http://localhost:3002/api/receive-from-n8n?data=true&limit=5"
```

## Frontend Funkce

### Real-time Updates
- Automatické obnovování každých 5 sekund
- Zobrazení nejnovějších doporučení
- Loading states a error handling

### Zobrazení
- Seznam AI doporučení s timestamp
- Statistiky (celkem requestů, doporučení)
- Webhook URL pro kopírování
- Testovací sekce s ukázkovými daty

### Ovládání
- Tlačítko pro manuální obnovení
- Kopírování webhook URL
- Status indikátor (Online/Načítání)

## Debugging

### Console Logs

API endpoint loguje všechny operace s emoji pro snadné rozpoznání:

- 🌱 Přijat POST request
- 📋 AI doporučení zahradníka
- ✅ AI doporučení úspěšně uloženo
- 📊 Statistiky
- 🌿 Text doporučení
- ❌ Chyby

### Error Handling

- Validace JSON dat
- Kontrola povinných polí
- Graceful error responses
- Detailed error messages

## Bezpečnost

⚠️ **Poznámka:** Tato implementace používá in-memory storage pro demonstraci. V produkci by měla být data ukládána do databáze (např. Supabase).

### Doporučení pro produkci

1. **Autentifikace:** Přidat API key nebo JWT token
2. **Rate Limiting:** Omezit počet requestů za časovou jednotku
3. **Validace:** Rozšířit validaci vstupních dat
4. **Logging:** Implementovat proper logging
5. **Monitoring:** Přidat monitoring a alerting

## Příklady AI Doporučení

### Zalévání
```json
{
  "recommendation": "Dnes je ideální čas na zalévání rajčat. Teplota je optimální a půda je suchá. Doporučuji zalít 2 litry vody na rostlinu.",
  "plants": ["rajčata", "papriky"],
  "action": "zalévání",
  "priority": "vysoká",
  "weather": "slunečno",
  "temperature": "22°C"
}
```

### Okopání
```json
{
  "recommendation": "Vaše mrkev potřebuje okopání. Půda je příliš zhutněná. Doporučuji jemně okopat kolem rostlin a přidat kompost.",
  "plants": ["mrkev", "petržel"],
  "action": "okopání",
  "priority": "střední",
  "soil_condition": "zhutněná"
}
```

### Sklizeň
```json
{
  "recommendation": "Čas na sklizeň jahod! Jsou zralé a sladké. Sklízejte ráno, když jsou chladné. Nezapomeňte odstranit poškozené plody.",
  "plants": ["jahody"],
  "action": "sklizeň",
  "priority": "vysoká",
  "ripeness": "plně zralé"
}
```

## Kontakt

Pro technickou podporu nebo dotazy kontaktujte vývojový tým. 