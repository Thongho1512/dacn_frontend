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
 * Backend JWT claims structure:
 * - ClaimTypes.NameIdentifier: nguoiDung.Id
 * - ClaimTypes.Name: nguoiDung.TenDangNhap
 * - ClaimTypes.Role: tenVaiTro
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
    
    console.log('JWT Payload:', payload); // Debug log
    
    // Extract claims based on backend structure
    // Backend uses standard claim types:
    // - http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier
    // - http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name
    // - http://schemas.microsoft.com/ws/2008/06/identity/claims/role
    
    const nameIdentifierClaim = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';
    const nameClaim = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name';
    const roleClaim = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
    
    return {
      id: payload[nameIdentifierClaim] || payload.sub || payload.userId || payload.id,
      name: payload[nameClaim] || payload.name || payload.userName || payload.TenDangNhap || 'User',
      username: payload[nameClaim] || payload.userName || payload.TenDangNhap,
      role: payload[roleClaim] || payload.role || 'User',
      exp: payload.exp,
      iat: payload.iat,
      iss: payload.iss,
      aud: payload.aud
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
  const now = Date.now();
  
  console.log('Token expiry check:', {
    expiresAt: new Date(exp),
    now: new Date(now),
    isExpired: now >= exp
  });
  
  return now >= exp;
}

/**
 * Get token expiry time
 * @returns {Date|null} Expiry date or null
 */
export function getTokenExpiry() {
  const user = getUserFromToken();
  
  if (!user || !user.exp) {
    return null;
  }
  
  return new Date(user.exp * 1000);
}

/**
 * Get time until token expires
 * @returns {number|null} Milliseconds until expiry or null
 */
export function getTimeUntilExpiry() {
  const expiry = getTokenExpiry();
  
  if (!expiry) {
    return null;
  }
  
  return expiry.getTime() - Date.now();
}