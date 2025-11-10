import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      setIsAuthenticated(true);
    } catch (error) {
      localStorage.removeItem('access_token');
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = (token: string, userData: string) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('userData', userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    isLoading,
    token,
    login,
    logout,
    checkAuthStatus
  };
};