import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Plus, Search, RefreshCw, Building2, Pencil, Trash2,
  ChevronLeft, ChevronRight, X, Upload, Check, AlertCircle,
  Loader2, Image as ImageIcon
} from 'lucide-react';
import { useCompanyStore } from '../../stores/companyStore';
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

const CompanyForm = ({ company, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: company?.name || '',
    alias: company?.alias || '',
    isActive: company?.isActive ?? true,
    image: null,
    imageUrl: company?.imageUrl || ''
  });
  const [imagePreview, setImagePreview] = useState(company?.imageUrl || null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nameRef = useRef(null);
  const aliasRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Company name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const result = await onSave(formData);
    setIsSubmitting(false);

    if (result.success) {
      onClose();
    } else {
      setErrors({ submit: result.error });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleKeyDown = (e, nextRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextRef?.current) {
        nextRef.current.focus();
      } else {
        handleSubmit();
      }
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">
            {company ? 'Edit Company' : 'Add Company'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Image Upload */}
          <div className="flex justify-center">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-400 cursor-pointer transition-colors overflow-hidden group"
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <ImageIcon className="w-8 h-8 mb-1" />
                  <span className="text-xs">Upload</span>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              ref={nameRef}
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              onKeyDown={(e) => handleKeyDown(e, aliasRef)}
              className={`w-full h-10 px-3 text-sm border rounded-lg outline-none transition-all
                ${errors.name
                  ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                  : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-yellow-50'
                }`}
              placeholder="Enter company name"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Alias */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Alias</label>
            <input
              ref={aliasRef}
              type="text"
              value={formData.alias}
              onChange={(e) => setFormData(prev => ({ ...prev, alias: e.target.value }))}
              onKeyDown={(e) => handleKeyDown(e, null)}
              className="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-yellow-50"
              placeholder="Short name or alias"
            />
          </div>

          {/* Status */}
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

          {errors.submit && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {errors.submit}
            </div>
          )}

          {/* Actions */}
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
                  {company ? 'Update' : 'Create'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteConfirmModal = ({ company, onClose, onConfirm, isDeleting }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm border border-slate-200 p-6">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">Delete Company</h3>
        <p className="text-sm text-slate-600 mb-6">
          Are you sure you want to delete <strong>{company?.name}</strong>? This action cannot be undone.
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

export const CompanyModule = () => {
  const {
    companies: rawCompanies,
    isLoading,
    error,
    pagination,
    filters,
    fetchCompanies,
    createCompany,
    updateCompany,
    deleteCompany,
    setFilters,
    setPage,
    clearError
  } = useCompanyStore();

  const companies = Array.isArray(rawCompanies) ? rawCompanies : [];

  const { showSuccess, showError } = useUIStore();

  const [showForm, setShowForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [deletingCompany, setDeletingCompany] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    fetchCompanies();
  }, [pagination.page, filters.name]);

  const handleSearch = (value) => {
    setSearchValue(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setFilters({ name: value });
      setPage(1);
    }, 300);
  };

  const handleCreate = () => {
    setEditingCompany(null);
    setShowForm(true);
  };

  const handleEdit = (company) => {
    setEditingCompany(company);
    setShowForm(true);
  };

  const handleSave = async (formData) => {
    if (editingCompany) {
      const result = await updateCompany(editingCompany.id, formData);
      if (result.success) {
        showSuccess('Company updated successfully');
      }
      return result;
    } else {
      const result = await createCompany(formData);
      if (result.success) {
        showSuccess('Company created successfully');
      }
      return result;
    }
  };

  const handleDelete = async () => {
    if (!deletingCompany) return;
    setIsDeleting(true);
    const result = await deleteCompany(deletingCompany.id);
    setIsDeleting(false);
    if (result.success) {
      showSuccess('Company deleted successfully');
      setDeletingCompany(null);
    } else {
      showError(result.error || 'Failed to delete company');
    }
  };

  const totalPages = Math.ceil(pagination.totalCount / pagination.pageSize) || 1;

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-800">Companies</h1>
              <p className="text-xs text-slate-500">Manage your company records</p>
            </div>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 h-9 px-4 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Company
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search companies..."
              className="w-full h-9 pl-9 pr-3 text-sm border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <button
            onClick={() => fetchCompanies()}
            disabled={isLoading}
            className="flex items-center gap-2 h-9 px-3 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider w-16">
                  #
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider w-20">
                  Logo
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Company Name
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Alias
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider w-28">
                  Status
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider w-32">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && companies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">Loading companies...</p>
                  </td>
                </tr>
              ) : companies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No companies found</p>
                    <button
                      onClick={handleCreate}
                      className="mt-2 text-sm text-blue-600 hover:underline"
                    >
                      Add your first company
                    </button>
                  </td>
                </tr>
              ) : (
                companies.map((company, index) => (
                  <tr
                    key={company.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {(pagination.page - 1) * pagination.pageSize + index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                        {company.imageUrl ? (
                          <img
                            src={company.imageUrl}
                            alt={company.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Building2 className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-slate-800">{company.name}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-600">{company.alias || '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge isActive={company.isActive} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(company)}
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingCompany(company)}
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

          {/* Pagination */}
          {companies.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
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
      </div>

      {/* Modals */}
      {showForm && (
        <CompanyForm
          company={editingCompany}
          onClose={() => setShowForm(false)}
          onSave={handleSave}
        />
      )}

      {deletingCompany && (
        <DeleteConfirmModal
          company={deletingCompany}
          onClose={() => setDeletingCompany(null)}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};

export default CompanyModule;
