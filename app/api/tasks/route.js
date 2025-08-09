import { NextResponse } from 'next/server';
import { getAllTasks, updateTask } from '../../../lib/taskDatabase';

// Placeholder pro Supabase konfiguraci
// Později bude nahrazeno skutečnou Supabase konfigurací
const mockSupabase = {
  async insert(data) {
    console.log('Ukládám do Supabase:', data);
    return { data: { id: Date.now() }, error: null };
  },
  
  async update(id, data) {
    console.log('Aktualizuji v Supabase:', { id, data });
    return { data: { id }, error: null };
  }
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { taskId, completed, userId } = body;

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    // Aktualizace úkolu v sdílené databázi
    updateTask(taskId, {
      completed: completed,
      completed_at: completed ? new Date().toISOString() : null
    });

    // Zde později přidáme skutečnou Supabase logiku
    const result = await mockSupabase.insert({
      task_id: taskId,
      completed: completed,
      user_id: userId || 'default_user',
      completed_at: completed ? new Date().toISOString() : null,
      created_at: new Date().toISOString()
    });

    if (result.error) {
      return NextResponse.json(
        { error: 'Failed to save task status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('API Error:', error);
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

    // Získat všechny úkoly ze sdílené databáze
    const allTasks = getAllTasks();
    
    // Filtrovat podle uživatele, pokud je specifikován
    const userTasks = userId ? allTasks.filter(task => task.userId === userId || !task.userId) : allTasks;

    return NextResponse.json({
      success: true,
      data: userTasks
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 