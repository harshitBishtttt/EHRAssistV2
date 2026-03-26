import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  conditionService, encounterService, observationService,
  procedureService, medicationRequestService, allergyIntoleranceService,
  immunizationService, serviceRequestService, appointmentService,
  documentReferenceService, diagnosticReportService
} from '../services/clinicalService';
import { parseBundleEntries, getBundleTotal, formatFhirDate, formatFhirDateTime } from '../utils/fhirParser';
import { Loader2, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, AlertCircle, Calendar, User, Stethoscope, Activity } from 'lucide-react';
import { STATUS_COLORS } from '../utils/constants';

const serviceMap = {
  condition: conditionService,
  encounter: encounterService,
  observation: observationService,
  procedure: procedureService,
  medicationrequest: medicationRequestService,
  allergyintolerance: allergyIntoleranceService,
  immunization: immunizationService,
  servicerequest: serviceRequestService,
  appointment: appointmentService,
  documentreference: documentReferenceService,
  diagnosticreport: diagnosticReportService,
};

const resourceTitles = {
  condition: 'Conditions',
  encounter: 'Encounters',
  observation: 'Observations (Vitals)',
  procedure: 'Procedures',
  medicationrequest: 'Medications',
  allergyintolerance: 'Allergies',
  immunization: 'Immunizations',
  servicerequest: 'Service Requests',
  appointment: 'Appointments',
  documentreference: 'Documents',
  diagnosticreport: 'Lab Results',
};

const DetailField = ({ label, value, icon: Icon }) => (
  <div className="bg-white p-3 rounded-lg border border-gray-200">
    <div className="flex items-center space-x-2 mb-1.5">
      {Icon && <Icon className="w-4 h-4 text-blue-500" />}
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">{label}</label>
    </div>
    <p className="text-gray-900 font-semibold">{value}</p>
  </div>
);

const ClinicalDataList = () => {
  const { resourceType } = useParams();
  const { patientId } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const size = 10;

  const service = serviceMap[resourceType];
  const title = resourceTitles[resourceType] || 'Clinical Data';

  useEffect(() => {
    setPage(0);
    setExpandedId(null);
  }, [resourceType]);

  const { data: bundle, isLoading, error } = useQuery({
    queryKey: ['clinical', resourceType, patientId, page],
    queryFn: () => service.search({ patient: patientId, page, size }),
    enabled: !!patientId && !!service,
  });

  const resources = bundle ? parseBundleEntries(bundle) : [];
  const total = bundle ? getBundleTotal(bundle) : 0;
  const totalPages = Math.ceil(total / size);

  const getResourceDisplay = (resource) => {
    switch (resourceType) {
      case 'condition':
        return {
          title: resource.code?.coding?.[0]?.display || resource.code?.text || 'Unknown',
          subtitle: `Status: ${resource.clinicalStatus?.coding?.[0]?.code || 'N/A'}`,
          date: resource.recordedDate || resource.onsetDateTime,
          status: resource.clinicalStatus?.coding?.[0]?.code
        };
      case 'medicationrequest':
        return {
          title: resource.medicationCodeableConcept?.coding?.[0]?.display || 'Unknown',
          subtitle: `Dosage: ${resource.dosageInstruction?.[0]?.text || 'N/A'}`,
          date: resource.authoredOn,
          status: resource.status
        };
      case 'encounter':
        return {
          title: resource.class?.display || resource.class?.code || 'Visit',
          subtitle: resource.type?.[0]?.coding?.[0]?.display || 'General Visit',
          date: resource.period?.start,
          status: resource.status
        };
      case 'observation':
        return {
          title: resource.code?.coding?.[0]?.display || 'Unknown',
          subtitle: resource.valueQuantity 
            ? `${resource.valueQuantity.value} ${resource.valueQuantity.unit || ''}`
            : resource.valueString || 'N/A',
          date: resource.effectiveDateTime || resource.issued,
          status: resource.status
        };
      case 'procedure':
        return {
          title: resource.code?.coding?.[0]?.display || 'Unknown',
          subtitle: resource.category?.coding?.[0]?.display || 'Procedure',
          date: resource.performedDateTime || resource.performedPeriod?.start,
          status: resource.status
        };
      case 'allergyintolerance':
        return {
          title: resource.code?.coding?.[0]?.display || 'Unknown',
          subtitle: `Type: ${resource.type || 'N/A'} | Category: ${resource.category?.[0] || 'N/A'}`,
          date: resource.recordedDate,
          status: resource.clinicalStatus?.coding?.[0]?.code
        };
      case 'immunization':
        return {
          title: resource.vaccineCode?.coding?.[0]?.display || 'Unknown',
          subtitle: `Lot: ${resource.lotNumber || 'N/A'}`,
          date: resource.occurrenceDateTime,
          status: resource.status
        };
      case 'appointment':
        return {
          title: resource.appointmentType?.coding?.[0]?.display || 'Appointment',
          subtitle: resource.description || 'No description',
          date: resource.start,
          status: resource.status
        };
      case 'diagnosticreport':
        return {
          title: resource.code?.coding?.[0]?.display || 'Lab Report',
          subtitle: `Category: ${resource.category?.[0]?.coding?.[0]?.display || 'N/A'}`,
          date: resource.effectiveDateTime || resource.issued,
          status: resource.status
        };
      case 'servicerequest':
        return {
          title: resource.code?.coding?.[0]?.display || 'Service Request',
          subtitle: `Priority: ${resource.priority || 'N/A'}`,
          date: resource.authoredOn,
          status: resource.status
        };
      case 'documentreference':
        return {
          title: resource.type?.coding?.[0]?.display || 'Document',
          subtitle: resource.description || 'No description',
          date: resource.date,
          status: resource.status
        };
      default:
        return {
          title: 'Resource',
          subtitle: 'N/A',
          date: null,
          status: null
        };
    }
  };

  const renderConditionDetails = (resource) => {
    const clinicalStatus = resource.clinicalStatus?.coding?.[0]?.code || 'N/A';
    const verificationStatus = resource.verificationStatus?.coding?.[0]?.code || 'N/A';
    
    return (
      <div className="mt-4 pt-4 border-t-2 border-blue-100 space-y-4 bg-gradient-to-br from-blue-50 to-teal-50 p-6 rounded-b-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailField 
            label="Diagnosis" 
            value={resource.code?.coding?.[0]?.display || 'Unknown'}
          />
          <DetailField 
            label="Clinical Status" 
            value={clinicalStatus.charAt(0).toUpperCase() + clinicalStatus.slice(1)}
            icon={AlertCircle}
          />
          <DetailField 
            label="Verification" 
            value={verificationStatus.charAt(0).toUpperCase() + verificationStatus.slice(1)}
          />
          <DetailField 
            label="Severity" 
            value={resource.severity?.coding?.[0]?.display || 'Not specified'}
          />
          <DetailField 
            label="Category" 
            value={resource.category?.[0]?.coding?.[0]?.display || 'N/A'}
          />
          <DetailField 
            label="Medical Code" 
            value={resource.code?.coding?.[0]?.code || 'N/A'}
          />
          <DetailField 
            label="When It Started" 
            value={formatFhirDateTime(resource.onsetDateTime)}
            icon={Calendar}
          />
          <DetailField 
            label="Date Recorded" 
            value={formatFhirDateTime(resource.recordedDate)}
            icon={Calendar}
          />
        </div>
        {resource.recorder && (
          <div className="mt-4 p-4 bg-white border-l-4 border-blue-500 rounded-lg shadow-sm">
            <div className="flex items-center space-x-3 text-blue-800">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Stethoscope className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase">Diagnosed By</p>
                <span className="font-bold text-gray-900">Practitioner ID: {resource.recorder.reference?.split('/')[1] || 'Unknown'}</span>
              </div>
            </div>
          </div>
        )}
        <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 rounded-lg shadow-sm">
          <p className="text-sm text-yellow-900 flex items-center space-x-2 font-medium">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <span>This is a read-only clinical record. Conditions cannot be modified by patients.</span>
          </p>
        </div>
      </div>
    );
  };

  const renderMedicationDetails = (resource) => {
    const dosage = resource.dosageInstruction?.[0];
    const doseAmount = dosage?.doseAndRate?.[0]?.doseQuantity;
    
    return (
      <div className="mt-4 pt-4 border-t-2 border-blue-100 space-y-4 bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-b-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailField 
            label="Medication Name" 
            value={resource.medicationCodeableConcept?.coding?.[0]?.display || 'Unknown'}
          />
          <DetailField 
            label="Status" 
            value={resource.status?.charAt(0).toUpperCase() + resource.status?.slice(1) || 'N/A'}
          />
          <DetailField 
            label="Priority" 
            value={resource.priority?.charAt(0).toUpperCase() + resource.priority?.slice(1) || 'Routine'}
          />
          <DetailField 
            label="Prescribed On" 
            value={formatFhirDateTime(resource.authoredOn)}
            icon={Calendar}
          />
          {doseAmount && (
            <DetailField 
              label="Dose Amount" 
              value={`${doseAmount.value} ${doseAmount.unit || ''}`}
            />
          )}
          {dosage?.text && (
            <div className="col-span-2">
              <DetailField 
                label="Instructions" 
                value={dosage.text}
              />
            </div>
          )}
        </div>
        {resource.requester && (
          <div className="mt-4 p-4 bg-white border-l-4 border-blue-500 rounded-lg shadow-sm">
            <div className="flex items-center space-x-3 text-blue-800">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Stethoscope className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase">Prescribed By</p>
                <span className="font-bold text-gray-900">Practitioner ID: {resource.requester.reference?.split('/')[1] || 'Unknown'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderEncounterDetails = (resource) => (
    <div className="mt-4 pt-4 border-t-2 border-blue-100 space-y-4 bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-b-xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DetailField 
          label="Visit Type" 
          value={resource.type?.[0]?.coding?.[0]?.display || resource.class?.display || 'General Visit'}
        />
        <DetailField 
          label="Status" 
          value={resource.status?.charAt(0).toUpperCase() + resource.status?.slice(1) || 'N/A'}
        />
        <DetailField 
          label="Service" 
          value={resource.serviceType?.coding?.[0]?.display || 'General Care'}
        />
        <DetailField 
          label="Visit Date" 
          value={formatFhirDateTime(resource.period?.start)}
          icon={Calendar}
        />
        {resource.period?.end && (
          <DetailField 
            label="Completed On" 
            value={formatFhirDateTime(resource.period.end)}
            icon={Calendar}
          />
        )}
      </div>
    </div>
  );

  const renderObservationDetails = (resource) => {
    const hasReferenceRange = resource.referenceRange?.[0];
    const interpretation = resource.interpretation?.[0]?.coding?.[0]?.code;
    const interpretationText = interpretation === 'N' ? 'Normal' : 
                               interpretation === 'H' ? 'High' : 
                               interpretation === 'L' ? 'Low' : 
                               interpretation || 'N/A';
    
    return (
      <div className="mt-4 pt-4 border-t-2 border-blue-100 space-y-4 bg-gradient-to-br from-teal-50 to-green-50 p-6 rounded-b-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailField 
            label="Measurement" 
            value={resource.code?.coding?.[0]?.display || 'Unknown'}
          />
          <DetailField 
            label="Value" 
            value={resource.valueQuantity 
              ? `${resource.valueQuantity.value} ${resource.valueQuantity.unit || ''}`
              : resource.valueString || 'N/A'}
          />
          <DetailField 
            label="Interpretation" 
            value={interpretationText}
          />
          <DetailField 
            label="Date Recorded" 
            value={formatFhirDateTime(resource.effectiveDateTime || resource.issued)}
            icon={Calendar}
          />
          {hasReferenceRange && (
            <div className="col-span-2">
              <DetailField 
                label="Normal Range" 
                value={`${hasReferenceRange.low?.value || 'N/A'} - ${hasReferenceRange.high?.value || 'N/A'} ${resource.valueQuantity?.unit || ''}`}
              />
            </div>
          )}
        </div>
        {resource.performer?.[0] && (
          <div className="mt-4 p-4 bg-white border-l-4 border-teal-500 rounded-lg shadow-sm">
            <div className="flex items-center space-x-3 text-teal-800">
              <div className="bg-teal-100 p-2 rounded-lg">
                <Stethoscope className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase">Performed By</p>
                <span className="font-bold text-gray-900">Practitioner ID: {resource.performer[0].reference?.split('/')[1] || 'Unknown'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderProcedureDetails = (resource) => (
    <div className="mt-4 pt-4 border-t-2 border-blue-100 space-y-4 bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-b-xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DetailField 
          label="Procedure Name" 
          value={resource.code?.coding?.[0]?.display || 'Unknown'}
        />
        <DetailField 
          label="Status" 
          value={resource.status?.charAt(0).toUpperCase() + resource.status?.slice(1) || 'N/A'}
        />
        <DetailField 
          label="Category" 
          value={resource.category?.coding?.[0]?.display || 'General Procedure'}
        />
        <DetailField 
          label="Date Performed" 
          value={formatFhirDateTime(resource.performedDateTime || resource.performedPeriod?.start)}
          icon={Calendar}
        />
        {resource.performedPeriod?.end && (
          <DetailField 
            label="Completed On" 
            value={formatFhirDateTime(resource.performedPeriod.end)}
            icon={Calendar}
          />
        )}
      </div>
    </div>
  );

  const renderAllergyDetails = (resource) => {
    const clinicalStatus = resource.clinicalStatus?.coding?.[0]?.code || 'N/A';
    const criticality = resource.criticality || 'Not specified';
    
    return (
      <div className="mt-4 pt-4 border-t-2 border-red-100 space-y-4 bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-b-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailField 
            label="Allergen" 
            value={resource.code?.coding?.[0]?.display || 'Unknown'}
          />
          <DetailField 
            label="Status" 
            value={clinicalStatus.charAt(0).toUpperCase() + clinicalStatus.slice(1)}
            icon={AlertCircle}
          />
          <DetailField 
            label="Type" 
            value={resource.type?.charAt(0).toUpperCase() + resource.type?.slice(1) || 'N/A'}
          />
          <DetailField 
            label="Category" 
            value={resource.category?.[0]?.charAt(0).toUpperCase() + resource.category?.[0]?.slice(1) || 'N/A'}
          />
          <DetailField 
            label="Severity Level" 
            value={criticality.charAt(0).toUpperCase() + criticality.slice(1)}
          />
          <DetailField 
            label="Date Recorded" 
            value={formatFhirDateTime(resource.recordedDate)}
            icon={Calendar}
          />
        </div>
        <div className="mt-4 p-4 bg-gradient-to-r from-red-100 to-orange-100 border-l-4 border-red-500 rounded-lg shadow-sm">
          <p className="text-sm text-red-900 flex items-center space-x-2 font-medium">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span>This is a read-only clinical record. Allergies cannot be modified by patients.</span>
          </p>
        </div>
      </div>
    );
  };

  const renderImmunizationDetails = (resource) => (
    <div className="mt-4 pt-4 border-t-2 border-blue-100 space-y-4 bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-b-xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DetailField 
          label="Vaccine Name" 
          value={resource.vaccineCode?.coding?.[0]?.display || 'Unknown'}
        />
        <DetailField 
          label="Status" 
          value={resource.status?.charAt(0).toUpperCase() + resource.status?.slice(1) || 'N/A'}
        />
        <DetailField 
          label="Date Given" 
          value={formatFhirDateTime(resource.occurrenceDateTime)}
          icon={Calendar}
        />
        <DetailField 
          label="Administration Site" 
          value={resource.site?.coding?.[0]?.display || 'N/A'}
        />
        <DetailField 
          label="Route" 
          value={resource.route?.coding?.[0]?.display || 'N/A'}
        />
        <DetailField 
          label="Lot Number" 
          value={resource.lotNumber || 'Not recorded'}
        />
      </div>
        {resource.performer?.[0] && (
          <div className="mt-4 p-4 bg-white border-l-4 border-green-500 rounded-lg shadow-sm">
            <div className="flex items-center space-x-3 text-green-800">
              <div className="bg-green-100 p-2 rounded-lg">
                <Stethoscope className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase">Administered By</p>
                <span className="font-bold text-gray-900">{resource.performer[0].actor?.reference?.split('/')[1] || 'Healthcare Provider'}</span>
              </div>
            </div>
          </div>
        )}
    </div>
  );

  const renderAppointmentDetails = (resource) => (
    <div className="mt-4 pt-4 border-t-2 border-blue-100 space-y-4 bg-gradient-to-br from-green-50 to-teal-50 p-6 rounded-b-xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DetailField 
          label="Appointment Type" 
          value={resource.appointmentType?.coding?.[0]?.display || 'General Consultation'}
        />
        <DetailField 
          label="Status" 
          value={resource.status?.charAt(0).toUpperCase() + resource.status?.slice(1) || 'N/A'}
        />
        <DetailField 
          label="Scheduled Date & Time" 
          value={formatFhirDateTime(resource.start)}
          icon={Calendar}
        />
        <DetailField 
          label="Duration" 
          value={resource.minutesDuration ? `${resource.minutesDuration} minutes` : 'Not specified'}
        />
        {resource.description && (
          <div className="col-span-2">
            <DetailField label="Notes" value={resource.description} />
          </div>
        )}
      </div>
    </div>
  );

  const renderDiagnosticReportDetails = (resource) => (
    <div className="mt-4 pt-4 border-t-2 border-blue-100 space-y-4 bg-gradient-to-br from-cyan-50 to-blue-50 p-6 rounded-b-xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DetailField 
          label="Test Name" 
          value={resource.code?.coding?.[0]?.display || 'Lab Test'}
        />
        <DetailField 
          label="Status" 
          value={resource.status?.charAt(0).toUpperCase() + resource.status?.slice(1) || 'N/A'}
        />
        <DetailField 
          label="Category" 
          value={resource.category?.[0]?.coding?.[0]?.display || 'Laboratory'}
        />
        <DetailField 
          label="Test Date" 
          value={formatFhirDateTime(resource.effectiveDateTime)}
          icon={Calendar}
        />
        <DetailField 
          label="Report Issued" 
          value={formatFhirDateTime(resource.issued)}
          icon={Calendar}
        />
        {resource.conclusion && (
          <div className="col-span-2">
            <DetailField label="Results Summary" value={resource.conclusion} />
          </div>
        )}
      </div>
    </div>
  );

  const renderServiceRequestDetails = (resource) => (
    <div className="mt-4 pt-4 border-t-2 border-blue-100 space-y-4 bg-gradient-to-br from-amber-50 to-yellow-50 p-6 rounded-b-xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DetailField 
          label="Service Requested" 
          value={resource.code?.coding?.[0]?.display || 'Unknown Service'}
        />
        <DetailField 
          label="Status" 
          value={resource.status?.charAt(0).toUpperCase() + resource.status?.slice(1) || 'N/A'}
        />
        <DetailField 
          label="Priority" 
          value={resource.priority?.charAt(0).toUpperCase() + resource.priority?.slice(1) || 'Routine'}
        />
        <DetailField 
          label="Request Date" 
          value={formatFhirDateTime(resource.authoredOn)}
          icon={Calendar}
        />
        <DetailField 
          label="Category" 
          value={resource.category?.[0]?.coding?.[0]?.display || 'General'}
        />
      </div>
    </div>
  );

  const renderDocumentReferenceDetails = (resource) => (
    <div className="mt-4 pt-4 border-t-2 border-blue-100 space-y-4 bg-gradient-to-br from-slate-50 to-gray-50 p-6 rounded-b-xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DetailField 
          label="Document Type" 
          value={resource.type?.coding?.[0]?.display || 'Medical Document'}
        />
        <DetailField 
          label="Status" 
          value={resource.status?.charAt(0).toUpperCase() + resource.status?.slice(1) || 'N/A'}
        />
        <DetailField 
          label="Category" 
          value={resource.category?.[0]?.coding?.[0]?.display || 'General'}
        />
        <DetailField 
          label="Document Date" 
          value={formatFhirDateTime(resource.date)}
          icon={Calendar}
        />
        {resource.description && (
          <div className="col-span-2">
            <DetailField label="Description" value={resource.description} />
          </div>
        )}
      </div>
    </div>
  );

  const renderDetailedView = (resource) => {
    switch (resourceType) {
      case 'condition':
        return renderConditionDetails(resource);
      case 'medicationrequest':
        return renderMedicationDetails(resource);
      case 'encounter':
        return renderEncounterDetails(resource);
      case 'observation':
        return renderObservationDetails(resource);
      case 'procedure':
        return renderProcedureDetails(resource);
      case 'allergyintolerance':
        return renderAllergyDetails(resource);
      case 'immunization':
        return renderImmunizationDetails(resource);
      case 'appointment':
        return renderAppointmentDetails(resource);
      case 'diagnosticreport':
        return renderDiagnosticReportDetails(resource);
      case 'servicerequest':
        return renderServiceRequestDetails(resource);
      case 'documentreference':
        return renderDocumentReferenceDetails(resource);
      default:
        return null;
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-teal-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
          <Loader2 className="relative w-16 h-16 animate-spin text-blue-600" />
        </div>
        <p className="mt-6 text-gray-600 font-medium">Loading your medical records...</p>
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
            <p className="font-bold text-red-900 text-lg">Error loading data</p>
            <p className="text-red-700 mt-1">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  const getResourceIcon = () => {
    const iconMap = {
      condition: AlertCircle,
      medicationrequest: Loader2,
      encounter: Stethoscope,
      observation: Activity,
      procedure: Stethoscope,
      allergyintolerance: AlertCircle,
      immunization: Activity,
      appointment: Calendar,
      diagnosticreport: Activity,
      servicerequest: Activity,
      documentreference: Activity
    };
    return iconMap[resourceType] || Activity;
  };

  const ResourceIcon = getResourceIcon();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-blue-500 to-teal-500 p-3 rounded-xl shadow-md">
              <ResourceIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
              <p className="text-sm text-gray-500 mt-1">View and manage your medical records</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-secondary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-gray-700 font-medium">
              Showing <span className="font-bold text-blue-600">{resources.length}</span> of{' '}
              <span className="font-bold text-blue-600">{total}</span> records
            </p>
          </div>
        </div>

        {resources.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <ResourceIcon className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg font-medium">No {title.toLowerCase()} found</p>
            <p className="text-gray-400 text-sm mt-2">Your medical records will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {resources.map((resource) => {
              const display = getResourceDisplay(resource);
              const isExpanded = expandedId === resource.id;
              return (
                <div
                  key={resource.id}
                  className={`border-2 rounded-xl transition-all ${
                    isExpanded 
                      ? 'border-blue-300 shadow-xl bg-gradient-to-r from-blue-50/50 to-teal-50/50' 
                      : 'border-gray-200 hover:border-blue-200 shadow-md hover:shadow-lg bg-white'
                  }`}
                >
                  <div 
                    className="p-5 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : resource.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${
                          isExpanded ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          <ResourceIcon className={`w-5 h-5 ${
                            isExpanded ? 'text-blue-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-bold text-gray-900">{display.title}</h3>
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-blue-600 font-bold" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1 font-medium">{display.subtitle}</p>
                          {display.date && (
                            <div className="flex items-center space-x-1 mt-2">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              <p className="text-xs text-gray-500 font-medium">
                                {formatFhirDateTime(display.date)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      {display.status && (
                        <span className={`status-badge ${
                          STATUS_COLORS[display.status] || 'bg-gray-100 text-gray-800'
                        }`}>
                          {display.status}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {isExpanded && renderDetailedView(resource)}
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t-2 border-gray-100">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="flex items-center space-x-2 px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 transition-all shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-teal-50 px-5 py-2 rounded-lg border border-blue-200">
              <span className="text-sm font-bold text-gray-700">
                Page {page + 1} of {totalPages}
              </span>
            </div>

            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="flex items-center space-x-2 px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 transition-all shadow-sm"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClinicalDataList;
