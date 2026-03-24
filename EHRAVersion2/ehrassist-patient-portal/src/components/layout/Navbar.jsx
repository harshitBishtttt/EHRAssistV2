import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Heart, LogOut, User, Menu, Activity } from 'lucide-react';
import { CLINICAL_RESOURCES } from '../../utils/constants';

const Navbar = ({ onMenuClick }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="bg-gradient-to-r from-blue-50 via-cyan-50 to-teal-50 shadow-md sticky top-0 z-50 border-b-2 border-blue-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onMenuClick}
              className="p-2 hover:bg-blue-100 rounded-lg lg:hidden transition-colors"
            >
              <Menu className="w-6 h-6 text-blue-700" />
            </button>
            
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
              <div className="relative">
                <div className="absolute inset-0 bg-blue-300 rounded-full blur-md opacity-30"></div>
                <div className="relative bg-gradient-to-br from-blue-600 to-teal-600 p-2.5 rounded-full shadow-lg">
                  <Activity className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-teal-600 bg-clip-text text-transparent tracking-tight">EHRAssist</span>
                <p className="text-xs text-blue-600 font-semibold">Patient Portal</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center space-x-3 px-4 py-2 bg-white hover:bg-blue-50 rounded-lg transition-colors shadow-sm border border-blue-200"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center shadow-md">
                <User className="w-5 h-5 text-white" />
              </div>
              <span className="hidden md:block text-gray-700 font-semibold">{user?.email?.split('@')[0] || 'User'}</span>
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-2xl py-2 border-2 border-blue-200 overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-teal-50 border-b-2 border-blue-100">
                  <p className="text-sm font-semibold text-gray-900">
                    {user?.email || 'User'}
                  </p>
                  <p className="text-xs text-blue-600 mt-0.5 font-medium">Patient Account</p>
                </div>
                <button
                  onClick={() => {
                    setShowProfile(false);
                    navigate('/profile');
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 flex items-center space-x-3 transition-colors font-medium"
                >
                  <User className="w-4 h-4 text-blue-600" />
                  <span>My Profile</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3 transition-colors font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
