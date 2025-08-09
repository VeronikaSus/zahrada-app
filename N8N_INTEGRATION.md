# Integrace s n8n pro doporučení zahrady

## Přehled
Tento dokument popisuje, jak napojit n8n workflow na aplikaci "Zahrada ve Vážanech" pro automatické generování textových doporučení.

## API Endpoint pro textová doporučení
**URL:** `http://localhost:3000/api/garden-recommendations`  
**Metoda:** POST  
**Content-Type:** application/json

## Formát dat z n8n Code node

### Očekávaný formát:
```json
{
  "title": "Název doporučení",
  "content": "Textové doporučení z n8n Code node",
  "userId": "default_user",
  "gardenId": "vazany_garden"
}
```

### Příklad dat:
```json
{
  "title": "Týdenní zahradní report - 5. 8. 2025",
  "content": "🌱 ZAHRADNÍ REPORT PRO TENTO TÝDEN\n\n📊 AKTUÁLNÍ STAV ROSTLIN:\n\n🍅 RAJČATA (70 dní od výsadby):\n- Rostliny jsou ve fázi plodů\n- Zalévat každý den v horkém počasí\n- Odstranit spodní listy pro lepší větrání\n- Kontrolovat výskyt plísní\n\n⚠️ DŮLEŽITÉ ÚKOLY TENTO TÝDEN:\n1. Zalévání každý den (ráno nebo večer)\n2. Kontrola škůdců na všech rostlinách\n3. Sklizeň zralých plodů",
  "userId": "default_user",
  "gardenId": "vazany_garden"
}
```

## Konfigurace v n8n

### 1. HTTP Request Node
- **Metoda:** POST
- **URL:** `http://localhost:3000/api/n8n-webhook`
- **Headers:** 
  - `Content-Type: application/json`

### 2. Body (JSON):
```json
{
  "title": "{{ $json.title || 'Zahradní doporučení' }}",
  "content": "{{ $json.content }}",
  "userId": "default_user",
  "gardenId": "vazany_garden"
}
```

### 3. Příklad workflow v n8n:

```
[Trigger] → [Data Processing] → [HTTP Request] → [Response Handling]
```

#### Krok 1: Trigger
- Použijte Schedule Trigger pro pravidelná doporučení
- Nebo Webhook Trigger pro okamžitá doporučení

#### Krok 2: Data Processing
- Zpracujte data podle potřeby
- Formátujte úkoly do požadovaného formátu

#### Krok 3: HTTP Request
- Odešlete data na náš webhook endpoint

#### Krok 4: Response Handling
- Zpracujte odpověď
- Logujte úspěch/chyby

## Testování

### 1. Spusťte testovací skript:
```bash
node test-garden-recommendations.js
```

### 2. Zkontrolujte v aplikaci:
- Otevřete http://localhost:3000
- Podívejte se do sekce "Doporučení pro moji zahradu"
- Měly by se zobrazit nová textová doporučení z n8n

### 3. Zkontrolujte konzoli:
- V terminálu s Next.js aplikací uvidíte logy
- V n8n uvidíte odpověď z webhooku

## Formátování textu
- Používejte emoji pro lepší vizuální přehled
- Používejte odrážky (-) pro seznamy
- Používejte číslování (1., 2., 3.) pro kroky
- Používejte **tučné písmo** pro důležité informace
- Používejte oddělovací řádky pro sekce

## Příklad struktury doporučení
```
🌱 NADPIS

📊 SEKCE 1:
- Bod 1
- Bod 2

⚠️ SEKCE 2:
1. Krok 1
2. Krok 2

📈 SEKCE 3:
- Závěrečné informace
```

## Poznámky pro produkci
1. Změňte `localhost:3000` na skutečnou URL vaší aplikace
2. Přidejte autentifikaci pro bezpečnost
3. Implementujte rate limiting
4. Přidejte logování pro debugging
5. Nahraďte mock databázi skutečnou Supabase databází

## Troubleshooting
- **Chyba 500:** Zkontrolujte formát dat
- **Chyba 400:** Zkontrolujte, zda `tasks` je pole
- **Úkoly se nezobrazují:** Zkontrolujte konzoli pro chyby
- **Webhook neodpovídá:** Zkontrolujte, zda aplikace běží 