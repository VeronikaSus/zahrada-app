# 🌱 Zahrada ve Vážanech - AI Zahradní Aplikace

Inteligentní zahradní aplikace s AI doporučeními a n8n integrací pro automatizované zahradnické rady.

## 🚀 Funkce

- **AI Doporučení Zahradníka** - Real-time zobrazení inteligentních doporučení
- **n8n Integrace** - Automatické přijímání dat z n8n workflow
- **Osevní Plán** - Plánování a správa zahradních plodin
- **Real-time Updates** - Automatické obnovování dat každých 5 sekund
- **Responsive Design** - Moderní UI s Tailwind CSS

## 🛠️ Technologie

- **Frontend:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS
- **Backend:** Next.js API Routes
- **Integrace:** n8n Workflow Automation
- **Deployment:** Vercel

## 📋 Požadavky

- Node.js 18+ 
- npm nebo yarn
- n8n instance (pro workflow automatizaci)

## 🚀 Instalace

1. **Klonování repozitáře**
```bash
git clone https://github.com/your-username/zahrada-app.git
cd zahrada-app
```

2. **Instalace závislostí**
```bash
npm install
```

3. **Spuštění vývojového serveru**
```bash
npm run dev
```

4. **Otevření aplikace**
```
http://localhost:3000
```

## 🌐 API Endpointy

### POST /api/receive-from-n8n
Přijímá AI doporučení zahradníka z n8n workflow.

**URL:** `https://your-domain.vercel.app/api/receive-from-n8n`

**Formát dat:**
```json
{
  "recommendation": "Dnes je ideální čas na zalévání rajčat...",
  "plants": ["rajčata", "papriky"],
  "action": "zalévání",
  "priority": "vysoká"
}
```

### GET /api/receive-from-n8n
Získává historii AI doporučení.

**Parametry:**
- `data=true` - Vrátí data
- `limit=10` - Omezí počet záznamů

## 🔧 n8n Konfigurace

### 1. HTTP Request Node
```javascript
// Metoda: POST
// URL: https://your-domain.vercel.app/api/receive-from-n8n
// Headers: Content-Type: application/json
// Body: JSON s AI doporučením
```

### 2. Příklad Workflow
```
[AI Model] → [Code Node] → [HTTP Request] → [Success/Error]
```

### 3. Code Node (JavaScript)
```javascript
const aiOutput = $input.first().json;

const recommendation = {
  recommendation: aiOutput.recommendation,
  plants: aiOutput.plants || [],
  action: aiOutput.action || "obecné",
  priority: aiOutput.priority || "střední"
};

return recommendation;
```

## 📁 Struktura Projektu

```
zahrada-app/
├── app/
│   ├── api/
│   │   └── receive-from-n8n/
│   │       └── route.js          # API endpoint pro n8n
│   ├── osevni-plan/
│   │   └── page.js               # Osevní plán stránka
│   ├── globals.css               # Globální styly
│   ├── layout.js                 # Root layout
│   └── page.js                   # Hlavní stránka
├── components/
│   ├── Navigation.js             # Navigační komponenta
│   ├── RostlinaIlustrace.jsx     # Ilustrace rostlin
│   ├── ZahradkaEditor.jsx        # Editor zahrady
│   └── vegetable_icons/          # Ikony zeleniny
├── data/
│   └── rostliny.js               # Data rostlin
├── lib/
│   └── taskDatabase.js           # Sdílená databáze úkolů
├── public/
│   ├── components/
│   │   └── vegetable_icons/      # Veřejné ikony
│   └── images/
│       └── rostliny/             # Obrázky rostlin
├── AI_GARDENER_INTEGRATION.md    # Dokumentace AI integrace
├── package.json                  # Závislosti
├── next.config.mjs              # Next.js konfigurace
├── tailwind.config.js           # Tailwind konfigurace
└── README.md                    # Tento soubor
```

## 🧪 Testování

### Test API Endpointu
```bash
# Test GET request
curl -X GET "http://localhost:3000/api/receive-from-n8n"

# Test POST request
curl -X POST "http://localhost:3000/api/receive-from-n8n" \
  -H "Content-Type: application/json" \
  -d '{
    "recommendation": "Dnes je ideální čas na zalévání rajčat...",
    "plants": ["rajčata", "papriky"],
    "action": "zalévání",
    "priority": "vysoká"
  }'
```

### Spuštění testovacího skriptu
```bash
node test-ai-gardener.js
```

## 🚀 Deployment na Vercel

1. **Připojení k Vercel**
```bash
npm install -g vercel
vercel login
```

2. **Deployment**
```bash
vercel --prod
```

3. **Nastavení proměnných prostředí** (pokud potřebné)
```bash
vercel env add N8N_WEBHOOK_URL
```

## 🔧 Vývoj

### Dostupné skripty
```bash
npm run dev          # Vývojový server
npm run build        # Build pro produkci
npm run start        # Spuštění produkčního serveru
npm run lint         # ESLint kontrola
```

### Struktura API
- **In-memory storage** - Pro demonstraci (v produkci doporučeno databáze)
- **Real-time updates** - Automatické obnovování každých 5 sekund
- **Error handling** - Graceful error responses
- **Console logging** - Debugging s emoji

## 📊 Monitoring

### Console Logs
API endpoint loguje všechny operace:
- 🌱 Přijat POST request
- 📋 AI doporučení zahradníka
- ✅ AI doporučení úspěšně uloženo
- 📊 Statistiky
- ❌ Chyby

### Statistiky
- Celkem requestů
- Počet doporučení
- Poslední aktualizace

## 🔒 Bezpečnost

⚠️ **Poznámka:** Tato implementace používá in-memory storage pro demonstraci.

### Doporučení pro produkci:
- Implementovat autentifikaci (API key, JWT)
- Přidat rate limiting
- Rozšířit validaci vstupních dat
- Implementovat proper logging
- Přidat monitoring a alerting

## 🤝 Přispívání

1. Fork repozitáře
2. Vytvořte feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit změn (`git commit -m 'Add some AmazingFeature'`)
4. Push do branch (`git push origin feature/AmazingFeature`)
5. Otevřete Pull Request

## 📝 Licence

Tento projekt je licencován pod MIT License - viz [LICENSE](LICENSE) soubor pro detaily.

## 📞 Kontakt

- **Autor:** [Vaše jméno]
- **Email:** [váš email]
- **GitHub:** [@your-username]

## 🙏 Poděkování

- Next.js tým za skvělý framework
- Tailwind CSS za úžasné styly
- n8n komunita za automatizační nástroje

---

**🌱 Zahrada ve Vážanech** - Inteligentní zahradní aplikace s AI doporučeními
