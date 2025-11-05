const ACCESS_TOKEN_KEY = 'accessToken';

export function saveAccessToken(token) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function removeAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

/**
 * Decode JWT token and extract user information
 * @returns {Object|null} User object or null if invalid
 */
export function getUserFromToken() {
  const token = getAccessToken();
  
  if (!token) {
    return null;
  }
  
  try {
    // JWT format: header.payload.signature
    const parts = token.split('.');
    
    if (parts.length !== 3) {
      console.error('Invalid token format');
      return null;
    }
    
    // Decode base64 payload
    const payload = JSON.parse(atob(parts[1]));
    
    // Extract common JWT claims
    // Adjust field names based on your backend JWT structure
    return {
      id: payload.sub || payload.userId || payload.id,
      name: payload.name || payload.userName || payload.fullName || 'User',
      email: payload.email || '',
      role: payload.role || payload.roles?.[0] || 'User',
      exp: payload.exp,
      iat: payload.iat
    };
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

/**
 * Check if token is expired
 * @returns {boolean} True if expired
 */
export function isTokenExpired() {
  const user = getUserFromToken();
  
  if (!user || !user.exp) {
    return true;
  }
  
  const exp = user.exp * 1000; // Convert to milliseconds
  return Date.now() >= exp;
}