export const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'search_fhir_patient',
      description: 'Search for patients in the FHIR system by name, email, phone, birthdate, or patient ID.',
      parameters: {
        type: 'object',
        properties: {
          GIVEN: { type: 'string', description: 'Patient first/given name' },
          FAMILY: { type: 'string', description: 'Patient last/family name' },
          EMAIL: { type: 'string', description: 'Patient email address' },
          PHONE: { type: 'string', description: 'Patient phone number' },
          BIRTHDATE: { type: 'string', description: 'Patient date of birth (YYYY-MM-DD)' },
          PATIENT_ID: { type: 'string', description: 'Patient numeric ID' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_patient_condition',
      description: 'Search patient conditions/diagnoses from FHIR. Can search by subject (patient ID) and/or ICD-9 code.',
      parameters: {
        type: 'object',
        properties: {
          SUBJECT: { type: 'string', description: "Patient numeric ID (do NOT include 'Patient/' prefix)" },
          CODE: { type: 'string', description: 'ICD-9 diagnosis code' },
          ENCOUNTER: { type: 'string', description: 'Encounter numeric ID' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_patient_procedure',
      description: 'Search patient procedures/surgeries from FHIR. Can search by subject and/or CPT code or code range.',
      parameters: {
        type: 'object',
        properties: {
          SUBJECT: { type: 'string', description: 'Patient numeric ID' },
          CODE: { type: 'string', description: 'CPT procedure code' },
          ENCOUNTER: { type: 'string', description: 'Encounter numeric ID' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_patient_medications',
      description: 'Search patient medication requests/prescriptions from FHIR.',
      parameters: {
        type: 'object',
        properties: {
          SUBJECT: { type: 'string', description: 'Patient numeric ID' },
          CODE: { type: 'string', description: 'Drug code (e.g. INSULIN, ACET325)' },
          PRESCRIPTIONID: { type: 'string', description: 'Prescription ID number' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_patient_encounter',
      description: 'Search patient encounters (admissions, discharges, insurance info) from FHIR.',
      parameters: {
        type: 'object',
        properties: {
          SUBJECT: { type: 'string', description: 'Patient numeric ID' },
          DATE: { type: 'string', description: "Start date filter e.g. 'gt2000-01-13' (gt=after, lt=before)" },
          DATE2: { type: 'string', description: "End date filter e.g. 'lt2024-09-13'" },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_patient_observations',
      description: 'Search patient lab results, vitals, and clinical observations from FHIR.',
      parameters: {
        type: 'object',
        properties: {
          SUBJECT: { type: 'string', description: 'Patient numeric ID' },
          CODE: { type: 'string', description: 'LOINC observation code' },
          value_quantity: { type: 'string', description: "Filter by value e.g. 'gt10|mEq/L' or 'lt5|mg/dL'" },
          page: { type: 'number', description: 'Page number for pagination, starting at 0' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'end_chat',
      description:
        "End the conversation when the user explicitly indicates they are done (says 'no', 'nothing else', \"that's all\", 'goodbye', 'bye', 'thank you' in a closing context).",
      parameters: {
        type: 'object',
        properties: {
          farewell_message: { type: 'string', description: 'A short professional closing message to the user.' },
        },
        required: ['farewell_message'],
      },
    },
  },
];
