import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback, 
} from 'react';

interface UserType {
  name: string;
  email: string;
  profile: string; 
}

interface AuthContextType {
  user: UserType | null;
  loading: boolean;
  register: (formData: FormData) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  profile: () => Promise<void>; 
  // refresh is intentionally not exposed directly as it's an internal mechanism
}

// Create the context with an initial undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props for the AuthProvider component
interface AuthProviderProps {
  children: React.ReactNode;
}

// The main AuthProvider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true); // True initially as we're checking auth status

  // Helper function to construct API URLs
  const getApiUrl = useCallback((path: string) => {
    return `${import.meta.env.VITE_API_URL}${path}`;
  }, []);

  /**
   * Fetches the user's profile from the backend.
   * This function is central to determining the current authenticated state.
   */
  const profile = useCallback(async () => {
    try {
      const res = await fetch(getApiUrl('/auth/profile'), {
        credentials: 'include', // Important for sending cookies
      });

      if (res.status === 401) {
        // If profile fetch returns 401, it means the access token is likely expired or invalid.
        // Attempt to refresh the tokens.
        // console.log('Access token expired or invalid. Attempting to refresh...');
        const refreshRes = await fetch(getApiUrl('/auth/refresh'), {
          method: 'POST',
          credentials: 'include',
        });

        if (!refreshRes.ok) {
          // If refresh token is invalid or expired, or server error on refresh.
          // console.error('Refresh failed. User must re-authenticate.');
          // Clear user and local storage, then throw error to indicate unauthenticated state.
          setUser(null);
          localStorage.removeItem('meetingId');
          throw new Error('Authentication required: Could not refresh token.');
        }

        // If refresh was successful, retry fetching the profile with the new access token.
        const retryProfileRes = await fetch(getApiUrl('/auth/profile'), {
          credentials: 'include',
        });

        if (!retryProfileRes.ok) {
          // If profile fetch still fails after refresh, something is wrong.
          const data = await retryProfileRes.json();
          console.error('Profile fetch failed even after refresh:', data.message || 'Unknown error');
          setUser(null);
          localStorage.removeItem('meetingId');
          throw new Error(data.message || 'Failed to fetch profile after token refresh.');
        }

        const data = await retryProfileRes.json();
        setUser({ name: data.name, email: data.email, profile: data.profile });
        // console.log('Profile successfully fetched after refresh.');

      } else if (!res.ok) {
        // Handle other non-401 errors from profile fetch
        const data = await res.json();
        console.error('Profile fetch failed:', data.message || 'Unknown error');
        setUser(null);
        localStorage.removeItem('meetingId');
        throw new Error(data.message || 'Failed to fetch profile.');
      } else {
        // Profile fetch was successful with existing access token
        const data = await res.json();
        setUser({ name: data.name, email: data.email, profile: data.profile });
        // console.log('Profile successfully fetched with existing token.');
      }
    } catch (error: any) {
      // Catch any network errors or errors re-thrown from above
      console.error('Error during profile fetching process:', error.message);
      setUser(null); // Ensure user state is null on any profile error
      localStorage.removeItem('meetingId'); // Clear any lingering session data
      localStorage.removeItem('host');
      // Re-throw to allow callers (like useEffect) to handle or log
      throw error;
    }
  }, [getApiUrl]); // Dependency on getApiUrl

  /**
   * Handles user registration.
   */
  const register = useCallback(async (formData: FormData) => {
    try {
      const res = await fetch(getApiUrl('/auth/register'), {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Registration failed');
      }
      // console.log('User registered successfully.');
    } catch (error: any) {
      // console.error('Registration error:', error.message);
      throw error;
    }
  }, [getApiUrl]);

  /**
   * Handles user login.
   * On successful login, it calls `profile()` to update the user state.
   */
  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch(getApiUrl('/auth/login'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Login failed');
      }
      // console.log('Login successful. Fetching profile...');
      await profile(); // Fetch user profile after successful login
    } catch (error: any) {
      // console.error('Login error:', error.message);
      throw error;
    }
  }, [getApiUrl, profile]);

  /**
   * Handles user logout.
   * Clears user state and any related local storage.
   */
  const logout = useCallback(async () => {
    try {
      // Send logout request to backend to clear server-side session/revoke refresh token
      await fetch(getApiUrl('/auth/logout'), {
        method: 'POST',
        credentials: 'include',
      });
      // console.log('Logout request sent to backend.');
    } catch (error: any) {
      // Log the error but proceed with client-side cleanup
      console.error('Error sending logout request:', error.message);
    } finally {
      // Always clear client-side state regardless of backend success
      setUser(null);
      localStorage.removeItem('meetingId');
      // console.log('Client-side logout complete.');
    }
  }, [getApiUrl]);

  /**
   * useEffect to perform initial authentication check on component mount.
   */
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true); // Start loading
      try {
        await profile(); // Attempt to fetch user profile
      } catch (error) {
        console.log('Initial authentication check failed or user not logged in.', error);
        // User state already set to null by `profile` if error occurs
      } finally {
        setLoading(false); // End loading
      }
    };

    initAuth();
  }, [profile]); // Dependency on `profile` (which is useCallback memoized)

  // Provide the context value to children
  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, profile }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to consume the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};