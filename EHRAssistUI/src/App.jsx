import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginScreen } from './components/LoginScreen';
import { HomeScreen } from './components/HomeScreen';
import { ChatWidget } from './components/ChatWidget';

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user) return <LoginScreen onLoginSuccess={() => {}} />;

  return (
    <>
      <HomeScreen />
      {/* Chat uses backend API - no OpenAI key needed on frontend */}
      <ChatWidget
        userName={user.name}
        userInitial={user.name.charAt(0).toUpperCase()}
      />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
