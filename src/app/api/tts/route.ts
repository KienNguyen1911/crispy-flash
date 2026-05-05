import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text');
  const lang = searchParams.get('lang') || 'ja';
  const slow = searchParams.get('slow') === 'true';

  if (!text) {
    return NextResponse.json({ error: 'Missing text query parameter' }, { status: 400 });
  }

  const encodedText = encodeURIComponent(text);
  const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${lang}&client=tw-ob${slow ? '&ttsspeed=0.24' : ''}`;

  const response = await fetch(audioUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7',
    },
    next: {
      revalidate: 3600,
    },
  });
  if (!response.ok) {
    return NextResponse.json({ error: 'Unable to fetch TTS audio' }, { status: 502 });
  }

  const headers = new Headers(response.headers);
  headers.set('Content-Type', 'audio/mpeg');
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Cache-Control', 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800');

  return new NextResponse(response.body, {
    status: response.status,
    headers,
  });
}
