import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, updatePatientId } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      
      // TODO: Fetch patient ID based on user email or Firebase UID
      // For now, using a default patient ID
      const defaultPatientId = 'F09A8C1C-EC65-407A-A7BE-4E12D1AFBD56';
      updatePatientId(defaultPatientId);
      
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-teal-600 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full -ml-40 -mb-40"></div>
      
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-10 border border-gray-100">
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-teal-400 rounded-2xl blur-xl opacity-50"></div>
            <div className="relative bg-gradient-to-br from-blue-600 to-teal-600 p-4 rounded-2xl shadow-lg">
              <Heart className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">EHRAssist</h1>
          <p className="text-gray-600 mt-2 font-medium">Patient Portal</p>
          <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-teal-600 mx-auto mt-3 rounded-full"></div>
        </div>

        {error && (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 text-red-800 px-5 py-4 rounded-xl mb-6 shadow-sm">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed py-3 text-lg"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center p-4 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl border border-blue-200">
          <p className="text-sm font-semibold text-gray-700">Demo Credentials</p>
          <p className="text-sm mt-1 text-gray-600 font-mono">hbisth@mailinator.com</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
