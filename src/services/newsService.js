const NEWS_API_KEY = process.env.NEXT_PUBLIC_NEWS_API_KEY;
const BASE_URL = 'https://newsapi.org/v2';

export const fetchTaxNews = async () => {
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
      throw new Error('Failed to fetch news');
    }

    const data = await response.json();
    return data.articles;
  } catch (error) {
    console.error('Error fetching tax news:', error);
    return [];
  }
}; 