// Testovací skript pro simulaci dat z n8n
// Spusťte: node test-n8n-receiver.js

const testData = [
  {
    message: "Zahradní report - týden 1",
    timestamp: new Date().toISOString(),
    data: {
      type: "garden_report",
      plants: [
        {
          name: "Rajčata",
          status: "kvetou",
          days_since_planting: 45,
          recommendations: [
            "Zalévat každý den",
            "Přidat hnojivo",
            "Kontrolovat škůdce"
          ]
        },
        {
          name: "Papriky",
          status: "rostou",
          days_since_planting: 30,
          recommendations: [
            "Zalévat obden",
            "Přesadit do větších květináčů"
          ]
        }
      ],
      weather: {
        temperature: 25,
        humidity: 60,
        forecast: "slunečno"
      }
    }
  },
  {
    message: "Systémová notifikace",
    timestamp: new Date().toISOString(),
    data: {
      type: "system_notification",
      level: "info",
      message: "Workflow úspěšně dokončen",
      execution_time: "2.5s",
      steps_completed: 5
    }
  },
  {
    message: "Chybová zpráva",
    timestamp: new Date().toISOString(),
    data: {
      type: "error",
      error_code: "API_001",
      message: "Chyba při připojení k databázi",
      details: "Connection timeout after 30 seconds"
    }
  }
];

async function sendTestData() {
  const webhookUrl = 'http://localhost:3000/api/receive-from-n8n';
  
  console.log('🚀 Spouštím test dat z n8n...\n');
  
  for (let i = 0; i < testData.length; i++) {
    const data = testData[i];
    
    try {
      console.log(`📤 Odesílám test data ${i + 1}/${testData.length}: ${data.message}`);
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Úspěšně odesláno! Request ID: ${result.requestId}`);
        console.log(`📊 Celkem záznamů: ${result.totalRecords}\n`);
      } else {
        console.log(`❌ Chyba: ${result.error}\n`);
      }
      
      // Pauza mezi requesty
      if (i < testData.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
    } catch (error) {
      console.error(`❌ Chyba při odesílání dat ${i + 1}:`, error.message);
    }
  }
  
  console.log('🎉 Test dokončen! Zkontrolujte aplikaci na http://localhost:3000/n8n-receiver');
}

// Spustit test
sendTestData(); 