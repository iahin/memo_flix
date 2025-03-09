import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'all';
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ genres: [] });
  }
  
  let genres = [];
  if (type === 'movie') {
    const res = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en-US`);
    const data = await res.json();
    genres = data.genres;
  } else if (type === 'tv') {
    const res = await fetch(`https://api.themoviedb.org/3/genre/tv/list?api_key=${apiKey}&language=en-US`);
    const data = await res.json();
    genres = data.genres;
  } else {
    // For 'all', combine both lists
    const [movieRes, tvRes] = await Promise.all([
      fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en-US`),
      fetch(`https://api.themoviedb.org/3/genre/tv/list?api_key=${apiKey}&language=en-US`)
    ]);
    const movieData = await movieRes.json();
    const tvData = await tvRes.json();
    const genreMap = new Map<number, string>();
    movieData.genres.forEach((g: any) => genreMap.set(g.id, g.name));
    tvData.genres.forEach((g: any) => genreMap.set(g.id, g.name));
    genres = Array.from(genreMap, ([id, name]) => ({ id, name }));
  }
  
  // Format genres for the dropdown
  const formattedGenres = genres.map((g: any) => ({
    value: g.id.toString(),
    label: g.name,
  }));
  formattedGenres.sort((a: any, b: any) => a.label.localeCompare(b.label));
  
  return NextResponse.json({ genres: formattedGenres });
}
