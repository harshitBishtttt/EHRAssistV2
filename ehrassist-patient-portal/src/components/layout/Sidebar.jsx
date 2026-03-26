import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, User, Stethoscope, Activity, Pill, FlaskConical, 
  Syringe, Hospital, Scissors, AlertTriangle, Heart, 
  FileText, Calendar, ClipboardList, X 
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'My Profile', path: '/profile', icon: User },
    { name: 'My Healthcare Team', path: '/practitioner', icon: Stethoscope },
    { name: 'My Appointments', path: '/appointments', icon: Calendar },
  ];

  const clinicalItems = [
    { name: 'Conditions', path: '/clinical/condition', icon: Activity },
    { name: 'Medications', path: '/clinical/medicationrequest', icon: Pill },
    { name: 'Lab Results', path: '/clinical/diagnosticreport', icon: FlaskConical },
    { name: 'Immunizations', path: '/clinical/immunization', icon: Syringe },
    { name: 'Encounters', path: '/clinical/encounter', icon: Hospital },
    { name: 'Procedures', path: '/clinical/procedure', icon: Scissors },
    { name: 'Allergies', path: '/clinical/allergyintolerance', icon: AlertTriangle },
    { name: 'Vitals', path: '/clinical/observation', icon: Heart },
    { name: 'Documents', path: '/clinical/documentreference', icon: FileText },
    { name: 'Service Requests', path: '/clinical/servicerequest', icon: ClipboardList },
  ];

  const isActive = (path) => location.pathname === path;

  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen bg-gradient-to-b from-white to-blue-50 shadow-2xl z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          w-72 overflow-y-auto border-r border-gray-200
        `}
      >
        <div className="p-5">
          <div className="flex items-center justify-between mb-8 lg:hidden">
            <h2 className="text-xl font-bold text-gray-900">Navigation</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all font-medium
                    ${isActive(item.path)
                      ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-md'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t-2 border-gray-200">
            <div className="flex items-center space-x-2 px-4 mb-4">
              <Activity className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Medical Records
              </h3>
            </div>
            <div className="space-y-1">
              {clinicalItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`
                      w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all text-sm
                      ${isActive(item.path)
                        ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-md font-medium'
                        : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
