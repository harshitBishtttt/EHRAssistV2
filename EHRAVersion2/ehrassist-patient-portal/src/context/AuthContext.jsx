import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [patientId, setPatientId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        localStorage.setItem('authToken', token);
        setUser(firebaseUser);
        
        const storedPatientId = localStorage.getItem('patientId');
        if (storedPatientId) {
          setPatientId(storedPatientId);
        }
      } else {
        localStorage.removeItem('authToken');
        localStorage.removeItem('patientId');
        setUser(null);
        setPatientId(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      localStorage.setItem('authToken', token);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('authToken');
      localStorage.removeItem('patientId');
      setUser(null);
      setPatientId(null);
    } catch (error) {
      throw error;
    }
  };

  const updatePatientId = (id) => {
    setPatientId(id);
    localStorage.setItem('patientId', id);
  };

  const value = {
    user,
    patientId,
    login,
    logout,
    updatePatientId,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
