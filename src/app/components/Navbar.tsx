"use client";

import { usePathname, useRouter } from 'next/navigation'
import React, { useContext } from 'react'
import AuthContext from '../contexts/AuthProvider';
import Link from 'next/link';

export const Navbar = () => {
    const router = useRouter();
    const pathname = usePathname();

    const { user } = useContext(AuthContext)!;

    if (pathname.includes('/auth/') || pathname.includes('/update-password/')) return null;
    return (
        <nav className='flex items-center justify-between py-2 px-4 bg-[var(--subground)] sticky top-0 z-50'>
            <div>
                <Link href={'/'} className='flex'>
                    <img src="/buckwise_logo.png" alt="" className='w-10 h-10' />
                </Link>
            </div>
            <div className='flex items-center gap-3'>
                <div>
                    <Link href={'/inbox'} className='flex'>
                        <button className="btn w-10 h-10 bg-gray-700 rounded-full text-gray-300 relative">
                            <span><i className="ri-inbox-2-line text-xl"></i></span>
                            {user?.unreadnotifications > 0 && <span className='p-0.5 rounded-xl bg-red-400 text-[0.7em] absolute bottom-0 -right-1 min-w-4'>{user?.unreadnotifications}</span>}
                        </button>
                    </Link>
                </div>
                <div>
                    <Link href={'/profile'} className='flex'>
                        <button className="nav-btn btn">
                            <img src={user?.avatar || "/profile-placeholder.png"} alt="" className='w-10 h-10 rounded-full' />
                        </button>
                    </Link>
                </div>
            </div>
        </nav>
    )
}
