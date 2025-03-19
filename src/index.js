// Required Dependencies
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import httpErrors from 'http-errors';

// Global Configs
import env from './common/constants/env.constants.js';
import DBConnection from './config/db.config.js';
import initCronJobs from './jobs/jobs.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import generalRoutes from './routes/general.routes.js';
import propertyRoutes from './routes/property.routes.js';

const app = express();

DBConnection(); // Database Connection
initCronJobs(); // Cron Job Initialization

// Global Middlewares
app.use(cors({ origin: env.ALLOWED_ORIGINS || '*' }));
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define Routes
app.use("/v1/", [
    authRoutes,
    userRoutes,
    generalRoutes,
    propertyRoutes
]);

// Error Handler
app.use((request, response, next) => next(httpErrors(404)));
app.use((error, request, response, next) => response.status(error.status || 500).json({ status: error.status || 500, message: error.message }));

// Start Server & Graceful Shutdown
const server = app.listen(env.PORT, () => console.log(`Server running on PORT ${env.PORT}`));

process.on("SIGINT", async () => {
    console.log("Shutting down server...");
    server.close(() => {
        console.log("Server closed. Exiting process...");
        process.exit(0);
    });
});