import { useState, useEffect, useRef } from 'react';
import {
  Plus, Search, RefreshCw, Package, Pencil, Trash2,
  ChevronLeft, ChevronRight, X, Check, AlertCircle,
  Loader2, ChevronDown, Upload, Image as ImageIcon, Eye
} from 'lucide-react';
import { useProductStore } from '../../stores/productStore';
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

const CompanySelector = ({ value, onChange, onClose, companies }) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef(null);

  const filtered = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
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
        onChange(filtered[selectedIndex]);
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm border border-slate-200">
        <div className="px-4 py-3 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-800">Select Company</h3>
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
          {filtered.map((company, index) => (
            <div
              key={company.id}
              onClick={() => { onChange(company); onClose(); }}
              className={`px-4 py-2 text-sm cursor-pointer transition-colors ${
                index === selectedIndex ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
              } ${value?.id === company.id ? 'font-medium' : ''}`}
            >
              {company.name}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-4 py-3 text-sm text-slate-500 text-center">No companies found</div>
          )}
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

const CategorySelector = ({ value, onChange, onClose }) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef(null);

  const categories = [
    { id: 1, name: 'Bathroom' },
    { id: 2, name: 'Bath Spouts' },
    { id: 3, name: 'Faucets' },
    { id: 4, name: 'Showers' },
    { id: 5, name: 'Accessories' },
    { id: 6, name: 'Tiles' },
    { id: 7, name: 'Sanitary' },
    { id: 8, name: 'Kitchen' },
  ];

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
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
        onChange(filtered[selectedIndex]);
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm border border-slate-200">
        <div className="px-4 py-3 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-800">Select Category</h3>
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
          {filtered.map((category, index) => (
            <div
              key={category.id}
              onClick={() => { onChange(category); onClose(); }}
              className={`px-4 py-2 text-sm cursor-pointer transition-colors ${
                index === selectedIndex ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
              } ${value?.id === category.id ? 'font-medium' : ''}`}
            >
              {category.name}
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

const ProductForm = ({ product, onClose, onSave, companies }) => {
  const [formData, setFormData] = useState({
    companyId: product?.companyId || null,
    companyName: product?.companyName || '',
    categoryId: product?.categoryId || null,
    categoryName: product?.categoryName || '',
    skuCode: product?.skuCode || '',
    name: product?.name || '',
    hsnCode: product?.hsnCode || '',
    remark1: product?.remark1 || '',
    taxPer: product?.taxPer || 0,
    discPer: product?.discPer || 0,
    mrp: product?.mrp || 0,
    purchaseRate: product?.purchaseRate || 0,
    saleRate: product?.saleRate || 0,
    isActive: product?.isActive ?? true,
    image: null,
    imageUrl: product?.imageUrl || ''
  });
  const [imagePreview, setImagePreview] = useState(product?.imageUrl || null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCompanySelector, setShowCompanySelector] = useState(false);
  const [showCategorySelector, setShowCategorySelector] = useState(false);

  const companyRef = useRef(null);
  const categoryRef = useRef(null);
  const skuRef = useRef(null);
  const nameRef = useRef(null);
  const hsnRef = useRef(null);
  const remarkRef = useRef(null);
  const gstRef = useRef(null);
  const discRef = useRef(null);
  const mrpRef = useRef(null);
  const delPriceRef = useRef(null);
  const saleRateRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    companyRef.current?.focus();
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!formData.skuCode.trim()) newErrors.skuCode = 'SKU Code is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const submitData = {
      companyId: formData.companyId,
      categoryId: formData.categoryId,
      skuCode: formData.skuCode,
      name: formData.name,
      hsnCode: formData.hsnCode,
      remark1: formData.remark1,
      taxPer: parseFloat(formData.taxPer) || 0,
      discPer: parseFloat(formData.discPer) || 0,
      mrp: parseFloat(formData.mrp) || 0,
      purchaseRate: parseFloat(formData.purchaseRate) || 0,
      saleRate: parseFloat(formData.saleRate) || 0,
      isActive: formData.isActive,
      image: formData.image,
      imageUrl: formData.imageUrl
    };
    const result = await onSave(submitData);
    setIsSubmitting(false);

    if (result.success) {
      onClose();
    } else {
      setErrors({ submit: result.error });
    }
  };

  const handleKeyDown = (e, nextRef, openSelector = null) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (openSelector === 'company') {
        setShowCompanySelector(true);
      } else if (openSelector === 'category') {
        setShowCategorySelector(true);
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

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
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

  const excGst = formData.saleRate ? (parseFloat(formData.saleRate) / (1 + parseFloat(formData.taxPer || 0) / 100)).toFixed(2) : '0.00';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-xl border border-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">
            {product ? 'Edit Product' : 'Add Product'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[70vh] overflow-auto">
          {/* Product Details Section */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Product Details</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Company</label>
                  <div className="relative">
                    <input
                      ref={companyRef}
                      type="text"
                      value={formData.companyName}
                      onClick={() => setShowCompanySelector(true)}
                      onKeyDown={(e) => handleKeyDown(e, categoryRef, 'company')}
                      readOnly
                      className={`${inputClass()} cursor-pointer pr-8`}
                      placeholder="Select company"
                    />
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Category</label>
                  <div className="relative">
                    <input
                      ref={categoryRef}
                      type="text"
                      value={formData.categoryName}
                      onClick={() => setShowCategorySelector(true)}
                      onKeyDown={(e) => handleKeyDown(e, skuRef, 'category')}
                      readOnly
                      className={`${inputClass()} cursor-pointer pr-8`}
                      placeholder="Select category"
                    />
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    SKU Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={skuRef}
                    type="text"
                    value={formData.skuCode}
                    onChange={updateField('skuCode')}
                    onKeyDown={(e) => handleKeyDown(e, nameRef)}
                    className={inputClass(errors.skuCode)}
                    placeholder="e.g. K-001"
                  />
                  {errors.skuCode && <p className="text-red-500 text-xs mt-1">{errors.skuCode}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">HSN Code</label>
                  <input
                    ref={hsnRef}
                    type="text"
                    value={formData.hsnCode}
                    onChange={updateField('hsnCode')}
                    onKeyDown={(e) => handleKeyDown(e, remarkRef)}
                    className={inputClass()}
                    placeholder="HSN code"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Product Name</label>
                <input
                  ref={nameRef}
                  type="text"
                  value={formData.name}
                  onChange={updateField('name')}
                  onKeyDown={(e) => handleKeyDown(e, hsnRef)}
                  className={inputClass()}
                  placeholder="Product name"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Description</label>
                  <textarea
                    ref={remarkRef}
                    value={formData.remark1}
                    onChange={updateField('remark1')}
                    onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-yellow-50 resize-none"
                    placeholder="Product description..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Image</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="relative h-[76px] rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-400 cursor-pointer transition-colors overflow-hidden group"
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
                        <ImageIcon className="w-6 h-6 mb-1" />
                        <span className="text-xs">Browse</span>
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
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Pricing</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">GST (%)</label>
                  <input
                    ref={gstRef}
                    type="number"
                    value={formData.taxPer}
                    onChange={updateField('taxPer')}
                    onKeyDown={(e) => handleKeyDown(e, discRef)}
                    className={inputClass()}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Disc (%)</label>
                  <input
                    ref={discRef}
                    type="number"
                    value={formData.discPer}
                    onChange={updateField('discPer')}
                    onKeyDown={(e) => handleKeyDown(e, mrpRef)}
                    className={inputClass()}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">MRP</label>
                  <input
                    ref={mrpRef}
                    type="number"
                    value={formData.mrp}
                    onChange={updateField('mrp')}
                    onKeyDown={(e) => handleKeyDown(e, delPriceRef)}
                    className={inputClass()}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Purchase Rate</label>
                  <input
                    ref={delPriceRef}
                    type="number"
                    value={formData.purchaseRate}
                    onChange={updateField('purchaseRate')}
                    onKeyDown={(e) => handleKeyDown(e, saleRateRef)}
                    className={inputClass()}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Sale Rate</label>
                  <input
                    ref={saleRateRef}
                    type="number"
                    value={formData.saleRate}
                    onChange={updateField('saleRate')}
                    onKeyDown={(e) => handleKeyDown(e, null)}
                    className={inputClass()}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Inc. GST</label>
                  <input
                    type="text"
                    value={formData.saleRate || '0.00'}
                    readOnly
                    className="w-full h-9 px-3 text-sm border border-slate-200 rounded-lg bg-slate-100 text-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Exc. GST</label>
                  <input
                    type="text"
                    value={excGst}
                    readOnly
                    className="w-full h-9 px-3 text-sm border border-slate-200 rounded-lg bg-slate-100 text-slate-600"
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
                  {product ? 'Update' : 'Create'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {showCompanySelector && (
        <CompanySelector
          value={{ id: formData.companyId, name: formData.companyName }}
          onChange={(company) => {
            setFormData(prev => ({ ...prev, companyId: company.id, companyName: company.name }));
            setTimeout(() => categoryRef.current?.focus(), 50);
          }}
          onClose={() => setShowCompanySelector(false)}
          companies={companies}
        />
      )}

      {showCategorySelector && (
        <CategorySelector
          value={{ id: formData.categoryId, name: formData.categoryName }}
          onChange={(category) => {
            setFormData(prev => ({ ...prev, categoryId: category.id, categoryName: category.name }));
            setTimeout(() => skuRef.current?.focus(), 50);
          }}
          onClose={() => setShowCategorySelector(false)}
        />
      )}
    </div>
  );
};

const DeleteConfirmModal = ({ product, onClose, onConfirm, isDeleting }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm border border-slate-200 p-6">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">Delete Product</h3>
        <p className="text-sm text-slate-600 mb-6">
          Are you sure you want to delete <strong>{product?.name || product?.skuCode}</strong>? This action cannot be undone.
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

const ProductViewModal = ({ product, onClose, onEdit }) => {
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);
  const closeBtnRef = useRef(null);
  const editBtnRef = useRef(null);

  useEffect(() => {
    if (product) {
      closeButtonRef.current?.focus();
    }
  }, [product]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!product) return null;

  const excGst = product.saleRate ? (product.saleRate / (1 + (product.taxPer || 0) / 100)).toFixed(2) : '0.00';
  const nrp = product.mrp && product.discPer ? (product.mrp * (1 - product.discPer / 100)).toFixed(2) : product.mrp?.toFixed(2) || '0.00';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-view-title"
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-5">
          <button
            ref={closeButtonRef}
            onClick={onClose}
            tabIndex={0}
            className="absolute right-4 top-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 text-white" />
          </button>
          <div className="flex items-start gap-5">
            {/* Product Image */}
            <div className="w-28 h-28 rounded-xl bg-white shadow-lg flex items-center justify-center overflow-hidden shrink-0 ring-4 ring-white/20">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name || 'Product'}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                />
              ) : null}
              <div className={`w-full h-full items-center justify-center bg-slate-100 ${product.imageUrl ? 'hidden' : 'flex'}`}>
                <Package className="w-10 h-10 text-slate-400" />
              </div>
            </div>
            {/* Title Info */}
            <div className="flex-1 min-w-0 pt-2">
              <h2 id="product-view-title" className="text-xl font-bold text-white truncate">
                {product.name || product.skuCode || 'Untitled Product'}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2.5 py-1 rounded-full bg-white/20 text-xs font-medium text-white">
                  {product.skuCode || 'No SKU'}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  product.isActive !== false
                    ? 'bg-emerald-400/30 text-emerald-100'
                    : 'bg-slate-400/30 text-slate-200'
                }`}>
                  {product.isActive !== false ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4 max-h-[60vh] overflow-auto" tabIndex={0}>
          {/* Category & Company */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Company</p>
              <p className="text-sm font-semibold text-slate-700">{product.companyName || '—'}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Category</p>
              <p className="text-sm font-semibold text-slate-700">{product.categoryName || '—'}</p>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Pricing</h3>
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">MRP</p>
                  <p className="text-lg font-bold text-slate-800">₹{product.mrp?.toFixed(2) || '0.00'}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Sale Rate</p>
                  <p className="text-lg font-bold text-blue-600">₹{product.saleRate?.toFixed(2) || '0.00'}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">NRP</p>
                  <p className="text-lg font-bold text-emerald-600">₹{nrp}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-200">
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Purchase</p>
                  <p className="text-sm font-medium text-slate-600">₹{product.purchaseRate?.toFixed(2) || '0.00'}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Exc. GST</p>
                  <p className="text-sm font-medium text-slate-600">₹{excGst}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">HSN Code</p>
                  <p className="text-sm font-medium text-slate-600">{product.hsnCode || '—'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tax & Discount */}
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tax & Discount</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-amber-700">GST Rate</span>
                  <span className="text-lg font-bold text-amber-700">{product.taxPer?.toFixed(1) || '0'}%</span>
                </div>
              </div>
              <div className="bg-rose-50 rounded-xl p-3 border border-rose-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-rose-700">Discount</span>
                  <span className="text-lg font-bold text-rose-700">{product.discPer?.toFixed(1) || '0'}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {product.remark1 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Description</h3>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-sm text-slate-600 leading-relaxed">{product.remark1}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex gap-3">
          <button
            ref={closeBtnRef}
            onClick={onClose}
            tabIndex={0}
            className="flex-1 h-10 px-4 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            Close
          </button>
          <button
            ref={editBtnRef}
            onClick={() => { onClose(); onEdit(product); }}
            tabIndex={0}
            className="flex-1 h-10 px-4 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            <Pencil className="w-4 h-4" />
            Edit Product
          </button>
        </div>
      </div>
    </div>
  );
};

export const ProductModule = () => {
  const {
    products: rawProducts,
    isLoading,
    pagination,
    filters,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    setFilters,
    setPage
  } = useProductStore();

  const { companies, fetchCompanies } = useCompanyStore();

  const products = Array.isArray(rawProducts) ? rawProducts : [];
  const companyList = Array.isArray(companies) ? companies : [];

  const { showSuccess, showError } = useUIStore();

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    fetchProducts();
    fetchCompanies();
  }, [pagination.page, filters.name]);

  useEffect(() => {
    if (products.length > 0 && !selectedId) {
      setSelectedId(products[0].id);
    }
  }, [products]);

  const handleSearch = (value) => {
    setSearchValue(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setFilters({ name: value });
      setPage(1);
    }, 300);
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleSave = async (formData) => {
    if (editingProduct) {
      const result = await updateProduct(editingProduct.id, formData);
      if (result.success) {
        showSuccess('Product updated successfully');
      }
      return result;
    } else {
      const result = await createProduct(formData);
      if (result.success) {
        showSuccess('Product created successfully');
      }
      return result;
    }
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;
    setIsDeleting(true);
    const result = await deleteProduct(deletingProduct.id);
    setIsDeleting(false);
    if (result.success) {
      showSuccess('Product deleted successfully');
      setDeletingProduct(null);
    } else {
      showError(result.error || 'Failed to delete product');
    }
  };

  const handleRowClick = (product) => {
    setSelectedId(product.id);
  };

  const handleRowDoubleClick = (product) => {
    handleEdit(product);
  };

  const getSelectedProduct = () => products.find(p => p.id === selectedId);

  const totalPages = Math.ceil(pagination.totalCount / pagination.pageSize) || 1;

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-800">Products</h1>
              <p className="text-xs text-slate-500">Manage your product catalog</p>
            </div>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 h-9 px-4 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Product
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
              placeholder="Search products..."
              className="w-full h-9 pl-9 pr-3 text-sm border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <button
            onClick={() => fetchProducts()}
            disabled={isLoading}
            className="flex items-center gap-2 h-9 px-3 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <div className="flex gap-1 ml-auto">
            <button
              onClick={() => { const p = getSelectedProduct(); if (p) handleEdit(p); }}
              disabled={!selectedId}
              className="h-9 px-3 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => { const p = getSelectedProduct(); if (p) setDeletingProduct(p); }}
              disabled={!selectedId}
              className="h-9 px-3 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Top Pagination */}
          {products.length > 0 && (
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-slate-50">
              <p className="text-sm text-slate-600">
                Showing {(pagination.page - 1) * pagination.pageSize + 1} to{' '}
                {Math.min(pagination.page * pagination.pageSize, pagination.totalCount)} of{' '}
                {pagination.totalCount} results
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="flex items-center gap-1 px-2 py-1 text-sm text-slate-600 hover:text-slate-800 hover:bg-white border border-slate-300 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Prev
                </button>
                <span className="px-2 py-1 text-sm text-slate-700 bg-white border border-slate-300 rounded">
                  {pagination.page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(pagination.page + 1)}
                  disabled={pagination.page >= totalPages}
                  className="flex items-center gap-1 px-2 py-1 text-sm text-slate-600 hover:text-slate-800 hover:bg-white border border-slate-300 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-center px-2 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider w-20">Image</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider w-24">SKU Code</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider min-w-[150px]">Product</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider w-24">Category</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider w-28">Company</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider w-20">HSNCode</th>
                  <th className="text-right px-3 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider w-20">MRP</th>
                  <th className="text-right px-3 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider w-20">Purchase</th>
                  <th className="text-right px-3 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider w-16">GST(%)</th>
                  <th className="text-right px-3 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider w-16">Disc(%)</th>
                  <th className="text-right px-3 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider w-20">NRP</th>
                  <th className="text-right px-3 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider w-20">SaleRate</th>
                  <th className="text-right px-3 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider w-20">Exc.GST</th>
                  <th className="text-center px-3 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading && products.length === 0 ? (
                  <tr>
                    <td colSpan={14} className="px-4 py-12 text-center">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">Loading products...</p>
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={14} className="px-4 py-12 text-center">
                      <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">No products found</p>
                      <button
                        onClick={handleCreate}
                        className="mt-2 text-sm text-blue-600 hover:underline"
                      >
                        Add your first product
                      </button>
                    </td>
                  </tr>
                ) : (
                  products.map((product) => {
                    const excGst = product.saleRate ? (product.saleRate / (1 + (product.taxPer || 0) / 100)).toFixed(2) : '0.00';
                    const nrp = product.mrp && product.discPer ? (product.mrp * (1 - product.discPer / 100)).toFixed(2) : product.mrp?.toFixed(2) || '0.00';
                    return (
                      <tr
                        key={product.id}
                        onClick={() => handleRowClick(product)}
                        onDoubleClick={() => handleRowDoubleClick(product)}
                        className={`cursor-pointer transition-colors ${
                          selectedId === product.id ? 'bg-blue-50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="px-2 py-2">
                          <div className="flex items-center justify-center">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name || 'Product'}
                                className="w-14 h-14 object-cover rounded-lg border border-slate-200 shadow-sm"
                                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                              />
                            ) : null}
                            <div
                              className={`w-14 h-14 rounded-lg bg-slate-100 border border-slate-200 items-center justify-center ${product.imageUrl ? 'hidden' : 'flex'}`}
                            >
                              <ImageIcon className="w-6 h-6 text-slate-400" />
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <span className="text-sm font-mono text-slate-700">{product.skuCode || '—'}</span>
                        </td>
                        <td className="px-3 py-2">
                          <span className="text-sm text-slate-800">{product.name || '—'}</span>
                        </td>
                        <td className="px-3 py-2">
                          <span className="text-sm text-slate-600">{product.categoryName || '—'}</span>
                        </td>
                        <td className="px-3 py-2">
                          <span className="text-sm text-slate-600">{product.companyName || '—'}</span>
                        </td>
                        <td className="px-3 py-2">
                          <span className="text-sm text-slate-600">{product.hsnCode || '—'}</span>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <span className="text-sm text-slate-700">{product.mrp?.toFixed(2) || '0.00'}</span>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <span className="text-sm text-slate-700">{product.purchaseRate?.toFixed(2) || '0.00'}</span>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <span className="text-sm text-slate-600">{product.taxPer?.toFixed(0) || '0'}</span>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <span className="text-sm text-slate-600">{product.discPer?.toFixed(0) || '0'}</span>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <span className="text-sm text-slate-700">{nrp}</span>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <span className="text-sm font-medium text-slate-800">{product.saleRate?.toFixed(2) || '0.00'}</span>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <span className="text-sm text-slate-600">{excGst}</span>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); setViewingProduct(product); }}
                              className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                              title="View"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleEdit(product); }}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Edit"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setDeletingProduct(product); }}
                              className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {products.length > 0 && (
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
        <ProductForm
          product={editingProduct}
          onClose={() => setShowForm(false)}
          onSave={handleSave}
          companies={companyList}
        />
      )}

      {deletingProduct && (
        <DeleteConfirmModal
          product={deletingProduct}
          onClose={() => setDeletingProduct(null)}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
        />
      )}

      {viewingProduct && (
        <ProductViewModal
          product={viewingProduct}
          onClose={() => setViewingProduct(null)}
          onEdit={handleEdit}
        />
      )}
    </div>
  );
};

export default ProductModule;
