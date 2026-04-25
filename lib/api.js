// lib/api.js - Frontend API utilities

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Register user
export async function registerUser(userData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Register gagal');
    }

    return await response.json();
  } catch (error) {
    console.error('Register error:', error);
    throw error;
  }
}

// Login user
export async function loginUser(username, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login gagal');
    }

    const data = await response.json();
    
    // Save token, user, dan login flag ke localStorage
    if (data.token) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('isLoggedIn', 'true');
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// Logout user
export function logoutUser() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  localStorage.removeItem('isLoggedIn');
}

// Get stored auth token
export function getAuthToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
}

// Get stored user info
export function getStoredUser() {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
  return null;
}

// Check if user is authenticated
export function isAuthenticated() {
  const token = getAuthToken();
  return !!token;
}

// Verify token dengan backend
export async function verifyToken() {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      logoutUser();
      throw new Error('Token invalid atau expired');
    }

    return await response.json();
  } catch (error) {
    console.error('Verify token error:', error);
    logoutUser();
    throw error;
  }
}

// Generic fetch dengan authorization header
export async function authenticatedFetch(url, options = {}) {
  const token = getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  // Jika 401, logout user
  if (response.status === 401) {
    logoutUser();
    window.location.href = '/login';
  }

  return response;
}
