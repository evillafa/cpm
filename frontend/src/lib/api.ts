/**
 * API utility functions with timeout handling
 */

// Default timeout for API requests (in milliseconds)
const DEFAULT_TIMEOUT = 10000;

/**
 * Fetch with timeout functionality
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @param timeout - Timeout in milliseconds
 * @returns Promise with response
 */
export async function fetchWithTimeout(
  url: string, 
  options: RequestInit = {}, 
  timeout: number = DEFAULT_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const { signal } = controller;
  
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeout}ms`);
    }
    throw error;
  }
}

/**
 * POST request with JSON data and timeout
 * @param url - The URL to post to
 * @param data - The data to send
 * @param timeout - Timeout in milliseconds
 * @returns Promise with parsed JSON response
 */
export async function postJson<T = any, R = any>(
  url: string, 
  data: T, 
  timeout: number = DEFAULT_TIMEOUT
): Promise<R> {
  const response = await fetchWithTimeout(
    url,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    },
    timeout
  );
  
  const responseData = await response.json();
  
  if (!response.ok) {
    throw new Error(responseData.error || `Request failed with status ${response.status}`);
  }
  
  return responseData;
}

/**
 * GET request with timeout
 * @param url - The URL to fetch
 * @param timeout - Timeout in milliseconds
 * @returns Promise with parsed JSON response
 */
export async function getJson<R = any>(
  url: string, 
  timeout: number = DEFAULT_TIMEOUT
): Promise<R> {
  const response = await fetchWithTimeout(url, {}, timeout);
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }
  
  return data;
}
