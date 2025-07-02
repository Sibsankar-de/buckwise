"use client";

import AuthContext from '@/app/contexts/AuthProvider';
import { Spinner } from '@/app/utils/spinners/Spinner';
import { formatDate, formatTime } from '@/lib/utils/formatDate';
import axios, { AxiosError } from 'axios';
import clsx from 'clsx';
import { useParams, useRouter } from 'next/navigation';
import React, { useContext, useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify';

const TEXTAREA_PLACEHOLDER = 'Write your message! eg: "I paid rupees 200 for the service"';

const ConnectionPage = () => {

    // handle UI
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // useEffect(() => {
    //     const handleFocus = () => {
    //         window.scrollTo(0, 0);
    //         document.body.style.overflow = 'hidden';
    //     };

    //     const handleBlur = () => {
    //         document.body.style.overflow = '';
    //     };

    //     const input = inputRef.current;
    //     if (input) {
    //         input.addEventListener('focus', handleFocus);
    //         input.addEventListener('blur', handleBlur);
    //     }

    //     return () => {
    //         if (input) {
    //             input.removeEventListener('focus', handleFocus);
    //             input.removeEventListener('blur', handleBlur);
    //         }
    //     };
    // }, []);


    // handle input change
    const [input, setInput] = useState('');
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const target = e.target;
        setInput(target.value);
        // Reset height to auto to shrink if needed, then set to scrollHeight up to a max height
        target.style.height = 'auto';
        const maxHeight = 200;
        if (target.scrollHeight <= maxHeight) {
            target.style.height = `${target.scrollHeight}px`;
        } else {
            target.style.height = `${maxHeight}px`;
        }
    };

    // get params
    const params = useParams();
    const connectedUserId = params.id;
    const router = useRouter();
    // get connected user
    const [connectedUser, setConnectedUser] = useState<Record<string, any> | null>(null);
    useEffect(() => {
        const fetchuser = async () => {
            try {
                await axios.get(`/api/user/get-user?id=${connectedUserId}`)
                    .then(res => {
                        setConnectedUser(res.data.data);
                    })
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    const status = error.response?.status as number;
                    if (status === 402 || status === 500) router.push("/not-found");
                }
                toast.error("Failed to load user");
            }
        };
        if (connectedUserId)
            fetchuser();
    }, [connectedUserId]);

    // current user 
    const { user } = useContext(AuthContext)!;

    // fetch messages
    const [messageList, setMessageList] = useState<Array<Record<string, any>> | null>(null);
    const [dueStatus, setDueStatus] = useState<Array<Record<string, any>> | null>(null);
    const fetchMessages = async () => {
        try {
            await axios.get(`/api/connection/get-messages?id=${connectedUserId}`)
                .then(res => {
                    setMessageList(res.data.data.messageList);
                    setDueStatus(res.data.data.dueStatus);
                })
        } catch (error) {
            toast.error("Failed to load messages. Please refresh the page");
        }
    }
    useEffect(() => {
        if (connectedUserId)
            fetchMessages();
    }, [connectedUserId]);

    // handle create dues
    const [uploading, setUploading] = useState<boolean>(false);
    const [dueUpdating, setDueUpdating] = useState<boolean>(false);
    const handleCreateDue = async () => {
        const prompt = input.trim();
        if (!prompt || !connectedUser || !messageList) return;

        try {
            setUploading(true);
            await axios.post(`/api/connection/create-message`, { prompt, connectedUserId })
                .then(async (res) => {
                    const newMessage: Record<string, any> = res.data.data;
                    setMessageList([...(messageList || []), newMessage]);
                    setInput('');

                    // update remaining dues
                    setDueUpdating(true);
                    await axios.patch(`/api/connection/update-due`, { dueId: newMessage._id })
                        .then(() => {
                            toast.info("All dues up to date");
                            fetchMessages();
                        })
                })
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const status = error.response?.status as number;
                if (status >= 400 && status < 500) toast.error(error.response?.data.message);
            } else {
                toast.error("Send failed! Please try again")
            }
        };

        setUploading(false);
        setDueUpdating(false);
    };

    // handle scroll behavior
    const [isFirstScrolled, setIsFirstScrolled] = useState<boolean>(false);
    useEffect(() => {
        // updates the behaviour to smooth after first render
        if (!isFirstScrolled && messageList) setIsFirstScrolled(true);
    }, [messageList]);

    // handle auto scroll
    const messagesContainerRef = useRef<HTMLDivElement | null>(null);
    const [isAtBottom, setIsAtBottom] = useState(true);

    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const threshold = 40; // px from bottom to consider as "at bottom"
            const atBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
            setIsAtBottom(atBottom);
        };

        container.addEventListener('scroll', handleScroll);
        // Scroll to bottom initially
        container.scrollTop = container.scrollHeight;

        return () => {
            container.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useEffect(() => {
        if (isAtBottom && messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messageList, isAtBottom]);

    // scroll bottom function
    const scrollToBottom = () => {
        const container = messagesContainerRef.current;
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    };

    return (
        <div className={clsx('grid grid-rows-[auto_1fr_auto] chat-screen w-full max-md:absolute! max-md:top-0 max-md:left-0 max-md:z-100', `h-[calc(100vh-56px)] max-md:h-[100vh]`)}>
            <section className='flex items-center gap-3 p-3 bg-[var(--subground)] md:ml-0.5 md:mt-0.5 mb-1'>
                <button className='flex items-center gap-1 btn' onClick={() => router.push('/connection')}>
                    <div><i className="ri-arrow-left-line"></i></div>
                    <img src={connectedUser?.avatar || "/profile-placeholder.png"} alt="" className='w-13 h-13 rounded-full' />
                </button>
                {connectedUser ?
                    <div>
                        <h1 className='text-[1.1em] font-semibold break-all line-clamp-1'>{connectedUser?.userName}</h1>
                        <div className='text-gray-500 text-[0.9em] flex items-center'>
                            <p><span>Due</span><span><i className="ri-arrow-right-s-fill"></i></span></p>
                            <p>
                                {dueStatus?.map((item, index) => (
                                    <span key={index} className='mr-2 break-all line-clamp-1'>{item.dueFromUser.userName?.split(' ')[0]}: <span className='bg-[var(--primary)] px-2 py-0.5 rounded-xl text-gray-50'>₹ {item.totalDue}</span></span>
                                ))}
                                {dueStatus?.length === 0 && <span className='break-all line-clamp-1'>All dues are cleared</span>}
                            </p>
                        </div>
                    </div>
                    : <div className='w-50 h-8 bg-gray-600 flicker rounded-xl'></div>
                }
            </section>

            <section className={clsx('w-full flex flex-col gap-3 overflow-y-auto items-center pb-3 relative message-section', isFirstScrolled && 'scroll-smooth')} ref={messagesContainerRef}>
                {
                    messageList?.map((item, index) => (
                        item.type === 'flag' ?
                            <FlagItem key={index} data={item} />
                            : <ChatItem key={index} data={item} dueFromUser={[user, connectedUser].find(e => e?._id === item.dueFrom)} dueToUser={[user, connectedUser].find(e => e?._id === item.dueTo)} />
                    ))
                }
                {
                    messageList?.length === 0 &&
                    <div className='p-4 bg-gray-800 max-w-[60%] text-center rounded-xl mt-3'>
                        <div>Start adding dues from each other</div>
                        <div> Example of prompt: <span className='text-[var(--primary)]'>I paid rupees 300 last night for dinner</span></div>
                    </div>
                }
                {
                    !messageList && <div className='p-2 px-4 bg-gray-700 rounded-xl'>Loading messages...</div>
                }
                {dueUpdating &&
                    <div className='bg-gray-700 flex items-center gap-4 p-2 text-sm rounded-xl'>
                        <div><Spinner size={16} /></div>
                        <div>Updating all dues</div>
                    </div>
                }
                <div className={clsx('fixed bottom-30 right-7 z-10 opacity-100 transition-all duration-200', isAtBottom && "!opacity-0")}>
                    <button className="btn btn-secondary !py-[5px] !px-[10px]" onClick={scrollToBottom}><i className="ri-arrow-down-double-line"></i></button>
                </div>
            </section>

            <section
                className='px-2 py-1 h-fit grid grid-cols-[1fr_auto] gap-3 items-baseline sticky bottom-0'
                style={{
                    // Add extra bottom padding if keyboard is open (mobile)
                    paddingBottom: typeof window !== 'undefined' && window.innerHeight < 500 ? 'env(safe-area-inset-bottom, 80px)' : undefined,
                    background: 'var(--subground)',
                    zIndex: 20,
                }}
            >
                <textarea
                    name="chat-box"
                    id="chat-box"
                    placeholder={TEXTAREA_PLACEHOLDER}
                    className='h-auto resize-none w-full overflow-y-auto p-3 rounded-2xl bg-[var(--subground)] outline-0 border-2 border-transparent focus:border-[var(--primary)] transition-[border] duration-200 scroll-thin'
                    onChange={handleInputChange}
                    value={input}
                    disabled={uploading}
                    ref={inputRef}
                    onFocus={() => {
                        // Scroll input into view on mobile when keyboard opens
                        setTimeout(() => {
                            inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 300);
                    }}
                ></textarea>
                <button className='bg-[var(--primary)] w-12 h-12 rounded-full text-[1.3em] font-bold self-end btn active:scale-[0.98] flex items-center justify-center' onClick={handleCreateDue} disabled={uploading || !input}>
                    {uploading ? <span><Spinner /></span>
                        : <i className="ri-arrow-up-line"></i>}
                </button>
            </section>
        </div>
    )
}

const ChatItem = ({ data, dueToUser, dueFromUser }: { data: Record<string, any>, dueToUser: Record<string, any> | null | undefined, dueFromUser: Record<string, any> | null | undefined }) => {
    return (
        <div className='lg:w-[60%] sm:w-[86%] w-[90%]  bg-[var(--subground)] p-4 rounded-xl pb-2'>
            <div className='mb-2'>
                <div className='flex items-start justify-between mb-3 flex-wrap gap-2'>
                    <div className='text-4xl'>
                        <span className='mr-2 text-[var(--primary)]'><i className="bi bi-currency-rupee font-bold"></i></span>
                        <span>{data.content.dueAmount}</span>
                        {data.content.paidAmount !== 0 && <span className='line-through text-xl ml-2 text-gray-500'>{data.content.totalAmount}</span>}
                    </div>
                    <div className='text-[0.8em] bg-gray-800 px-2 py-1 w-fit rounded-xl flex items-center gap-2'>
                        <span className='text-[var(--primary)]'><i className={`bi bi-${data.isDue ? 'hourglass-split' : 'check2-all'}`}></i></span>
                        <span>{data.isDue ? "Payment due" : "Due completed"}</span>
                    </div>
                </div>
                <div className='text-gray-400'>
                    {dueToUser?.userName} paid to {dueFromUser?.userName}
                </div>
                <div className='bg-gray-800 p-3 rounded-xl mt-2'>
                    {data?.content?.remarks && <div>
                        <p className='text-[0.95em] mb-2 line-clamp-2'><strong>Remarks: </strong><span className='text-gray-500 '>{data?.content?.remarks}</span></p>
                    </div>}
                    <div>
                        <p className='text-[0.95em]'><strong>Status: </strong><span className='text-gray-500 '>{data?.content?.status}</span></p>
                    </div>
                </div>
            </div>
            <div className='flex items-center justify-end gap-4 flex-wrap'>
                <div className='flex items-center gap-3'>
                    <img src={data?.createdByUser?.avatar || "/profile-placeholder.png"} alt="" className='w-8 h-8 rounded-full' />
                    <div>{data?.createdByUser?.userName}</div>
                </div>
                <div className='text-gray-500 text-[0.9em]'>
                    <span>{formatDate(data.createdAt)}</span>
                    <span className='mx-1'><i className="bi bi-dot"></i></span>
                    <span>{formatTime(data.createdAt)}</span>
                </div>
            </div>
        </div>
    )
}

const FlagItem = ({ data }: { data: Record<string, any> }) => {
    return (
        <div className='lg:max-w-[60%] max-w-[86%] bg-gray-700 px-3 py-2 rounded-xl text-[0.9em] text-gray-300 text-center'>
            {data.content.message}
        </div>
    )
}

export default ConnectionPage