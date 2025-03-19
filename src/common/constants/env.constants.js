import dotenv from 'dotenv';

dotenv.config();

const env = {
    PORT: process.env.PORT,
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    API_URL: process.env.API_URL,
    TOKEN_IDX: process.env.TOKEN_IDX,
    TOKEN_DLA: process.env.TOKEN_DLA,
    TOKEN_VOW: process.env.TOKEN_VOW,
    MAILING_USERNAME: process.env.MAILING_USERNAME,
    MAILING_PASSWORD: process.env.MAILING_PASSWORD,
    GOOGLE_DRIVE_FOLDER_ID: process.env.GOOGLE_DRIVE_FOLDER_ID
}

export default env;