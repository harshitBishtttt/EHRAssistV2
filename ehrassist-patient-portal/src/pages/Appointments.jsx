import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appointmentService, practitionerService } from '../services/clinicalService';
import { parseBundleEntries, formatFhirDateTime } from '../utils/fhirParser';
import { 
  Calendar, Clock, User, MapPin, ChevronDown, ChevronUp, 
  CheckCircle, XCircle, AlertCircle, Ban, Loader2, CalendarCheck, Plus, X 
} from 'lucide-react';

const Appointments = () => {
  const { patientId } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState(null);
  const [showCancelled, setShowCancelled] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [formData, setFormData] = useState({
    practitionerId: '',
    appointmentType: '',
    date: '',
    time: '',
    reason: '',
    description: ''
  });

  const { data: bundle, isLoading, error } = useQuery({
    queryKey: ['appointments', patientId],
    queryFn: () => appointmentService.search({ patient: patientId, page: 0, size: 100 }),
    enabled: !!patientId,
  });

  // Fetch all practitioners - backend requires at least one search param, so we search by empty name to get all
  const { data: practitionersBundle, isLoading: practitionersLoading, error: practitionersError } = useQuery({
    queryKey: ['practitioners'],
    queryFn: () => practitionerService.search({ name: '', page: 0, size: 100 }),
  });

  const createAppointmentMutation = useMutation({
    mutationFn: (appointmentData) => appointmentService.create(appointmentData),
    onSuccess: () => {
      queryClient.invalidateQueries(['appointments']);
      setShowRequestForm(false);
      setFormData({
        practitionerId: '',
        appointmentType: '',
        date: '',
        time: '',
        reason: '',
        description: ''
      });
      alert('Appointment request submitted successfully! Waiting for approval.');
    },
    onError: (error) => {
      alert(`Failed to create appointment: ${error.message}`);
    }
  });

  const cancelAppointmentMutation = useMutation({
    mutationFn: ({ id, appointment }) => appointmentService.update(id, appointment),
    onSuccess: () => {
      queryClient.invalidateQueries(['appointments']);
      alert('Appointment cancelled successfully.');
    },
    onError: (error) => {
      alert(`Failed to cancel appointment: ${error.message}`);
    }
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-teal-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
          <Loader2 className="relative w-16 h-16 animate-spin text-blue-600" />
        </div>
        <p className="mt-6 text-gray-600 font-medium">Loading your appointments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl shadow-lg p-6 border-l-4 border-red-500">
        <div className="flex items-center space-x-3">
          <div className="bg-red-100 p-3 rounded-lg">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="font-bold text-red-900 text-lg">Error loading appointments</p>
            <p className="text-red-700 mt-1">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  const allAppointments = bundle ? parseBundleEntries(bundle) : [];
  const allPractitioners = practitionersBundle ? parseBundleEntries(practitionersBundle) : [];

  const upcomingStatuses = ['booked', 'pending', 'proposed', 'waitlist'];
  const completedStatuses = ['arrived', 'fulfilled', 'checked-in'];
  const missedStatuses = ['noshow'];
  const cancelledStatuses = ['cancelled'];

  // Identify "My Practitioners" from appointment history
  const myPractitionerIds = new Map(); // Map<practitionerId, appointmentCount>
  
  allAppointments.forEach(apt => {
    if (apt.participant) {
      apt.participant.forEach(p => {
        if (p.actor?.reference?.startsWith('Practitioner/')) {
          const practId = p.actor.reference.split('/')[1];
          myPractitionerIds.set(practId, (myPractitionerIds.get(practId) || 0) + 1);
        }
      });
    }
  });

  // Split practitioners into "My Practitioners" and "Others"
  const myPractitioners = [];
  const otherPractitioners = [];

  allPractitioners.forEach(prac => {
    if (myPractitionerIds.has(prac.id)) {
      myPractitioners.push({
        ...prac,
        appointmentCount: myPractitionerIds.get(prac.id)
      });
    } else {
      otherPractitioners.push(prac);
    }
  });

  // Sort "My Practitioners" by appointment count (most frequent first)
  myPractitioners.sort((a, b) => b.appointmentCount - a.appointmentCount);

  // Auto-select most frequent practitioner when form opens
  if (showRequestForm && !formData.practitionerId && myPractitioners.length > 0) {
    setFormData(prev => ({ ...prev, practitionerId: myPractitioners[0].id }));
  }

  const handleRequestAppointment = (e) => {
    e.preventDefault();
    
    const dateTime = new Date(`${formData.date}T${formData.time}`);
    const endTime = new Date(dateTime.getTime() + 30 * 60000); // 30 minutes later

    const appointmentResource = {
      resourceType: 'Appointment',
      status: 'proposed', // Patient requests start as 'proposed'
      appointmentType: {
        coding: [{
          code: formData.appointmentType,
          display: formData.appointmentType
        }]
      },
      reasonCode: formData.reason ? [{
        coding: [{
          code: 'consultation',
          display: formData.reason
        }]
      }] : undefined,
      description: formData.description,
      start: dateTime.toISOString(),
      end: endTime.toISOString(),
      minutesDuration: 30,
      participant: [
        {
          actor: {
            reference: `Patient/${patientId}`
          },
          required: 'required',
          status: 'accepted'
        },
        ...(formData.practitionerId ? [{
          actor: {
            reference: `Practitioner/${formData.practitionerId}`
          },
          required: 'required',
          status: 'needs-action'
        }] : [])
      ]
    };

    createAppointmentMutation.mutate(appointmentResource);
  };

  const handleCancelAppointment = (appointment) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      const updatedAppointment = {
        ...appointment,
        status: 'cancelled'
      };
      cancelAppointmentMutation.mutate({ id: appointment.id, appointment: updatedAppointment });
    }
  };

  const upcomingAppointments = allAppointments.filter(apt => 
    upcomingStatuses.includes(apt.status?.toLowerCase())
  );
  
  const completedAppointments = allAppointments.filter(apt => 
    completedStatuses.includes(apt.status?.toLowerCase())
  );
  
  const missedAppointments = allAppointments.filter(apt => 
    missedStatuses.includes(apt.status?.toLowerCase())
  );
  
  const cancelledAppointments = allAppointments.filter(apt => 
    cancelledStatuses.includes(apt.status?.toLowerCase())
  );

  const AppointmentCard = ({ appointment, type }) => {
    const isExpanded = expandedId === appointment.id;
    const statusColors = {
      upcoming: 'border-blue-400 bg-gradient-to-r from-blue-50 to-cyan-50',
      completed: 'border-green-400 bg-gradient-to-r from-green-50 to-emerald-50',
      missed: 'border-red-400 bg-gradient-to-r from-red-50 to-orange-50',
      cancelled: 'border-gray-400 bg-gradient-to-r from-gray-50 to-slate-50'
    };

    const statusIcons = {
      upcoming: <Clock className="w-5 h-5 text-blue-600" />,
      completed: <CheckCircle className="w-5 h-5 text-green-600" />,
      missed: <XCircle className="w-5 h-5 text-red-600" />,
      cancelled: <Ban className="w-5 h-5 text-gray-600" />
    };

    return (
      <div className={`border-2 rounded-xl shadow-md hover:shadow-lg transition-all ${statusColors[type]}`}>
        <div 
          className="p-5 cursor-pointer"
          onClick={() => setExpandedId(isExpanded ? null : appointment.id)}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <div className={`p-2 rounded-lg ${
                type === 'upcoming' ? 'bg-blue-100' :
                type === 'completed' ? 'bg-green-100' :
                type === 'missed' ? 'bg-red-100' : 'bg-gray-100'
              }`}>
                {statusIcons[type]}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-bold text-gray-900">
                    {appointment.appointmentType?.coding?.[0]?.display || 'Appointment'}
                  </h3>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-blue-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <p className="text-sm font-semibold text-gray-700">
                    {formatFhirDateTime(appointment.start)}
                  </p>
                </div>
                {appointment.description && (
                  <p className="text-sm text-gray-600 mt-1">{appointment.description}</p>
                )}
              </div>
            </div>
            <span className={`status-badge ${
              type === 'upcoming' ? 'bg-blue-100 text-blue-700' :
              type === 'completed' ? 'bg-green-100 text-green-700' :
              type === 'missed' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
            }`}>
              {appointment.status}
            </span>
          </div>
        </div>

        {isExpanded && (
          <div className="px-5 pb-5 pt-2 border-t-2 border-white/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-2 mb-1.5">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Start Time</label>
                </div>
                <p className="text-gray-900 font-semibold">{formatFhirDateTime(appointment.start)}</p>
              </div>

              {appointment.end && (
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-2 mb-1.5">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">End Time</label>
                  </div>
                  <p className="text-gray-900 font-semibold">{formatFhirDateTime(appointment.end)}</p>
                </div>
              )}

              {appointment.minutesDuration && (
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-2 mb-1.5">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Duration</label>
                  </div>
                  <p className="text-gray-900 font-semibold">{appointment.minutesDuration} minutes</p>
                </div>
              )}

              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-2 mb-1.5">
                  <CalendarCheck className="w-4 h-4 text-blue-500" />
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Status</label>
                </div>
                <p className="text-gray-900 font-semibold capitalize">{appointment.status}</p>
              </div>

              {appointment.participant?.[0] && (
                <div className="col-span-2 bg-white p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-2 mb-1.5">
                    <User className="w-4 h-4 text-blue-500" />
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Practitioner</label>
                  </div>
                  <p className="text-gray-900 font-semibold">
                    {appointment.participant[0].actor?.reference?.split('/')[1] || 'Not assigned'}
                  </p>
                </div>
              )}
            </div>

            {type === 'upcoming' && (
              <div className="mt-4 flex space-x-3">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCancelAppointment(appointment);
                  }}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-all shadow-md"
                  disabled={cancelAppointmentMutation.isLoading}
                >
                  {cancelAppointmentMutation.isLoading ? 'Cancelling...' : 'Cancel Appointment'}
                </button>
              </div>
            )}

            {type === 'missed' && (
              <div className="mt-4">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowRequestForm(true);
                  }}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-all shadow-md"
                >
                  Request New Appointment
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const SectionHeader = ({ title, count, icon: Icon, color }) => (
    <div className={`flex items-center justify-between p-4 bg-gradient-to-r ${color} rounded-xl border-l-4 ${
      color.includes('blue') ? 'border-blue-500' :
      color.includes('green') ? 'border-green-500' :
      color.includes('red') ? 'border-red-500' : 'border-gray-500'
    } shadow-md`}>
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${
          color.includes('blue') ? 'bg-blue-100' :
          color.includes('green') ? 'bg-green-100' :
          color.includes('red') ? 'bg-red-100' : 'bg-gray-100'
        }`}>
          <Icon className={`w-6 h-6 ${
            color.includes('blue') ? 'text-blue-600' :
            color.includes('green') ? 'text-green-600' :
            color.includes('red') ? 'text-red-600' : 'text-gray-600'
          }`} />
        </div>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      </div>
      <span className={`px-4 py-2 rounded-full font-bold text-lg ${
        color.includes('blue') ? 'bg-blue-200 text-blue-800' :
        color.includes('green') ? 'bg-green-200 text-green-800' :
        color.includes('red') ? 'bg-red-200 text-red-800' : 'bg-gray-200 text-gray-800'
      }`}>
        {count}
      </span>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-blue-500 to-teal-500 p-3 rounded-xl shadow-md">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
              <p className="text-sm text-gray-500 mt-1">Manage and view all your healthcare appointments</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowRequestForm(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Request Appointment</span>
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-secondary"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Appointment Request Form Modal */}
      {showRequestForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-teal-500 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white p-2 rounded-lg">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Request New Appointment</h2>
                </div>
                <button
                  onClick={() => setShowRequestForm(false)}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleRequestAppointment} className="p-6 space-y-5">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Your appointment request will be sent to the practitioner for approval. 
                  You'll be notified once it's confirmed.
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Select Practitioner *
                </label>
                {myPractitioners.length > 0 && (
                  <div className="mb-2 bg-blue-50 border border-blue-200 rounded-lg p-2 flex items-center space-x-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <span className="text-xs text-blue-800 font-semibold">
                      💡 Your most frequent practitioner is pre-selected
                    </span>
                  </div>
                )}
                <select
                  required
                  value={formData.practitionerId}
                  onChange={(e) => setFormData({ ...formData, practitionerId: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Choose a practitioner...</option>
                  
                  {myPractitioners.length > 0 && (
                    <optgroup label="👥 MY PRACTITIONERS">
                      {myPractitioners.map(prac => (
                        <option key={prac.id} value={prac.id}>
                          ⭐ {prac.name?.[0]?.text || prac.name?.[0]?.family || 'Unknown'} ({prac.appointmentCount} {prac.appointmentCount === 1 ? 'visit' : 'visits'})
                        </option>
                      ))}
                    </optgroup>
                  )}
                  
                  {otherPractitioners.length > 0 && (
                    <optgroup label="🏥 OTHER PRACTITIONERS">
                      {otherPractitioners.map(prac => (
                        <option key={prac.id} value={prac.id}>
                          {prac.name?.[0]?.text || prac.name?.[0]?.family || 'Unknown Practitioner'}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Appointment Type *
                </label>
                <select
                  required
                  value={formData.appointmentType}
                  onChange={(e) => setFormData({ ...formData, appointmentType: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select type...</option>
                  <option value="General Checkup">General Checkup</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Consultation">Consultation</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Routine">Routine</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Preferred Date *
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Preferred Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Reason for Visit
                </label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="e.g., Annual checkup, Follow-up consultation"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Any additional information for the practitioner..."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={createAppointmentMutation.isLoading}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg disabled:opacity-50"
                >
                  {createAppointmentMutation.isLoading ? 'Submitting...' : 'Submit Request'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowRequestForm(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-5 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Upcoming</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{upcomingAppointments.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-xl">
              <Clock className="w-7 h-7 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-5 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Completed</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{completedAppointments.length}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-xl">
              <CheckCircle className="w-7 h-7 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-5 border-l-4 border-red-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Missed</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{missedAppointments.length}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-xl">
              <XCircle className="w-7 h-7 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-5 border-l-4 border-gray-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Cancelled</p>
              <p className="text-3xl font-bold text-gray-600 mt-2">{cancelledAppointments.length}</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-xl">
              <Ban className="w-7 h-7 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Appointments */}
      {upcomingAppointments.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <SectionHeader 
            title="Upcoming Appointments" 
            count={upcomingAppointments.length}
            icon={Clock}
            color="from-blue-50 to-cyan-50"
          />
          <div className="mt-4 space-y-3">
            {upcomingAppointments.map(apt => (
              <div key={apt.id}>
                {(apt.status === 'proposed' || apt.status === 'pending') && (
                  <div className="mb-2 bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                      <p className="text-sm font-semibold text-yellow-800">
                        Waiting for practitioner approval
                      </p>
                    </div>
                  </div>
                )}
                <AppointmentCard appointment={apt} type="upcoming" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Appointments */}
      {completedAppointments.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <SectionHeader 
            title="Completed Appointments" 
            count={completedAppointments.length}
            icon={CheckCircle}
            color="from-green-50 to-emerald-50"
          />
          <div className="mt-4 space-y-3">
            {completedAppointments.map(apt => (
              <AppointmentCard key={apt.id} appointment={apt} type="completed" />
            ))}
          </div>
        </div>
      )}

      {/* Missed Appointments */}
      {missedAppointments.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <SectionHeader 
            title="Missed Appointments" 
            count={missedAppointments.length}
            icon={XCircle}
            color="from-red-50 to-orange-50"
          />
          <div className="mt-4 space-y-3">
            {missedAppointments.map(apt => (
              <AppointmentCard key={apt.id} appointment={apt} type="missed" />
            ))}
          </div>
        </div>
      )}

      {/* Cancelled Appointments (Collapsible) */}
      {cancelledAppointments.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <button
            onClick={() => setShowCancelled(!showCancelled)}
            className="w-full"
          >
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border-l-4 border-gray-500 shadow-md hover:shadow-lg transition-all">
              <div className="flex items-center space-x-3">
                <div className="bg-gray-100 p-2 rounded-lg">
                  <Ban className="w-6 h-6 text-gray-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Cancelled Appointments</h2>
              </div>
              <div className="flex items-center space-x-3">
                <span className="px-4 py-2 rounded-full font-bold text-lg bg-gray-200 text-gray-800">
                  {cancelledAppointments.length}
                </span>
                {showCancelled ? (
                  <ChevronUp className="w-6 h-6 text-gray-600" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-gray-600" />
                )}
              </div>
            </div>
          </button>
          
          {showCancelled && (
            <div className="mt-4 space-y-3">
              {cancelledAppointments.map(apt => (
                <AppointmentCard key={apt.id} appointment={apt} type="cancelled" />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {allAppointments.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-100">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
            <Calendar className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg font-medium">No appointments found</p>
          <p className="text-gray-400 text-sm mt-2">Your appointments will appear here</p>
        </div>
      )}
    </div>
  );
};

export default Appointments;
