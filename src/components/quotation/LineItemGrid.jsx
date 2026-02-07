import { useState, useCallback, useRef, useEffect, memo, forwardRef, useImperativeHandle } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Package, Building2, Tag, Image as ImageIcon } from 'lucide-react';
import { useQuotationStore } from '../../stores/quotationStore';
import { useUIStore } from '../../stores/uiStore';
import { formatCurrency } from '../../utils/formatters';

const columnConfig = [
  { id: 'rowNum', header: '', width: 35, editable: false, align: 'center' },
  { id: 'area', header: 'Area', width: 120, editable: true, type: 'text' },
  { id: 'priceList', header: 'PriceList', width: 100, editable: false, type: 'text' },
  { id: 'skuCode', header: 'SKU Code', width: 110, editable: true, type: 'text' },
  { id: 'image', header: 'Image', width: 85, editable: false, type: 'image', align: 'center' },
  { id: 'description', header: 'Desc', width: 150, editable: false, type: 'text' },
  { id: 'product', header: 'Product', width: 220, editable: true, type: 'product' },
  { id: 'mrp', header: 'MRP', width: 100, editable: true, type: 'currency', align: 'right' },
  { id: 'qty', header: 'Qty', width: 70, editable: true, type: 'number', align: 'right' },
  { id: 'grossAmount', header: 'GAmt.', width: 110, editable: false, type: 'currency', align: 'right' },
  { id: 'discPercent', header: 'Disc(%)', width: 80, editable: true, type: 'percent', align: 'right' },
  { id: 'discAmount', header: 'DiscAmt.', width: 100, editable: false, type: 'currency', align: 'right' },
  { id: 'gstPercent', header: 'GST(%)', width: 75, editable: false, type: 'percent', align: 'right' },
  { id: 'gstAmount', header: 'GST Amt', width: 100, editable: false, type: 'currency', align: 'right' },
  { id: 'netAmount', header: 'NetAmt.', width: 110, editable: false, type: 'currency', align: 'right' },
  { id: 'actions', header: '', width: 45, editable: false, align: 'center' }
];

const ProductInfoPopover = ({ product, position, onClose }) => {
  if (!product || !position) return null;

  return createPortal(
    <div
      className="fixed z-[9999] bg-white rounded-xl shadow-2xl border border-slate-200 w-72 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      style={{
        top: position.top,
        left: position.left,
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Header with Image */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3">
        <div className="flex items-start gap-3">
          <div className="w-16 h-16 rounded-lg bg-white shadow flex items-center justify-center overflow-hidden shrink-0">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name || 'Product'}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              />
            ) : null}
            <div className={`w-full h-full items-center justify-center bg-slate-100 ${product.imageUrl ? 'hidden' : 'flex'}`}>
              <Package className="w-6 h-6 text-slate-400" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white truncate">
              {product.name || 'Unnamed Product'}
            </h3>
            <p className="text-xs text-blue-100 mt-0.5 font-mono">
              {product.skuCode || 'No SKU'}
            </p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="p-3 space-y-2">
        {/* Company & Category */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-50 rounded-lg p-2">
            <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
              <Building2 className="w-3 h-3" />
              <span className="text-[10px] uppercase tracking-wide">Company</span>
            </div>
            <p className="text-xs font-medium text-slate-700 truncate">
              {product.companyName || '—'}
            </p>
          </div>
          <div className="bg-slate-50 rounded-lg p-2">
            <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
              <Tag className="w-3 h-3" />
              <span className="text-[10px] uppercase tracking-wide">Category</span>
            </div>
            <p className="text-xs font-medium text-slate-700 truncate">
              {product.categoryName || '—'}
            </p>
          </div>
        </div>

        {/* Pricing Row */}
        <div className="flex items-center justify-between bg-blue-50 rounded-lg px-3 py-2">
          <div className="text-center">
            <p className="text-[10px] text-slate-400 uppercase">MRP</p>
            <p className="text-sm font-bold text-slate-700">₹{product.mrp?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-slate-400 uppercase">GST</p>
            <p className="text-sm font-semibold text-amber-600">{product.taxPer || 0}%</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-slate-400 uppercase">Disc</p>
            <p className="text-sm font-semibold text-rose-500">{product.discPer || 0}%</p>
          </div>
        </div>

        {/* HSN Code */}
        {product.hsnCode && (
          <div className="flex items-center justify-between text-xs px-1">
            <span className="text-slate-400">HSN Code</span>
            <span className="font-mono text-slate-600">{product.hsnCode}</span>
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 text-center">
        <p className="text-[10px] text-slate-400">Press Enter to change product</p>
      </div>
    </div>,
    document.body
  );
};

const EditableCell = memo(({
  value,
  type,
  align,
  isEditing,
  isFocused,
  onChange,
  onStartEdit,
  onEndEdit,
  onKeyDown,
  isProductCell,
  onOpenProductModal,
  isSkuCodeCell,
  onSkuCodeFocus
}) => {
  const inputRef = useRef(null);
  const cellRef = useRef(null);
  const [localValue, setLocalValue] = useState(value ?? '');
  const [popoverPosition, setPopoverPosition] = useState(null);
  const wasEditingRef = useRef(false);

  useEffect(() => {
    if (isEditing && !wasEditingRef.current) {
      setLocalValue(value ?? '');
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }
    wasEditingRef.current = isEditing;
  }, [isEditing, value]);

  useEffect(() => {
    if (isProductCell && isFocused && value && cellRef.current) {
      const rect = cellRef.current.getBoundingClientRect();
      const popoverWidth = 288;
      const popoverHeight = 280;

      let left = rect.left;
      let top = rect.bottom + 4;

      if (left + popoverWidth > window.innerWidth - 16) {
        left = window.innerWidth - popoverWidth - 16;
      }
      if (top + popoverHeight > window.innerHeight - 16) {
        top = rect.top - popoverHeight - 4;
      }

      setPopoverPosition({ top, left });
    } else {
      setPopoverPosition(null);
    }
  }, [isProductCell, isFocused, value]);

  const formatValue = useCallback(() => {
    if (value === null || value === undefined) return '';
    switch (type) {
      case 'currency':
        return formatCurrency(value, { showSymbol: false });
      case 'percent':
        return typeof value === 'number' ? value.toFixed(1) : value;
      case 'product':
        return value?.name || '';
      default:
        return value;
    }
  }, [value, type]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    const parsedValue = (type === 'number' || type === 'percent')
      ? (newValue === '' ? 0 : parseFloat(newValue) || 0)
      : newValue;
    onChange(parsedValue);
  };

  const handleBlur = () => {
    onEndEdit();
  };

  const handleKeyDown = (e) => {
    onKeyDown(e);
  };

  if (type === 'image') {
    const imageUrl = value?.imageUrl || value;
    return (
      <div className="h-full flex items-center justify-center p-1">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="w-14 h-14 object-cover rounded-lg border border-slate-200 shadow-sm" />
        ) : (
          <div className="w-14 h-14 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-slate-300" />
          </div>
        )}
      </div>
    );
  }

  if (isProductCell) {
    return (
      <>
        <div
          ref={cellRef}
          onDoubleClick={onOpenProductModal}
          onKeyDown={(e) => e.key === 'Enter' && onOpenProductModal()}
          tabIndex={0}
          className={`
            h-full px-1.5 flex items-center cursor-pointer transition-all duration-100
            ${isFocused ? 'bg-blue-50 ring-2 ring-blue-400 ring-inset rounded-sm' : 'hover:bg-slate-50'}
          `}
        >
          {value ? (
            <span className="truncate text-xs font-medium text-slate-700">
              {value.name}
            </span>
          ) : (
            <div className="flex items-center gap-1.5 w-full">
              <Package className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate text-xs text-slate-400 italic">Select...</span>
            </div>
          )}
        </div>
        {popoverPosition && (
          <ProductInfoPopover
            product={value}
            position={popoverPosition}
            onClose={() => setPopoverPosition(null)}
          />
        )}
      </>
    );
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type={type === 'number' || type === 'percent' ? 'number' : 'text'}
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        step={type === 'percent' ? '0.1' : '1'}
        min={0}
        className="w-full h-full px-1.5 text-xs bg-amber-50 border-2 border-blue-400 rounded-sm focus:outline-none text-slate-800"
        style={{ textAlign: align || 'left' }}
      />
    );
  }

  const handleCellFocus = () => {
    if (isSkuCodeCell && onSkuCodeFocus) {
      onSkuCodeFocus();
    }
  };

  return (
    <div
      onClick={onStartEdit}
      onFocus={handleCellFocus}
      onKeyDown={(e) => e.key === 'Enter' && onStartEdit()}
      tabIndex={0}
      className={`
        h-full px-1.5 flex items-center text-xs transition-all duration-100
        ${isFocused ? 'bg-blue-50 ring-2 ring-blue-400 ring-inset rounded-sm' : 'hover:bg-slate-50'}
        ${type === 'currency' || type === 'number' || type === 'percent' ? 'font-mono text-slate-600' : 'text-slate-700'}
        cursor-pointer
      `}
      style={{ justifyContent: align === 'right' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start' }}
    >
      <span className="truncate">
        {formatValue()}
      </span>
    </div>
  );
});

EditableCell.displayName = 'EditableCell';

const GridRow = memo(({
  item,
  rowIndex,
  isSelected,
  focusedCell,
  editingCell,
  onCellEdit,
  onStartEdit,
  onEndEdit,
  onDeleteRow,
  onOpenProductModal,
  onCellKeyDown,
  onCellFocus,
  priceList
}) => {
  const updateLineItem = useQuotationStore(state => state.updateLineItem);

  return (
    <div
      className={`
        flex items-stretch border-b border-slate-100 transition-colors duration-100
        ${isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'}
      `}
      style={{ height: '64px' }}
    >
      {columnConfig.map((col) => {
        const isEditing = editingCell?.rowId === item.id && editingCell?.columnId === col.id;
        const isFocused = focusedCell?.rowId === item.id && focusedCell?.columnId === col.id;

        if (col.id === 'rowNum') {
          return (
            <div
              key={col.id}
              className="flex items-center justify-center text-xs text-slate-400 border-r border-slate-100 bg-slate-50/50"
              style={{ width: col.width, minWidth: col.width }}
            >
              {rowIndex + 1}
            </div>
          );
        }

        if (col.id === 'actions') {
          return (
            <div
              key={col.id}
              className="flex items-center justify-center bg-slate-50/50"
              style={{ width: col.width, minWidth: col.width }}
            >
              <button
                onClick={() => onDeleteRow(item.id)}
                className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-all duration-150"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        }

        let cellValue = item[col.id];
        if (col.id === 'image') {
          cellValue = item.product;
        } else if (col.id === 'description') {
          cellValue = item.product?.remark1 || item.product?.description || '';
        } else if (col.id === 'priceList') {
          cellValue = priceList || '---';
        }

        return (
          <div
            key={col.id}
            className="border-r border-slate-100 last:border-r-0"
            style={{ width: col.width, minWidth: col.width }}
            onClick={() => onCellFocus(item.id, col.id)}
          >
            <EditableCell
              value={cellValue}
              type={col.type}
              align={col.align}
              isEditing={isEditing && col.editable}
              isFocused={isFocused}
              isProductCell={col.id === 'product'}
              isSkuCodeCell={col.id === 'skuCode'}
              onChange={(value) => {
                if (col.id === 'skuCode') {
                  updateLineItem(item.id, 'skuCode', value);
                } else {
                  onCellEdit(item.id, col.id, value);
                }
              }}
              onStartEdit={() => col.editable && onStartEdit(item.id, col.id)}
              onEndEdit={onEndEdit}
              onKeyDown={(e) => onCellKeyDown(e, item.id, col.id)}
              onOpenProductModal={() => onOpenProductModal(item.id)}
              onSkuCodeFocus={() => onOpenProductModal(item.id)}
            />
          </div>
        );
      })}
    </div>
  );
});

GridRow.displayName = 'GridRow';

export const LineItemGrid = forwardRef((props, ref) => {
  const {
    currentQuotation,
    addLineItem,
    updateLineItem,
    deleteLineItem,
    setProductFromSku
  } = useQuotationStore();
  const { openProductModal } = useUIStore();

  const [selectedRowId, setSelectedRowId] = useState(null);
  const [focusedCell, setFocusedCell] = useState(null);
  const [editingCell, setEditingCell] = useState(null);
  const gridRef = useRef(null);

  const lineItems = currentQuotation.lineItems;

  const handleAddRow = useCallback(() => {
    const lastItem = lineItems[lineItems.length - 1];
    const inheritedArea = lastItem?.area || '';
    const newId = addLineItem();
    if (inheritedArea) {
      setTimeout(() => updateLineItem(newId, 'area', inheritedArea), 0);
    }
    setSelectedRowId(newId);
    setFocusedCell({ rowId: newId, columnId: 'area' });
    setTimeout(() => {
      setEditingCell({ rowId: newId, columnId: 'area' });
    }, 50);
  }, [addLineItem, lineItems, updateLineItem]);

  useImperativeHandle(ref, () => ({
    focusFirstCell: () => {
      if (lineItems.length > 0) {
        const firstRowId = lineItems[0].id;
        setSelectedRowId(firstRowId);
        setFocusedCell({ rowId: firstRowId, columnId: 'area' });
        setEditingCell({ rowId: firstRowId, columnId: 'area' });
      } else {
        handleAddRow();
      }
    },
    focusCell: (rowId, columnId) => {
      setSelectedRowId(rowId);
      setFocusedCell({ rowId, columnId });
      setTimeout(() => {
        setEditingCell({ rowId, columnId });
      }, 50);
    }
  }), [lineItems, handleAddRow]);

  const handleCellEdit = useCallback((rowId, columnId, value) => {
    updateLineItem(rowId, columnId, value);
  }, [updateLineItem]);

  const handleCellFocus = useCallback((rowId, columnId) => {
    setSelectedRowId(rowId);
    setFocusedCell({ rowId, columnId });
    if (columnId === 'skuCode') {
      openProductModal(rowId);
    }
  }, [openProductModal]);

  const handleStartEdit = useCallback((rowId, columnId) => {
    setSelectedRowId(rowId);
    setFocusedCell({ rowId, columnId });
    if (columnId === 'skuCode') {
      openProductModal(rowId);
    } else {
      setEditingCell({ rowId, columnId });
    }
  }, [openProductModal]);

  const handleEndEdit = useCallback(() => {
    setEditingCell(null);
  }, []);

  const handleDeleteRow = useCallback((rowId) => {
    deleteLineItem(rowId);
    if (selectedRowId === rowId) {
      setSelectedRowId(null);
      setFocusedCell(null);
    }
  }, [deleteLineItem, selectedRowId]);

  const handleOpenProductModal = useCallback((rowId) => {
    setSelectedRowId(rowId);
    openProductModal(rowId);
  }, [openProductModal]);

  const handleCellKeyDown = useCallback((e, rowId, columnId) => {
    const currentColIndex = columnConfig.findIndex(c => c.id === columnId);
    const currentRowIndex = lineItems.findIndex(item => item.id === rowId);

    switch (e.key) {
      case 'Enter': {
        e.preventDefault();

        if (columnId === 'skuCode') {
          const item = lineItems.find(i => i.id === rowId);
          if (item?.skuCode) {
            setProductFromSku(rowId, item.skuCode).then(found => {
              if (found) {
                setFocusedCell({ rowId, columnId: 'qty' });
                setEditingCell({ rowId, columnId: 'qty' });
              } else {
                openProductModal(rowId);
              }
            });
          } else {
            openProductModal(rowId);
          }
          return;
        }

        const nextCol = columnConfig.slice(currentColIndex + 1).find(c => c.editable);
        if (nextCol) {
          setFocusedCell({ rowId, columnId: nextCol.id });
          setEditingCell({ rowId, columnId: nextCol.id });
        } else {
          handleEndEdit();
          handleAddRow();
        }
        break;
      }
      case 'Tab': {
        e.preventDefault();
        if (e.shiftKey) {
          const prevCol = columnConfig.slice(0, currentColIndex).reverse().find(c => c.editable);
          if (prevCol) {
            setFocusedCell({ rowId, columnId: prevCol.id });
            setEditingCell({ rowId, columnId: prevCol.id });
          }
        } else {
          const nextTabCol = columnConfig.slice(currentColIndex + 1).find(c => c.editable);
          if (nextTabCol) {
            setFocusedCell({ rowId, columnId: nextTabCol.id });
            setEditingCell({ rowId, columnId: nextTabCol.id });
          } else if (currentRowIndex < lineItems.length - 1) {
            const nextRowId = lineItems[currentRowIndex + 1].id;
            const firstEditableCol = columnConfig.find(c => c.editable);
            if (firstEditableCol) {
              setSelectedRowId(nextRowId);
              setFocusedCell({ rowId: nextRowId, columnId: firstEditableCol.id });
              setEditingCell({ rowId: nextRowId, columnId: firstEditableCol.id });
            }
          }
        }
        break;
      }
      case 'Escape':
        handleEndEdit();
        break;
      case 'ArrowDown': {
        e.preventDefault();
        if (currentRowIndex < lineItems.length - 1) {
          const nextRowId = lineItems[currentRowIndex + 1].id;
          setSelectedRowId(nextRowId);
          setFocusedCell({ rowId: nextRowId, columnId });
          if (editingCell) {
            setEditingCell({ rowId: nextRowId, columnId });
          }
        }
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        if (currentRowIndex > 0) {
          const prevRowId = lineItems[currentRowIndex - 1].id;
          setSelectedRowId(prevRowId);
          setFocusedCell({ rowId: prevRowId, columnId });
          if (editingCell) {
            setEditingCell({ rowId: prevRowId, columnId });
          }
        }
        break;
      }
      case 'ArrowRight': {
        e.preventDefault();
        const nextCol = columnConfig.slice(currentColIndex + 1).find(c => c.editable);
        if (nextCol) {
          setFocusedCell({ rowId, columnId: nextCol.id });
          if (editingCell) {
            setEditingCell({ rowId, columnId: nextCol.id });
          }
        } else if (currentRowIndex < lineItems.length - 1) {
          const nextRowId = lineItems[currentRowIndex + 1].id;
          const firstEditableCol = columnConfig.find(c => c.editable);
          if (firstEditableCol) {
            setSelectedRowId(nextRowId);
            setFocusedCell({ rowId: nextRowId, columnId: firstEditableCol.id });
            if (editingCell) {
              setEditingCell({ rowId: nextRowId, columnId: firstEditableCol.id });
            }
          }
        }
        break;
      }
      case 'ArrowLeft': {
        e.preventDefault();
        const prevCol = columnConfig.slice(0, currentColIndex).reverse().find(c => c.editable);
        if (prevCol) {
          setFocusedCell({ rowId, columnId: prevCol.id });
          if (editingCell) {
            setEditingCell({ rowId, columnId: prevCol.id });
          }
        } else if (currentRowIndex > 0) {
          const prevRowId = lineItems[currentRowIndex - 1].id;
          const lastEditableCol = columnConfig.slice().reverse().find(c => c.editable);
          if (lastEditableCol) {
            setSelectedRowId(prevRowId);
            setFocusedCell({ rowId: prevRowId, columnId: lastEditableCol.id });
            if (editingCell) {
              setEditingCell({ rowId: prevRowId, columnId: lastEditableCol.id });
            }
          }
        }
        break;
      }
    }
  }, [lineItems, handleEndEdit, editingCell, openProductModal, handleAddRow, setProductFromSku]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleAddRow();
        } else if (e.key === 'd' && selectedRowId) {
          e.preventDefault();
          handleDeleteRow(selectedRowId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAddRow, handleDeleteRow, selectedRowId]);

  const totalWidth = columnConfig.reduce((sum, col) => sum + col.width, 0);
  const totals = currentQuotation.totals;

  return (
    <div className="flex flex-col h-full bg-white">
      <div
        ref={gridRef}
        className="flex-1 overflow-auto"
        style={{ minHeight: '200px' }}
      >
        {/* Header - sticky top */}
        <div
          className="flex sticky top-0 z-10 bg-slate-50 border-b border-slate-200"
          style={{ minWidth: totalWidth }}
        >
          {columnConfig.map((col) => (
            <div
              key={col.id}
              className="px-2 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wide border-r border-slate-200 last:border-r-0"
              style={{
                width: col.width,
                minWidth: col.width,
                textAlign: col.align || 'left'
              }}
            >
              {col.header}
            </div>
          ))}
        </div>

        <div style={{ minWidth: totalWidth }}>
          <AnimatePresence>
            {lineItems.length === 0 ? (
              <div className="px-4 py-12 text-center text-slate-400">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">No items added yet</p>
                <p className="text-xs mt-1 text-slate-400">
                  Press <kbd className="kbd">Ctrl+Enter</kbd> or click below to add items
                </p>
              </div>
            ) : (
              lineItems.map((item, index) => (
                <GridRow
                  key={item.id}
                  item={item}
                  rowIndex={index}
                  isSelected={selectedRowId === item.id}
                  focusedCell={focusedCell}
                  editingCell={editingCell}
                  onCellEdit={handleCellEdit}
                  onCellFocus={handleCellFocus}
                  onStartEdit={handleStartEdit}
                  onEndEdit={handleEndEdit}
                  onDeleteRow={handleDeleteRow}
                  onOpenProductModal={handleOpenProductModal}
                  onCellKeyDown={handleCellKeyDown}
                  priceList={currentQuotation.priceList}
                />
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Summary Row - sticky bottom */}
        {lineItems.length > 0 && (
          <div className="flex sticky bottom-0 z-10 bg-gradient-to-r from-slate-50 to-blue-50 border-t-2 border-slate-200" style={{ minWidth: totalWidth }}>
          {/* Sr */}
          <div className="px-1 py-2 text-xs font-bold text-slate-600 text-center border-r border-slate-200" style={{ width: 35 }}>
            {lineItems.length}
          </div>
          {/* Area - "Total" label */}
          <div className="px-2 py-2 text-xs font-bold text-slate-700 uppercase tracking-wide border-r border-slate-200" style={{ width: 120 }}>
            Total
          </div>
          {/* PriceList */}
          <div className="border-r border-slate-200" style={{ width: 100 }} />
          {/* SKU Code */}
          <div className="border-r border-slate-200" style={{ width: 110 }} />
          {/* Image */}
          <div className="border-r border-slate-200" style={{ width: 85 }} />
          {/* Desc */}
          <div className="border-r border-slate-200" style={{ width: 150 }} />
          {/* Product */}
          <div className="border-r border-slate-200" style={{ width: 220 }} />
          {/* MRP */}
          <div className="border-r border-slate-200" style={{ width: 100 }} />
          {/* Qty */}
          <div className="border-r border-slate-200" style={{ width: 70 }} />
          {/* GAmt */}
          <div className="px-2 py-2 text-xs font-mono font-semibold text-right text-slate-700 border-r border-slate-200" style={{ width: 110 }}>
            {formatCurrency(totals.grossAmount, { showSymbol: false })}
          </div>
          {/* Disc% */}
          <div className="border-r border-slate-200" style={{ width: 80 }} />
          {/* DiscAmt */}
          <div className="px-2 py-2 text-xs font-mono font-semibold text-right text-red-500 border-r border-slate-200" style={{ width: 100 }}>
            -{formatCurrency(totals.discountAmount, { showSymbol: false })}
          </div>
          {/* GST% */}
          <div className="border-r border-slate-200" style={{ width: 75 }} />
          {/* GST Amt */}
          <div className="px-2 py-2 text-xs font-mono font-semibold text-right text-slate-700 border-r border-slate-200" style={{ width: 100 }}>
            {formatCurrency(totals.gstAmount, { showSymbol: false })}
          </div>
          {/* NetAmt */}
          <div className="px-2 py-2 text-xs font-mono font-bold text-right text-blue-600" style={{ width: 110 }}>
            {formatCurrency(totals.netAmount, { showSymbol: false })}
          </div>
          {/* Actions */}
          <div style={{ width: 45 }} />
          </div>
        )}
      </div>

    </div>
  );
});

LineItemGrid.displayName = 'LineItemGrid';

export default LineItemGrid;
