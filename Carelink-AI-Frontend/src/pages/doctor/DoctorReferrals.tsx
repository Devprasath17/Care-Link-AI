import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  Building2,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  Stethoscope,
  ChevronRight,
  ShieldCheck,
  User
} from 'lucide-react';
import { referralsApi } from '../../api/referrals';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Timeline } from '../../components/common/Timeline';
import { Referral } from '../../types';

export const DoctorReferrals: React.FC = () => {
  const navigate = useNavigate();
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'All' | 'New' | 'Accepted' | 'Scheduled' | 'Completed' | 'Closed'>('New');
  const [selectedRef, setSelectedRef] = useState<any | null>(null);

  const fetchReferrals = async () => {
    try {
      const res = await referralsApi.getIncomingReferrals();
      setReferrals(res.data || []);
    } catch (e) {
      console.error('Failed to load referrals', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  const getFilteredReferrals = () => {
    switch (activeTab) {
      case 'New': return referrals.filter(r => r.status === 'Received' || r.status === 'Created' || r.status === 'Pending');
      case 'Accepted': return referrals.filter(r => r.status === 'Accepted');
      case 'Scheduled': return referrals.filter(r => r.status === 'Scheduled');
      case 'Completed': return referrals.filter(r => r.status === 'Completed');
      case 'Closed': return referrals.filter(r => r.status === 'Closed');
      default: return referrals;
    }
  };

  const displayed = getFilteredReferrals();

  const handleAccept = async (refId: string) => {
    try {
      await referralsApi.acceptReferral(refId, {});
      alert('Referral accepted. You can now schedule an appointment slot.');
      fetchReferrals();
    } catch (e) {
      console.error(e);
      alert('Failed to accept referral.');
    }
  };

  const handleSchedule = async (refId: string) => {
    try {
      await referralsApi.scheduleReferral(refId, { scheduled_date: '2026-10-02', scheduled_time: '10:00 AM' });
      alert('Referral appointment scheduled for 02 Oct 2026 at 10:00 AM.');
      fetchReferrals();
    } catch (e) {
      console.error(e);
      alert('Failed to schedule referral.');
    }
  };

  const handleClose = async (refId: string) => {
    try {
      await referralsApi.closeReferral(refId, { resolution_notes: 'Closed by doctor' });
      alert('Referral closed successfully.');
      fetchReferrals();
    } catch (e) {
      console.error(e);
      alert('Failed to close referral.');
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-card flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900">Referral Management Inbox</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Incoming digital patient referrals from community health workers & primary triage
          </p>
        </div>
        <span className="bg-brand-50 text-brand-700 text-xs font-bold px-3 py-1 rounded-full border border-brand-200">
          {referrals.filter(r => r.status === 'Received' || r.status === 'Created' || r.status === 'Pending').length} Pending Review
        </span>
      </div>

      {/* Tabs (Matching Updated Doctor Interface Page 1) */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {(['New', 'Accepted', 'Scheduled', 'Completed', 'Closed', 'All'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === tab
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab} ({
              tab === 'New' ? referrals.filter(r => r.status === 'Received' || r.status === 'Created' || r.status === 'Pending').length :
              tab === 'Accepted' ? referrals.filter(r => r.status === 'Accepted').length :
              tab === 'Scheduled' ? referrals.filter(r => r.status === 'Scheduled').length :
              tab === 'Completed' ? referrals.filter(r => r.status === 'Completed').length :
              tab === 'Closed' ? referrals.filter(r => r.status === 'Closed').length : referrals.length
            })
          </button>
        ))}
      </div>

      {/* Referral Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayed.map(ref => (
          <div
            key={ref.id}
            className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-card space-y-3.5 hover:border-brand-300 transition-all flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-slate-900">{ref.patient_name || ref.patientName}</h3>
                    <span className="text-[11px] text-slate-500 font-semibold">{ref.patient_age || ref.patientAge} yrs • {ref.patient_gender || ref.patientGender}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold">{ref.referralCode || ref.id.slice(0,8).toUpperCase()}</p>
                </div>
                <StatusBadge status={ref.priority} size="xs" />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl space-y-1 text-xs">
                <p className="font-bold text-slate-800">{ref.reason}</p>
                <p className="text-slate-500 text-[11px]">From: {ref.from_name || ref.fromName} ({ref.from_facility || ref.fromFacility})</p>
                <p className="text-slate-600 text-[11px] leading-relaxed pt-1">
                  <strong>Summary:</strong> {ref.clinical_summary || ref.clinicalSummary}
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Created: {ref.created_at ? new Date(ref.created_at).toLocaleDateString() : ref.createdDate}</span>
                <StatusBadge status={ref.status} size="xs" />
              </div>
            </div>

            {/* Lifecycle Action Buttons */}
            <div className="pt-2 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => setSelectedRef(ref)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl text-xs transition-colors"
              >
                View Timeline
              </button>

              {(ref.status === 'Received' || ref.status === 'Created' || ref.status === 'Pending') && (
                <button
                  onClick={() => handleAccept(ref.id)}
                  className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-bold py-2 rounded-xl text-xs shadow-sm active:scale-98 transition-all"
                >
                  Accept Referral
                </button>
              )}

              {ref.status === 'Accepted' && (
                <button
                  onClick={() => handleSchedule(ref.id)}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 rounded-xl text-xs shadow-sm"
                >
                  Schedule Slot
                </button>
              )}

              {ref.status === 'Scheduled' && (
                <button
                  onClick={() => navigate(`/doctor/consultation?patientId=${ref.patient_id || ref.patientId}&referralId=${ref.id}`)}
                  className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-bold py-2 rounded-xl text-xs shadow-sm"
                >
                  Start Consult
                </button>
              )}

              {ref.status === 'Completed' && (
                <button
                  onClick={() => handleClose(ref.id)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs"
                >
                  Close Referral
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Referral Details & Lifecycle Modal (Matching Updated Doctor Interface Page 2) */}
      {selectedRef && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-2 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Referral Details
                </span>
                <h3 className="text-base font-black text-slate-900 mt-0.5">{selectedRef.patient_name || selectedRef.patientName}</h3>
                <p className="text-[11px] text-slate-500">{selectedRef.referralCode || selectedRef.id.slice(0,8).toUpperCase()} • {selectedRef.patient_age || selectedRef.patientAge} yrs • {selectedRef.patient_gender || selectedRef.patientGender}</p>
              </div>
              <StatusBadge status={selectedRef.priority} />
            </div>

            {/* Complete Lifecycle Timeline */}
            <div>
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2">
                Referral Lifecycle Timeline
              </h4>
              <Timeline steps={selectedRef.timeline || []} variant="vertical" />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => navigate(`/doctor/consultation?patientId=${selectedRef.patient_id || selectedRef.patientId}&referralId=${selectedRef.id}`)}
                className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-sm"
              >
                Start Consultation
              </button>
              <button
                onClick={() => setSelectedRef(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
