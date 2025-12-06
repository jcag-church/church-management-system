import axios from 'axios';
import { toast } from 'sonner';
import { signOut } from "supertokens-auth-react/recipe/session";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // If we're already on the auth page, don't do anything
      if (window.location.pathname.startsWith('/auth')) {
        return Promise.reject(error);
      }

      try {
        await signOut();
        window.location.href = '/auth';
        toast.error('Session expired. Please log in again.');
      } catch (e) {
        console.error('Error signing out:', e);
        window.location.href = '/auth';
      }
      return Promise.reject(error);
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action.');
      return Promise.reject(error);
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      // Don't show toast for 404 on /me endpoint as it's handled in App.tsx
      if (!originalRequest.url.includes('/users/me')) {
        toast.error('Resource not found.');
      }
      return Promise.reject(error);
    }

    // Handle 500 Server Error
    if (error.response?.status >= 500) {
      toast.error('Internal server error. Please try again later.');
      return Promise.reject(error);
    }

    // Handle other errors
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    // Avoid showing generic "Network Error" if possible, or make it friendlier
    if (message === 'Network Error') {
      toast.error('Unable to connect to the server. Please check your internet connection.');
    } else {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default api;
