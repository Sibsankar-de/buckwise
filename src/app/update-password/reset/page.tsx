"use client";

import AuthContext from '@/app/contexts/AuthProvider';
import { Spinner } from '@/app/utils/spinners/Spinner';
import axios from 'axios';
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useContext, useState } from 'react'
import { toast } from 'react-toastify';

const LoginPage = () => {
    const router = useRouter();
    const [password, setPassword] = useState({ newPassword: "", confirmPassword: "" });
    const [loading, setLoading] = useState<boolean>(false);
    const [isPasswordReset, setIsPasswordReset] = useState(false);
    const params = useSearchParams();
    const token = params.get('token');

    const { isAuthenticated } = useContext(AuthContext)!;

    const handleReset = async () => {
        if (!token) router.push('/not-found');
        if (password.newPassword !== password.confirmPassword) {
            toast.error("Password should match with confirm password");
            return;
        }
        if (password.newPassword.length < 5) {
            toast.error("Password must contain atleast 5 characters");
            return;
        }
        try {
            setLoading(true);
            await axios.post('/api/user/reset-password/reset', { token, password: password.newPassword })
                .then(() => {
                    setIsPasswordReset(true);
                })
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const status = error.response?.status as number;
                if (status >= 400 && status < 500) toast.error(error.response?.data.message);
            } else {
                toast.error("Password reset failed! Please try again")
            }
        }
        setLoading(false);
    }
    return (
        <div className='xl:w-[40vw] md:w-[60vw] w-[90vw] bg-gray-700 p-5 rounded-2xl h-[80vh] flex flex-col justify-between gap-10 overflow-y-auto'>
            {!isPasswordReset ? <>
                <div>
                    <h5 className='text-[1.5em] font-bold mb-10 text-center'><span className='text-[var(--primary)]'>Reset</span> Password</h5>
                    <div className='mb-4'>
                        <div className='mb-3'>
                            <input type="password" name="" id="" placeholder='Enter new password' className='input-control' required onChange={e => setPassword({ ...password, newPassword: e.target.value })} />
                        </div>
                        <div className='mb-3'>
                            <input type="password" name="" id="" placeholder='Confirm new password' className='input-control' required onChange={e => setPassword({ ...password, confirmPassword: e.target.value })} />
                        </div>
                    </div>
                </div>
                <div>
                    <div>
                        <button className="btn bg-[var(--primary)] h-10 p-2 w-full rounded-[10px] flex items-center gap-2 justify-center" onClick={handleReset}>
                            {loading ?
                                <Spinner size={20} />
                                : <>
                                    <div>Reset password</div>
                                    <div><span><i className="ri-arrow-right-s-line"></i></span></div>
                                </>}
                        </button>
                    </div>
                </div>
            </>
                : <div>
                    <p className='text-center'>Your password reset successfully!</p>
                    <div>
                        <button className='btn btn-primary' onClick={() => router.push(isAuthenticated ? '/' : '/auth/login')}>{isAuthenticated ? "Back to Home" : "Back to Login"}</button>
                    </div>
                </div>}
        </div>
    )
}

export default LoginPage