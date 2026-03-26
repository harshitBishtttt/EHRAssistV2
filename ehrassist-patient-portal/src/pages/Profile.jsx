import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { patientService } from '../services/patientService';
import { 
  parsePatientName, parsePatientGender, parsePatientBirthDate, 
  calculateAge, parseAddress, parseTelecom 
} from '../utils/fhirParser';
import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, X, Loader2 } from 'lucide-react';

const Profile = () => {
  const { patientId } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  const { data: patient, isLoading } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => patientService.getById(patientId),
    enabled: !!patientId,
    onSuccess: (data) => {
      setFormData({
        givenName: data.name?.[0]?.given?.[0] || '',
        familyName: data.name?.[0]?.family || '',
        gender: data.gender || '',
        birthDate: data.birthDate || '',
        phone: parseTelecom(data, 'phone') || '',
        email: parseTelecom(data, 'email') || '',
        street: data.address?.[0]?.line?.[0] || '',
        city: data.address?.[0]?.city || '',
        state: data.address?.[0]?.state || '',
        postalCode: data.address?.[0]?.postalCode || '',
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: (updatedPatient) => patientService.update(patientId, updatedPatient),
    onSuccess: () => {
      queryClient.invalidateQueries(['patient', patientId]);
      setIsEditing(false);
    }
  });

  const handleSave = () => {
    const updatedPatient = {
      ...patient,
      name: [{
        use: 'official',
        family: formData.familyName,
        given: [formData.givenName]
      }],
      gender: formData.gender,
      birthDate: formData.birthDate,
      telecom: [
        { system: 'phone', value: formData.phone, use: 'mobile' },
        { system: 'email', value: formData.email }
      ],
      address: [{
        use: 'home',
        line: [formData.street],
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode
      }]
    };

    updateMutation.mutate(updatedPatient);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-teal-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
          <Loader2 className="relative w-16 h-16 animate-spin text-blue-600" />
        </div>
        <p className="mt-6 text-gray-600 font-medium">Loading your profile...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl shadow-lg p-6 border-l-4 border-red-500">
        <div className="flex items-center space-x-3">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <p className="text-red-900 font-bold">Patient data not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-blue-500 to-teal-500 p-3 rounded-xl shadow-md">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              <p className="text-sm text-gray-500 mt-1">Manage your personal information</p>
            </div>
          </div>
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="btn-primary flex items-center space-x-2">
              <Edit2 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div className="flex space-x-2">
              <button 
                onClick={handleSave} 
                disabled={updateMutation.isLoading}
                className="btn-primary flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{updateMutation.isLoading ? 'Saving...' : 'Save'}</span>
              </button>
              <button 
                onClick={() => setIsEditing(false)} 
                className="btn-secondary flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center space-x-3 mb-6 pb-4 border-b-2 border-gray-100">
          <div className="bg-blue-100 p-2 rounded-lg">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.givenName}
                onChange={(e) => setFormData({ ...formData, givenName: e.target.value })}
                className="input-field"
              />
            ) : (
              <p className="text-gray-900">{patient.name?.[0]?.given?.[0] || 'N/A'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.familyName}
                onChange={(e) => setFormData({ ...formData, familyName: e.target.value })}
                className="input-field"
              />
            ) : (
              <p className="text-gray-900">{patient.name?.[0]?.family || 'N/A'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
            {isEditing ? (
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="input-field"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            ) : (
              <p className="text-gray-900">{parsePatientGender(patient)}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Birth Date</span>
            </label>
            {isEditing ? (
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                className="input-field"
              />
            ) : (
              <p className="text-gray-900">
                {parsePatientBirthDate(patient)} 
                {calculateAge(patient.birthDate) && ` (${calculateAge(patient.birthDate)} years)`}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center space-x-3 mb-6 pb-4 border-b-2 border-gray-100">
          <div className="bg-green-100 p-2 rounded-lg">
            <Phone className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Contact Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
              <Phone className="w-4 h-4" />
              <span>Phone</span>
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input-field"
                placeholder="+1 (555) 123-4567"
              />
            ) : (
              <p className="text-gray-900">{parseTelecom(patient, 'phone') || 'N/A'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </label>
            {isEditing ? (
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
              />
            ) : (
              <p className="text-gray-900">{parseTelecom(patient, 'email') || 'N/A'}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center space-x-3 mb-6 pb-4 border-b-2 border-gray-100">
          <div className="bg-purple-100 p-2 rounded-lg">
            <MapPin className="w-6 h-6 text-purple-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Address</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                className="input-field"
              />
            ) : (
              <p className="text-gray-900">{patient.address?.[0]?.line?.[0] || 'N/A'}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="input-field"
                />
              ) : (
                <p className="text-gray-900">{patient.address?.[0]?.city || 'N/A'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="input-field"
                />
              ) : (
                <p className="text-gray-900">{patient.address?.[0]?.state || 'N/A'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="input-field"
                />
              ) : (
                <p className="text-gray-900">{patient.address?.[0]?.postalCode || 'N/A'}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {updateMutation.isError && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-xl shadow-lg p-5">
          <div className="flex items-center space-x-2 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <p className="font-medium">Failed to update profile. Please try again.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
