import Admin from '../../models/admin.model.js';
import { verifyToken } from '../utils/jwt.js';

export const adminAuthGuard = async (request, response, next) => {
    try {
		const header = request.headers?.authorization;
        if (!header) return response.status(401).json({ status: 401, message: "Authorization header is missing" });

        const tokenParts = header.split(' ');
        if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') return response.status(401).json({ status: 401, error: "Invalid token format" });

        const token = tokenParts[1];
		if (!token) return response.status(401).json({ status: 401, message: "Access token is missing" });

        const decoded = verifyToken(token);
		const admin = await Admin.findById(decoded.id);

		if (!admin) return response.status(404).json({ status: 404, message: "Admin not found" });

        request['admin'] = admin;
		return next();
	} catch (error) {
		response.status(500).json({ status: 500, message: error.message });
	}
}