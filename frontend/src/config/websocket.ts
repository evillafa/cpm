/**
 * WebSocket configuration
 * 
 * This file is kept for backward compatibility.
 * All API URL configuration is now centralized in api-config.ts
 */

import { getWebSocketUrl as getConfigWebSocketUrl } from './api-config';

// Re-export the WebSocket URL getter from the shared config
export const getWebSocketUrl = getConfigWebSocketUrl;
