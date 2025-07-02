import React from 'react'
import { checkAuth } from '@/lib/utils/checkAuth'
import { notFound } from 'next/navigation';

const UpdatePasswordLayout = async ({ children }: { children: React.ReactNode }) => {
    return (
        <div className='flex justify-center items-center h-screen'>
            {children}
        </div>
    )
}

export default UpdatePasswordLayout