# 🚀 Deployment Checklist - Zahrada ve Vážanech

## ✅ Pre-deployment Kontrola

### 1. Soubory pro Git
- [x] `.gitignore` - Vylučuje node_modules, .next, atd.
- [x] `README.md` - Kompletní dokumentace projektu
- [x] `LICENSE` - MIT License
- [x] `vercel.json` - Vercel konfigurace

### 2. Konfigurační soubory
- [x] `package.json` - Závislosti a skripty
- [x] `next.config.mjs` - Next.js konfigurace
- [x] `postcss.config.mjs` - PostCSS konfigurace
- [x] `eslint.config.mjs` - ESLint konfigurace
- [x] `jsconfig.json` - JavaScript konfigurace

### 3. Aplikace
- [x] `app/page.js` - Hlavní stránka s AI doporučeními
- [x] `app/layout.js` - Root layout
- [x] `app/globals.css` - Globální styly
- [x] `app/api/receive-from-n8n/route.js` - API endpoint
- [x] `app/osevni-plan/page.js` - Osevní plán

### 4. Komponenty
- [x] `components/Navigation.js` - Navigace
- [x] `components/RostlinaIlustrace.jsx` - Ilustrace rostlin
- [x] `components/ZahradkaEditor.jsx` - Editor zahrady

### 5. Data a knihovny
- [x] `data/rostliny.js` - Data rostlin
- [x] `lib/taskDatabase.js` - Sdílená databáze

### 6. Veřejné soubory
- [x] `public/` - Statické soubory
- [x] `public/components/vegetable_icons/` - Ikony zeleniny
- [x] `public/images/rostliny/` - Obrázky rostlin

### 7. Dokumentace
- [x] `AI_GARDENER_INTEGRATION.md` - AI integrace
- [x] `API_ENDPOINT_DOCUMENTATION.md` - API dokumentace
- [x] `N8N_INTEGRATION.md` - n8n integrace

### 8. Testovací soubory
- [x] `test-ai-gardener.js` - Test AI doporučení
- [x] `test-n8n-receiver.js` - Test n8n receiver
- [x] `test-garden-recommendations.js` - Test doporučení

## 🚀 GitHub Upload

### 1. Inicializace Git repozitáře
```bash
# Pokud ještě není inicializován
git init

# Přidání všech souborů
git add .

# První commit
git commit -m "Initial commit: Zahrada ve Vážanech - AI zahradní aplikace"

# Přidání remote origin (nahraďte YOUR_USERNAME a REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Push na GitHub
git push -u origin main
```

### 2. GitHub Repository Setup
- [ ] Vytvořit nový repository na GitHub
- [ ] Název: `zahrada-app` nebo `zahrada-ve-vazanech`
- [ ] Popis: "AI zahradní aplikace s n8n integrací"
- [ ] Veřejný repository
- [ ] Přidat README.md
- [ ] Přidat .gitignore (Next.js)
- [ ] Přidat LICENSE (MIT)

## 🌐 Vercel Deployment

### 1. Připojení k Vercel
```bash
# Instalace Vercel CLI
npm install -g vercel

# Přihlášení
vercel login

# Deployment
vercel --prod
```

### 2. Vercel Dashboard Setup
- [ ] Importovat repository z GitHub
- [ ] Framework Preset: Next.js
- [ ] Root Directory: `./`
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `.next`
- [ ] Install Command: `npm install`

### 3. Environment Variables (pokud potřebné)
```bash
# Nastavení proměnných prostředí
vercel env add N8N_WEBHOOK_URL
vercel env add NODE_ENV production
```

### 4. Custom Domain (volitelné)
- [ ] Přidat custom domain v Vercel dashboard
- [ ] Nastavit DNS záznamy
- [ ] SSL certifikát (automaticky)

## 🔧 Post-deployment Kontrola

### 1. Funkčnost aplikace
- [ ] Hlavní stránka se načte
- [ ] AI doporučení sekce funguje
- [ ] Osevní plán je dostupný
- [ ] Navigace funguje

### 2. API Endpointy
```bash
# Test GET request
curl -X GET "https://your-domain.vercel.app/api/receive-from-n8n"

# Test POST request
curl -X POST "https://your-domain.vercel.app/api/receive-from-n8n" \
  -H "Content-Type: application/json" \
  -d '{"recommendation": "Test doporučení"}'
```

### 3. n8n Integrace
- [ ] Aktualizovat webhook URL v n8n
- [ ] Testovat workflow
- [ ] Ověřit příjem dat

### 4. Performance
- [ ] Lighthouse audit
- [ ] Core Web Vitals
- [ ] Mobile responsiveness

## 📝 Aktualizace dokumentace

### 1. README.md
- [ ] Aktualizovat URL na Vercel domain
- [ ] Přidat deployment badge
- [ ] Aktualizovat instrukce

### 2. API dokumentace
- [ ] Aktualizovat webhook URL
- [ ] Přidat produkční endpointy
- [ ] Aktualizovat příklady

## 🔒 Bezpečnost

### 1. Produkční nastavení
- [ ] NODE_ENV=production
- [ ] Disable debug logging
- [ ] Rate limiting (pokud implementováno)
- [ ] CORS nastavení

### 2. Monitoring
- [ ] Vercel Analytics
- [ ] Error tracking
- [ ] Performance monitoring

## 🎉 Hotovo!

Po dokončení všech kroků bude vaše aplikace dostupná na:
- **GitHub:** https://github.com/YOUR_USERNAME/zahrada-app
- **Vercel:** https://your-domain.vercel.app
- **API:** https://your-domain.vercel.app/api/receive-from-n8n

## 📞 Support

Pokud narazíte na problémy:
1. Zkontrolujte Vercel build logs
2. Ověřte environment variables
3. Testujte lokálně s `npm run build`
4. Kontaktujte support

---

**🌱 Zahrada ve Vážanech** - Úspěšně nasazeno! 🚀 