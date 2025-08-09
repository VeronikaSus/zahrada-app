// Testovací skript pro simulaci dat z n8n
// Spusťte: node test-n8n-webhook.js

const testN8nData = {
  tasks: [
    {
      title: "Zalévání rajčat",
      description: "Rajčata potřebují vodu každý den v horkém počasí",
      priority: "high",
      deadline: "Dnes do 18:00",
      category: "Zalévání"
    },
    {
      title: "Hnojení paprik",
      description: "Přidat organické hnojivo k paprikám",
      priority: "medium",
      deadline: "Zítra",
      category: "Hnojení"
    },
    {
      title: "Kontrola mšic",
      description: "Zkontrolovat výskyt mšic na růžích a případně ošetřit",
      priority: "low",
      deadline: "Tento týden",
      category: "Ochrana rostlin"
    },
    {
      title: "Sklizeň bazalky",
      description: "Ostříhat bazalku před květem pro lepší chuť",
      priority: "medium",
      deadline: "Dnes",
      category: "Sklizeň"
    }
  ],
  userId: "default_user",
  gardenId: "vazany_garden"
};

async function sendN8nData() {
  try {
    const response = await fetch('http://localhost:3000/api/n8n-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testN8nData),
    });

    const result = await response.json();
    console.log('Odpověď z webhooku:', result);
    
    if (result.success) {
      console.log('✅ Úkoly z n8n úspěšně přidány!');
      console.log(`📝 Přidáno ${result.tasks.length} úkolů`);
    } else {
      console.log('❌ Chyba při přidávání úkolů:', result.error);
    }
  } catch (error) {
    console.error('❌ Chyba při odesílání dat:', error);
  }
}

// Spustit test
sendN8nData(); 