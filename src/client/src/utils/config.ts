/**
 * Application configuration
 */

export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  env: import.meta.env.VITE_ENV || 'development',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
};
