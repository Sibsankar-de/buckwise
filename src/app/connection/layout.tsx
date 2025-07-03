"use client";

import React, { useContext, useEffect, useState } from 'react'
import { PopupBox } from '../components/PopupBox'
import AuthContext from '../contexts/AuthProvider';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Spinner } from '../utils/spinners/Spinner';
import clsx from 'clsx';
import { AuthenticatedContainer } from '../components/AuthenticatedContainer';

const ConnectionLayout = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    // check for protected route
    const { isAuthenticated } = useContext(AuthContext)!;

    const [openNewConnection, setOpenNewConnection] = useState(false);

    // handle connection list
    const [connectionList, setConnectionList] = useState<Array<any> | null>(null);
    useEffect(() => {
        if (!isAuthenticated) return;
        const fetchList = async () => {
            try {
                await axios.get('/api/connection/get-connections')
                    .then(res => {
                        setConnectionList(res.data.data);
                    })
            } catch (error) {
                toast.error('Failed to load connections');
            }
        }

        fetchList();

    }, []);


    // handle searching
    const [searchedList, setSearchedList] = useState<any[] | null>(null);
    useEffect(() => {
        setSearchedList(connectionList);
    }, [connectionList]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.trim().toLowerCase();
        if (!connectionList) return;

        if (!value) {
            // If input is empty, show all connections
            setSearchedList(connectionList);
            return;
        }

        // Score and filter connections
        const scored = connectionList
            .map(item => {
                const name = item.connectedUser?.userName?.toLowerCase() || '';
                const email = item.connectedUser?.email?.toLowerCase() || '';
                let score = 0;
                if (name === value || email === value) score += 100;
                else {
                    if (name.startsWith(value)) score += 50;
                    if (email.startsWith(value)) score += 40;
                    if (name.includes(value)) score += 20;
                    if (email.includes(value)) score += 10;
                }
                return { item, score };
            })
            .filter(entry => entry.score > 0)
            .sort((a, b) => b.score - a.score)
            .map(entry => entry.item);

        setSearchedList(scored);
    }

    return (
        <AuthenticatedContainer>
            <div className='grid grid-cols-[auto_1fr] h-[calc(100vh-56px)]'>
                <div className='bg-[var(--subground)] p-4 pb-0 lg:w-[25em] md:w-[35vw] w-[100vw] grid grid-rows-[auto_1fr] h-[calc(100dvh-56px)] sticky top-[56px]'>
                    <div className='mb-4 grid grid-cols-[1fr_auto] items-center gap-2'>
                        <div className='flex items-center focus-within:[&>span]:text-[var(--primary)]'>
                            <span className='absolute ml-2.5 text-lg font-semibold text-gray-300 transition-all duration-300'><i className="ri-search-2-line"></i></span>
                            <input type="search" placeholder='Search connections' className='input-control !pl-9' onChange={handleSearch} />
                        </div>
                        <div>
                            <button className="btn btn-primary" onClick={() => setOpenNewConnection(true)}><span className='font-bold'><i className="ri-add-large-fill"></i></span></button>
                        </div>
                    </div>
                    <div className='overflow-y-auto'>
                        {
                            connectionList === null && <div className='flex justify-center my-3 items-center gap-3'><Spinner size={15} /><span>loading connections...</span></div>
                        }
                        {
                            searchedList?.map((item, index) => (
                                <ConnectionItem key={index} data={item} />
                            ))
                        }
                        {
                            connectionList?.length === 0 &&
                            <div className='flex flex-col items-center my-4'>
                                <div className='mb-3'>Start adding new connection.</div>
                                <div>
                                    <button className='btn btn-primary' onClick={() => setOpenNewConnection(true)}><span className='mr-2'><i className="ri-add-large-fill font-bold"></i></span><span>Add connection</span></button>
                                </div>
                            </div>
                        }
                        {
                            (connectionList && connectionList?.length > 0 && searchedList?.length === 0) && <div className='text-center text-sm text-gray-300'>No connections found</div>
                        }
                    </div>
                </div>
                {children}

                <AddConnectionPopup openState={openNewConnection} onClose={() => setOpenNewConnection(false)} />
            </div>
        </AuthenticatedContainer>
    )
}

const ConnectionItem = ({ data }: { data: Record<string, any> }) => {
    const router = useRouter();
    return (
        <div className='flex items-center gap-4 p-2 hover:bg-[var(--hover)] cursor-pointer mb-3 w-full rounded-xl transition-all duration-200' onClick={() => router.push(`/connection/${data.connectedUser._id}?room=${data.roomId}`)}>
            <img src="/profile-placeholder.png" alt="" className='w-17 h-17 rounded-full' />
            <div>
                <h5 className='text-[1.1em] font-semibold break-all line-clamp-1'>{data.connectedUser.userName}</h5>
                {data.lastMessage.content && <p className='text-gray-500 break-all line-clamp-1 text-sm'>{data.lastMessage.content.status}</p>}
                {data.totalDue > 0 && <div className='text-sm mt-1'><span className='text-gray-300'>Due:</span> <span className='bg-[var(--primary)] px-2 py-0.5 rounded-xl w-fit h-fit text-sm'>₹ {data.totalDue}</span></div>}
            </div>
        </div>
    )
}

const AddConnectionPopup = ({ openState, onClose }: { openState: boolean, onClose: () => void }) => {
    // handle user list
    const [userList, setUserList] = useState<Array<any> | null>(null);
    const [filterList, setFilterList] = useState<Array<any> | null>(null);
    useEffect(() => {
        const fetchList = async () => {
            try {
                await axios.get('/api/user/get-userlist')
                    .then(res => {
                        setUserList(res.data.data);
                        setFilterList([]);
                    })
            } catch (error) {
                toast.error('Failed to load userlist');
            }
        }

        openState &&
            fetchList();

    }, [openState]);

    // handle search
    const [input, setInput] = useState("");
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!userList) return;
        const input = e.target.value?.trim().toLowerCase() || '';
        setInput(input);
        if (!input) {
            setFilterList([]);
            return;
        }
        // serach logic
        const scored = (userList || []).map(user => {
            const name = user.userName?.toLowerCase() || '';
            const email = user.email?.toLowerCase() || '';
            let score = 0;
            if (name === input || email === input) score += 100;
            else {
                if (name.startsWith(input)) score += 50;
                if (email.startsWith(input)) score += 40;
                if (name.includes(input)) score += 20;
                if (email.includes(input)) score += 10;
            }
            return { user, score };
        })
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 5)       // limit set to 10
            .map(item => item.user);

        setFilterList(scored.length ? scored : []);
    };

    return (
        <PopupBox openState={openState} onClose={onClose} className='xl:w-[50vw] sm:w-[80vw] w-[100vw] max-sm:h-[100vh] max-sm:top-0 max-sm:left-0 max-sm:rounded-none'>
            <div className='flex items-center justify-between gap-2 mb-3'>
                <h5 className='text-lg font-semibold text-gray-300'>Add new Connection</h5>
                <button className="bg-gray-700 w-10 h-10 rounded-xl btn text-gray-300" onClick={onClose}><i className="ri-close-large-fill"></i></button>
            </div>
            <div>
                <div className='flex items-center focus-within:[&>span]:text-[var(--primary)] mb-3'>
                    <span className='absolute ml-2.5 text-lg font-semibold text-gray-300 transition-all duration-300'><i className="ri-search-2-line"></i></span>
                    <input type="text" placeholder='Search by email or names' className='input-control !pl-9' onChange={handleSearch} disabled={userList === null} />
                </div>
                <div className=' h-[65svh] overflow-y-auto'>
                    {
                        filterList?.map((item, index) => (
                            <PopupUserItem key={index} data={item} />
                        ))
                    }
                    {
                        (filterList?.length === 0) && <div className='text-center text-gray-300 my-3'>{input.length > 0 ? "No users found on your search!" : "Type user name or email id to find user"}</div>
                    }
                    {!userList &&
                        <div className='flex justify-center'>
                            <Spinner size={25} />
                        </div>
                    }
                </div>
            </div>
        </PopupBox>
    )
}

const PopupUserItem = ({ data }: { data: Record<string, any> }) => {
    // handle send connection request
    const [isSend, setIsSend] = useState<boolean | null>(false);
    const [sending, setSending] = useState<boolean>(false);
    const [requestId, setRequestId] = useState<string | null>(null);
    // update send status
    useEffect(() => {
        const requestStatus = data.request?.status;
        if (!requestStatus) return;
        if (requestStatus === 'pending') setIsSend(true);
        if (requestStatus === 'accepted') setIsSend(null);
        if (requestStatus === 'rejected') setIsSend(false);
    }, [data]);

    // handle request
    const handleSentRequest = async () => {
        if (isSend === null || !data) return;
        try {
            setSending(true);
            if (isSend === false) {
                await axios.post('/api/request/create', { requestTo: data._id })
                    .then((res) => {
                        setIsSend(true);
                        setRequestId(res.data.data.requestId);
                        toast.success(`Connection request send to ${data.userName}`);
                    });
            }
            if (isSend) {
                await axios.delete(`/api/request/remove?id=${requestId || data.request?.id}`)
                    .then(() => {
                        setIsSend(false);
                        toast.success(`Connection request to ${data.userName} has been removed`);
                    });
            }
        } catch (error) {
            toast.error("Unable tp perform request");
        }
        setSending(false);
    }
    return (
        <div className='flex items-center gap-4 p-2 hover:bg-[var(--hover)] cursor-pointer w-full rounded-xl transition-all duration-200'>
            <img src={data.avatar || "/profile-placeholder.png"} alt="" className='w-15 h-15 rounded-full' />
            <div className='flex justify-between w-full items-center gap-2'>
                <div>
                    <h5 className='font-semibold break-all line-clamp-1'>{data.userName}</h5>
                    <p className='text-gray-500 text-sm break-all line-clamp-1'>{data.email}</p>
                </div>
                {isSend !== null && <div className='flex items-center gap-2 mt-2'>
                    <button className={clsx("btn whitespace-nowrap py-2!", !isSend && 'btn-primary', isSend && 'btn-secondary text-red-300')} onClick={handleSentRequest} disabled={sending}>{isSend ? "Cancel request" : "Sent request"}</button>
                </div>}
            </div>
        </div>
    )
}

export default ConnectionLayout