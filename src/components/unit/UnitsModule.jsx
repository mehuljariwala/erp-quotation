import { useState, useEffect, useRef } from 'react';
import {
  Plus, Search, RefreshCw, Ruler, Pencil, Trash2,
  ChevronLeft, ChevronRight, X, Check, AlertCircle,
  Loader2
} from 'lucide-react';
import { useUnitStore } from '../../stores/unitStore';
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

const UnitForm = ({ unit, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: unit?.name || '',
    alias: unit?.alias || '',
    isActive: unit?.isActive ?? true,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nameRef = useRef(null);
  const aliasRef = useRef(null);

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
    const result = await onSave({
      name: formData.name,
      alias: formData.alias,
      isActive: formData.isActive,
    });
    setIsSubmitting(false);

    if (result.success) {
      onClose();
    } else {
      setErrors({ submit: result.error });
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
            {unit ? 'Edit Unit' : 'Add Unit'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Unit Details</h3>
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
                  placeholder="Unit name"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Alias</label>
                <input
                  ref={aliasRef}
                  type="text"
                  value={formData.alias}
                  onChange={updateField('alias')}
                  onKeyDown={(e) => handleKeyDown(e, null)}
                  className={inputClass()}
                  placeholder="Short name"
                />
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
                  {unit ? 'Update' : 'Create'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteConfirmModal = ({ unit, onClose, onConfirm, isDeleting }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm border border-slate-200 p-6">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">Delete Unit</h3>
        <p className="text-sm text-slate-600 mb-6">
          Are you sure you want to delete <strong>{unit?.name}</strong>? This action cannot be undone.
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

export const UnitsModule = () => {
  const {
    units: rawUnits,
    isLoading,
    pagination,
    filters,
    fetchUnits,
    createUnit,
    updateUnit,
    deleteUnit,
    setFilters,
    setPage
  } = useUnitStore();

  const units = Array.isArray(rawUnits) ? rawUnits : [];

  const { showSuccess, showError } = useUIStore();

  const [showForm, setShowForm] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [deletingUnit, setDeletingUnit] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [searchValue, setSearchValue] = useState('');

  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    fetchUnits();
  }, [pagination.page, filters.name]);

  useEffect(() => {
    if (units.length > 0 && !selectedId) {
      setSelectedId(units[0].id);
    }
  }, [units]);

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
    setEditingUnit(null);
    setShowForm(true);
  };

  const handleEdit = (unit) => {
    setEditingUnit(unit);
    setShowForm(true);
  };

  const handleSave = async (formData) => {
    if (editingUnit) {
      const result = await updateUnit(editingUnit.id, formData);
      if (result.success) {
        showSuccess('Unit updated successfully');
      }
      return result;
    } else {
      const result = await createUnit(formData);
      if (result.success) {
        showSuccess('Unit created successfully');
      }
      return result;
    }
  };

  const handleDelete = async () => {
    if (!deletingUnit) return;
    setIsDeleting(true);
    const result = await deleteUnit(deletingUnit.id);
    setIsDeleting(false);
    if (result.success) {
      showSuccess('Unit deleted successfully');
      setDeletingUnit(null);
    } else {
      showError(result.error || 'Failed to delete unit');
    }
  };

  const handleRowClick = (unit) => {
    setSelectedId(unit.id);
  };

  const handleRowDoubleClick = (unit) => {
    handleEdit(unit);
  };

  const totalPages = Math.ceil(pagination.totalCount / pagination.pageSize) || 1;

  return (
    <div className="h-full flex flex-col">
      <div className="m-3 mb-0 bg-white rounded-lg border border-[#e2e8f0] shadow-sm flex flex-col min-h-0 flex-1 overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-4 py-3 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
              <Ruler className="w-4 h-4 text-teal-600" />
            </div>
            <h3 className="font-semibold text-slate-800">All Units</h3>
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{pagination.totalCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchValue}
                onChange={handleSearch}
                placeholder="Search units..."
                className="h-8 w-full md:w-52 pl-8 pr-3 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition-all"
              />
            </div>
            <button
              onClick={() => fetchUnits()}
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

        <div className="flex-1 overflow-auto min-h-0">
          <table className="w-full">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="hidden md:table-cell text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider w-14">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Name</th>
                <th className="hidden md:table-cell text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Alias</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider w-24">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && units.length === 0 ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={`loader-${i}`}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-4 py-4">
                        <Loader2 className="w-4 h-4 animate-spin text-slate-300" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : units.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <Ruler className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No units found</p>
                    <button
                      onClick={handleCreate}
                      className="mt-2 text-sm text-blue-600 hover:underline"
                    >
                      Add your first unit
                    </button>
                  </td>
                </tr>
              ) : (
                units.map((unit, index) => (
                  <tr
                    key={unit.id}
                    onClick={() => handleRowClick(unit)}
                    onDoubleClick={() => handleRowDoubleClick(unit)}
                    className={`cursor-pointer transition-colors ${
                      selectedId === unit.id ? 'bg-blue-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="hidden md:table-cell px-4 py-3 text-sm text-slate-500">
                      {(pagination.page - 1) * pagination.pageSize + index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-slate-800">{unit.name}</span>
                    </td>
                    <td className="hidden md:table-cell px-4 py-3">
                      <span className="text-sm text-slate-600">{unit.alias || '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge isActive={unit.isActive} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEdit(unit); }}
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeletingUnit(unit); }}
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

        {units.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50 flex-shrink-0">
            <p className="text-sm text-slate-600 hidden md:block">
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

      {showForm && (
        <UnitForm
          unit={editingUnit}
          onClose={() => setShowForm(false)}
          onSave={handleSave}
        />
      )}

      {deletingUnit && (
        <DeleteConfirmModal
          unit={deletingUnit}
          onClose={() => setDeletingUnit(null)}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};

export default UnitsModule;
