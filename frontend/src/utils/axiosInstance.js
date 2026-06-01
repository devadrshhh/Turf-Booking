import api from '../api/api';

/**
 * 🔄 Backwards-Compatible Axios Instance Wrapper
 * 
 * Re-exports the production-ready api instance configured in src/api/api.js.
 * This guarantees zero breaking changes across all active pages (Dashboard, Bookings, etc.)
 * while migrating the application to full environment variable configurations.
 */
const axiosInstance = api;

export default axiosInstance;

