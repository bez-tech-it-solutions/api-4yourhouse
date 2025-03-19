export const roleGuard = (role) => {
    return function(request, response, next) {
        try {
            if (role === request?.user.role) return next();
            response.status(403).json({ status: 403, message: "Forbidden. You don't have permission to access this resource" });
        } catch (error) {
            response.status(500).json({ status: 500, message: error.message });
        }
    };
}