import { NextResponse } from 'next/server';
import { analyzeDesign } from '@/lib/claude';

export async function POST(request: Request) {
  const { image, mediaType } = await request.json();

  if (!image || !mediaType) {
    return NextResponse.json({ error: 'Missing image or mediaType' }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
  }

  const elements = await analyzeDesign(image, mediaType);
  return NextResponse.json({ elements });
}
