import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/baseR4';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/fhir+json',
    'Accept': 'application/fhir+json',
  },
  transformResponse: [
    (data) => {
      if (typeof data === 'string') {
        try {
          return JSON.parse(data);
        } catch (e) {
          return data;
        }
      }
      return data;
    }
  ]
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('patientId');
      window.location.href = '/login';
    }
    
    const errorMessage = error.response?.data?.message 
      || error.response?.data?.issue?.[0]?.diagnostics
      || error.message 
      || 'An error occurred';
    
    return Promise.reject(new Error(errorMessage));
  }
);

export default apiClient;
export { API_BASE_URL };
