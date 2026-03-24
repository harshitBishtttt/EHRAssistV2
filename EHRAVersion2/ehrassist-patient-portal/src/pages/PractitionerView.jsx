import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { patientService } from '../services/patientService';
import { practitionerService, appointmentService } from '../services/clinicalService';
import { parseReference, parseBundleEntries } from '../utils/fhirParser';
import { Stethoscope, Mail, Phone, Building2, Loader2, UserX, Calendar, Users } from 'lucide-react';

const PractitionerView = () => {
  const { patientId } = useAuth();
  const navigate = useNavigate();

  const { data: patient, isLoading: patientLoading } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => patientService.getById(patientId),
    enabled: !!patientId,
  });

  // Fetch all appointments to identify "My Practitioners"
  const { data: appointmentsBundle, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['appointments', patientId],
    queryFn: () => appointmentService.search({ patient: patientId, page: 0, size: 100 }),
    enabled: !!patientId,
  });

  // Fetch all practitioners - backend requires at least one search param, so we search by empty name to get all
  const { data: practitionersBundle, isLoading: practitionersLoading } = useQuery({
    queryKey: ['practitioners'],
    queryFn: () => practitionerService.search({ name: '', page: 0, size: 100 }),
  });

  const practitionerRef = patient?.generalPractitioner?.[0];
  const primaryPractitionerId = practitionerRef ? parseReference(practitionerRef)?.id : null;

  if (patientLoading || appointmentsLoading || practitionersLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-teal-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
          <Loader2 className="relative w-16 h-16 animate-spin text-blue-600" />
        </div>
        <p className="mt-6 text-gray-600 font-medium">Loading your healthcare team...</p>
      </div>
    );
  }

  // Parse appointments and practitioners
  const allAppointments = appointmentsBundle ? parseBundleEntries(appointmentsBundle) : [];
  const allPractitioners = practitionersBundle ? parseBundleEntries(practitionersBundle) : [];

  // Identify "My Practitioners" from appointment history
  const practitionerStats = new Map(); // Map<practitionerId, {count, lastVisit}>
  
  allAppointments.forEach(apt => {
    if (apt.participant) {
      apt.participant.forEach(p => {
        if (p.actor?.reference?.startsWith('Practitioner/')) {
          const practId = p.actor.reference.split('/')[1];
          const currentStats = practitionerStats.get(practId) || { count: 0, lastVisit: null };
          currentStats.count += 1;
          
          // Track most recent appointment
          if (apt.start) {
            const aptDate = new Date(apt.start);
            if (!currentStats.lastVisit || aptDate > new Date(currentStats.lastVisit)) {
              currentStats.lastVisit = apt.start;
            }
          }
          
          practitionerStats.set(practId, currentStats);
        }
      });
    }
  });

  // Build "My Practitioners" list with details
  const myPractitioners = allPractitioners
    .filter(prac => practitionerStats.has(prac.id))
    .map(prac => ({
      ...prac,
      appointmentCount: practitionerStats.get(prac.id).count,
      lastVisit: practitionerStats.get(prac.id).lastVisit,
      isPrimary: prac.id === primaryPractitionerId
    }))
    .sort((a, b) => {
      // Primary practitioner first
      if (a.isPrimary) return -1;
      if (b.isPrimary) return 1;
      // Then by appointment count
      return b.appointmentCount - a.appointmentCount;
    });

  if (myPractitioners.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-600">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-blue-500 to-teal-500 p-3 rounded-xl shadow-md">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Healthcare Team</h1>
              <p className="text-sm text-gray-500 mt-1">Your healthcare providers</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg text-center py-16 border border-gray-100">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
            <UserX className="w-12 h-12 text-gray-400" />
          </div>
          <p className="text-gray-700 text-xl font-bold">No practitioners found</p>
          <p className="text-gray-500 mt-3 max-w-md mx-auto">
            You haven't had any appointments yet. Book your first appointment to see your healthcare team here.
          </p>
          <button
            onClick={() => navigate('/appointments')}
            className="mt-6 btn-primary inline-flex items-center space-x-2"
          >
            <Calendar className="w-5 h-5" />
            <span>Book Appointment</span>
          </button>
        </div>
      </div>
    );
  }

  const PractitionerCard = ({ practitioner }) => {
    const practitionerName = practitioner.name?.[0]
      ? `${practitioner.name[0].prefix?.[0] || ''} ${practitioner.name[0].given?.join(' ') || ''} ${practitioner.name[0].family || ''}`.trim()
      : 'Unknown Practitioner';

    const specialty = practitioner.qualification?.[0]?.code?.coding?.[0]?.display || 'General Practice';
    const phone = practitioner.telecom?.find(t => t.system === 'phone')?.value;
    const email = practitioner.telecom?.find(t => t.system === 'email')?.value;
    const lastVisitDate = practitioner.lastVisit ? new Date(practitioner.lastVisit).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : 'N/A';

    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-teal-400 rounded-full blur-lg opacity-30"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-blue-100 to-teal-100 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                  <Stethoscope className="w-10 h-10 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="text-2xl font-bold text-gray-900">{practitionerName}</h3>
                {practitioner.isPrimary && (
                  <span className="bg-gradient-to-r from-blue-500 to-teal-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    PRIMARY
                  </span>
                )}
              </div>
              <p className="text-blue-600 font-semibold mt-1">{specialty}</p>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-3 rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-center space-x-2 mb-1">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <p className="text-xs font-bold text-gray-500 uppercase">Total Visits</p>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{practitioner.appointmentCount}</p>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border-l-4 border-green-500">
                  <div className="flex items-center space-x-2 mb-1">
                    <Calendar className="w-4 h-4 text-green-600" />
                    <p className="text-xs font-bold text-gray-500 uppercase">Last Visit</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900">{lastVisitDate}</p>
                </div>
              </div>

              {(phone || email) && (
                <div className="mt-4 space-y-2">
                  {phone && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Phone className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium">{phone}</span>
                    </div>
                  )}
                  {email && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Mail className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium">{email}</span>
                    </div>
                  )}
                </div>
              )}

              {practitioner.qualification && practitioner.qualification.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-blue-500" />
                    <span>Qualifications</span>
                  </h4>
                  <div className="space-y-1">
                    {practitioner.qualification.map((qual, idx) => (
                      <div key={idx} className="bg-gray-50 px-3 py-2 rounded-lg">
                        <p className="text-sm font-semibold text-gray-800">
                          {qual.code?.coding?.[0]?.display || qual.code?.text || 'Qualification'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => navigate('/appointments')}
            className="ml-4 btn-primary flex items-center space-x-2 whitespace-nowrap"
          >
            <Calendar className="w-4 h-4" />
            <span>Book</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-blue-500 to-teal-500 p-3 rounded-xl shadow-md">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Healthcare Team</h1>
              <p className="text-sm text-gray-500 mt-1">{myPractitioners.length} {myPractitioners.length === 1 ? 'Practitioner' : 'Practitioners'}</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/appointments')}
            className="btn-primary flex items-center space-x-2"
          >
            <Calendar className="w-5 h-5" />
            <span>New Appointment</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {myPractitioners.map(prac => (
          <PractitionerCard key={prac.id} practitioner={prac} />
        ))}
      </div>
    </div>
  );
};

export default PractitionerView;
