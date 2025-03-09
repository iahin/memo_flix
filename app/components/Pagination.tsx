//Pagination
'use client';
import { useRouter } from 'next/navigation';
import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    filters: {
        type: string;
        year: string;
        month: string;
        genre: string;
        country: string;
    };
}

export default function Pagination({ currentPage, totalPages, filters }: PaginationProps) {
    const router = useRouter();
    const searchParams = new URLSearchParams();
    if (filters.type) searchParams.set('type', filters.type);
    if (filters.year) searchParams.set('year', filters.year);
    if (filters.month) searchParams.set('month', filters.month);
    if (filters.genre) searchParams.set('genre', filters.genre);
    if (filters.country) searchParams.set('country', filters.country);

    const goToPage = (page: number) => {
        searchParams.set('page', page.toString());
        router.push(`/?${searchParams.toString()}`);
    };

    return (
        <div className="flex justify-center space-x-4 mt-4">
            <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="p-2 border rounded bg-white text-gray-900 hover:bg-blue-100"
            >
                Previous
            </button>
            <span className="text-gray-900">
                {currentPage} of {totalPages}
            </span>
            <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="p-2 border rounded bg-white text-gray-900 hover:bg-blue-100"
            >
                Next
            </button>
        </div>
    );
}
