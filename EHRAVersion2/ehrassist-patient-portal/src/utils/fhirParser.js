import { format, parseISO } from 'date-fns';

export const parsePatientName = (patient) => {
  if (!patient.name || patient.name.length === 0) return 'Unknown';
  const name = patient.name[0];
  const given = name.given ? name.given.join(' ') : '';
  const family = name.family || '';
  return `${given} ${family}`.trim();
};

export const parsePatientGender = (patient) => {
  return patient.gender ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : 'Unknown';
};

export const parsePatientBirthDate = (patient) => {
  if (!patient.birthDate) return 'Unknown';
  try {
    return format(parseISO(patient.birthDate), 'MMM dd, yyyy');
  } catch {
    return patient.birthDate;
  }
};

export const calculateAge = (birthDate) => {
  if (!birthDate) return null;
  try {
    const birth = parseISO(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  } catch {
    return null;
  }
};

export const parseAddress = (patient) => {
  if (!patient.address || patient.address.length === 0) return null;
  const addr = patient.address[0];
  const parts = [
    addr.line ? addr.line.join(', ') : '',
    addr.city,
    addr.state,
    addr.postalCode,
    addr.country
  ].filter(Boolean);
  return parts.join(', ');
};

export const parseTelecom = (patient, system = 'phone') => {
  if (!patient.telecom) return null;
  const telecom = patient.telecom.find(t => t.system === system);
  return telecom ? telecom.value : null;
};

export const parseConditionCode = (condition) => {
  if (!condition.code || !condition.code.coding || condition.code.coding.length === 0) {
    return 'Unknown Condition';
  }
  return condition.code.coding[0].display || condition.code.text || 'Unknown Condition';
};

export const parseMedicationCode = (medication) => {
  if (!medication.medicationCodeableConcept) return 'Unknown Medication';
  const coding = medication.medicationCodeableConcept.coding;
  if (!coding || coding.length === 0) return 'Unknown Medication';
  return coding[0].display || medication.medicationCodeableConcept.text || 'Unknown Medication';
};

export const parseObservationCode = (observation) => {
  if (!observation.code || !observation.code.coding || observation.code.coding.length === 0) {
    return 'Unknown Observation';
  }
  return observation.code.coding[0].display || observation.code.text || 'Unknown Observation';
};

export const parseObservationValue = (observation) => {
  if (observation.valueQuantity) {
    return `${observation.valueQuantity.value} ${observation.valueQuantity.unit || ''}`;
  }
  if (observation.valueString) {
    return observation.valueString;
  }
  if (observation.valueCodeableConcept) {
    const coding = observation.valueCodeableConcept.coding;
    if (coding && coding.length > 0) {
      return coding[0].display || observation.valueCodeableConcept.text;
    }
  }
  return 'N/A';
};

export const formatFhirDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return format(parseISO(dateString), 'MMM dd, yyyy');
  } catch {
    return dateString;
  }
};

export const formatFhirDateTime = (dateTimeString) => {
  if (!dateTimeString) return 'N/A';
  try {
    return format(parseISO(dateTimeString), 'MMM dd, yyyy hh:mm a');
  } catch {
    return dateTimeString;
  }
};

export const parseBundleEntries = (bundle) => {
  if (!bundle || !bundle.entry) return [];
  return bundle.entry.map(entry => entry.resource);
};

export const getBundleTotal = (bundle) => {
  return bundle?.total || 0;
};

export const parseReference = (reference) => {
  if (!reference || !reference.reference) return null;
  const parts = reference.reference.split('/');
  return parts.length === 2 ? { type: parts[0], id: parts[1] } : null;
};
