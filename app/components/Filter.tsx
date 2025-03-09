//Filter.tsx
'use client';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';

interface FilterProps {
    initialFilters: {
        type: string;
        year: string;
        month: string;
        genre: string;
        country: string;
        rating: string;
        provider: string;
        tvCategory: string;
        query: string;
    };
}

const monthOptions = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
];

const countryOptions = [
    { value: 'all', label: 'All' },
    { value: 'KR', label: 'Korea' },
    { value: 'ES', label: 'Spain' },
    { value: 'MY', label: 'Malaysia' },
    { value: 'CN', label: 'China' },
    { value: 'TH', label: 'Thailand' },
    { value: 'CA', label: 'Canada' },
    { value: 'FR', label: 'France' },
    { value: 'DE', label: 'Germany' },
    { value: 'IT', label: 'Italy' },
    { value: 'TR', label: 'Turkey' },
    { value: 'US', label: 'United States' },
    { value: 'GB', label: 'United Kingdom' },
    { value: 'AU', label: 'Australia' },
    { value: 'IN', label: 'India' },
];

const ratingOptions = [
    { value: 'all', label: 'All Ratings' },
    ...Array.from({ length: 11 }, (_, i) => ({ value: i.toString(), label: i.toString() })),
];

const tvCategoryOptions = [
    { value: 'all', label: 'All TV Types' },
    { value: 'scripted', label: 'Scripted' },
    { value: 'documentary', label: 'Documentary' },
    { value: 'news', label: 'News' },
    { value: 'miniseries', label: 'Miniseries' },
    { value: 'reality', label: 'Reality' },
    { value: 'talk_show', label: 'Talk Show' },
];

export default function Filter({ initialFilters }: FilterProps) {
    const router = useRouter();
    const currentYear = new Date().getFullYear();

    // Default values
    const defaultValues = {
        type: 'all',
        year: currentYear.toString(),
        month: String(new Date().getMonth() + 1).padStart(2, '0'),
        genre: 'all',
        country: 'all',
        rating: 'all',
        provider: 'all',
        tvCategory: 'all',
        query: '',
    };

    const [type, setType] = useState<string>(initialFilters.type || defaultValues.type);
    const [year, setYear] = useState<string>(initialFilters.year || defaultValues.year);
    const [month, setMonth] = useState<string>(initialFilters.month || defaultValues.month);
    const [genre, setGenre] = useState<string>(initialFilters.genre || defaultValues.genre);
    const [country, setCountry] = useState<string>(initialFilters.country || defaultValues.country);
    const [rating, setRating] = useState<string>(initialFilters.rating || defaultValues.rating);
    const [provider, setProvider] = useState<string>(initialFilters.provider || defaultValues.provider);
    const [tvCategory, setTvCategory] = useState<string>(initialFilters.tvCategory || defaultValues.tvCategory);
    const [queryText, setQueryText] = useState<string>(initialFilters.query || defaultValues.query);

    // Fetch provider options dynamically
    const [providerOptions, setProviderOptions] = useState<{ value: string; label: string }[]>([
        { value: 'all', label: 'All Streaming Services' },
    ]);
    useEffect(() => {
        async function fetchProviders() {
            const res = await fetch('/api/watch-providers');
            const data = await res.json();
            if (data.providers) {
                setProviderOptions([{ value: 'all', label: 'All Streaming Services' }, ...data.providers]);
            }
        }
        fetchProviders();
    }, []);

    // Fetch genres dynamically based on type
    const [dynamicGenreOptions, setDynamicGenreOptions] = useState<{ value: string; label: string }[]>([
        { value: 'all', label: 'All Genres' },
    ]);
    useEffect(() => {
        async function fetchGenres() {
            const res = await fetch(`/api/genres?type=${type}`);
            const data = await res.json();
            if (data.genres) {
                let genres = [{ value: 'all', label: 'All Genres' }, ...data.genres];
                if (type === 'tv' && !genres.find((g: any) => g.value === '27')) {
                    genres.push({ value: '27', label: 'Horror' });
                }
                genres = [genres[0], ...genres.slice(1).sort((a: any, b: any) => a.label.localeCompare(b.label))];
                setDynamicGenreOptions(genres);
            }
        }
        fetchGenres();
    }, [type]);

    // Handle search button click
    const handleSearch = () => {
        const query = new URLSearchParams();
        query.set('type', type);
        query.set('year', year);
        query.set('month', month);
        query.set('genre', genre);
        query.set('country', country);
        query.set('rating', rating);
        query.set('provider', provider);
        query.set('tvCategory', tvCategory);
        query.set('query', queryText);
        query.set('page', '1'); // Reset page to 1 on search
        router.push(`/?${query.toString()}`);
    };

    const yearOptions = [];
    for (let y = 2000; y <= currentYear; y++) {
        yearOptions.push(y.toString());
    }

    const handleReset = () => {
        setType(defaultValues.type);
        setYear(defaultValues.year);
        setMonth(defaultValues.month);
        setGenre(defaultValues.genre);
        setCountry(defaultValues.country);
        setRating(defaultValues.rating);
        setProvider(defaultValues.provider);
        setTvCategory(defaultValues.tvCategory);
        setQueryText(defaultValues.query);
    };

    return (
        <div className="bg-gradient-to-r from-blue-100 to-purple-100 shadow-lg rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Filter</h2>
            <p className="text-gray-700 mb-4">
                Use the filters below to refine your results. Click "Search" to apply changes.
            </p>
            <div className="mb-4">
                <label className="block text-gray-800 mb-1">Search Title/Keywords</label>
                <input
                    type="text"
                    value={queryText}
                    onChange={(e) => setQueryText(e.target.value)}
                    placeholder="Enter title or keyword..."
                    className="p-3 border rounded w-full bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
                <div>
                    <label className="block text-gray-800 mb-1">Type</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="p-3 border rounded bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        <option value="all">All</option>
                        <option value="movie">Movies</option>
                        <option value="tv">TV Shows</option>
                    </select>
                </div>
                <div>
                    <label className="block text-gray-800 mb-1">Year</label>
                    <select
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="p-3 border rounded bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        {yearOptions.map((y) => (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-gray-800 mb-1">Month</label>
                    <select
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        className="p-3 border rounded bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        {monthOptions.map((m) => (
                            <option key={m.value} value={m.value}>
                                {m.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-gray-800 mb-1">Genre</label>
                    <select
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
                        className="p-3 border rounded bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        {dynamicGenreOptions.map((g) => (
                            <option key={g.value} value={g.value}>
                                {g.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-gray-800 mb-1">Country</label>
                    <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="p-3 border rounded bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        {countryOptions.map((c) => (
                            <option key={c.value} value={c.value}>
                                {c.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-gray-800 mb-1">Rating</label>
                    <select
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                        className="p-3 border rounded bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        {ratingOptions.map((r) => (
                            <option key={r.value} value={r.value}>
                                {r.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-gray-800 mb-1">Streaming Service</label>
                    <select
                        value={provider}
                        onChange={(e) => setProvider(e.target.value)}
                        className="p-3 border rounded bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        {providerOptions.map((p) => (
                            <option key={p.value} value={p.value}>
                                {p.label}
                            </option>
                        ))}
                    </select>
                </div>
                {type === 'tv' && (
                    <div>
                        <label className="block text-gray-800 mb-1">TV Category</label>
                        <select
                            value={tvCategory}
                            onChange={(e) => setTvCategory(e.target.value)}
                            className="p-3 border rounded bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            {tvCategoryOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>
            <div className="mt-4 flex justify-between">
                <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                >
                    Reset Filters
                </button>
                <button
                    onClick={handleSearch}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                    Search
                </button>
            </div>
        </div>
    );
}