"use client";

import React, { useContext } from 'react'
import AuthContext from '../contexts/AuthProvider'

const ConnectionHomePage = () => {
    const { user } = useContext(AuthContext)!;
    return (
        <div className='flex flex-col items-center p-4 overflow-y-auto max-md:hidden'>
            <div className='mb-4'>
                <img src="/buckwise_logo.png" alt="" className='w-40 h-40' />
            </div>
            <h1 className='text-4xl font-bold mb-2'>Hello {user?.userName},</h1>
            <h3 className='text-2xl mb-3'>A warm wellcome to <span className='text-[var(--primary)] font-bold'>Buckwise</span></h3>
            <p className='text-gray-300 text-center'>Easily manage your dues in the most interactive way — we’ll remember them, so you don’t have to!</p>
            <p className='text-gray-300'>Create connections and leave it to us!</p>
        </div>
    )
}

export default ConnectionHomePage