const fetch = require('node-fetch');

const API_URL = 'http://localhost:3002/api/receive-from-n8n';

// Testovací AI doporučení zahradníka
const testRecommendations = [
  {
    recommendation: "Dnes je ideální čas na zalévání rajčat. Teplota je optimální a půda je suchá. Doporučuji zalít 2 litry vody na rostlinu.",
    plants: ["rajčata", "papriky"],
    action: "zalévání",
    priority: "vysoká",
    weather: "slunečno",
    temperature: "22°C"
  },
  {
    recommendation: "Vaše mrkev potřebuje okopání. Půda je příliš zhutněná. Doporučuji jemně okopat kolem rostlin a přidat kompost.",
    plants: ["mrkev", "petržel"],
    action: "okopání",
    priority: "střední",
    soil_condition: "zhutněná"
  },
  {
    recommendation: "Čas na sklizeň jahod! Jsou zralé a sladké. Sklízejte ráno, když jsou chladné. Nezapomeňte odstranit poškozené plody.",
    plants: ["jahody"],
    action: "sklizeň",
    priority: "vysoká",
    ripeness: "plně zralé"
  }
];

async function testAIRecommendations() {
  console.log('🧪 Testování AI doporučení zahradníka...\n');

  try {
    // Test 1: GET request - kontrola endpointu
    console.log('1️⃣ Test GET request...');
    const getResponse = await fetch(API_URL);
    const getResult = await getResponse.json();
    
    if (getResult.success) {
      console.log('✅ GET request úspěšný');
      console.log(`📊 Statistiky: ${getResult.stats.totalRequests} requestů, ${getResult.stats.totalRecommendations} doporučení\n`);
    } else {
      console.log('❌ GET request selhal:', getResult.error);
      return;
    }

    // Test 2: POST requesty s AI doporučeními
    console.log('2️⃣ Test POST requestů s AI doporučeními...\n');
    
    for (let i = 0; i < testRecommendations.length; i++) {
      const recommendation = testRecommendations[i];
      console.log(`📤 Odesílám doporučení ${i + 1}/${testRecommendations.length}...`);
      
      const postResponse = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recommendation)
      });
      
      const postResult = await postResponse.json();
      
      if (postResult.success) {
        console.log(`✅ Doporučení ${i + 1} úspěšně odesláno`);
        console.log(`   Request ID: ${postResult.requestId}`);
        console.log(`   Celkem doporučení: ${postResult.totalRecommendations}`);
        console.log(`   Doporučení: ${recommendation.recommendation.substring(0, 60)}...\n`);
      } else {
        console.log(`❌ Doporučení ${i + 1} selhalo:`, postResult.error);
      }
      
      // Pauza mezi requesty
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Test 3: Ověření dat
    console.log('3️⃣ Ověřování přijatých dat...');
    const finalGetResponse = await fetch(`${API_URL}?data=true&limit=10`);
    const finalGetResult = await finalGetResponse.json();
    
    if (finalGetResult.success && finalGetResult.recommendations) {
      console.log(`✅ Data ověřena: ${finalGetResult.recommendations.length} doporučení v databázi`);
      console.log(`📊 Finální statistiky: ${finalGetResult.stats.totalRequests} requestů, ${finalGetResult.stats.totalRecommendations} doporučení\n`);
      
      // Zobrazení posledního doporučení
      if (finalGetResult.recommendations.length > 0) {
        const latest = finalGetResult.recommendations[0];
        console.log('🌿 Poslední AI doporučení:');
        console.log(`   Čas: ${latest.timestamp}`);
        console.log(`   Request ID: ${latest.requestId}`);
        console.log(`   Doporučení: ${latest.recommendation}\n`);
      }
    } else {
      console.log('❌ Ověření dat selhalo');
    }

    console.log('🎉 Testování dokončeno!');
    console.log(`🌐 Webhook URL: ${API_URL}`);
    console.log('📝 Nyní můžete testovat s n8n workflow');

  } catch (error) {
    console.error('❌ Chyba při testování:', error.message);
  }
}

// Spuštění testu
testAIRecommendations(); 