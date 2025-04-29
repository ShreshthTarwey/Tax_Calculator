import { NextResponse } from 'next/server';

const NEWS_API_KEY = process.env.NEXT_PUBLIC_NEWS_API_KEY;
const BASE_URL = 'https://newsapi.org/v2';

export async function GET() {
  try {
    const response = await fetch(
      `${BASE_URL}/everything?q=(tax OR taxation OR "tax policy" OR "tax reform" OR "tax laws" OR "tax rates" OR "income tax" OR "corporate tax" OR "tax system")&language=en&sortBy=publishedAt&pageSize=6`,
      {
        headers: {
          'X-Api-Key': NEWS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`NewsAPI request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in news API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
} 