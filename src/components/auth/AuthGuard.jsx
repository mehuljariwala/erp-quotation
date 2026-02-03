import { useAuthStore } from '../../stores/authStore';
import { AuthPage } from './AuthPage';

export const AuthGuard = ({ children }) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return children;
};

export default AuthGuard;
