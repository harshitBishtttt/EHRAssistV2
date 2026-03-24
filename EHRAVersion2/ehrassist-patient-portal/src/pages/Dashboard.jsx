import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { patientService } from '../services/patientService';
import { 
  conditionService, encounterService, medicationRequestService,
  appointmentService, observationService 
} from '../services/clinicalService';
import { 
  parsePatientName, parsePatientGender, parsePatientBirthDate, 
  calculateAge, parseBundleEntries, getBundleTotal 
} from '../utils/fhirParser';
import { Activity, Pill, Hospital, Calendar, Heart, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { patientId } = useAuth();
  const navigate = useNavigate();

  const { data: patient, isLoading: patientLoading } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => patientService.getById(patientId),
    enabled: !!patientId,
  });

  const { data: conditionsBundle } = useQuery({
    queryKey: ['conditions', patientId],
    queryFn: () => conditionService.search({ patient: patientId, page: 0, size: 5 }),
    enabled: !!patientId,
  });

  const { data: encountersBundle } = useQuery({
    queryKey: ['encounters', patientId],
    queryFn: () => encounterService.search({ patient: patientId, page: 0, size: 5 }),
    enabled: !!patientId,
  });

  const { data: medicationsBundle } = useQuery({
    queryKey: ['medications', patientId],
    queryFn: () => medicationRequestService.search({ patient: patientId, page: 0, size: 5 }),
    enabled: !!patientId,
  });

  const { data: appointmentsBundle } = useQuery({
    queryKey: ['appointments', patientId],
    queryFn: () => appointmentService.search({ patient: patientId, page: 0, size: 5 }),
    enabled: !!patientId,
  });

  const { data: vitalsBundle } = useQuery({
    queryKey: ['vitals', patientId],
    queryFn: () => observationService.search({ patient: patientId, page: 0, size: 5 }),
    enabled: !!patientId,
  });

  if (patientLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-teal-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
          <Loader2 className="relative w-16 h-16 animate-spin text-blue-600" />
        </div>
        <p className="mt-6 text-gray-600 font-medium">Loading your dashboard...</p>
      </div>
    );
  }

  const patientName = patient ? parsePatientName(patient) : 'Patient';
  const patientGender = patient ? parsePatientGender(patient) : '';
  const patientAge = patient && patient.birthDate ? calculateAge(patient.birthDate) : null;

  const stats = [
    {
      title: 'Active Conditions',
      value: getBundleTotal(conditionsBundle),
      icon: Activity,
      color: 'bg-red-500',
      link: '/clinical/condition'
    },
    {
      title: 'Active Medications',
      value: getBundleTotal(medicationsBundle),
      icon: Pill,
      color: 'bg-blue-500',
      link: '/clinical/medicationrequest'
    },
    {
      title: 'Total Encounters',
      value: getBundleTotal(encountersBundle),
      icon: Hospital,
      color: 'bg-indigo-500',
      link: '/clinical/encounter'
    },
    {
      title: 'Appointments',
      value: getBundleTotal(appointmentsBundle),
      icon: Calendar,
      color: 'bg-green-500',
      link: '/clinical/appointment'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-teal-600 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
        <div className="relative p-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Welcome back, {patientName}!</h1>
              <p className="text-blue-100 text-lg mt-1">
                {patientGender} {patientAge && `• ${patientAge} years old`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <button
              key={stat.title}
              onClick={() => navigate(stat.link)}
              className="group relative overflow-hidden bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all border border-gray-100 text-left p-6"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-50 to-teal-50 rounded-full -mr-12 -mt-12 opacity-50"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{stat.title}</p>
                  <p className="text-4xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-4 rounded-xl shadow-md group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg border-l-4 border-red-500 p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center space-x-3 mb-5">
            <div className="bg-red-100 p-2.5 rounded-lg">
              <Activity className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Recent Conditions</h2>
          </div>
          {conditionsBundle && parseBundleEntries(conditionsBundle).length > 0 ? (
            <div className="space-y-3">
              {parseBundleEntries(conditionsBundle).slice(0, 5).map((condition) => (
                <div key={condition.id} className="flex items-start justify-between p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-100 hover:shadow-md transition-all">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {condition.code?.coding?.[0]?.display || 'Unknown'}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs font-medium text-gray-600">
                        {condition.clinicalStatus?.coding?.[0]?.code || 'N/A'}
                      </span>
                      {condition.severity?.coding?.[0]?.display && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span className="text-xs text-gray-600">{condition.severity.coding[0].display}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 py-8 text-center">No conditions recorded</p>
          )}
          <button
            onClick={() => navigate('/clinical/condition')}
            className="mt-5 w-full text-blue-600 hover:text-blue-700 font-semibold text-sm py-2 hover:bg-blue-50 rounded-lg transition-colors"
          >
            View All Conditions →
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg border-l-4 border-blue-500 p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center space-x-3 mb-5">
            <div className="bg-blue-100 p-2.5 rounded-lg">
              <Pill className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Active Medications</h2>
          </div>
          {medicationsBundle && parseBundleEntries(medicationsBundle).length > 0 ? (
            <div className="space-y-3">
              {parseBundleEntries(medicationsBundle).slice(0, 5).map((medication) => (
                <div key={medication.id} className="flex items-start justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100 hover:shadow-md transition-all">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {medication.medicationCodeableConcept?.coding?.[0]?.display || 'Unknown'}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs font-medium text-gray-600">
                        {medication.status || 'N/A'}
                      </span>
                      {medication.dosageInstruction?.[0]?.text && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span className="text-xs text-gray-600">{medication.dosageInstruction[0].text}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 py-8 text-center">No medications recorded</p>
          )}
          <button
            onClick={() => navigate('/clinical/medicationrequest')}
            className="mt-5 w-full text-blue-600 hover:text-blue-700 font-semibold text-sm py-2 hover:bg-blue-50 rounded-lg transition-colors"
          >
            View All Medications →
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border-l-4 border-indigo-500 p-6 hover:shadow-xl transition-shadow">
        <div className="flex items-center space-x-3 mb-5">
          <div className="bg-indigo-100 p-2.5 rounded-lg">
            <Hospital className="w-6 h-6 text-indigo-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Recent Encounters</h2>
        </div>
        {encountersBundle && parseBundleEntries(encountersBundle).length > 0 ? (
          <div className="space-y-3">
            {parseBundleEntries(encountersBundle).slice(0, 5).map((encounter) => (
              <div key={encounter.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100 hover:shadow-md transition-all">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {encounter.class?.display || encounter.class?.code || 'Visit'}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {encounter.period?.start ? new Date(encounter.period.start).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                  encounter.status === 'finished' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {encounter.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 py-8 text-center">No encounters recorded</p>
        )}
        <button
          onClick={() => navigate('/clinical/encounter')}
          className="mt-5 w-full text-blue-600 hover:text-blue-700 font-semibold text-sm py-2 hover:bg-blue-50 rounded-lg transition-colors"
        >
          View All Encounters →
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
