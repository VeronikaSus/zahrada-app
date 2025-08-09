import { NextResponse } from 'next/server';

// Sdílená "databáze" pro textová doporučení
let recommendations = [
  {
    id: 1,
    title: "Týdenní zahradní report",
    content: "Zatím nejsou k dispozici žádná doporučení. Data budou načítána z n8n workflow.",
    created_at: new Date().toISOString(),
    source: "manual"
  }
];

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Očekávaný formát dat z n8n Code node
    const { title, content, userId, gardenId } = body;
    
    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Vytvořit nové doporučení
    const newRecommendation = {
      id: Date.now(),
      title: title || "Zahradní doporučení",
      content: content,
      created_at: new Date().toISOString(),
      source: "n8n",
      userId: userId || 'default_user',
      gardenId: gardenId || 'vazany_garden'
    };

    // Přidat do "databáze"
    recommendations.unshift(newRecommendation); // Přidat na začátek

    // Zachovat pouze posledních 10 doporučení
    if (recommendations.length > 10) {
      recommendations = recommendations.slice(0, 10);
    }

    console.log('Přijato doporučení z n8n:', {
      id: newRecommendation.id,
      title: newRecommendation.title,
      contentLength: newRecommendation.content.length
    });

    return NextResponse.json({
      success: true,
      message: 'Doporučení úspěšně uloženo',
      recommendation: newRecommendation
    });

  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'default_user';
    const limit = parseInt(searchParams.get('limit')) || 5;

    // Filtrovat podle uživatele
    let filteredRecommendations = recommendations.filter(
      rec => rec.userId === userId || !rec.userId
    );

    // Omezit počet výsledků
    filteredRecommendations = filteredRecommendations.slice(0, limit);

    return NextResponse.json({
      success: true,
      data: filteredRecommendations
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 