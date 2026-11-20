/**
 * API and Microservice Configuration
 * Configure base URLs for your upcoming backend / microservices.
 */

export const ENV = {
  DEV: {
    API_BASE_URL: 'http://localhost:5000/api', // Replace with local backend or LAN IP for physical device
    AUTH_SERVICE_URL: 'http://localhost:5001/api/auth',
    MEDIA_SERVICE_URL: 'http://localhost:5002/api/media',
  },
  STAGING: {
    API_BASE_URL: 'https://staging-api.adstreet.com/api',
    AUTH_SERVICE_URL: 'https://staging-auth.adstreet.com/api/auth',
    MEDIA_SERVICE_URL: 'https://staging-media.adstreet.com/api/media',
  },
  PRODUCTION: {
    API_BASE_URL: 'https://api.adstreet.com/api',
    AUTH_SERVICE_URL: 'https://auth.adstreet.com/api/auth',
    MEDIA_SERVICE_URL: 'https://media.adstreet.com/api/media',
  },
};

// Current Active Environment
export const ACTIVE_ENV = __DEV__ ? ENV.DEV : ENV.PRODUCTION;
