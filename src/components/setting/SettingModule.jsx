import { useState, useEffect, useRef } from 'react';
import {
  Settings, Tag, Ruler, Receipt, Plus, Search, RefreshCw,
  Pencil, Trash2, ChevronLeft, ChevronRight, X, Check,
  Loader2, AlertCircle, Upload
} from 'lucide-react';
import { useCategoryStore } from '../../stores/categoryStore';
import { useUnitStore } from '../../stores/unitStore';
import { usePriceListStore } from '../../stores/priceListStore';
import { useUIStore } from '../../stores/uiStore';

const TABS = [
  { key: 'categories', label: 'Categories', icon: Tag, color: 'amber' },
  { key: 'units', label: 'Units', icon: Ruler, color: 'teal' },
  { key: 'priceLists', label: 'Price Lists', icon: Receipt, color: 'violet' },
];

const TAB_COLORS = {
  amber: { active: 'text-amber-600 border-amber-500', iconBg: 'bg-amber-100', iconText: 'text-amber-600' },
  teal: { active: 'text-teal-600 border-teal-500', iconBg: 'bg-teal-100', iconText: 'text-teal-600' },
  violet: { active: 'text-violet-600 border-violet-500', iconBg: 'bg-violet-100', iconText: 'text-violet-600' },
};

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

const CategoryForm = ({ item, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    alias: item?.alias || '',
    isActive: item?.isActive ?? true,
    image: null,
    imageUrl: item?.imageUrl || ''
  });
  const [imagePreview, setImagePreview] = useState(item?.imageUrl || null);
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
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    const result = await onSave(formData);
    setIsSubmitting(false);
    if (result.success) onClose();
    else setErrors({ submit: result.error });
  };

  const handleKeyDown = (e, nextRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextRef?.current) nextRef.current.focus();
      else handleSubmit();
    }
    if (e.key === 'Escape') onClose();
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target.result);
      reader.readAsDataURL(file);
    }
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
            {item ? 'Edit Category' : 'Add Category'}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              ref={nameRef}
              type="text"
              value={formData.name}
              onChange={(e) => { setFormData(prev => ({ ...prev, name: e.target.value })); if (errors.name) setErrors(prev => ({ ...prev, name: null })); }}
              onKeyDown={(e) => handleKeyDown(e, aliasRef)}
              className={inputClass(errors.name)}
              placeholder="Category name"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Alias</label>
            <input
              ref={aliasRef}
              type="text"
              value={formData.alias}
              onChange={(e) => setFormData(prev => ({ ...prev, alias: e.target.value }))}
              onKeyDown={(e) => handleKeyDown(e, null)}
              className={inputClass()}
              placeholder="Short name"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Image</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative h-20 rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-400 cursor-pointer transition-colors overflow-hidden group"
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <Upload className="w-5 h-5 mb-1" />
                  <span className="text-xs">Browse image</span>
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
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              ) : (
                <><Check className="w-4 h-4" /> {item ? 'Update' : 'Create'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const UnitForm = ({ item, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    alias: item?.alias || '',
    isActive: item?.isActive ?? true,
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
    const result = await onSave(formData);
    setIsSubmitting(false);
    if (result.success) onClose();
    else setErrors({ submit: result.error });
  };

  const handleKeyDown = (e, nextRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextRef?.current) nextRef.current.focus();
      else handleSubmit();
    }
    if (e.key === 'Escape') onClose();
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
            {item ? 'Edit Unit' : 'Add Unit'}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              ref={nameRef}
              type="text"
              value={formData.name}
              onChange={(e) => { setFormData(prev => ({ ...prev, name: e.target.value })); if (errors.name) setErrors(prev => ({ ...prev, name: null })); }}
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
              onChange={(e) => setFormData(prev => ({ ...prev, alias: e.target.value }))}
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
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              ) : (
                <><Check className="w-4 h-4" /> {item ? 'Update' : 'Create'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PriceListForm = ({ item, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    vchDate: item?.vchDate?.slice(0, 10) || '',
    remark: item?.remark || '',
    isActive: item?.isActive ?? true,
    excelFile: null,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nameRef = useRef(null);
  const dateRef = useRef(null);
  const remarkRef = useRef(null);
  const fileInputRef = useRef(null);

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
    const result = await onSave(formData);
    setIsSubmitting(false);
    if (result.success) onClose();
    else setErrors({ submit: result.error });
  };

  const handleKeyDown = (e, nextRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextRef?.current) nextRef.current.focus();
      else handleSubmit();
    }
    if (e.key === 'Escape') onClose();
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
            {item ? 'Edit Price List' : 'Add Price List'}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              ref={nameRef}
              type="text"
              value={formData.name}
              onChange={(e) => { setFormData(prev => ({ ...prev, name: e.target.value })); if (errors.name) setErrors(prev => ({ ...prev, name: null })); }}
              onKeyDown={(e) => handleKeyDown(e, dateRef)}
              className={inputClass(errors.name)}
              placeholder="Price list name"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Date</label>
            <input
              ref={dateRef}
              type="date"
              value={formData.vchDate}
              onChange={(e) => setFormData(prev => ({ ...prev, vchDate: e.target.value }))}
              onKeyDown={(e) => handleKeyDown(e, remarkRef)}
              className={inputClass()}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Remark</label>
            <input
              ref={remarkRef}
              type="text"
              value={formData.remark}
              onChange={(e) => setFormData(prev => ({ ...prev, remark: e.target.value }))}
              onKeyDown={(e) => handleKeyDown(e, null)}
              className={inputClass()}
              placeholder="Optional remark"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Excel File</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative h-16 rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-400 cursor-pointer transition-colors overflow-hidden group flex items-center justify-center gap-2"
            >
              {formData.excelFile ? (
                <div className="flex items-center gap-2 px-3">
                  <Receipt className="w-5 h-5 text-emerald-600" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{formData.excelFile.name}</p>
                    <p className="text-xs text-slate-400">{(formData.excelFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setFormData(prev => ({ ...prev, excelFile: null })); }}
                    className="ml-2 text-xs text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center text-slate-400">
                  <Upload className="w-5 h-5 mb-0.5" />
                  <span className="text-xs">Upload .xlsx or .csv</span>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => setFormData(prev => ({ ...prev, excelFile: e.target.files?.[0] || null }))}
                className="hidden"
              />
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
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              ) : (
                <><Check className="w-4 h-4" /> {item ? 'Update' : 'Create'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteConfirmModal = ({ label, itemName, onClose, onConfirm, isDeleting }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm border border-slate-200 p-6">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">Delete {label}</h3>
        <p className="text-sm text-slate-600 mb-6">
          Are you sure you want to delete <strong>{itemName}</strong>? This action cannot be undone.
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
              <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
);

export const SettingModule = () => {
  const {
    categories: rawCategories, isLoading: catLoading, pagination: catPagination,
    fetchCategories, createCategory, updateCategory, deleteCategory,
    setFilters: setCatFilters, setPage: setCatPage
  } = useCategoryStore();

  const {
    units: rawUnits, isLoading: unitLoading, pagination: unitPagination,
    fetchUnits, createUnit, updateUnit, deleteUnit,
    setFilters: setUnitFilters, setPage: setUnitPage
  } = useUnitStore();

  const {
    priceLists: rawPriceLists, isLoading: plLoading, pagination: plPagination,
    fetchPriceLists, createPriceList, updatePriceList, deletePriceList,
    setFilters: setPlFilters, setPage: setPlPage
  } = usePriceListStore();

  const { showSuccess, showError } = useUIStore();

  const categories = Array.isArray(rawCategories) ? rawCategories : [];
  const units = Array.isArray(rawUnits) ? rawUnits : [];
  const priceLists = Array.isArray(rawPriceLists) ? rawPriceLists : [];

  const [activeTab, setActiveTab] = useState('categories');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [searchValue, setSearchValue] = useState('');

  const searchTimeoutRef = useRef(null);

  const isLoading = activeTab === 'categories' ? catLoading : activeTab === 'units' ? unitLoading : plLoading;
  const pagination = activeTab === 'categories' ? catPagination : activeTab === 'units' ? unitPagination : plPagination;
  const items = activeTab === 'categories' ? categories : activeTab === 'units' ? units : priceLists;

  const fetchFn = activeTab === 'categories' ? fetchCategories : activeTab === 'units' ? fetchUnits : fetchPriceLists;
  const setFiltersFn = activeTab === 'categories' ? setCatFilters : activeTab === 'units' ? setUnitFilters : setPlFilters;
  const setPageFn = activeTab === 'categories' ? setCatPage : activeTab === 'units' ? setUnitPage : setPlPage;

  useEffect(() => {
    fetchFn();
  }, [activeTab]);

  useEffect(() => {
    setSelectedId(null);
    setSearchValue('');
  }, [activeTab]);

  useEffect(() => {
    if (items.length > 0 && !selectedId) {
      setSelectedId(items[0].id);
    }
  }, [items]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setFiltersFn({ name: value });
      setPageFn(1);
    }, 300);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleCreate = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleSave = async (formData) => {
    if (activeTab === 'categories') {
      if (editingItem) {
        const result = await updateCategory(editingItem.id, formData);
        if (result.success) showSuccess('Category updated');
        return result;
      }
      const result = await createCategory(formData);
      if (result.success) showSuccess('Category created');
      return result;
    }
    if (activeTab === 'units') {
      if (editingItem) {
        const result = await updateUnit(editingItem.id, formData);
        if (result.success) showSuccess('Unit updated');
        return result;
      }
      const result = await createUnit(formData);
      if (result.success) showSuccess('Unit created');
      return result;
    }
    if (editingItem) {
      const result = await updatePriceList(editingItem.id, formData);
      if (result.success) showSuccess('Price list updated');
      return result;
    }
    const result = await createPriceList(formData);
    if (result.success) showSuccess('Price list created');
    return result;
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    let result;
    if (activeTab === 'categories') result = await deleteCategory(deletingItem.id);
    else if (activeTab === 'units') result = await deleteUnit(deletingItem.id);
    else result = await deletePriceList(deletingItem.id);
    setIsDeleting(false);
    if (result.success) {
      showSuccess(`${activeTab === 'categories' ? 'Category' : activeTab === 'units' ? 'Unit' : 'Price list'} deleted`);
      setDeletingItem(null);
    } else {
      showError(result.error || 'Failed to delete');
    }
  };

  const tabLabel = activeTab === 'categories' ? 'Category' : activeTab === 'units' ? 'Unit' : 'Price List';
  const totalPages = Math.ceil(pagination.totalCount / pagination.pageSize) || 1;

  return (
    <div className="h-full flex flex-col">
      <div className="m-3 mb-0 bg-white rounded-lg border border-[#e2e8f0] shadow-sm flex flex-col min-h-0 flex-1 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Settings className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="font-semibold text-slate-800">Settings</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchValue}
                onChange={handleSearch}
                placeholder={`Search ${activeTab}...`}
                className="h-8 w-52 pl-8 pr-3 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition-all"
              />
            </div>
            <button
              onClick={() => fetchFn()}
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

        <div className="flex items-center gap-1 px-4 py-1 border-b border-slate-200 bg-slate-50/50 flex-shrink-0">
          {TABS.map(({ key, label, icon: Icon, color }) => {
            const isActive = activeTab === key;
            const colors = TAB_COLORS[color];
            return (
              <button
                key={key}
                onClick={() => handleTabChange(key)}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                  isActive
                    ? `${colors.active}`
                    : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-auto min-h-0">
          <table className="w-full">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider w-14">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Name</th>
                {activeTab !== 'priceLists' && (
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Alias</th>
                )}
                {activeTab === 'priceLists' && (
                  <>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider w-32">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Remark</th>
                  </>
                )}
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider w-24">Status</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && items.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === 'priceLists' ? 6 : 5} className="px-4 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">Loading {activeTab}...</p>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === 'priceLists' ? 6 : 5} className="px-4 py-12 text-center">
                    <Settings className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No {activeTab} found</p>
                    <button onClick={handleCreate} className="mt-2 text-sm text-blue-600 hover:underline">
                      Add your first {tabLabel.toLowerCase()}
                    </button>
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    onDoubleClick={() => handleEdit(item)}
                    className={`cursor-pointer transition-colors ${
                      selectedId === item.id ? 'bg-blue-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {(pagination.page - 1) * pagination.pageSize + index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-slate-800">{item.name}</span>
                    </td>
                    {activeTab !== 'priceLists' && (
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-600">{item.alias || '-'}</span>
                      </td>
                    )}
                    {activeTab === 'priceLists' && (
                      <>
                        <td className="px-4 py-3">
                          <span className="text-sm text-slate-600">
                            {item.vchDate ? new Date(item.vchDate).toLocaleDateString('en-IN') : '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-slate-600">{item.remark || '-'}</span>
                        </td>
                      </>
                    )}
                    <td className="px-4 py-3 text-center">
                      <StatusBadge isActive={item.isActive} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeletingItem(item); }}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {items.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50 flex-shrink-0">
            <p className="text-sm text-slate-600">
              Showing {(pagination.page - 1) * pagination.pageSize + 1} to{' '}
              {Math.min(pagination.page * pagination.pageSize, pagination.totalCount)} of{' '}
              {pagination.totalCount} results
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPageFn(pagination.page - 1)}
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
                onClick={() => setPageFn(pagination.page + 1)}
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

      {showForm && activeTab === 'categories' && (
        <CategoryForm
          item={editingItem}
          onClose={() => setShowForm(false)}
          onSave={handleSave}
        />
      )}

      {showForm && activeTab === 'units' && (
        <UnitForm
          item={editingItem}
          onClose={() => setShowForm(false)}
          onSave={handleSave}
        />
      )}

      {showForm && activeTab === 'priceLists' && (
        <PriceListForm
          item={editingItem}
          onClose={() => setShowForm(false)}
          onSave={handleSave}
        />
      )}

      {deletingItem && (
        <DeleteConfirmModal
          label={tabLabel}
          itemName={deletingItem.name}
          onClose={() => setDeletingItem(null)}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};

export default SettingModule;
