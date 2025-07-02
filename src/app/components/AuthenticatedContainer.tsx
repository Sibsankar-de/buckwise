"use client";

import React, { useContext, useEffect } from 'react'
import AuthContext from '../contexts/AuthProvider';
import { useRouter } from 'next/navigation';

export const AuthenticatedContainer = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated } = useContext(AuthContext)!;
    const router = useRouter();
    useEffect(() => {
        if (isAuthenticated === false) router.push('/auth/login');
    }, []);

    return (
        isAuthenticated ?
            children : null
    )
}
