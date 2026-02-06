import { useCallback } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { AuthPage } from './AuthPage';
import { OrgSelectorModal } from './OrgSelectorModal';

export const AuthGuard = ({ children }) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const selectedOrg = useAuthStore(state => state.selectedOrg);
  const organizationsUser = useAuthStore(state => state.organizationsUser);
  const setSelectedOrg = useAuthStore(state => state.setSelectedOrg);

  const handleOrgSelect = useCallback((org) => {
    setSelectedOrg(org);
  }, [setSelectedOrg]);

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  if (!selectedOrg && organizationsUser.length > 0) {
    return <OrgSelectorModal organizations={organizationsUser} onSelect={handleOrgSelect} />;
  }

  return children;
};

export default AuthGuard;
