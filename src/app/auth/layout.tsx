import React from 'react'
import { checkAuth } from '@/lib/utils/checkAuth'
import { notFound } from 'next/navigation';

const AuthLayout = async ({ children }: { children: React.ReactNode }) => {
    const isAuthenticated = await checkAuth();

    if (isAuthenticated) notFound();
    return (
        <div className='flex justify-center items-center h-screen'>
            {children}
        </div>
    )
}

export default AuthLayout