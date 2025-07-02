import React from 'react'
import { ActiveLink } from '../components/ActiveLink'
import { checkAuth } from '@/lib/utils/checkAuth';
import { redirect } from 'next/navigation';

const InboxLayout = async ({ children }: { children: React.ReactNode }) => {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) redirect('/auth/login')
    return (
        <div className='page-container'>
            <div className='p-3 bg-[var(--background)] w-full sticky top-[56px] z-20 border-b-1 border-gray-600 pb-0 mb-4'>
                <div className='flex items-center gap-4'>
                    <ActiveLink href='/inbox/requests' activeClassName='[&>button]:border-[var(--primary)] [&>button]:text-[var(--primary)]'>
                        <button className='btn px-3 py-2 flex border-b-4 border-transparent items-center justify-center gap-2 text-gray-300 font-semibold !transition-all !duration-300'>
                            <span><i className="ri-user-add-line"></i></span><span>Requests</span>
                        </button>
                    </ActiveLink>
                    <ActiveLink href='/inbox/notifications' activeClassName='[&>button]:border-[var(--primary)] [&>button]:text-[var(--primary)]'>
                        <button className='btn px-3 py-2 flex border-b-4 border-transparent items-center justify-center gap-2 text-gray-300 font-semibold !transition-all !duration-300'>
                            <span><i className="ri-notification-4-line"></i></span><span>Notifications</span>
                        </button>
                    </ActiveLink>
                </div>
            </div>
            <div className='mb-4'>{children}</div>
        </div>
    )
}

export default InboxLayout