import { useState, useEffect } from 'react';
import { authService, User, AuthResponse, SignUpData, SignInData } from '../services/authService';

interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signUp: (data: SignUpData) => Promise<AuthResponse>;
  signIn: (data: SignInData) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<AuthResponse>;
  refreshUser: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize authentication state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      
      // Check if user is authenticated
      if (authService.isAuthenticated()) {
        // Get stored user first for immediate UI update
        const storedUser = authService.getStoredUser();
        if (storedUser) {
          setUser(storedUser);
        }
        
        // Then fetch fresh user data from server
        const freshUser = await authService.getCurrentUser();
        if (freshUser) {
          setUser(freshUser);
        } else {
          // If server says user doesn't exist, clear local storage
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (data: SignUpData): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      const response = await authService.signUp(data);
      
      if (response.success && response.data) {
        setUser(response.data.user);
      }
      
      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Sign up failed'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (data: SignInData): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      const response = await authService.signIn(data);
      
      if (response.success && response.data) {
        setUser(response.data.user);
      }
      
      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Sign in failed'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await authService.signOut();
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      // Still clear user state even if server request fails
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      const response = await authService.updateProfile(data);
      
      if (response.success && response.data) {
        setUser(response.data.user);
      }
      
      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Profile update failed'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const freshUser = await authService.getCurrentUser();
      if (freshUser) {
        setUser(freshUser);
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshUser
  };
};