import { redirect } from 'next/navigation'
import React from 'react'

const AuthPage = () => {
    redirect('/auth/login');
}

export default AuthPage