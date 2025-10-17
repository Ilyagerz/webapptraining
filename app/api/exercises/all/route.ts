import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    // Путь к файлу с упражнениями
    const filePath = join(process.cwd(), 'data', 'exercises-full.json');
    
    // Проверяем существование файла
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Exercise database not found. Please run: npm run exercises:fetch' },
        { status: 404 }
      );
    }
    
    // Читаем и парсим файл
    const fileContent = readFileSync(filePath, 'utf-8');
    const exercises = JSON.parse(fileContent);
    
    return NextResponse.json(exercises, {
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
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

