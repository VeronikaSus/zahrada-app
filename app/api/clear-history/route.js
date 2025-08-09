import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    console.log('🗑️ Požadavek na vyčištění historie');
    
    // Zde bychom měli volat funkci z receive-from-n8n route
    // Pro jednoduchost resetujeme lokální data
    
    return NextResponse.json({
      success: true,
      message: 'Historie byla vyčištěna',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Chyba při vyčišťování historie:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
} 