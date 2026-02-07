import { User, Mail, Shield, Building2 } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

export const UserModule = () => {
  const user = useAuthStore(state => state.user);
  const selectedOrg = useAuthStore(state => state.selectedOrg);

  const initial = user?.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <div className="h-full flex flex-col">
      <div className="m-3 mb-0 bg-white rounded-lg border border-[#e2e8f0] shadow-sm flex flex-col min-h-0 flex-1 overflow-hidden">
        <div className="px-4 py-3 border-b border-[#e2e8f0] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <User size={16} className="text-blue-600" />
          </div>
          <h2 className="text-base font-semibold text-[#1a1a2e]">User Profile</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-md mx-auto">
            <div className="flex flex-col items-center mb-8">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mb-4 shadow-lg">
                <span className="text-3xl font-bold text-white">{initial}</span>
              </div>
              <h3 className="text-xl font-semibold text-[#1a1a2e]">{user?.name || 'Unknown User'}</h3>
              {user?.role && (
                <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                  {user.role}
                </span>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <User size={16} className="text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-[#64748b]">Name</p>
                  <p className="text-sm font-medium text-[#1a1a2e] truncate">{user?.name || '-'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <Mail size={16} className="text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-[#64748b]">Email</p>
                  <p className="text-sm font-medium text-[#1a1a2e] truncate">{user?.email || '-'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
                <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <Shield size={16} className="text-amber-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-[#64748b]">Role</p>
                  <p className="text-sm font-medium text-[#1a1a2e] truncate">{user?.role || '-'}</p>
                </div>
              </div>

              {selectedOrg && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
                  <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                    <Building2 size={16} className="text-purple-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-[#64748b]">Organization</p>
                    <p className="text-sm font-medium text-[#1a1a2e] truncate">{selectedOrg.unName || selectedOrg.orgName || '-'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserModule;
