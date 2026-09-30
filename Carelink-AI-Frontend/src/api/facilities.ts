import { api } from './client';

export const facilitiesApi = {
  getFacilities: () => api.get<any>('/facilities'),
  getFacilityById: (id: string) => api.get<any>(`/facilities/${id}`),
};
