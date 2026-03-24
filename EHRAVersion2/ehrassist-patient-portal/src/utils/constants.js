export const CLINICAL_RESOURCES = [
  { name: 'Conditions', key: 'Condition', icon: 'Activity', color: 'bg-red-500' },
  { name: 'Medications', key: 'MedicationRequest', icon: 'Pill', color: 'bg-blue-500' },
  { name: 'Lab Results', key: 'DiagnosticReport', icon: 'FlaskConical', color: 'bg-purple-500' },
  { name: 'Immunizations', key: 'Immunization', icon: 'Syringe', color: 'bg-green-500' },
  { name: 'Encounters', key: 'Encounter', icon: 'Hospital', color: 'bg-indigo-500' },
  { name: 'Procedures', key: 'Procedure', icon: 'Scissors', color: 'bg-orange-500' },
  { name: 'Allergies', key: 'AllergyIntolerance', icon: 'AlertTriangle', color: 'bg-yellow-500' },
  { name: 'Vitals', key: 'Observation', icon: 'Heart', color: 'bg-pink-500' },
  { name: 'Documents', key: 'DocumentReference', icon: 'FileText', color: 'bg-teal-500' },
  { name: 'Appointments', key: 'Appointment', icon: 'Calendar', color: 'bg-cyan-500' },
];

export const STATUS_COLORS = {
  active: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  'in-progress': 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800',
  finished: 'bg-blue-100 text-blue-800',
  booked: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  final: 'bg-blue-100 text-blue-800',
  preliminary: 'bg-yellow-100 text-yellow-800',
};

export const SEVERITY_COLORS = {
  severe: 'text-red-600',
  moderate: 'text-orange-600',
  mild: 'text-yellow-600',
  low: 'text-green-600',
};
