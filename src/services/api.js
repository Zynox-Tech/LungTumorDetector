import axios from 'axios';
import { auth } from '../config/firebase';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 120000, // 2 minutes — HuggingFace cold start can be slow
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});

// Request interceptor to add authentication token
api.interceptors.request.use(
  async (config) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          throw new Error('Authentication required. Please sign in again.');
        case 400:
          // Handle structured validation errors
          if (typeof data.detail === 'object') {
            const validationError = data.detail;
            throw new Error(
              validationError.error || 
              validationError.suggestion || 
              'Image validation failed'
            );
          }
          throw new Error(data.detail || 'Invalid request. Please check your input.');
        case 413:
          throw new Error('File too large. Please select a smaller image.');
        case 415:
          throw new Error('Unsupported file type. Please upload a valid medical image.');
        case 500:
          throw new Error(
            (typeof data?.detail === 'string' ? data.detail : null) ||
            'Server error. Please try again in a moment.'
          );
        default:
          throw new Error(data.detail || `Request failed with status ${status}`);
      }
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timed out. The server may be starting up — please try again in 30 seconds.');
    } else if (error.request) {
      throw new Error('Network error. Please check your internet connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error('Request failed. Please try again.');
    }
  }
);

/**
 * Upload image for lung cancer detection
 * @param {File} file - The image file to analyze
 * @param {Object} user - Current authenticated user
 * @returns {Promise<Object>} Analysis results
 */
export const uploadImage = async (file, user) => {
  try {
    // Validate file
    if (!file) {
      throw new Error('No file selected');
    }

    // Create FormData
    const formData = new FormData();
    formData.append('file', file);

    // Log request for debugging
    console.log('Uploading image:', {
      name: file.name,
      size: file.size,
      type: file.type,
      user: user?.email
    });

    // Make request
    const response = await api.post('/predict', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        console.log('Upload progress:', percentCompleted + '%');
      }
    });

    // Validate response
    if (!response.data) {
      throw new Error('No response data received');
    }

    console.log('Analysis completed:', response.data);
    return response.data;

  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

/**
 * Verify authentication token
 * @returns {Promise<Object>} User verification data
 */
export const verifyAuth = async () => {
  try {
    const response = await api.post('/auth/verify');
    return response.data;
  } catch (error) {
    console.error('Auth verification error:', error);
    throw error;
  }
};

/**
 * Get API health status
 * @returns {Promise<Object>} Health status
 */
export const getHealthStatus = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Health check error:', error);
    throw error;
  }
};

/**
 * Test API connection
 * @returns {Promise<boolean>} Connection status
 */
export const testConnection = async () => {
  try {
    await api.get('/');
    return true;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
};

export default api;
