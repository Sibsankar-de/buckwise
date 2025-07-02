import { redirect } from 'next/navigation'
import React from 'react'

const InboxPage = () => {
    redirect('/inbox/requests');
}

export default InboxPage