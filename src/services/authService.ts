import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('uncloud-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('uncloud-token');
      localStorage.removeItem('uncloud-user');
      // Redirect to sign in page
      window.location.href = '/sign-in';
    }
    return Promise.reject(error);
  }
);

export interface SignUpData {
  email: string;
  password: string;
  confirmPassword: string;
  name?: string;
  age?: number;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  age?: number;
  preferences: {
    language: string;
    reminders: boolean;
    darkMode: boolean;
  };
  isVerified: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
  };
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

class AuthService {
  // Sign up
  async signUp(userData: SignUpData): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/signup', userData);
      
      if (response.data.success && response.data.data) {
        const { user, token } = response.data.data;
        this.setAuthData(user, token);
      }
      
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  // Sign in
  async signIn(credentials: SignInData): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/signin', credentials);
      
      if (response.data.success && response.data.data) {
        const { user, token } = response.data.data;
        this.setAuthData(user, token);
      }
      
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      await api.post('/auth/signout');
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      this.clearAuthData();
    }
  }

  // Get current user profile
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await api.get('/auth/me');
      if (response.data.success) {
        return response.data.data.user;
      }
      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // Update user profile
  async updateProfile(profileData: Partial<User>): Promise<AuthResponse> {
    try {
      const response = await api.put('/auth/profile', profileData);
      
      if (response.data.success && response.data.data) {
        const { user } = response.data.data;
        this.updateStoredUser(user);
      }
      
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('uncloud-token');
    const user = localStorage.getItem('uncloud-user');
    return !!(token && user);
  }

  // Get stored user
  getStoredUser(): User | null {
    try {
      const userString = localStorage.getItem('uncloud-user');
      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      console.error('Error parsing stored user:', error);
      return null;
    }
  }

  // Get stored token
  getStoredToken(): string | null {
    return localStorage.getItem('uncloud-token');
  }

  // Set authentication data in localStorage
  private setAuthData(user: User, token: string): void {
    localStorage.setItem('uncloud-user', JSON.stringify(user));
    localStorage.setItem('uncloud-token', token);
  }

  // Update stored user data
  private updateStoredUser(user: User): void {
    localStorage.setItem('uncloud-user', JSON.stringify(user));
  }

  // Clear authentication data
  private clearAuthData(): void {
    localStorage.removeItem('uncloud-user');
    localStorage.removeItem('uncloud-token');
  }

  // Handle API errors
  private handleError(error: any): AuthResponse {
    console.error('Auth API Error:', error);
    
    if (error.code === 'ERR_NETWORK') {
      return {
        success: false,
        message: 'Network error: Unable to connect to the server. Please check if the server is running on port 5001.'
      };
    }
    
    if (error.response?.data) {
      return error.response.data;
    }
    
    if (error.message) {
      return {
        success: false,
        message: error.message
      };
    }
    
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.'
    };
  }
}

export const authService = new AuthService();
export default api;