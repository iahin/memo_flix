//pages.tsx
import React from 'react';
import Filter from './components/Filter';
import Pagination from './components/Pagination';
import Card, { MediaItem } from './components/Card';

interface GetDataResult {
  items: MediaItem[];
  totalPages: number;
}

async function fetchTrailer(item: MediaItem, apiKey: string): Promise<string> {
  const endpoint =
    item.media_type === 'movie'
      ? `https://api.themoviedb.org/3/movie/${item.id}/videos?api_key=${apiKey}&language=en-US`
      : `https://api.themoviedb.org/3/tv/${item.id}/videos?api_key=${apiKey}&language=en-US`;
  try {
    const res = await fetch(endpoint);
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      const trailer = data.results.find(
        (video: any) => video.type === 'Trailer' && video.site === 'YouTube'
      );
      if (trailer) {
        return `https://www.youtube.com/watch?v=${trailer.key}`;
      }
    }
  } catch (error) {
    console.error('Error fetching trailer for item', item.id, error);
  }
  const title = item.title || item.name || 'trailer';
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(title + " trailer")}`;
}

async function getData({
  type,
  year,
  month,
  genre,
  country,
  rating,
  provider,
  tvCategory,
  page,
  query,
}: {
  type: string;
  year: string;
  month: string;
  genre: string;
  country: string;
  rating: string;
  provider: string;
  tvCategory: string;
  page: number;
  query: string;
}): Promise<GetDataResult> {
  const apiKey = process.env.TMDB_API_KEY;
  let items: MediaItem[] = [];
  let totalPages = 1;

  const startDate = `${year}-${month}-01`;
  const endDay = new Date(parseInt(year), parseInt(month), 0).getDate();
  const endDate = `${year}-${month}-${endDay}`;

  // TV category mapping with placeholder keyword ids
  const tvCategoryMapping: Record<string, string> = {
    documentary: '0',
    news: '1',
    miniseries: '2',
    reality: '3',
    scripted: '4',
    talk_show: '5',
    video: '6',
  };

  let genreQuery = genre && genre !== 'all' ? `&with_genres=${genre}` : '';
  const regionQuery = country && country !== 'all' ? `&region=${country}` : '';
  const originQuery = country && country !== 'all' ? `&with_origin_country=${country}` : '';
  const ratingQuery = rating && rating !== 'all' ? `&vote_average.gte=${rating}` : '';
  const providerQuery = provider && provider !== 'all' ? `&with_watch_providers=${provider}&watch_region=US` : '';
  let tvCategoryQuery = tvCategory && tvCategory !== 'all' ? `&with_type=${tvCategoryMapping[tvCategory]}` : '';

  if (type === 'tv' && genre === '27') {
    genreQuery = `&with_keyword=315058`;
    tvCategoryQuery = '';
  }

  if (query && query.trim() !== '') {
    // Search with filters
    if (type === 'movie' || type === 'all') {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}` +
        `&primary_release_date.gte=${startDate}&primary_release_date.lte=${endDate}` +
        `${regionQuery}${genreQuery}${ratingQuery}${providerQuery}`
      );
      const data = await res.json();
      items = data.results.map((item: any) => ({ ...item, media_type: 'movie' as const }));
      totalPages = data.total_pages;
    }
    if (type === 'tv' || type === 'all') {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&query=${encodeURIComponent(query)}` +
        `&first_air_date.gte=${startDate}&first_air_date.lte=${endDate}` +
        `${originQuery}${genreQuery}${ratingQuery}${providerQuery}${tvCategoryQuery}`
      );
      const data = await res.json();
      const tvItems = data.results.map((item: any) => ({ ...item, media_type: 'tv' as const }));
      if (type === 'all') {
        items = [...items, ...tvItems];
        totalPages = Math.ceil(items.length / 10);
      } else {
        items = tvItems;
        totalPages = data.total_pages;
      }
    }
  } else {
    // No search query: use discover endpoint with filters.
    if (type === 'movie') {
      const tmdbPage = Math.ceil(page / 2);
      const res = await fetch(
        `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}` +
        `&sort_by=popularity.desc&page=${tmdbPage}` +
        `&primary_release_date.gte=${startDate}&primary_release_date.lte=${endDate}` +
        `${regionQuery}${genreQuery}${ratingQuery}${providerQuery}`,
        { cache: 'no-store' }
      );
      const data = await res.json();
      const sliceStart = page % 2 === 1 ? 0 : 10;
      items = data.results.slice(sliceStart, sliceStart + 10).map((item: any) => ({
        ...item,
        media_type: 'movie' as const,
      }));
      totalPages = data.total_pages * 2;
    } else if (type === 'tv') {
      const tmdbPage = Math.ceil(page / 2);
      const res = await fetch(
        `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}` +
        `&sort_by=popularity.desc&page=${tmdbPage}` +
        `&first_air_date.gte=${startDate}&first_air_date.lte=${endDate}` +
        `${originQuery}${genreQuery}${ratingQuery}${providerQuery}${tvCategoryQuery}`,
        { cache: 'no-store' }
      );
      const data = await res.json();
      const sliceStart = page % 2 === 1 ? 0 : 9;
      items = data.results.slice(sliceStart, sliceStart + 9).map((item: any) => ({
        ...item,
        media_type: 'tv' as const,
      }));
      totalPages = data.total_pages * 2;
    } else {
      const [movieRes, tvRes] = await Promise.all([
        fetch(
          `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}` +
          `&sort_by=popularity.desc&page=1` +
          `&primary_release_date.gte=${startDate}&primary_release_date.lte=${endDate}` +
          `${regionQuery}${genreQuery}${ratingQuery}${providerQuery}`,
          { cache: 'no-store' }
        ),
        fetch(
          `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}` +
          `&sort_by=popularity.desc&page=1` +
          `&first_air_date.gte=${startDate}&first_air_date.lte=${endDate}` +
          `${originQuery}${genreQuery}${ratingQuery}${providerQuery}${tvCategoryQuery}`,
          { cache: 'no-store' }
        ),
      ]);
      const movieData = await movieRes.json();
      const tvData = await tvRes.json();
      let combined: MediaItem[] = [
        ...movieData.results.map((item: any) => ({ ...item, media_type: 'movie' as const })),
        ...tvData.results.map((item: any) => ({ ...item, media_type: 'tv' as const })),
      ];
      combined.sort((a, b) => {
        const dateA = new Date(a.media_type === 'movie' ? a.release_date : a.first_air_date);
        const dateB = new Date(b.media_type === 'movie' ? b.release_date : b.first_air_date);
        return dateB.getTime() - dateA.getTime();
      });
      totalPages = Math.ceil(combined.length / 10);
      items = combined.slice((page - 1) * 10, page * 10);
    }
  }

  // Attach trailer URLs to each item
  items = await Promise.all(
    items.map(async (item) => {
      const trailerUrl = await fetchTrailer(item, apiKey);
      return { ...item, trailerUrl };
    })
  );

  return { items, totalPages };
}

interface PageProps {
  searchParams: {
    type?: string;
    year?: string;
    month?: string;
    genre?: string;
    country?: string;
    rating?: string;
    provider?: string;
    tvCategory?: string;
    query?: string;
    page?: string;
  };
}

export default async function Page({ searchParams }: PageProps) {
  const params = await Promise.resolve(searchParams);
  const type = params.type || 'all';
  const year = params.year || new Date().getFullYear().toString();
  const month = params.month || String(new Date().getMonth() + 1).padStart(2, '0');
  const genre = params.genre || 'all';
  const country = params.country || 'all';
  const rating = params.rating || 'all';
  const provider = params.provider || 'all';
  const tvCategory = params.tvCategory || 'all';
  const query = params.query || '';
  const page = parseInt(params.page || '1', 10);

  const { items, totalPages } = await getData({
    type,
    year,
    month,
    genre,
    country,
    rating,
    provider,
    tvCategory,
    page,
    query,
  });

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 container mx-auto p-4">
      <Filter
        initialFilters={{
          type,
          year,
          month,
          genre,
          country,
          rating,
          provider,
          tvCategory,
          query,
        }}
      />
      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Card key={`${item.media_type}-${item.id}`} item={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-xl text-gray-700">No results found.</p>
        </div>
      )}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        filters={{ type, year, month, genre, country, rating, provider, tvCategory, query }}
      />
    </main>
  );
}