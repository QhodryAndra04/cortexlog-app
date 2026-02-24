import { verifyToken } from './auth';

export function authenticateRequest(req) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { authenticated: false, user: null, error: 'No token provided' };
    }
    
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return { authenticated: false, user: null, error: 'Invalid token' };
    }
    
    return { authenticated: true, user: decoded, error: null };
  } catch (error) {
    console.error('Authentication error:', error);
    return { authenticated: false, user: null, error: error.message };
  }
}
