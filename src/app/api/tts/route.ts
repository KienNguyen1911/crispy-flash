import { NextRequest, NextResponse } from 'next/server';
import googleTTS from 'google-tts-api';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text');
  const lang = searchParams.get('lang') || 'ja';
  const slow = searchParams.get('slow') === 'true';

  if (!text) {
    return NextResponse.json({ error: 'Missing text query parameter' }, { status: 400 });
  }

  const audioUrl = googleTTS.getAudioUrl(text, {
    lang,
    slow,
    host: 'https://translate.google.com',
  });

  const response = await fetch(audioUrl);
  if (!response.ok) {
    return NextResponse.json({ error: 'Unable to fetch TTS audio' }, { status: 502 });
  }

  const headers = new Headers(response.headers);
  headers.set('Content-Type', 'audio/mpeg');

  return new NextResponse(response.body, {
    status: response.status,
    headers,
  });
}
