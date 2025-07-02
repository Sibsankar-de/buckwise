"use client";

import { Spinner } from '@/app/utils/spinners/Spinner';
import axios from 'axios';
import clsx from 'clsx';
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';

const RequestPage = () => {
  const router = useRouter();
  const query = useSearchParams();
  const filter = query.get('filter') || 'received';

  // fetch request list
  const [requestList, setRequestList] = useState<Array<Record<string, any>> | null>(null);
  useEffect(() => {
    const fetchList = async () => {
      try {
        setRequestList(null);
        await axios.get(`/api/request/get-list?filter=${filter || 'received'}`)
          .then(res => {
            setRequestList(res.data.data);
          });
      } catch (error) {
        toast.error("Failed to fetch. Please refresh the page");
      }
    };

    fetchList();
  }, [filter]);

  // handle checkout request
  const handleCheckout = async () => {
    try {
      await axios.patch('/api/request/checkout');
    } catch (error) {

    }
  };

  useEffect(() => {
    handleCheckout();
  }, [requestList]);

  return (
    <div>
      <div className='mb-5'>
        <Link href={'?filter=received'} className={clsx('btn p-2 px-3 bg-gray-700 rounded-[10px] text-[0.9em] border-1 border-transparent mr-3', filter === 'received' && 'bg-gray-800 !border-[var(--primary)]')}>Received</Link>
        <Link href={'?filter=send'} className={clsx('btn p-2 px-3 bg-gray-700 rounded-[10px] text-[0.9em] border-1 border-transparent', filter === 'send' && 'bg-gray-800 !border-[var(--primary)]')}>Send</Link>
      </div>
      <div>
        {!requestList &&
          <div className='flex justify-center'>
            <Spinner size={25} />
          </div>
        }
        {
          requestList?.map((item: any, index: number) => (
            <RequestItem key={index} data={item} filter={filter} />
          ))
        }
        {
          requestList?.length === 0 &&
          <div className='flex flex-col items-center'>
            <img src="/blank-list.png" alt="" className='w-40 h-40' />
            <div className='text-gray-400 mt-2'>No requests found!</div>
          </div>
        }
      </div>
    </div>
  )
}

const RequestItem = ({ data, filter }: { data: Record<string, any>, filter: string }) => {
  const [isAccepted, setIsAccepted] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // update request status
  const handleRequestAcceptOrReject = async (action: string) => {
    if (!data || isAccepted !== null || !action) return;
    try {
      setLoading(true);
      await axios.patch(`/api/request/update`, { status: action, requestId: data._id })
        .then(() => {
          if (action === 'rejected' && data._id) {
            setIsAccepted(false);
          } else {
            setIsAccepted(true);
          }
          toast.success(`Request ${action}`);
        });
    } catch (error) {
      toast.error("Failed to update");
    }
    setLoading(false);
  };

  // handle cancel request
  const [isCanceled, setIsCanceled] = useState<boolean>(false);
  const handleCancleRequest = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/request/remove?id=${data._id}`)
        .then(() => {
          setIsCanceled(true);
          toast.success("Request canceled");
        });
    } catch (error) {
      toast.error("Failed to update");
    }
    setLoading(false);
  };

  return (
    <div className={clsx('flex items-center gap-4 p-4 px-2 hover:bg-[var(--hover)] cursor-pointer w-full rounded-[5px] transition-all duration-200', (filter === 'received' && data.isChecked === false) && 'bg-[#28616637]')}>
      <img src={data.avatar || "/profile-placeholder.png"} alt="" className='w-20 h-20 rounded-full' />
      <div>
        <h5 className='font-semibold line-clamp-1 break-all'>{data.userDetails.userName}</h5>
        <p className='text-gray-500 text-sm line-clamp-1 break-all'>{data.userDetails.email}</p>
        <div className='flex items-center gap-2 mt-2 flex-wrap'>
          {filter === 'received' ?
            <>
              {isAccepted === null ? <>
                <button className="btn btn-primary !py-[5px]" onClick={() => handleRequestAcceptOrReject("accepted")} disabled={loading}>Accept</button>
                <button className="btn btn-secondary !py-[5px] text-red-400" onClick={() => handleRequestAcceptOrReject("rejected")} disabled={loading}>Reject</button>
              </> :
                isAccepted ? <div className='text-green-300'>Request accepted</div> : <div className='text-red-400'>Request rejected</div>}
            </>
            :
            isCanceled ?
              <div className='text-red-400'>Request canceled</div>
              : <button className="btn btn-secondary !py-[5px] text-red-400" onClick={handleCancleRequest} disabled={loading}>Cancel Request</button>
          }
        </div>

      </div>
    </div>
  )
}

export default RequestPage