import apiClient from '../config/api';

export const patientService = {
  getById: async (id) => {
    const response = await apiClient.get(`/Patient/${id}`);
    return response.data;
  },

  search: async (params) => {
    const response = await apiClient.get('/Patient', { params });
    return response.data;
  },

  update: async (id, patientData) => {
    const response = await apiClient.put(`/Patient/${id}`, JSON.stringify(patientData));
    return response.data;
  },

  create: async (patientData) => {
    const response = await apiClient.post('/Patient', JSON.stringify(patientData));
    return response.data;
  },

  delete: async (id) => {
    await apiClient.delete(`/Patient/${id}`);
  }
};
