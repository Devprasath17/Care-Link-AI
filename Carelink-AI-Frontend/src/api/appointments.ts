import { api } from './client';

export const appointmentsApi = {
  // Patient
  getPatientAppointments: () => api.get<any>('/patient/appointments'),
  getPatientAppointmentById: (id: string) => api.get<any>(`/patient/appointments/${id}`),
  createAppointment: (data: any) => api.post<any>('/appointments', data),
  cancelPatientAppointment: (id: string) => api.patch<any>(`/patient/appointments/${id}/cancel`, {}),
  reschedulePatientAppointment: (id: string, data: any) => api.patch<any>(`/patient/appointments/${id}/reschedule`, data),

  // Doctor
  getDoctorAppointments: () => api.get<any>('/doctor/appointments'),
  getDoctorAppointmentById: (id: string) => api.get<any>(`/doctor/appointments/${id}`),
  updateDoctorAppointmentStatus: (id: string, data: any) => api.patch<any>(`/doctor/appointments/${id}/status`, data),
};
