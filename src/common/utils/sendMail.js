import nodemailer from 'nodemailer';
import env from '../constants/env.constants.js';

export const sendMail = async (data) => {
    const transport = nodemailer.createTransport({
        host: "smtp.hostinger.com",
        port: 465, // Use 587 for TLS
        secure: true, // true for 465, false for 587
        auth: {
            user: env.MAILING_USERNAME,
            pass: env.MAILING_PASSWORD
        }
    });

    return await transport.sendMail(data);
};