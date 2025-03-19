import { createReadStream } from 'fs';
import { google } from 'googleapis';
import env from '../constants/env.constants.js';

export const auth = new google.auth.GoogleAuth({
    keyFile: 'gd.json',
    scopes: 'https://www.googleapis.com/auth/drive'
});

const drive = google.drive({ version: 'v3', auth });


// ========== Upload file to Google Drive ==========
export const uploadFileOnCloud = async (filePath, fileName) => {
    const requestBody = { name: fileName, parents: [env.GOOGLE_DRIVE_FOLDER_ID] };
    const media = { mineType: 'application/octet-stream', body: createReadStream(filePath) };

    try {
        return (await drive.files.create({ requestBody, media, fields: 'id' })).data;
    } catch (error) {
        return { status: 500, error }
    }
}


// ========== Get file from Google Drive ==========
export const getFileFromCloud = async (fileId) => {
    try {
        return (await drive.files.get({ fileId, fields: '*' })).data;
    } catch (error) {
        return { status: 500, error };
    }
}


// ========== Delete file from Google Drive ==========
export const deleteFileFromCloud = async (fileId) => {
    try {
        await drive.files.delete({ fileId });
    } catch (error) {
        console.error('Error deleting file from Google Drive:', error);
        throw error;
    }
}