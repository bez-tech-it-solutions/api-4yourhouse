import propertiesJob from './properties/index.js';

// Initialize all cron jobs
const initCronJobs = () => {
    console.log("Starting Cron Jobs...");
    propertiesJob();
};

export default initCronJobs;