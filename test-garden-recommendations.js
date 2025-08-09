// Testovací skript pro simulaci textových doporučení z n8n Code node
// Spusťte: node test-garden-recommendations.js

const testRecommendation = {
  title: "Týdenní zahradní report - 5. 8. 2025",
  content: `🌱 ZAHRADNÍ REPORT PRO TENTO TÝDEN

📊 AKTUÁLNÍ STAV ROSTLIN:

🍅 RAJČATA (70 dní od výsadby):
- Rostliny jsou ve fázi plodů
- Zalévat každý den v horkém počasí
- Odstranit spodní listy pro lepší větrání
- Kontrolovat výskyt plísní

🫑 PAPRIKY (65 dní od výsadby):
- Rostliny kvetou a tvoří plody
- Přidat organické hnojivo s vyšším obsahem draslíku
- Zalévat ke kořenům, ne na listy
- Podepřít těžké plody

🥬 SALÁT (45 dní od výsadby):
- Rostliny jsou připravené ke sklizni
- Sklízet postupně, nechat některé rostliny dorůst
- Kontrolovat výskyt mšic
- V horkém počasí zastínit

🌿 BYLINKY:
- Bazalka: ostříhat před květem pro lepší chuť
- Máta: sklízet mladé lístky
- Petržel: pravidelně sklízet pro nový růst

⚠️ DŮLEŽITÉ ÚKOLY TENTO TÝDEN:
1. Zalévání každý den (ráno nebo večer)
2. Kontrola škůdců na všech rostlinách
3. Sklizeň zralých plodů
4. Přidání hnojiva k paprikám

🌤️ POČASÍ:
- Očekává se teplé a suché počasí
- Zvýšit frekvenci zalévání
- Zastínit citlivé rostliny

📈 PŘÍŠTÍ TÝDEN:
- Připravit se na hlavní sklizeň rajčat
- Plánovat výsadbu podzimních plodin
- Kontrolovat stav půdy a pH`,
  userId: "default_user",
  gardenId: "vazany_garden"
};

async function sendGardenRecommendation() {
  try {
    const response = await fetch('http://localhost:3000/api/garden-recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testRecommendation),
    });

    const result = await response.json();
    console.log('Odpověď z webhooku:', result);
    
    if (result.success) {
      console.log('✅ Zahradní doporučení úspěšně přidáno!');
      console.log(`📝 ID: ${result.recommendation.id}`);
      console.log(`📋 Název: ${result.recommendation.title}`);
      console.log(`📏 Délka obsahu: ${result.recommendation.content.length} znaků`);
    } else {
      console.log('❌ Chyba při přidávání doporučení:', result.error);
    }
  } catch (error) {
    console.error('❌ Chyba při odesílání dat:', error);
  }
}

// Spustit test
sendGardenRecommendation(); 