import { NextResponse } from 'next/server';
import { addTasks, getTasksBySource } from '../../../lib/taskDatabase';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Očekávaný formát dat z n8n
    const { tasks, userId, gardenId } = body;
    
    if (!tasks || !Array.isArray(tasks)) {
      return NextResponse.json(
        { error: 'Invalid tasks data format' },
        { status: 400 }
      );
    }

    // Přidat nové úkoly z n8n
    const newTasks = tasks.map((task, index) => ({
      id: Date.now() + index, // Jednoduché ID generování
      title: task.title || task.name,
      description: task.description || task.details,
      priority: task.priority || 'medium',
      deadline: task.deadline || task.due_date || 'Tento týden',
      category: task.category || task.type || 'Obecné',
      completed: false,
      created_at: new Date().toISOString(),
      source: "n8n",
      userId: userId || 'default_user',
      gardenId: gardenId || 'default_garden'
    }));

    // Přidat nové úkoly do sdílené databáze
    addTasks(newTasks);

    console.log('Přijato z n8n:', newTasks);

    return NextResponse.json({
      success: true,
      message: `Přidáno ${newTasks.length} úkolů z n8n`,
      tasks: newTasks
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
    const source = searchParams.get('source');

    let filteredTasks = getTasksBySource(source || 'n8n');
    
    if (userId) {
      filteredTasks = filteredTasks.filter(task => task.userId === userId || !task.userId);
    }

    return NextResponse.json({
      success: true,
      data: filteredTasks
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 