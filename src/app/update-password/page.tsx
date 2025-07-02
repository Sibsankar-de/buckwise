import { redirect } from 'next/navigation'
import React from 'react'

const UpdatePasswordPage = () => {
    redirect('/update-password/verify');
}

export default UpdatePasswordPage