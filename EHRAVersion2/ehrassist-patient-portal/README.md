# EHRAssist Patient Portal

A modern React-based patient portal for accessing and managing Electronic Health Records (EHR) using FHIR R4 standards.

## Features

### Authentication
- Firebase Authentication
- Secure token-based API access
- Auto-logout on token expiration

### Dashboard
- Welcome card with patient info
- Quick stats (Conditions, Medications, Encounters, Appointments)
- Recent activity cards
- Quick navigation to clinical data

### Clinical Data Management
View and access:
- Conditions
- Medications (MedicationRequest)
- Lab Results (DiagnosticReport)
- Immunizations
- Encounters (Visits)
- Procedures
- Allergies (AllergyIntolerance)
- Vitals (Observations)
- Documents (DocumentReference)
- Appointments
- Service Requests

### Profile Management
- View personal information
- Edit name, contact info, address
- Update patient demographics

### Practitioner View
- View assigned practitioner details
- Contact information
- Qualifications and specialties

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **React Router v6** - Navigation
- **TanStack Query (React Query)** - Data fetching & caching
- **Axios** - HTTP client
- **Firebase** - Authentication
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **date-fns** - Date formatting

## Getting Started

### Prerequisites
- Node.js v18.20.8
- npm 9.9.4
- Backend API running on http://localhost:8081

### Installation

```bash
cd ehrassist-patient-portal
npm install
```

### Configuration

Update Firebase config in `src/config/firebase.js`:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  // ... other config
};
```

### Running the App

```bash
npm run dev
```

The app will run on **http://localhost:4000**

### Demo Credentials

Email: `hbisth@mailinator.com`
Password: (Your Firebase password)

## Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   └── Layout.jsx
│   └── ProtectedRoute.jsx
├── config/
│   ├── api.js
│   └── firebase.js
├── context/
│   └── AuthContext.jsx
├── pages/
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Profile.jsx
│   ├── PractitionerView.jsx
│   └── ClinicalDataList.jsx
├── services/
│   ├── patientService.js
│   └── clinicalService.js
├── utils/
│   ├── constants.js
│   └── fhirParser.js
├── App.jsx
└── main.jsx
```

## API Integration

The app integrates with FHIR R4 compliant backend APIs:

- Base URL: `http://localhost:8081/baseR4`
- Authentication: Bearer token (Firebase JWT)
- Content-Type: `application/fhir+json`

### Supported Search Parameters

All resources support:
- `_id` - Get specific resource by ID
- `patient` - Filter by patient ID
- Other resource-specific parameters

### AND Logic
Multiple search parameters use AND logic:
- `?_id=123&patient=456` - Returns resource with ID 123 that belongs to patient 456
- If no match, returns empty bundle

## Building for Production

```bash
npm run build
```

Build output will be in `dist/` folder.

## License

Proprietary - EHRAssist V2
