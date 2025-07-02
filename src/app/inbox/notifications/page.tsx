"use client";

import { Spinner } from '@/app/utils/spinners/Spinner';
import { formatDate, formatTime } from '@/lib/utils/formatDate';
import axios from 'axios';
import clsx from 'clsx';
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';

const NotificationPage = () => {
  const query = useSearchParams();
  const filter = query.get('filter') || 'all';
  // fetch notifications
  const [notificationList, setNotificationList] = useState<Array<Record<string, any>> | null>(null);
  useEffect(() => {
    const fetchList = async () => {
      setNotificationList(null);
      try {
        await axios.get(`/api/notification/get-list?filter=${filter}`)
          .then(res => {
            setNotificationList(res.data.data);
          })
      } catch (error) {
        toast.error("Failed to fetch notifications. Please refresh the page");
      }
    };

    fetchList();
  }, [filter]);
  return (
    <div>
      <div className='mb-5'>
        <Link href={'?filter=all'} className={clsx('btn p-2 px-3 bg-gray-700 rounded-[10px] text-[0.9em] border-1 border-transparent mr-3', filter === 'all' && 'bg-gray-800 !border-[var(--primary)]')}>All</Link>
        <Link href={'?filter=unreads'} className={clsx('btn p-2 px-3 bg-gray-700 rounded-[10px] text-[0.9em] border-1 border-transparent', filter === 'unreads' && 'bg-gray-800 !border-[var(--primary)]')}>Unreads</Link>
      </div>
      <div>
        {!notificationList &&
          <div className='flex justify-center'>
            <Spinner size={25} />
          </div>
        }
        {
          notificationList?.map((item, index) => (
            <NotificationItem key={index} data={item} />
          ))
        }
        {
          notificationList?.length === 0 &&
          <div className='flex flex-col items-center'>
            <img src="/blank-list.png" alt="" className='w-40 h-40' />
            <div className='text-gray-400 mt-2'>No notifications found!</div>
          </div>
        }
      </div>
    </div>
  )
}

const NotificationItem = ({ data }: { data: Record<string, any> }) => {
  const router = useRouter();
  // mark as read notification
  const [isRead, setIsRead] = useState<boolean>(data.isRead || false);
  const handleMarkRead = async () => {
    if (!data || isRead) return;
    try {
      await axios.patch(`/api/notification/checkout?id=${data._id}`)
        .then(() => {
          setIsRead(true);
        })
    } catch (error) {

    }
  }

  return (
    <div className={clsx('p-4 hover:bg-[var(--hover)] cursor-pointer w-full rounded-[5px] transition-all duration-200', isRead === false && "bg-[#28616637]")} onClick={handleMarkRead}>
      <div className='mb-2'>
        <div><h5 className='text-[1.1em]'>{data.title}</h5></div>
        <div className='text-sm text-gray-500'>{formatDate(data.createdAt)} at {formatTime(data.createdAt)}</div>
      </div>
      <div className='mb-1'>
        <p className='text-gray-400'>{data.content.message}</p>
      </div>
      {data.type === 'request' &&
        <div className='flex items-center gap-2 mt-2'>
          <button className='btn btn-primary !py-[5px]' onClick={() => router.push('/inbox/requests?filter=received')}>View request</button>
        </div>
      }
    </div>
  )
}

export default NotificationPage