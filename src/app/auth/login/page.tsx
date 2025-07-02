"use client";

import { Spinner } from '@/app/utils/spinners/Spinner';
import axios from 'axios';
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';

const LoginPage = () => {
    const [input, setInput] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState<boolean>(false);

    const handleLogin = async () => {
        if (Object.keys(input).some((e) => input[e as keyof typeof input] === '')) {
            toast.error("Please fillup all the fields");
            return;
        }
        try {
            setLoading(true);
            await axios.post('/api/user/login', input)
                .then(() => {
                    window.location.href = `${window.location.origin}`
                })
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const status = error.response?.status as number;
                if (status >= 400 && status < 500) toast.error(error.response?.data.message);
            } else {
                toast.error("Login failed! Please try again")
            }
        }
        setLoading(false);
    }

    // handle google login 
    const [googleLoginLoading, setGoogleLoginLoading] = useState<boolean>(false);
    const handleGoogleLogin = async () => {
        try {
            setGoogleLoginLoading(true);
            window.location.href = `${window.location.origin}/api/oauth/authenticate`
        } catch (error) {
            toast.error("Login failed! Please try again");
            console.log(error);

            setGoogleLoginLoading(false);
        }
    }

    useEffect(() => {
        document.title = "Login to Buckwise"
    }, []);

    return (
        <div className='xl:w-[40vw] md:w-[60vw] w-[90vw] bg-gray-700 p-5 rounded-2xl h-[80vh] flex flex-col justify-between gap-10 overflow-y-auto'>
            <div>
                <h5 className='text-[1.5em] font-bold mb-10 text-center'><span className='text-[var(--primary)]'>Log</span>In BuckWise </h5>
                <div className='mb-4'>
                    <div className='mb-3'>
                        <input type="email" name="" id="" placeholder='Enter email' className='input-control' required onChange={e => setInput({ ...input, email: e.target.value })} />
                    </div>
                    <div>
                        <input type="password" name="" id="" placeholder='Enter password' className='input-control' required onChange={e => setInput({ ...input, password: e.target.value })} />
                    </div>
                </div>
                <div>
                    <div className='mb-2'>
                        <span>Don,t have an account? <Link href={'/auth/signup'} className='text-blue-400'>Signup <span><i className="ri-arrow-right-long-fill"></i></span></Link></span>
                    </div>
                    <div>
                        <span>Forgot password? <Link href={'/update-password'} className='text-blue-400'>Reset <span><i className="ri-arrow-right-long-fill"></i></span></Link></span>
                    </div>
                </div>
            </div>
            <div>
                <div className='mb-3'>
                    <button className="btn bg-[var(--primary)] h-10 p-2 w-full rounded-[10px] flex items-center gap-2 justify-center" onClick={handleLogin}>
                        {loading ?
                            <Spinner size={20} />
                            : <>
                                <div>Continue to Login</div>
                                <div><span><i className="ri-arrow-right-s-line"></i></span></div>
                            </>}
                    </button>
                </div>
                <div>
                    <button className="btn bg-gray-800 w-full h-10 p-2 py-1 rounded-[10px] " onClick={handleGoogleLogin}>
                        {!googleLoginLoading ? <div className='w-full h-full flex items-center gap-2 justify-between'>
                            <div>
                                <img src="/google-logo.png" alt="" className='w-7 h-7 rounded-[5px]' />
                            </div>
                            <div>Continue with Google</div>
                            <div className='bg-gray-900 w-10 h-7 rounded-[10px] flex items-center justify-center'><span><i className="ri-arrow-right-s-line"></i></span></div>
                        </div>
                            : <div className='w-full h-full flex items-center justify-center'>
                                <Spinner size={20} />
                            </div>}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default LoginPage