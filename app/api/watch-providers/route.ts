// /app/api/watch-providers/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return NextResponse.json({ providers: [] });
  // Fetch watch providers for movies in region "US"
  const res = await fetch(
    `https://api.themoviedb.org/3/watch/providers/movie?api_key=${apiKey}&language=en-US&watch_region=US`
  );
  const data = await res.json();
  // According to TMDB docs, when a watch_region is provided, data.results should be an array of providers
  // Each provider object should have provider_id and provider_name.
  const providers =
    data.results?.map((p: any) => ({
      value: p.provider_id.toString(),
      label: p.provider_name,
    })) || [];
  // Sort providers alphabetically by label
  providers.sort((a: any, b: any) => a.label.localeCompare(b.label));
  return NextResponse.json({ providers });
}
