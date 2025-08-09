import { NextResponse } from 'next/server';

// In-memory storage pro doporučení (v produkci by bylo v databázi)
let gardenRecommendations = [];
let requestCount = 0;

export async function POST(request) {
  try {
    requestCount++;
    const timestamp = new Date().toISOString();
    
    console.log(`[${timestamp}] 🌱 Přijat POST request #${requestCount} z n8n`);
    
    // Parsování JSON dat
    const body = await request.json();
    console.log(`[${timestamp}] 📋 AI doporučení zahradníka:`, JSON.stringify(body, null, 2));
    
    // Validace dat
    if (!body || typeof body !== 'object') {
      console.error(`[${timestamp}] ❌ Neplatná data: chybí nebo není objekt`);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid data format',
          message: 'Data musí být JSON objekt'
        }, 
        { status: 400 }
      );
    }
    
    // Vytvoření nového záznamu
    const newRecommendation = {
      id: Date.now(),
      timestamp: timestamp,
      requestId: requestCount,
      source: 'n8n-ai-gardener',
      data: body,
      // Pokud je v datech text doporučení, uložíme ho zvlášť
      recommendation: body.recommendation || body.text || body.message || JSON.stringify(body)
    };
    
    // Přidání do historie (max 50 záznamů)
    gardenRecommendations.unshift(newRecommendation);
    if (gardenRecommendations.length > 50) {
      gardenRecommendations = gardenRecommendations.slice(0, 50);
    }
    
    console.log(`[${timestamp}] ✅ AI doporučení úspěšně uloženo`);
    console.log(`[${timestamp}] 📊 Celkem doporučení: ${gardenRecommendations.length}`);
    console.log(`[${timestamp}] 🌿 Doporučení: ${newRecommendation.recommendation.substring(0, 100)}...`);
    
    return NextResponse.json({
      success: true,
      message: 'AI doporučení zahradníka úspěšně přijato',
      requestId: requestCount,
      timestamp: timestamp,
      totalRecommendations: gardenRecommendations.length,
      webhookUrl: 'https://c079f14c427b.ngrok-free.app/api/receive-from-n8n'
    });
    
  } catch (error) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ❌ Chyba při zpracování POST requestu:`, error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: error.message 
      }, 
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🔍 Přijat GET request - testování endpointu`);
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 10;
    const includeData = searchParams.get('data') === 'true';
    
    const response = {
      success: true,
      message: 'API endpoint pro AI doporučení zahradníka funguje správně',
      timestamp: timestamp,
      endpoint: '/api/receive-from-n8n',
      methods: ['POST', 'GET'],
      stats: {
        totalRequests: requestCount,
        totalRecommendations: gardenRecommendations.length,
        lastRequest: gardenRecommendations.length > 0 ? gardenRecommendations[0].timestamp : null
      }
    };
    
    // Přidání dat pouze pokud je požadováno
    if (includeData) {
      response.recommendations = gardenRecommendations.slice(0, limit);
    }
    
    console.log(`[${timestamp}] ✅ GET request úspěšně zpracován`);
    return NextResponse.json(response);
    
  } catch (error) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ❌ Chyba při zpracování GET requestu:`, error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: error.message 
      }, 
      { status: 500 }
    );
  }
}

// Export funkcí pro přístup k datům z jiných částí aplikace
export function getRecommendations() {
  return gardenRecommendations;
}

export function getRequestCount() {
  return requestCount;
}

export function clearRecommendations() {
  gardenRecommendations = [];
  requestCount = 0;
  console.log(`[${new Date().toISOString()}] 🗑️ Historie doporučení vyčištěna`);
} 