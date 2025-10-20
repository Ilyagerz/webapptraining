import { NextResponse } from 'next/server';
import type { BodyMeasurement } from '@/types';

// Временное хранилище для замеров (в продакшене это была бы настоящая БД)
const measurementsStorage = new Map<string, BodyMeasurement[]>();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  const measurements = measurementsStorage.get(userId) || [];
  return NextResponse.json({ measurements });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, measurement } = body;

    if (!userId || !measurement) {
      return NextResponse.json({ error: 'User ID and measurement are required' }, { status: 400 });
    }

    const userMeasurements = measurementsStorage.get(userId) || [];
    userMeasurements.unshift(measurement); // Новые замеры в начале
    measurementsStorage.set(userId, userMeasurements);

    return NextResponse.json({ success: true, measurement });
  } catch (error) {
    console.error('Error saving measurement:', error);
    return NextResponse.json({ error: 'Failed to save measurement' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const measurementId = searchParams.get('id');

  if (!userId || !measurementId) {
    return NextResponse.json({ error: 'User ID and measurement ID are required' }, { status: 400 });
  }

  const userMeasurements = measurementsStorage.get(userId) || [];
  const filtered = userMeasurements.filter(m => m.id !== measurementId);
  measurementsStorage.set(userId, filtered);

  return NextResponse.json({ success: true });
}

