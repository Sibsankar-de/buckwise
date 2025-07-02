"use client"

import React, { useState, useEffect, useCallback, useContext } from 'react'
import { PopupBox } from '../components/PopupBox'
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { useRouter } from 'next/navigation';
import AuthContext from '../contexts/AuthProvider';
import { Spinner } from '../utils/spinners/Spinner';
import { toast } from 'react-toastify';
import axios from 'axios';
import Link from 'next/link';
import { AuthenticatedContainer } from '../components/AuthenticatedContainer';

const ProfilePage = () => {
    const router = useRouter();
    const { isAuthenticated, user, setUser } = useContext(AuthContext)!;

    // handle data
    const [userData, setUserData] = useState({ userName: "", email: "" });
    const [previewUrl, setPreviewUrl] = useState<string>('');

    useEffect(() => {
        if (user) {
            setUserData({ userName: user.userName, email: user.email });
            setPreviewUrl(user.avatar || '');
        }
    }, [user]);

    // handle user data update
    const [loading, setLoading] = useState<boolean>(false);
    const handleUserDataUpdate = async () => {
        if (!userData.email || !userData.userName) {
            toast.error("All fields are required");
        }

        try {
            setLoading(true);
            await axios.patch('/api/user/update-user', userData)
                .then(res => {
                    const data = res.data.data;
                    setUser(data);
                    toast.success("Changes saved");
                })
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.log(error.response);
                const status = error.response?.status as number;
                if (status >= 400 && status < 500) toast.error(error.response?.data.message);
            }
        }
        setLoading(false);
    }

    // Image handleing
    const [openCropper, setOpenCropper] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [croppedFile, setCroppedFile] = useState<File | null>(null);
    const [fileUploadLoading, setFileUploadLoading] = useState<boolean>(false);
    // handle file upload
    useEffect(() => {
        const uploadImage = async (uploadFile: File) => {
            try {
                setFileUploadLoading(true);
                const formData = new FormData();
                formData.append('avatar', uploadFile);
                await axios.patch('/api/user/update-avatar', formData, {
                    headers: {
                        "Content-Type": "multipart/formdata"
                    }
                }).then(res => {
                    const data = res.data.data
                    setPreviewUrl(data.avatar);
                    setUser(data);
                    toast.success("Profile image saved");
                })

            } catch (error) {
                if (axios.isAxiosError(error)) {
                    console.log(error.response);
                    const status = error.response?.status as number;
                    if (status >= 400 && status < 500) toast.error(error.response?.data.message);
                }
            }
            setFileUploadLoading(false);
        }
        if (croppedFile) {
            if (croppedFile.size > 15728640) {
                toast.error("File size must be within 15mb");
                return;
            }
            uploadImage(croppedFile);

        }
    }, [croppedFile]);

    // handle password update
    const [password, setPassword] = useState({ currentPassword: "", newPassword: "" });
    const handlePasswordUpdate = async () => {
        try {
            setLoading(true);
            await axios.patch("/api/user/update-password", password)
                .then(() => {
                    toast.success("Password updated");
                })
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.log(error.response);
                const status = error.response?.status as number;
                if (status >= 400 && status < 500) toast.error(error.response?.data.message);
            }
        }
        setLoading(false);
    }

    // handle logout
    const [logoutLoading, setLogoutLoading] = useState<boolean>(false);
    const handleLogOut = async () => {
        try {
            setLogoutLoading(true);
            await axios.get("/api/user/logout")
                .then(() => {
                    window.location.href = `${window.location.origin}/auth`;
                })
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.log(error.response);
                const status = error.response?.status as number;
                if (status >= 400 && status < 500) toast.error(error.response?.data.message);
            }
        }
        setLogoutLoading(false);
    }
    return (
        <AuthenticatedContainer>
            <div className='w-screen flex flex-col items-center mt-3'>
                <div className='lg:w-[60%] md:w-[80%] w-[95%]'>
                    <section className='w-[100%] mb-4 flex items-center gap-3'>
                        <button className='bg-gray-600 w-10 h-10 rounded-2xl btn text-gray-300' onClick={() => router.back()}><i className="ri-arrow-left-line text-3xl"></i></button>
                        <h1 className='text-2xl font-bold'>Manage Profile</h1>
                    </section>
                    <section className='w-[100%] p-3 bg-gray-700 rounded-xl mb-4'>
                        <div className='mb-4 grid w-fit relative'>
                            <img src={previewUrl || "/profile-placeholder.png"} alt="" className='w-40 h-40 rounded-full' />
                            <label htmlFor='profile-image-input' className="btn bg-gray-800 w-12 h-12 rounded-full text-xl absolute self-end justify-self-end -translate-1.5 border-4 border-gray-700 flex items-center justify-center z-10">
                                <i className="ri-pencil-fill"></i>
                            </label>
                            <input type="file" id='profile-image-input' multiple={false} accept='image/*' className='hidden' onChange={(e) => {
                                if (e.target.files && e.target.files.length > 0) {
                                    setFile(e.target.files[0]);
                                    setOpenCropper(true);
                                }
                            }} />
                            {fileUploadLoading && <div className='absolute w-full h-full rounded-full backdrop-blur-[5px] bg-[#101a326c] flex items-center justify-center'>
                                <Spinner size={50} />
                            </div>}
                        </div>
                        <div className='mb-3'>
                            <input type="text" className='input-control' placeholder='Write your name' required onChange={e => setUserData({ ...userData, userName: e.target.value })} value={userData.userName} disabled={loading || !user} />
                        </div>
                        <div className='mb-4'>
                            <input type="email" className='input-control' placeholder='Write your email' required onChange={e => setUserData({ ...userData, email: e.target.value })} value={userData.email} disabled={loading || !user} />
                        </div>
                        <div className='flex justify-end'>
                            <button className="btn btn-primary" onClick={handleUserDataUpdate} disabled={loading || !user} >{loading ? "Saving canges..." : "Save changes"}</button>
                        </div>
                    </section>
                    <section className='w-[100%] p-3 bg-gray-700 rounded-xl mb-4'>
                        <h5 className='font-semibold text-gray-300 mb-3'>Update your password</h5>
                        <div className='mb-3'>
                            <input type="password" className='input-control' placeholder='Enter current password' onChange={e => setPassword({ ...password, currentPassword: e.target.value })} />
                        </div>
                        <div className='mb-2'>
                            <input type="password" className='input-control' placeholder='Enter new password' onChange={e => setPassword({ ...password, newPassword: e.target.value })} />
                        </div>
                        <div className='mb-4'>
                            <span className='text-gray-400'>Forgot password? <Link href={'/update-password'} className='text-blue-400'>Reset <span><i className="ri-arrow-right-long-fill"></i></span></Link></span>
                        </div>
                        <div className='flex justify-end'>
                            <button className="btn btn-primary" onClick={handlePasswordUpdate} disabled={loading || !user} >{loading ? "Saving canges..." : "Save changes"}</button>
                        </div>
                    </section>
                    <section className='w-[100%] p-3 bg-gray-700 rounded-xl mb-4'>
                        <button className="btn text-red-400 p-3 px-5 rounded-xl flex items-center gap-2 bg-gray-800" onClick={handleLogOut} disabled={logoutLoading}><span>{logoutLoading ? "Logging out..." : "Log out"}</span><span><i className="ri-logout-box-r-line"></i></span></button>
                    </section>

                    <p className='text-center text-gray-500 text-[0.9rem] mt-7 mb-3'>
                        &copy; {new Date().getFullYear()} Buckwise
                        <span><i className="bi bi-dot"></i></span>
                        <Link href={'/privacy-policy'}>Privacy policy</Link>
                        <span><i className="bi bi-dot"></i></span>
                        <Link href={'/terms-conditions'}>Terms & conditions</Link>
                    </p>
                </div>

                <ImageCropper openState={openCropper} onClose={() => setOpenCropper(false)} file={file} onCropComplete={croppedFile => setCroppedFile(croppedFile)} />
            </div>
        </AuthenticatedContainer>
    )
}

const ImageCropper = ({ openState, onClose, file, onCropComplete }: { openState: boolean, onClose: () => void, file: File | null, onCropComplete: (croppedFile: File | null) => void }) => {
    const [imageSrc, setImageSrc] = useState<string>('');
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    // Load the file as data URL
    useEffect(() => {
        if (!file) return;
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            setImageSrc(reader.result as string);
        };
    }, [file]);

    const onCropDone = async () => {
        if (!croppedAreaPixels) return;
        const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
        const croppedFile = new File([croppedBlob], `cropped_${file?.name}`, { type: file?.type });
        onCropComplete(croppedFile);
        onClose();
        setImageSrc('');
    };

    const onCropCompleteHandler = useCallback((_: Area, croppedPixels: Area) => {
        setCroppedAreaPixels(croppedPixels);
    }, []);

    return (
        <PopupBox openState={openState} onClose={onClose} >
            <div >
                <div className='md:w-[80vw] w-[90vw] md:h-[65svh] h-[80svh] overflow-y-auto relative mb-3'>
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropCompleteHandler}
                    />
                </div>
                <div className='flex items-center justify-end gap-3'>
                    <button className='btn bg-gray-700 p-[10px] rounded-[10px]' onClick={onClose}>Cancel</button>
                    <button className='btn btn-primary' onClick={onCropDone}>Crop & save</button>
                </div>
            </div>
        </PopupBox>
    )
}

async function getCroppedImg(imageSrc: string, crop: any): Promise<Blob> {
    const image = new Image();
    image.src = imageSrc;
    await new Promise((resolve) => (image.onload = resolve));

    const canvas = document.createElement('canvas');
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d')!;

    ctx.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        crop.width,
        crop.height
    );

    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            if (blob) resolve(blob);
        }, 'image/jpeg');
    });
}

export default ProfilePage