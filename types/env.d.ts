declare namespace NodeJS {
    interface ProcessEnv {
        PORT?: string;
        CORS_ORIGIN: string;
        MONGODB_URI: string;
        COOKIE_EXPIRY: number;
        ACCESS_TOKEN_SECRET: string;
        REFRESH_TOKEN_SECRET: string;
        ACCESS_TOKEN_EXPIRY: number;
        REFRESH_TOKEN_EXPIRY: number;
        CLOUDINARY_CLOUD_NAME: string;
        CLOUDINARY_API_SECRET: string;
        CLOUDINARY_API_KEY: string;
        OPENROUTER_KEY: string;
        OAUTH_CLIENT_ID: string;
        OAUTH_CLIENT_SECRET: string;
        OAUTH_CLIENT_ORIGIN: string;
        PASSWORD_RESET_TOKEN_SECRET: string;
    }
}