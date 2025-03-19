import jwt from 'jsonwebtoken';
import env from '../constants/env.constants.js';

export const generateToken = (payload) => {
    return jwt.sign(payload, env.JWT_SECRET, {expiresIn: '10d'});
}

export const verifyToken = (token) => {
    return jwt.verify(token, env.JWT_SECRET);
}