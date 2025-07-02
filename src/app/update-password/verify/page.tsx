"use client";

import { Spinner } from '@/app/utils/spinners/Spinner';
import axios from 'axios';
import Link from 'next/link'
import React, { useState } from 'react'
import { toast } from 'react-toastify';

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState<boolean>(false);
    const [isEmailSend, setIsEmailSend] = useState(false);

    const handleContinue = async () => {
        if (!email) return;
        try {
            setLoading(true);
            await axios.post('/api/user/reset-password/generate-token', { email })
                .then(() => {
                    setIsEmailSend(true);
                })
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const status = error.response?.status as number;
                if (status >= 400 && status < 500) toast.error(error.response?.data.message);
            } else {
                toast.error("Something went wrong! Please try again");
            }
        }
        setLoading(false);
    }
    return (
        <div className='xl:w-[40vw] md:w-[60vw] w-[90vw] bg-gray-700 p-5 rounded-2xl h-[80vh] flex flex-col justify-between gap-10 overflow-y-auto'>
            {!isEmailSend ? <>
                <div>
                    <div className='mb-3'>
                        <input type="email" name="" id="" placeholder='Enter registered email' className='input-control' required onChange={e => setEmail(e.target.value)} />
                    </div>
                    <p className='text-gray-400'>You will receive a mail in your registered email id to reset your password!</p>
                </div>
                <div>
                    <div>
                        <button className="btn bg-[var(--primary)] h-10 p-2 w-full rounded-[10px] flex items-center gap-2 justify-center" onClick={handleContinue}>
                            {loading ?
                                <Spinner size={20} />
                                : <>
                                    <div>Continue</div>
                                    <div><span><i className="ri-arrow-right-s-line"></i></span></div>
                                </>}
                        </button>
                    </div>
                </div>
            </>
                : <div>
                    <p className='mb-2'>An email with an URL to reset password has been send to your registered email id. Checkout that email within 1 hours to reset your password.</p>
                    <p className='text-gray-400 text-sm'>Don,t forget to check out in the spam box</p>
                </div>}
        </div>
    )
}

export default LoginPage