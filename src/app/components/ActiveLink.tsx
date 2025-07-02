'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import clsx from 'clsx'; // optional for cleaner class logic

interface ActiveLinkProps {
    href: string;
    children: React.ReactNode;
    activeClassName?: string;
    className?: string;
    exact?: boolean;
}

export const ActiveLink = ({ href, children, activeClassName = 'active', className = '', exact = false }: ActiveLinkProps) => {
    const pathname = usePathname();
    const isActive = exact ? pathname === href : (pathname.startsWith(href) || pathname.includes(href));

    return (
        <Link
            href={href}
            className={clsx(className, { [activeClassName]: isActive })}
        >
            {children}
        </Link>
    );
};
