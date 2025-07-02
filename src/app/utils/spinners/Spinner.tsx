"use client";

import React from 'react'
import "./spinner.css"

export const Spinner = ({ size = 23 }: { size?: number }) => {
    return (
        <div className="sk-chase" style={{ width: size, height: size }}>
            <div className="sk-chase-dot"></div>
            <div className="sk-chase-dot"></div>
            <div className="sk-chase-dot"></div>
            <div className="sk-chase-dot"></div>
            <div className="sk-chase-dot"></div>
            <div className="sk-chase-dot"></div>
        </div>
    )
}
