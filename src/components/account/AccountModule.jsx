import { useState, useEffect, useRef } from 'react';
import {
  Plus, Search, RefreshCw, Users, Pencil, Trash2,
  ChevronLeft, ChevronRight, X, Check, AlertCircle,
  Loader2, ChevronDown
} from 'lucide-react';
import { useAccountStore } from '../../stores/accountStore';
import { useUIStore } from '../../stores/uiStore';


const StatusBadge = ({ isActive }) => (
  <span className={`
    inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
    ${isActive
      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
      : 'bg-slate-100 text-slate-500 border border-slate-200'
    }
  `}>
    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
    {isActive ? 'Active' : 'Inactive'}
  </span>
);

const PartyTypeSelector = ({ value, onChange, onClose }) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef(null);

  const partyTypes = [
    { id: 'party', name: 'Party' },
    { id: 'architect', name: 'Architect' },
    { id: 'builder', name: 'Builder' },
    { id: 'contractor', name: 'Contractor' },
    { id: 'dealer', name: 'Dealer' },
    { id: 'retailer', name: 'Retailer' },
    { id: 'wholesaler', name: 'Wholesaler' },
  ];

  const filtered = partyTypes.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        onChange(filtered[selectedIndex].name);
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-xs border border-slate-200">
        <div className="px-4 py-3 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-800">Select Party Type</h3>
        </div>
        <div className="p-3 border-b border-slate-100">
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search..."
            className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div className="max-h-48 overflow-auto">
          {filtered.map((type, index) => (
            <div
              key={type.id}
              onClick={() => { onChange(type.name); onClose(); }}
              className={`px-4 py-2 text-sm cursor-pointer transition-colors ${
                index === selectedIndex ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
              } ${value === type.name ? 'font-medium' : ''}`}
            >
              {type.name}
            </div>
          ))}
        </div>
        <div className="px-4 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="h-8 px-4 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const AccountForm = ({ account, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: account?.name || '',
    alias: account?.alias || '',
    accType: account?.accGrpName || 'Party',
    address: account?.address1 || '',
    city: account?.city || '',
    pinCode: account?.pinCode || '',
    district: account?.district || '',
    state: account?.stateName || '',
    mobileNo: account?.mobileNo1 || '',
    email: account?.emailId || '',
    isActive: account?.isActive ?? true,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPartySelector, setShowPartySelector] = useState(false);

  const nameRef = useRef(null);
  const aliasRef = useRef(null);
  const accTypeRef = useRef(null);
  const addressRef = useRef(null);
  const cityRef = useRef(null);
  const pinRef = useRef(null);
  const districtRef = useRef(null);
  const stateRef = useRef(null);
  const mobileRef = useRef(null);
  const emailRef = useRef(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const submitData = {
      name: formData.name,
      alias: formData.alias,
      accGrpName: formData.accType,
      address1: formData.address,
      city: formData.city,
      pinCode: formData.pinCode,
      district: formData.district,
      stateName: formData.state,
      mobileNo1: formData.mobileNo,
      emailId: formData.email,
      isActive: formData.isActive,
    };
    const result = await onSave(submitData);
    setIsSubmitting(false);

    if (result.success) {
      onClose();
    } else {
      setErrors({ submit: result.error });
    }
  };

  const handleKeyDown = (e, nextRef, openSelector = false) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (openSelector) {
        setShowPartySelector(true);
      } else if (nextRef?.current) {
        nextRef.current.focus();
      } else {
        handleSubmit();
      }
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const updateField = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const inputClass = (error) => `
    w-full h-9 px-3 text-sm border rounded-lg outline-none transition-all
    ${error
      ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
      : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-yellow-50'
    }
  `;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md border border-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">
            {account ? 'Edit Account' : 'Add Account'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[70vh] overflow-auto">
          {/* Account Details Section */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Account Details</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  ref={nameRef}
                  type="text"
                  value={formData.name}
                  onChange={updateField('name')}
                  onKeyDown={(e) => handleKeyDown(e, aliasRef)}
                  className={inputClass(errors.name)}
                  placeholder="Account name"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Alias</label>
                  <input
                    ref={aliasRef}
                    type="text"
                    value={formData.alias}
                    onChange={updateField('alias')}
                    onKeyDown={(e) => handleKeyDown(e, accTypeRef, true)}
                    className={inputClass()}
                    placeholder="Short name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Account Type</label>
                  <div className="relative">
                    <input
                      ref={accTypeRef}
                      type="text"
                      value={formData.accType}
                      onClick={() => setShowPartySelector(true)}
                      onKeyDown={(e) => handleKeyDown(e, addressRef, true)}
                      readOnly
                      className={`${inputClass()} cursor-pointer pr-8`}
                      placeholder="Select type"
                    />
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Status</label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      formData.isActive ? 'bg-blue-500' : 'bg-slate-300'
                    }`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      formData.isActive ? 'left-6' : 'left-1'
                    }`} />
                  </button>
                  <span className="text-sm text-slate-700">
                    {formData.isActive ? 'Active' : 'Inactive'}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Address Details Section */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Address Details</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Address</label>
                <input
                  ref={addressRef}
                  type="text"
                  value={formData.address}
                  onChange={updateField('address')}
                  onKeyDown={(e) => handleKeyDown(e, cityRef)}
                  className={inputClass()}
                  placeholder="Street address"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">City</label>
                  <input
                    ref={cityRef}
                    type="text"
                    value={formData.city}
                    onChange={updateField('city')}
                    onKeyDown={(e) => handleKeyDown(e, pinRef)}
                    className={inputClass()}
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">PIN Code</label>
                  <input
                    ref={pinRef}
                    type="text"
                    value={formData.pinCode}
                    onChange={updateField('pinCode')}
                    onKeyDown={(e) => handleKeyDown(e, districtRef)}
                    className={inputClass()}
                    placeholder="PIN"
                    maxLength={6}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">District</label>
                  <input
                    ref={districtRef}
                    type="text"
                    value={formData.district}
                    onChange={updateField('district')}
                    onKeyDown={(e) => handleKeyDown(e, stateRef)}
                    className={inputClass()}
                    placeholder="District"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">State</label>
                <input
                  ref={stateRef}
                  type="text"
                  value={formData.state}
                  onChange={updateField('state')}
                  onKeyDown={(e) => handleKeyDown(e, mobileRef)}
                  className={inputClass()}
                  placeholder="State"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Mobile No.</label>
                  <input
                    ref={mobileRef}
                    type="tel"
                    value={formData.mobileNo}
                    onChange={updateField('mobileNo')}
                    onKeyDown={(e) => handleKeyDown(e, emailRef)}
                    className={inputClass()}
                    placeholder="Mobile number"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Email</label>
                  <input
                    ref={emailRef}
                    type="email"
                    value={formData.email}
                    onChange={updateField('email')}
                    onKeyDown={(e) => handleKeyDown(e, null)}
                    className={inputClass()}
                    placeholder="email@example.com"
                  />
                </div>
              </div>
            </div>
          </div>

          {errors.submit && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {errors.submit}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 px-4 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-10 px-4 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {account ? 'Update' : 'Create'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {showPartySelector && (
        <PartyTypeSelector
          value={formData.accType}
          onChange={(val) => {
            setFormData(prev => ({ ...prev, accType: val }));
            setTimeout(() => addressRef.current?.focus(), 50);
          }}
          onClose={() => setShowPartySelector(false)}
        />
      )}
    </div>
  );
};

const DeleteConfirmModal = ({ account, onClose, onConfirm, isDeleting }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm border border-slate-200 p-6">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">Delete Account</h3>
        <p className="text-sm text-slate-600 mb-6">
          Are you sure you want to delete <strong>{account?.name}</strong>? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-10 px-4 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 h-10 px-4 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
);

export const AccountModule = () => {
  const {
    accounts: rawAccounts,
    isLoading,
    pagination,
    filters,
    fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
    setFilters,
    setPage
  } = useAccountStore();

  const accounts = Array.isArray(rawAccounts) ? rawAccounts : [];

  const { showSuccess, showError } = useUIStore();

  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [deletingAccount, setDeletingAccount] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [searchValue, setSearchValue] = useState('');

  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    fetchAccounts();
  }, [pagination.page, filters.name]);

  useEffect(() => {
    if (accounts.length > 0 && !selectedId) {
      setSelectedId(accounts[0].id);
    }
  }, [accounts]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setFilters({ name: value });
      setPage(1);
    }, 300);
  };

  const handleCreate = () => {
    setEditingAccount(null);
    setShowForm(true);
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setShowForm(true);
  };

  const handleSave = async (formData) => {
    if (editingAccount) {
      const result = await updateAccount(editingAccount.id, formData);
      if (result.success) {
        showSuccess('Account updated successfully');
      }
      return result;
    } else {
      const result = await createAccount(formData);
      if (result.success) {
        showSuccess('Account created successfully');
      }
      return result;
    }
  };

  const handleDelete = async () => {
    if (!deletingAccount) return;
    setIsDeleting(true);
    const result = await deleteAccount(deletingAccount.id);
    setIsDeleting(false);
    if (result.success) {
      showSuccess('Account deleted successfully');
      setDeletingAccount(null);
    } else {
      showError(result.error || 'Failed to delete account');
    }
  };

  const handleRowClick = (account) => {
    setSelectedId(account.id);
  };

  const handleRowDoubleClick = (account) => {
    handleEdit(account);
  };

  const getSelectedAccount = () => accounts.find(a => a.id === selectedId);

  const totalPages = Math.ceil(pagination.totalCount / pagination.pageSize) || 1;

  return (
    <div className="h-full flex flex-col bg-slate-50 p-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col min-h-0 flex-1 overflow-hidden">
        {/* Sticky Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Users className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-slate-800">All Accounts</h3>
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{pagination.totalCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchValue}
                onChange={handleSearch}
                placeholder="Search accounts..."
                className="h-8 w-52 pl-8 pr-3 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition-all"
              />
            </div>
            <button
              onClick={() => fetchAccounts()}
              disabled={isLoading}
              className="h-8 px-2.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleCreate}
              className="flex items-center gap-1.5 h-8 px-3 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>
        </div>

        {/* Scrollable Table */}
        <div className="flex-1 overflow-auto min-h-0">
          <table className="w-full">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider w-14">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider w-72">Account</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">City</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider w-28">Mobile</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider w-24">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && accounts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">Loading accounts...</p>
                  </td>
                </tr>
              ) : accounts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No accounts found</p>
                    <button
                      onClick={handleCreate}
                      className="mt-2 text-sm text-blue-600 hover:underline"
                    >
                      Add your first account
                    </button>
                  </td>
                </tr>
              ) : (
                accounts.map((account, index) => (
                  <tr
                    key={account.id}
                    onClick={() => handleRowClick(account)}
                    onDoubleClick={() => handleRowDoubleClick(account)}
                    className={`cursor-pointer transition-colors ${
                      selectedId === account.id ? 'bg-blue-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {(pagination.page - 1) * pagination.pageSize + index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-600 flex-shrink-0">
                          {account.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">
                            {account.name}
                            {account.alias && (
                              <span className="text-xs text-slate-400 ml-1.5">({account.alias})</span>
                            )}
                          </p>
                          <p className="text-xs text-slate-400 truncate">
                            {account.emailId || account.address1 || '—'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        {account.accGrpName || 'Party'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-600">{account.city || '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-600">{account.mobileNo1 || '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge isActive={account.isActive} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEdit(account); }}
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeletingAccount(account); }}
                          className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Sticky Footer Pagination */}
        {accounts.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50 flex-shrink-0">
            <p className="text-sm text-slate-600">
              Showing {(pagination.page - 1) * pagination.pageSize + 1} to{' '}
              {Math.min(pagination.page * pagination.pageSize, pagination.totalCount)} of{' '}
              {pagination.totalCount} results
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800 hover:bg-white border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Prev
              </button>
              <span className="px-3 py-1.5 text-sm text-slate-700 bg-white border border-slate-300 rounded-lg">
                {pagination.page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(pagination.page + 1)}
                disabled={pagination.page >= totalPages}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800 hover:bg-white border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showForm && (
        <AccountForm
          account={editingAccount}
          onClose={() => setShowForm(false)}
          onSave={handleSave}
        />
      )}

      {deletingAccount && (
        <DeleteConfirmModal
          account={deletingAccount}
          onClose={() => setDeletingAccount(null)}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};

export default AccountModule;
