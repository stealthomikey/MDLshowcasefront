// custom hook to manage user authentication 
import { useState, useEffect, useCallback } from 'react';
import { User, AuthStatus } from '../types/auth'; 

// url for api
const API_BASE_URL = 'http://localhost:8000'; 

// custom hook to get the users infromation via the cookies 
const useAuthStatus = (): AuthStatus => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // fetch the users data from the backend
  const fetchUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/user/me`, {
        method: 'GET',
        credentials: 'include', 
      });

      if (response.ok) {
        const userData: User = await response.json(); 
        setUser(userData);
      } else if (response.status === 401) {
        // User is not authenticated
        setUser(null);
      } else {
        const errorData = await response.json();
        // get error info
        throw new Error(errorData.detail || `Failed to fetch user data: ${response.status}`);
      }
    } catch (err: any) { 
      console.error("Error fetching user data:", err);
      setError(err.message || "An unexpected error occurred.");
      setUser(null); // set user is null on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { user, isLoading, error, refetchUser: fetchUser };
};

export default useAuthStatus;