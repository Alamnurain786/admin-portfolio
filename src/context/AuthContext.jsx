// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
// Consider adding a JWT decoding library if you want to check token expiration client-side
// import { jwtDecode } from "jwt-decode"; // Example: yarn add jwt-decode or npm install jwt-decode

// Create context with null default value
const AuthContext = createContext(null);

// API base URL from environment variables or fallback to localhost
const API_BASE_URL =
  import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5000/api';

/**
 * AuthProvider Component - Manages authentication state
 * Provides login, logout functionality and authentication state to child components
 */
export const AuthProvider = ({ children }) => {
  // State for user data, JWT token, and loading status
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Initialize auth state from localStorage on component mount
  useEffect(() => {
    // console.log("AuthContext: Initializing useEffect to check localStorage.");

    const loadUserFromStorage = () => {
      const storedToken = localStorage.getItem('adminToken');
      const storedUser = localStorage.getItem('adminUser');

      if (storedToken && storedUser) {
        try {
          // Parse user data from localStorage
          const parsedUser = JSON.parse(storedUser);

          // Validate token before setting state
          if (isTokenValid(storedToken, parsedUser)) {
            setUser(parsedUser);
            setToken(storedToken);
            // console.log("AuthContext: Found and validated stored token and user.", {
            //   user: parsedUser,
            //   tokenLength: storedToken.length,
            //   accessLevel: parsedUser?.accessLevel,
            // });
          } else {
            // console.warn(
            //   "AuthContext: Stored token is invalid or expired, clearing storage."
            // );
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            setUser(null);
            setToken(null);
          }
        } catch (e) {
          // console.error(
          //   "AuthContext: Failed to parse stored user data, clearing storage:",
          //   e
          // );
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          setUser(null);
          setToken(null);
        }
      } else {
        // console.log("AuthContext: No stored token or user found.");
        setUser(null);
        setToken(null);
      }

      setLoading(false);
      // console.log(
      //   "AuthContext: Initial loading check complete. Loading state:",
      //   false
      // );
    };

    loadUserFromStorage();

    // Activity tracker to help with session management
    const activityTracker = () => {
      setLastActivity(Date.now());
    };

    // Add activity listeners
    window.addEventListener('click', activityTracker);
    window.addEventListener('keypress', activityTracker);
    window.addEventListener('scroll', activityTracker); // Added scroll for more activity tracking

    // Clean up event listeners
    return () => {
      window.removeEventListener('click', activityTracker);
      window.removeEventListener('keypress', activityTracker);
      window.removeEventListener('scroll', activityTracker);
    };
  }, []);

  // Track user session activity and token state
  useEffect(() => {
    if (!token || !user) return;

    // console.log("AuthContext: Token state changed or activity tracked");

    // Check token validity periodically (every 5 minutes)
    const tokenCheckInterval = setInterval(
      () => {
        // console.log(
        //   `AuthContext: Periodic token check running.`
        // );
        if (!isTokenValid(token, user)) {
          // Pass current user for potential role checks if needed
          // console.warn(
          //   "AuthContext: Token appears invalid or expired during periodic check, logging out."
          // );
          logout('session_expired_periodic_check');
        }
      },
      5 * 60 * 1000
    ); // 5 minutes

    return () => {
      clearInterval(tokenCheckInterval);
    };
  }, [token, user, lastActivity]); // Added user to dependency array

  /**
   * Validates the stored token
   * @param {string} tokenToCheck - Optional token to check (uses state token if not provided)
   * @param {object} currentUser - Optional current user object for context
   * @returns {boolean} - Whether token appears valid
   */
  const isTokenValid = (tokenToCheck, currentUser) => {
    // Added currentUser for context
    try {
      const tokenToValidate =
        tokenToCheck || token || localStorage.getItem('adminToken');

      if (!tokenToValidate) {
        // console.log("AuthContext: Token validation failed - token missing.");
        return false;
      }

      // Basic JWT structure check (3 parts separated by dots)
      const parts = tokenToValidate.split('.');
      if (parts.length !== 3) {
        // console.log(
        //   "AuthContext: Token validation failed - not a valid JWT format."
        // );
        return false;
      }

      // **Optional: More thorough check using jwt-decode (if installed)**
      // try {
      //   const decodedToken = jwtDecode(tokenToValidate);
      //   const currentTime = Date.now() / 1000; // Convert to seconds
      //   if (decodedToken.exp < currentTime) {
      //     // console.log("AuthContext: Token validation failed - token expired.");
      //     return false;
      //   }
      //   // You could also check `nbf` (not before) or `iat` (issued at) if relevant
      //   // Or even if the user ID in the token matches currentUser?._id
      //   // if (currentUser && decodedToken.id !== currentUser._id) {
      //   //   console.log("AuthContext: Token validation failed - user ID mismatch.");
      //   //   return false;
      //   // }
      // } catch (decodeError) {
      //   // console.error("AuthContext: Error decoding token:", decodeError);
      //   return false; // Invalid token if it can't be decoded
      // }

      return true;
    } catch (e) {
      // console.error("AuthContext: Token validation error:", e);
      return false;
    }
  };

  /**
   * Login function with flexible parameters
   * @param {object|string} usernameOrCredentials - Either a credentials object or username string
   * @param {string} passwordParam - Password (used when first param is username string)
   * @returns {Promise<object>} - User data on successful login
   */
  const login = async (usernameOrCredentials, passwordParam) => {
    let username, password;

    if (typeof usernameOrCredentials === 'object') {
      username = usernameOrCredentials.username;
      password = usernameOrCredentials.password;
    } else {
      username = usernameOrCredentials;
      password = passwordParam;
    }

    if (!username || !password) {
      // console.error("AuthContext: Missing username or password", {
      //   username: !!username,
      //   password: !!password,
      // });
      throw new Error('Please provide both username and password');
    }

    // console.log("AuthContext: Attempting login for user:", username);
    setLoading(true); // Set loading true at the start of login attempt

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        username,
        password,
      });

      // --- MODIFIED PART ---
      const responseBody = response.data; // Get the whole response body

      // Check if the backend signaled success and the nested data object exists
      if (!responseBody.success || !responseBody.data) {
        // console.error(
        //   "AuthContext: Login response indicates failure or missing data object.",
        //   responseBody
        // );
        throw new Error(
          responseBody.message ||
            'Login failed: Invalid server response structure.'
        );
      }

      // Extract data from the nested 'data' object
      const {
        token: receivedToken,
        _id,
        username: userDataUsername,
        accessLevel,
      } = responseBody.data;
      // --- END OF MODIFIED PART ---

      // console.log("AuthContext: Login response received:", {
      //   success: responseBody.success,
      //   message: responseBody.message,
      //   userId: _id,
      //   username: userDataUsername,
      //   accessLevel,
      //   tokenReceived: !!receivedToken,
      // });

      if (!receivedToken || !_id || !userDataUsername || !accessLevel) {
        // console.error(
        //   "AuthContext: Missing essential fields (token, _id, username, accessLevel) in login response data."
        // );
        throw new Error(
          'Invalid server response, missing authentication data.'
        );
      }

      const userData = { _id, username: userDataUsername, accessLevel };
      localStorage.setItem('adminToken', receivedToken);
      localStorage.setItem('adminUser', JSON.stringify(userData));

      setUser(userData);
      setToken(receivedToken);
      setLastActivity(Date.now());

      // console.log("AuthContext: Login successful. Auth state updated.", {
      //   userState: userData,
      //   tokenLength: receivedToken.length,
      // });
      setLoading(false);
      return responseBody.data; // Return the nested data object
    } catch (error) {
      setLoading(false);
      // console.error("AuthContext: Login failed:", {
      //   messageFromError: error.message, // This will now include messages from the new Error() throws above
      //   axiosErrorMessage: error.response?.data?.message,
      //   status: error.response?.status,
      //   isAxiosError: error.isAxiosError,
      // });

      if (error.response?.status === 401) {
        throw new Error(
          error.response?.data?.message || 'Invalid username or password'
        );
      } else if (error.response?.status === 429) {
        throw new Error(
          error.response?.data?.message ||
            'Too many login attempts. Please try again later.'
        );
      } else if (
        !error.isAxiosError &&
        error.message.startsWith('Login failed:')
      ) {
        // Catch custom errors thrown above
        throw error;
      } else if (!error.response) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error(
          error.response?.data?.message || 'Login failed. Please try again.'
        );
      }
    }
  };

  /**
   * Refresh the current token
   * @returns {Promise<boolean>} Success state of refresh operation
   */
  const refreshToken = async () => {
    // console.log("AuthContext: Attempting to refresh token");
    if (!token || !user?._id) {
      // console.error(
      //   "AuthContext: Cannot refresh token - no current token or user ID"
      // );
      return false;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        // Assuming your refresh endpoint expects the current token or user identifier
        // Adjust payload as per your backend requirements
        // currentToken: token, // Example
        userId: user._id, // Example
      });

      // **IMPORTANT**: Adjust the following based on your /auth/refresh response structure
      // If it's also nested like the login response:
      if (
        response.data &&
        response.data.success &&
        response.data.data &&
        response.data.data.token
      ) {
        const newToken = response.data.data.token;
        setToken(newToken);
        localStorage.setItem('adminToken', newToken);
        setLastActivity(Date.now());
        // console.log("AuthContext: Token refreshed successfully (nested structure).");
        setLoading(false);
        return true;
      }
      // If it's a direct token response:
      else if (response.data && response.data.token) {
        const newToken = response.data.token;
        setToken(newToken);
        localStorage.setItem('adminToken', newToken);
        setLastActivity(Date.now());
        //  console.log("AuthContext: Token refreshed successfully (direct structure).");
        setLoading(false);
        return true;
      } else {
        // console.error(
        //   "AuthContext: Token refresh failed - no new token in response or unexpected structure", response.data
        // );
        setLoading(false);
        // Optionally logout if refresh fails critically
        // logout("token_refresh_failed");
        return false;
      }
    } catch (error) {
      // console.error("AuthContext: Failed to refresh token:", {
      //   message: error.response?.data?.message || error.message,
      //   status: error.response?.status,
      // });
      setLoading(false);
      // Optionally logout if refresh fails critically
      // logout("token_refresh_failed_error");
      return false;
    }
  };

  /**
   * Logout function - clears state and localStorage
   */
  const logout = (reason = 'user_initiated') => {
    // Added reason for logging
    // console.log(`AuthContext: User logging out. Reason: ${reason}`);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setUser(null);
    setToken(null);
    // Optionally, redirect to login page or show a message
    // window.location.href = '/login'; // Example redirect
  };

  // Create object with all values and functions to expose via context
  const authContextValue = {
    user,
    token,
    isAuthenticated: !!token && isTokenValid(token, user), // More robust isAuthenticated
    loading,
    login,
    logout,
    refreshToken,
    isTokenValid, // Expose for potential external use
  };

  // Provide context to children components
  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use the auth context
 * @returns {object} Auth context value
 * @throws {Error} If used outside of AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined || context === null) {
    // Check for null as well
    // console.error(
    //   "useAuth must be used within an AuthProvider. Context is undefined or null."
    // );
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
