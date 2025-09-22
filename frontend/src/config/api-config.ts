/**
 * Shared API configuration for both WebSocket and HTTP endpoints
 * Automatically detects whether to use localhost or int-arch-backend based on environment
 */

// Detect if we're running in a test environment
const isE2ETest = typeof window !== 'undefined' && 
  (window.navigator.userAgent.includes('Playwright') || 
   window.navigator.userAgent.includes('HeadlessChrome'));

// Check if we're running in a Docker container (for e2e tests)
const isRunningInDocker = typeof window !== 'undefined' && 
  (window.location.hostname !== 'localhost' && 
   window.location.hostname !== '127.0.0.1');

// Check for test environment variables
const hasTestEnvVar = typeof process !== 'undefined' && 
  (process.env.NODE_ENV === 'test' || 
   process.env.NEXT_PUBLIC_IS_E2E === 'true');

// Host configurations
const HOSTS = {
  e2e: 'infra-ti-backend',
  development: 'localhost'
};

// Port configurations
const PORTS = {
  backend: '3001'
};

/**
 * Get the appropriate backend host based on environment
 */
export const getBackendHost = (): string => {
  if (isE2ETest || isRunningInDocker || hasTestEnvVar) {
    console.log('Using E2E test backend host: ' + HOSTS.e2e);
    return HOSTS.e2e;
  }
  
  console.log('Using development backend host: ' + HOSTS.development);
  return HOSTS.development;
};

/**
 * Get WebSocket URL for the backend
 */
export const getWebSocketUrl = (): string => {
  const host = getBackendHost();
  return `ws://${host}:${PORTS.backend}`;
};

/**
 * Get HTTP API URL for the backend
 */
export const getApiUrl = (path: string = ''): string => {
  const host = getBackendHost();
  const baseUrl = `http://${host}:${PORTS.backend}`;
  
  // Add path if provided, ensuring proper formatting
  if (path) {
    // Make sure path starts with / but the final URL doesn't have //
    const formattedPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${formattedPath}`;
  }
  
  return baseUrl;
};
