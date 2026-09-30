import { api } from './client';

export const referralsApi = {
  // Patient
  getPatientReferrals: () => api.get<any>('/patient/referrals'),
  getPatientReferralById: (id: string) => api.get<any>(`/patient/referrals/${id}`),

  // Doctor
  createReferral: (data: any) => api.post<any>('/doctor/referrals', data),
  getDoctorReferrals: () => api.get<any>('/doctor/referrals'),
  getDoctorReferralById: (id: string) => api.get<any>(`/doctor/referrals/${id}`),
  getIncomingReferrals: () => api.get<any>('/doctor/incoming-referrals'),
  getIncomingReferralById: (id: string) => api.get<any>(`/doctor/incoming-referrals/${id}`),
  acceptReferral: (id: string, data: any) => api.patch<any>(`/doctor/incoming-referrals/${id}/accept`, data),
  rejectReferral: (id: string, data: any) => api.patch<any>(`/doctor/incoming-referrals/${id}/reject`, data),
  scheduleReferral: (id: string, data: any) => api.patch<any>(`/doctor/referrals/${id}/schedule`, data),
  attendReferral: (id: string) => api.patch<any>(`/doctor/referrals/${id}/attend`, {}),
  completeReferral: (id: string, data: any) => api.patch<any>(`/doctor/referrals/${id}/complete`, data),
  closeReferral: (id: string, data: any) => api.patch<any>(`/doctor/referrals/${id}/close`, data),
};
