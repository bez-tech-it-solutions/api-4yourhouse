import Users from '../../models/user.model.js';
import { verifyToken } from '../utils/jwt.js';

export const authGuard = async (request, response, next) => {
    try {
		const header = request.headers?.authorization;
        if (!header) return response.status(401).json({ status: 401, message: "Authorization header is missing" });

        const tokenParts = header.split(' ');
        if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') return response.status(401).json({ status: 401, error: "Invalid token format" });

        const token = tokenParts[1];
		if (!token) return response.status(401).json({ status: 401, message: "Access token is missing" });

        const decoded = verifyToken(token);
		const user = await Users.findById(decoded.id);

		if (!user) return response.status(404).json({ status: 404, message: "User not found" });

        request['user'] = user;
		return next();
	} catch (error) {
		response.status(500).json({ status: 500, message: error.message });
	}
}