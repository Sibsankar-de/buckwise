"use client";

import clsx from 'clsx';
import React, { useEffect, useState } from 'react'

type PopupBoxProps = {
    children?: React.ReactNode;
    className?: string;
    onClose?: () => void;
    openState?: boolean;
}

export const PopupBox = ({ children, openState = false, onClose, className = '' }: PopupBoxProps) => {
    const [open, setOpen] = useState(false);
    const [closing, setClosing] = useState(false);
    useEffect(() => {
        if (openState) {
            setOpen(true);
            setClosing(false);
            document.body.style.overflowY = 'hidden';
        } else {
            setClosing(true);
            setTimeout(() => {
                setOpen(false);
                setClosing(false);
                document.body.style.overflowY = 'auto';
            }, 300);
        }
    }, [openState]);

    if (!open) return null;
    return (
        <div className={clsx('fixed top-0 left-0 w-screen h-screen bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-60 backdrop-blur-[5px] fade-in', closing && 'fade-out')} onClick={() => onClose && onClose()}>
            <div className={clsx('min-w-[15em] min-h-[5em] bg-[var(--background)] p-3 rounded-xl popup-open-anim', className, closing && 'popup-close-anim')} onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    )
}
