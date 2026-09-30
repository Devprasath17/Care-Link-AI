import { api } from './client';

export const patientApi = {
  getProfile: () => api.get<any>('/patient/profile'),
  updateProfile: (data: any) => api.patch<any>('/patient/profile', data),
  getDashboard: () => api.get<any>('/patient/dashboard'),
  
  // Symptoms
  createSymptomSession: (data: any) => api.post<any>('/patient/symptom-sessions', data),
  getSymptomSessions: () => api.get<any>('/patient/symptom-sessions'),
  getSymptomSessionById: (id: string) => api.get<any>(`/patient/symptom-sessions/${id}`),
  getSymptomsBySessionId: (id: string) => api.get<any>(`/patient/symptom-sessions/${id}/symptoms`),

  // Triage
  getTriageHistory: () => api.get<any>('/patient/triage'),
  getTriageById: (id: string) => api.get<any>(`/patient/triage/${id}`),
};
