import { NextResponse } from 'next/server';
import { generateLottie } from '@/lib/lottie-generator';

export async function POST(request: Request) {
  const { width, height, elements, animations } = await request.json();

  if (!elements || !animations || !width || !height) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const lottie = generateLottie(width, height, elements, animations);
  return NextResponse.json({ lottie });
}
