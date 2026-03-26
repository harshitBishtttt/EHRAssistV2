import apiClient from '../config/api';

const createResourceService = (resourceType) => ({
  getById: async (id) => {
    const endpoint = resourceType === 'Observation' ? `/${resourceType}/search?_id=${id}` : `/${resourceType}/${id}`;
    const response = await apiClient.get(endpoint);
    return response.data;
  },

  search: async (params) => {
    const endpoint = resourceType === 'Observation' ? `/${resourceType}/search` : `/${resourceType}`;
    const response = await apiClient.get(endpoint, { params });
    return response.data;
  },

  create: async (data) => {
    const response = await apiClient.post(`/${resourceType}`, JSON.stringify(data));
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.put(`/${resourceType}/${id}`, JSON.stringify(data));
    return response.data;
  },

  delete: async (id) => {
    await apiClient.delete(`/${resourceType}/${id}`);
  }
});

export const conditionService = createResourceService('Condition');
export const encounterService = createResourceService('Encounter');
export const observationService = createResourceService('Observation');
export const procedureService = createResourceService('Procedure');
export const medicationRequestService = createResourceService('MedicationRequest');
export const allergyIntoleranceService = createResourceService('AllergyIntolerance');
export const immunizationService = createResourceService('Immunization');
export const serviceRequestService = createResourceService('ServiceRequest');
export const appointmentService = createResourceService('Appointment');
export const documentReferenceService = createResourceService('DocumentReference');
export const diagnosticReportService = createResourceService('DiagnosticReport');
export const practitionerService = createResourceService('Practitioner');
