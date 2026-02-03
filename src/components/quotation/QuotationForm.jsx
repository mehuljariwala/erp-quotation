import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Mail, Plus, Percent, Trash2, Save,
  Printer, RotateCcw, X, FileText, User, Calendar, Hash
} from 'lucide-react';
import { LineItemGrid } from './LineItemGrid';
import { ProductSelector } from './ProductSelector';
import { PartyAutocomplete } from '../ui/PartyAutocomplete';
import { SmartAutocomplete } from '../ui/SmartAutocomplete';
import { useQuotationStore } from '../../stores/quotationStore';
import { useUIStore } from '../../stores/uiStore';
import { useMasterStore } from '../../stores/masterStore';
import { useGlobalShortcuts } from '../../hooks/useKeyboardNavigation';
import { formatCurrency } from '../../utils/formatters';

const FormField = ({ label, children, icon: Icon }) => (
  <div className="flex flex-col gap-1">
    <label className="field-label flex items-center gap-1">
      {Icon && <Icon className="w-3 h-3" />}
      {label}
    </label>
    {children}
  </div>
);

const TableInput = ({ value, onChange, placeholder, readOnly, className = '', onKeyDown, inputRef, type = 'text', onArrowLeft, onArrowRight }) => {
  const handleKeyDown = (e) => {
    if ((e.key === 'Tab' || e.key === 'Enter') && onKeyDown) {
      onKeyDown(e);
      return;
    }
    if (e.key === 'ArrowLeft' && onArrowLeft) {
      const input = e.target;
      if (input.selectionStart === 0) {
        e.preventDefault();
        onArrowLeft();
      }
    } else if (e.key === 'ArrowRight' && onArrowRight) {
      const input = e.target;
      if (input.selectionStart === input.value.length) {
        e.preventDefault();
        onArrowRight();
      }
    } else if (onKeyDown) {
      onKeyDown(e);
    }
  };

  return (
    <input
      ref={inputRef}
      type={type}
      value={value || ''}
      onChange={onChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      readOnly={readOnly}
      className={`
        w-full h-9 px-3 text-[13px] bg-white border border-[#e2e8f0] rounded-md
        focus:bg-[#fef9c3] focus:border-[#3b82f6] focus:outline-none focus:ring-2 focus:ring-blue-100
        transition-all duration-150
        ${readOnly ? 'bg-[#f8fafc] text-[#64748b] cursor-default' : ''}
        ${className}
      `}
    />
  );
};

export const QuotationForm = ({ onBackToList }) => {
  const {
    currentQuotation,
    setParty,
    setReference,
    setRemark,
    setEmail,
    setSalesman,
    setPriceList,
    setVchDate,
    setProductForLineItem,
    saveQuotation,
    newQuotation,
    deleteQuotation,
    applyOverallDiscount,
    addLineItem
  } = useQuotationStore();

  const {
    isProductModalOpen,
    closeProductModal,
    activeProductRowId,
    showSuccess,
    showError
  } = useUIStore();

  const { parties, salesmen, priceLists } = useMasterStore();
  const [showDiscountModal, setShowDiscountModal] = useState(false);

  const partyRef = useRef(null);
  const referenceRef = useRef(null);
  const salesmanRef = useRef(null);
  const priceListRef = useRef(null);
  const emailRef = useRef(null);
  const remarkRef = useRef(null);
  const lineItemGridRef = useRef(null);

  useEffect(() => {
    partyRef.current?.focus();
  }, []);

  const handlePartySelect = useCallback((party) => {
    setParty(party);
  }, [setParty]);

  const handleReferenceSelect = useCallback((ref) => {
    setReference(ref);
  }, [setReference]);

  const handleSalesmanSelect = useCallback((salesman) => {
    setSalesman(salesman);
  }, [setSalesman]);

  const handlePriceListSelect = useCallback((priceList) => {
    setPriceList(priceList?.name || null);
  }, [setPriceList]);

  const handleSave = useCallback(async () => {
    if (!currentQuotation.party) {
      showError('Please select a party');
      return;
    }
    if (currentQuotation.lineItems.length === 0) {
      showError('Please add at least one item');
      return;
    }
    const result = await saveQuotation();
    if (result.success) {
      showSuccess('Saved Successfully');
    } else {
      showError(result.error || 'Failed to save quotation');
    }
  }, [currentQuotation, saveQuotation, showSuccess, showError]);

  const handleNew = useCallback(() => {
    newQuotation();
    showSuccess('New quotation created');
  }, [newQuotation, showSuccess]);

  const handleProductSelect = useCallback((product) => {
    if (activeProductRowId) {
      setProductForLineItem(activeProductRowId, product);
      setTimeout(() => {
        lineItemGridRef.current?.focusCell(activeProductRowId, 'qty');
      }, 100);
    }
    closeProductModal();
  }, [activeProductRowId, setProductForLineItem, closeProductModal]);

  useGlobalShortcuts({
    onCtrlS: (e) => { e.preventDefault(); handleSave(); },
    onCtrlN: (e) => { e.preventDefault(); handleNew(); },
    onCtrlP: (e) => { e.preventDefault(); window.print(); }
  });

  const totals = currentQuotation.totals;

  return (
    <div className="flex flex-col h-full bg-[#f1f5f9]">
      {/* Header Card */}
      <div className="m-3 mb-0 bg-white rounded-lg border border-[#e2e8f0] shadow-sm">
        {/* Title Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#e2e8f0]">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#3b82f6]" />
            <h1 className="text-base font-semibold text-[#0f172a]">New Quotation</h1>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-[#64748b]" />
              <span className="font-mono font-semibold text-[#3b82f6]">{String(currentQuotation.vchNo).padStart(4, '0')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#64748b]" />
              <span className="text-[#475569]">{currentQuotation.vchDate}</span>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="p-4">
          <div className="grid grid-cols-12 gap-x-4 gap-y-3">
            {/* Row 1: Party | Reference | Salesman | Price List */}
            <div className="col-span-4">
              <FormField label="Party" icon={User}>
                <PartyAutocomplete
                  ref={partyRef}
                  value={currentQuotation.party}
                  onChange={handlePartySelect}
                  placeholder="Select party..."
                  onNext={() => referenceRef.current?.focus()}
                />
              </FormField>
            </div>
            <div className="col-span-4">
              <FormField label="Reference">
                <PartyAutocomplete
                  ref={referenceRef}
                  value={currentQuotation.reference}
                  onChange={handleReferenceSelect}
                  placeholder="Select reference..."
                  searchType="Refrence"
                  onNext={() => salesmanRef.current?.focus()}
                  onPrev={() => partyRef.current?.focus()}
                />
              </FormField>
            </div>
            <div className="col-span-2">
              <FormField label="Salesman">
                <SmartAutocomplete
                  ref={salesmanRef}
                  value={currentQuotation.salesman}
                  onChange={handleSalesmanSelect}
                  options={salesmen}
                  searchFields={['name', 'code', 'phone', 'territory']}
                  type="salesman"
                  placeholder="Select..."
                  entityName="salesmen"
                  minWidth={340}
                  onNext={() => priceListRef.current?.focus()}
                  onPrev={() => referenceRef.current?.focus()}
                />
              </FormField>
            </div>
            <div className="col-span-2">
              <FormField label="Price List">
                <SmartAutocomplete
                  ref={priceListRef}
                  value={priceLists.find(p => p.name === currentQuotation.priceList) || null}
                  onChange={handlePriceListSelect}
                  options={priceLists}
                  searchFields={['name', 'code', 'description']}
                  type="priceList"
                  placeholder="Select..."
                  entityName="price lists"
                  minWidth={280}
                  onNext={() => emailRef.current?.focus()}
                  onPrev={() => salesmanRef.current?.focus()}
                />
              </FormField>
            </div>

            {/* Row 2: Email | Remark */}
            <div className="col-span-4">
              <FormField label="Email" icon={Mail}>
                <TableInput
                  inputRef={emailRef}
                  value={currentQuotation.email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  onKeyDown={(e) => {
                    if (e.key === 'Tab' || e.key === 'Enter') {
                      e.preventDefault();
                      if (e.shiftKey) {
                        priceListRef.current?.focus();
                      } else {
                        remarkRef.current?.focus();
                      }
                    }
                  }}
                />
              </FormField>
            </div>
            <div className="col-span-8">
              <FormField label="Remark">
                <TableInput
                  inputRef={remarkRef}
                  value={currentQuotation.remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="Add notes or remarks..."
                  onKeyDown={(e) => {
                    if (e.key === 'Tab' || e.key === 'Enter') {
                      e.preventDefault();
                      if (e.shiftKey) {
                        emailRef.current?.focus();
                      } else {
                        lineItemGridRef.current?.focusFirstCell?.();
                      }
                    }
                  }}
                />
              </FormField>
            </div>
          </div>
        </div>
      </div>

      {/* Line Items Grid */}
      <div className="flex-1 m-3 overflow-hidden bg-white rounded-lg border border-[#e2e8f0] shadow-sm">
        <LineItemGrid ref={lineItemGridRef} />
      </div>

      {/* Bottom Section */}
      <div className="m-3 mt-0 bg-white rounded-lg border border-[#e2e8f0] shadow-sm">
        <div className="flex items-center justify-between p-3">
          {/* Left Actions */}
          <div className="flex items-center gap-2">
            <button className="win-btn" onClick={() => showSuccess('Email feature coming soon')}>
              <Mail className="w-3.5 h-3.5" />
              Email
            </button>
            <button className="win-btn" onClick={addLineItem}>
              <Plus className="w-3.5 h-3.5" />
              Add Row
            </button>
            <button className="win-btn" onClick={() => setShowDiscountModal(true)}>
              <Percent className="w-3.5 h-3.5" />
              Discount
            </button>
          </div>

          {/* Center - Totals */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-wider text-[#64748b] mb-0.5">Items</div>
              <div className="font-mono text-sm font-semibold">{totals.totalItems}</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-wider text-[#64748b] mb-0.5">Gross</div>
              <div className="font-mono text-sm">{formatCurrency(totals.grossAmount, { showSymbol: false })}</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-wider text-[#64748b] mb-0.5">Discount</div>
              <div className="font-mono text-sm text-red-500">-{formatCurrency(totals.discountAmount, { showSymbol: false })}</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-wider text-[#64748b] mb-0.5">GST</div>
              <div className="font-mono text-sm">{formatCurrency(totals.gstAmount, { showSymbol: false })}</div>
            </div>
            <div className="text-center px-4 py-1 bg-[#eff6ff] rounded-lg">
              <div className="text-[10px] uppercase tracking-wider text-[#3b82f6] mb-0.5">Net Total</div>
              <div className="font-mono text-lg font-bold text-[#3b82f6]">
                {formatCurrency(totals.netAmount, { showSymbol: true })}
              </div>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <button className="win-btn" onClick={handleNew}>
              <RotateCcw className="w-3.5 h-3.5" />
              New
            </button>
            <button className="win-btn win-btn-primary" onClick={handleSave}>
              <Save className="w-3.5 h-3.5" />
              Save
            </button>
            <button
              className="win-btn win-btn-danger"
              onClick={async () => {
                if (currentQuotation.id) {
                  const result = await deleteQuotation(currentQuotation.id);
                  if (result.success) {
                    showSuccess('Quotation deleted');
                  } else {
                    showError(result.error || 'Failed to delete');
                  }
                }
              }}
              disabled={!currentQuotation.id}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
            <button className="win-btn" onClick={() => window.print()}>
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            <button className="win-btn" onClick={onBackToList}>
              <X className="w-3.5 h-3.5" />
              Exit
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ProductSelector
        isOpen={isProductModalOpen}
        onClose={closeProductModal}
        onSelect={handleProductSelect}
        priceList={currentQuotation.priceList}
        priceId={currentQuotation.priceId}
      />

      {showDiscountModal && (
        <DiscountModal
          onClose={() => setShowDiscountModal(false)}
          onApply={(percent) => {
            applyOverallDiscount(percent);
            setShowDiscountModal(false);
            showSuccess(`Applied ${percent}% discount to all items`);
          }}
        />
      )}
    </div>
  );
};

const DiscountModal = ({ onClose, onApply }) => {
  const [discount, setDiscount] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      <div className="absolute inset-0 modal-overlay" onClick={onClose} />
      <div className="modal-dialog w-[320px] relative animate-scale-in">
        <div className="modal-title-bar">
          <span>Apply Overall Discount</span>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <label className="field-label block mb-2">Discount Percentage</label>
          <div className="flex gap-3">
            <input
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="form-field flex-1 text-lg font-mono"
              autoFocus
              placeholder="0.0"
            />
            <span className="flex items-center text-xl font-semibold text-[#64748b]">%</span>
          </div>
          <div className="flex gap-2 mt-5">
            <button className="action-btn flex-1" onClick={onClose}>Cancel</button>
            <button
              className="action-btn primary flex-1"
              onClick={() => onApply(parseFloat(discount) || 0)}
            >
              Apply Discount
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationForm;
