import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    // Используем custom-exercises.json - вашу персональную базу из 107 упражнений!
    const filePath = join(process.cwd(), 'data', 'custom-exercises.json');
    
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Exercises file not found' },
        { status: 404 }
      );
    }

    const exercises = JSON.parse(readFileSync(filePath, 'utf-8'));

    return NextResponse.json(exercises, {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
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

