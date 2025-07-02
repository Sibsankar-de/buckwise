import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const CLOUD_FOLDER = 'money_manager_profile'

export const uploadToCloudinary = async (buffer: Buffer, filename: string): Promise<{ url: string; public_id: string }> => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                folder: CLOUD_FOLDER,
                public_id: filename.split('.').slice(0, -1).join(''), // remove extension
                resource_type: 'auto',
            },
            (error, result) => {
                if (error) return reject(error);
                if (result) {
                    resolve({
                        url: result.secure_url,
                        public_id: result.public_id,
                    });
                }
            }
        )
            .end(buffer);
    });
};

const getPublicIdFromLUrl = (url: string) => {
    const regex = /\/(?:v\d+\/)?([^\/]+)\.[a-zA-Z]+$/;
    const match = url?.match(regex);
    return match ? match[1] : null;
}

export const deleteFromCloudinary = async (fileUrl: string) => {
    const publicId = getPublicIdFromLUrl(fileUrl)
    if (!publicId) return null
    try {
        await cloudinary.uploader.destroy(publicId)

    } catch (error) {
        console.error(400, "Failed deletion from Cloudinary")
    }

}