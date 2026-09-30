import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { api } from '../api/client';
import { patientApi } from '../api/patient';
import { User, UserRole, PatientProfile } from '../types';
import { INITIAL_PATIENT_PROFILE } from '../services/mockData';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  patientProfile: PatientProfile;
  login: (email: string, role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (newRole: UserRole) => void;
  updateProfile: (profile: Partial<PatientProfile>) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('carelink_role');
    return (saved as UserRole) || 'patient';
  });

  const [user, setUser] = useState<User | null>(null);
  const [patientProfile, setPatientProfile] = useState<PatientProfile>(INITIAL_PATIENT_PROFILE);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    try {
      const res = await api.get<{ data: any }>('/auth/me');
      if (res.data) {
        setUser({
          id: res.data.id,
          name: res.data.full_name,
          email: res.data.email,
          role: res.data.role,
          avatarUrl: res.data.avatar_url,
          facilityId: res.data.profile?.facility_id,
          phone: res.data.profile?.phone || '',
          createdAt: res.data.created_at || new Date().toISOString(),
        });
        setRole(res.data.role);
        localStorage.setItem('carelink_role', res.data.role);

        if (res.data.role === 'patient') {
          try {
            const profileRes = await patientApi.getProfile();
            if (profileRes.data) {
              setPatientProfile({
                ...INITIAL_PATIENT_PROFILE, // fallback for missing fields in db
                name: res.data.full_name,
                email: res.data.email,
                phone: res.data.profile.phone,
                avatarUrl: res.data.avatar_url,
                bloodGroup: profileRes.data.blood_group,
                height: `${profileRes.data.height_cm} cm`,
                weight: `${profileRes.data.weight_kg} kg`,
                address: profileRes.data.address,
                language: profileRes.data.preferred_language,
                // map other fields as necessary
              });
            }
          } catch (e) {
            console.error('Failed to load patient profile', e);
          }
        }
      }
    } catch (e) {
      console.error('Failed to fetch /auth/me', e);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchMe();
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchMe();
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const switchRole = (newRole: UserRole) => {
    setRole(newRole);
  };

  const login = async (email: string, requestedRole: UserRole = 'patient') => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: 'carelink123',
    });
    
    if (error) {
       console.error("Supabase login failed", error);
       throw error;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('carelink_role');
  };

  const updateProfile = async (updatedFields: Partial<PatientProfile>) => {
    try {
      const apiPayload: any = {};
      
      if (updatedFields.language) {
        apiPayload.preferred_language = updatedFields.language === 'Tamil' ? 'tamil' : 'english';
      }
      if (updatedFields.bloodGroup) apiPayload.blood_group = updatedFields.bloodGroup;
      if (updatedFields.height) apiPayload.height_cm = parseInt(updatedFields.height, 10);
      if (updatedFields.weight) apiPayload.weight_kg = parseInt(updatedFields.weight, 10);
      if (updatedFields.address) apiPayload.address = updatedFields.address;
      if (updatedFields.emergencyContact) {
        apiPayload.emergency_contact_name = updatedFields.emergencyContact.name;
        apiPayload.emergency_contact_phone = updatedFields.emergencyContact.phone;
      }
      if (updatedFields.allergies) apiPayload.allergies = updatedFields.allergies;
      if (updatedFields.regularMedications) apiPayload.chronic_conditions = updatedFields.regularMedications;

      // Update backend
      await patientApi.updateProfile(apiPayload);
      
      // Update local state
      setPatientProfile(prev => ({
        ...prev,
        ...updatedFields
      }));
    } catch (e) {
      console.error('Failed to update profile', e);
      throw e;
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading CareLink AI...</div>;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        patientProfile,
        login,
        logout,
        switchRole,
        updateProfile,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
