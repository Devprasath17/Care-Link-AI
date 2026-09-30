import { api } from './client';

export const consultationsApi = {
  getPatientConsultations: () => api.get<any>('/patient/consultations'),
  getPatientConsultationById: (id: string) => api.get<any>(`/patient/consultations/${id}`),
};

export const prescriptionsApi = {
  getPatientPrescriptions: () => api.get<any>('/patient/prescriptions'),
  getPatientPrescriptionById: (id: string) => api.get<any>(`/patient/prescriptions/${id}`),
};

export const labOrdersApi = {
  getPatientLabOrders: () => api.get<any>('/patient/lab-orders'),
  getPatientLabOrderById: (id: string) => api.get<any>(`/patient/lab-orders/${id}`),
};
