"use client";

import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react'

export default function NotFound() {
    const router = useRouter();
    useEffect(() => {
        document.title = "404 - Page not found!"
    }, []);
    return (
        <div className="flex flex-col items-center h-screen text-center p-3">
            <img src="/not-found.png" alt="" className='w-70' />
            <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
            <p className="mt-4 text-lg text-gray-600">Sorry, we couldn’t find the page you’re looking for.</p>
            <button className='btn btn-primary my-3' onClick={() => router.push('/')}>Back to home</button>
        </div>
    )
}