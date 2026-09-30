import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Search, Stethoscope, Filter, User } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { StatusBadge } from '../../components/common/StatusBadge';

import { appointmentsApi } from '../../api/appointments';

export const DoctorAppointments: React.FC = () => {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await appointmentsApi.getDoctorAppointments();
        setAppointments(res.data || []);
      } catch (e) {
        console.error('Failed to load appointments', e);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const filtered = appointments.filter(a => {
    const matchesFilter = filterStatus === 'All' ? true : a.status === filterStatus;
    const matchesSearch = (a.patient_name || a.patientName)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.reason?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-5 animate-fadeIn pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900">Doctor OPD Schedule</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage daily consultation slots, appointment status, and patient intake
          </p>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search patient or symptom..."
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {(['All', 'Confirmed', 'Pending', 'Completed', 'Cancelled'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilterStatus(tab)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              filterStatus === tab
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Appointment Cards */}
      <div className="space-y-3.5">
        {loading ? (
          <div className="text-center py-10 text-xs text-slate-500 font-medium">Loading appointments...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-card">
            <h3 className="text-sm font-bold text-slate-800">No appointments found</h3>
          </div>
        ) : filtered.map(apt => (
          <div
            key={apt.id}
            className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-brand-300 transition-all"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex flex-col items-center justify-center font-bold text-xs shrink-0">
                <span className="text-[10px] uppercase font-semibold text-brand-500">{(apt.appointment_date || apt.date || '').split('-')[1] === '09' ? 'Sep' : 'Oct'}</span>
                <span className="text-sm font-black text-brand-700 leading-none">{(apt.appointment_date || apt.date || '').split('-')[2] || '30'}</span>
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-slate-900">{apt.patient_name || apt.patientName}</h3>
                  <span className="text-xs text-slate-500 font-semibold">{apt.patient_age || apt.patientAge} yrs • {apt.patient_gender || apt.patientGender}</span>
                </div>
                <p className="text-xs text-slate-600"><strong>Chief Complaint:</strong> {apt.reason}</p>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                  <Clock className="w-3.5 h-3.5 text-brand-600" />
                  <span>{apt.appointment_time || apt.time}</span>
                  <span>•</span>
                  <span>{apt.type}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center">
              <StatusBadge status={apt.status} />
              <button
                onClick={() => navigate(`/doctor/consultation?patientId=${apt.patient_id || apt.patientId}&appointmentId=${apt.id}`)}
                className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm flex items-center gap-1.5"
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Consult</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
