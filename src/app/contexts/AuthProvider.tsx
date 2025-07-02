"use client";

import { IUser } from "@/lib/models/user.model";
import axios from "axios";
import React, { createContext, useState, useEffect } from "react";

interface AuthContextType {
    user: Record<string, any> | null;
    setUser: (user: IUser | null) => void;
    isAuthenticated: boolean | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<IUser | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    // fetch user
    useEffect(() => {
        const fetchUser = async () => {
            try {
                await axios.get('/api/user/current-user')
                    .then((res) => {
                        setUser(res.data.data)
                        setIsAuthenticated(true);
                    })
            } catch (error) {
                console.error(error);
                setIsAuthenticated(false);
            }
        }
        fetchUser();
    }, []);
    return (
        <AuthContext.Provider value={{ user, setUser, isAuthenticated }}>
            {isAuthenticated === null ?
                <LoadingScreen />
                : children
            }
        </AuthContext.Provider>
    )
};

const LoadingScreen = () => {
    return (
        <div className="flex items-center justify-center w-screen h-screen">
            <img src="/buckwise_logo_fill.png" alt="" className="w-40 h-40 flicker" />
        </div>
    )
}

export default AuthContext;