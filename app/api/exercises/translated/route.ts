import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    // Пробуем загрузить переведенную версию
    let filePath = join(process.cwd(), 'data', 'custom-exercises-ru.json');
    
    // Если её нет, загружаем оригинальную
    if (!existsSync(filePath)) {
      console.log('⚠️ custom-exercises-ru.json не найден, используем custom-exercises.json');
      filePath = join(process.cwd(), 'data', 'custom-exercises.json');
    }
    
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Exercises file not found' },
        { status: 404 }
      );
    }

    const exercises = JSON.parse(readFileSync(filePath, 'utf-8'));

    return NextResponse.json(exercises, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error loading exercises:', error);
    return NextResponse.json(
      { error: 'Failed to load exercises' },
      { status: 500 }
    );
  }
}

