//Card.tsx
'use client';
import React, { useState } from 'react';

export interface MediaItem {
    id: number;
    media_type: 'movie' | 'tv';
    title?: string;
    name?: string;
    release_date?: string;
    first_air_date?: string;
    overview: string;
    vote_average: number;
    poster_path: string | null;
    genre_ids?: number[];
    origin_country?: string[];
    // trailerUrl is set by data fetching
    trailerUrl?: string;
    imdb_id?: string;
}

const genreMapping: Record<number, string> = {
    28: 'Action',
    12: 'Adventure',
    16: 'Animation',
    35: 'Comedy',
    80: 'Crime',
    99: 'Documentary',
    18: 'Drama',
    10751: 'Family',
    14: 'Fantasy',
    36: 'History',
    27: 'Horror',
    10402: 'Music',
    9648: 'Mystery',
    10749: 'Romance',
    878: 'Science Fiction',
    10770: 'TV Movie',
    53: 'Thriller',
    10752: 'War',
    37: 'Western',
};

function slugify(text: string): string {
    return text.toLowerCase().replace(/\s+/g, '-');
}

interface CardProps {
    item: MediaItem;
}

export default function Card({ item }: CardProps) {
    const title = item.title || item.name || 'Untitled';
    const releaseDate = item.release_date || item.first_air_date || 'N/A';
    const year = releaseDate !== 'N/A' ? releaseDate.split('-')[0] : 'N/A';
    const rating = item.vote_average;
    const formattedDate =
        releaseDate !== 'N/A'
            ? new Date(releaseDate).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            })
            : 'N/A';

    const thumbnail = item.poster_path
        ? `https://image.tmdb.org/t/p/original${item.poster_path}`
        : '/placeholder.png';

    const genres =
        item.genre_ids && item.genre_ids.length > 0
            ? item.genre_ids.map((id) => genreMapping[id] || id).join(', ')
            : 'N/A';

    const country =
        item.media_type === 'tv' && item.origin_country && item.origin_country.length > 0
            ? item.origin_country.join(', ')
            : 'N/A';

    // IMDB search URL fallback (if imdb_id not available)
    const imdbUrl = item.imdb_id
        ? `https://www.imdb.com/title/${item.imdb_id}`
        : `https://www.imdb.com/find?q=${encodeURIComponent(title)}`;

    // Construct Popcorn Movies URL based on type
    const slug = slugify(title);
    const moviePopcornUrl = `https://popcornmovies.to/movie/${slug}`;

    // For tv, we need to let user choose season and episode.
    const [showForm, setShowForm] = useState<boolean>(false);
    const [season, setSeason] = useState<string>('');
    const [episode, setEpisode] = useState<string>('');

    const handleTvFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (season && episode) {
            const tvPopcornUrl = `https://popcornmovies.to/episode/${slug}/${season}-${episode}`;
            window.open(tvPopcornUrl, '_blank');
        }
    };

    return (
        <div className="border rounded p-4 shadow hover:shadow-lg transition bg-white">
            <div className="w-full flex items-center justify-center">
                <img
                    src={thumbnail}
                    alt={title}
                    className="max-w-full max-h-[500px] object-contain rounded"
                />
            </div>
            <h2 className="text-2xl font-bold mt-4 text-gray-800">{title}</h2>
            <p className="text-gray-600 mt-1">
                <span className="font-semibold">Year:</span> {year}
            </p>
            <p className="text-gray-600">
                <span className="font-semibold">Release Date:</span> {formattedDate}
            </p>
            <p className="text-gray-600">
                <span className="font-semibold">Rating:</span> {rating > 0 ? rating : 'No ratings yet'}
            </p>
            <p className="text-gray-600">
                <span className="font-semibold">Genre:</span> {genres}
            </p>
            <p className="text-gray-600">
                <span className="font-semibold">Country:</span> {country}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
                <a
                    href={imdbUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                >
                    IMDB Search
                </a>
                {item.media_type === 'movie' ? (
                    <a
                        href={moviePopcornUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                        Watch on Popcorn Movies
                    </a>
                ) : (
                    <>
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        >
                            {showForm ? 'Close Episode Form' : 'Select Episode'}
                        </button>
                        {showForm && (
                            <form onSubmit={handleTvFormSubmit} className="mt-2 flex flex-col gap-2">
                                <input
                                    type="number"
                                    placeholder="Season"
                                    value={season}
                                    onChange={(e) => setSeason(e.target.value)}
                                    className="p-2 border rounded"
                                    required
                                />
                                <input
                                    type="number"
                                    placeholder="Episode"
                                    value={episode}
                                    onChange={(e) => setEpisode(e.target.value)}
                                    className="p-2 border rounded"
                                    required
                                />
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-900 transition"
                                >
                                    Watch Episode
                                </button>
                            </form>
                        )}
                    </>
                )}
            </div>
            <div className="mt-2">
                <a
                    href={item.trailerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                >
                    Watch Trailer
                </a>
            </div>
        </div>
    );
}
