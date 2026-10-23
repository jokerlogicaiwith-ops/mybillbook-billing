import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Upload, 
  Settings, 
  Share2, 
  Plus, 
  Calendar, 
  ScanLine, 
  Trash2, 
  CheckCircle2, 
  Sparkles, 
  X, 
  Keyboard, 
  Smartphone, 
  Lightbulb, 
  Save, 
  Printer, 
  FileText,
  AlertCircle,
  HelpCircle,
  Eye,
  Check
} from 'lucide-react';

export default function CreatePurchaseInvoiceView({ onExit, onSuccess }) {
  const [parties, setParties] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  
  // Header state
  const [mode, setMode] = useState('edit'); // 'edit' or 'preview'
  const [showAutoSmsBanner, setShowAutoSmsBanner] = useState(true);
  const [showAutofillBox, setShowAutofillBox] = useState(true);
  
  // Invoice form state
  const [invoiceNo, setInvoiceNo] = useState('1');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [originalInvoiceNo, setOriginalInvoiceNo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [showDueDateInput, setShowDueDateInput] = useState(false);
  
  // Party state
  const [selectedParty, setSelectedParty] = useState(null);
  const [showPartyModal, setShowPartyModal] = useState(false);
  const [partySearch, setPartySearch] = useState('');
  const [newPartyName, setNewPartyName] = useState('');
  const [newPartyPhone, setNewPartyPhone] = useState('');

  // Line items state
  const [items, setItems] = useState([
    {
      item_id: null,
      item_name: '',
      hsn_code: '',
      quantity: 1,
      unit: 'PCS',
      rate: 0,
      discount: 0,
      tax_rate: 18,
      tax_amount: 0,
      total: 0
    }
  ]);

  // Barcode scanning
  const [barcodeQuery, setBarcodeQuery] = useState('');
  const [scanFeedback, setScanFeedback] = useState(null);
  const [showBarcodeBox, setShowBarcodeBox] = useState(false);
  const barcodeInputRef = useRef(null);

  // Payment & Terms
  const [paymentType, setPaymentType] = useState('Credit');
  const [paidAmount, setPaidAmount] = useState(0);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchParties();
    fetchInventory();
    fetchNextInvoiceNo();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const fetchParties = async () => {
    try {
      const res = await fetch('/api/parties');
      const data = await res.json();
      setParties(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchInventory = async () => {
    try {
      const res = await fetch('/api/items');
      const data = await res.json();
      setInventoryItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchNextInvoiceNo = async () => {
    try {
      const res = await fetch('/api/transactions?type=Purchase Invoices');
      const data = await res.json();
      if (Array.isArray(data)) {
        setInvoiceNo(String(data.length + 1));
      }
    } catch (e) {
      setInvoiceNo('1');
    }
  };

  // Recalculate line item totals
  const recalculateRow = (rows, index) => {
    const row = rows[index];
    const qty = parseFloat(row.quantity) || 0;
    const rate = parseFloat(row.rate) || 0;
    const discount = parseFloat(row.discount) || 0;
    const base = Math.max(0, (qty * rate) - discount);
    const taxRate = parseFloat(row.tax_rate) || 0;
    const taxAmount = (base * taxRate) / 100;
    row.tax_amount = parseFloat(taxAmount.toFixed(2));
    row.total = Math.round(base + taxAmount);
    setItems([...rows]);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;

    if (field === 'item_name') {
      const found = inventoryItems.find(it => it.name.toLowerCase() === String(value).toLowerCase());
      if (found) {
        updated[index].item_id = found.id;
        updated[index].hsn_code = found.hsn_code || '';
        updated[index].rate = found.purchase_price || found.sale_price || 0;
        updated[index].unit = found.unit || 'PCS';
        updated[index].tax_rate = found.tax_rate || 18;
      }
    }

    recalculateRow(updated, index);
  };

  const handleSelectItemFromDropdown = (index, found) => {
    const updated = [...items];
    updated[index].item_id = found.id;
    updated[index].item_name = found.name;
    updated[index].hsn_code = found.hsn_code || '';
    updated[index].rate = found.purchase_price || found.sale_price || 0;
    updated[index].unit = found.unit || 'PCS';
    updated[index].tax_rate = found.tax_rate || 18;
    recalculateRow(updated, index);
  };

  const addItemRow = () => {
    setItems([
      ...items,
      {
        item_id: null,
        item_name: '',
        hsn_code: '',
        quantity: 1,
        unit: 'PCS',
        rate: 0,
        discount: 0,
        tax_rate: 18,
        tax_amount: 0,
        total: 0
      }
    ]);
  };

  const removeItemRow = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Barcode Scanning
  const handleBarcodeProcess = (rawQuery) => {
    const code = rawQuery.trim();
    if (!code) return;

    const found = inventoryItems.find(i => 
      (i.item_code && i.item_code.toLowerCase() === code.toLowerCase()) ||
      (i.name && i.name.toLowerCase() === code.toLowerCase())
    );

    if (!found) {
      setScanFeedback({ type: 'error', message: `Item nahi mila barcode "${code}" ke liye!` });
      setTimeout(() => setScanFeedback(null), 3000);
      return;
    }

    let updatedRows = [...items];
    const existingIdx = updatedRows.findIndex(it => it.item_id === found.id);

    if (existingIdx !== -1) {
      const currentQty = parseFloat(updatedRows[existingIdx].quantity) || 0;
      updatedRows[existingIdx].quantity = currentQty + 1;
      recalculateRow(updatedRows, existingIdx);
      setScanFeedback({ type: 'success', message: `✓ "${found.name}" ki QTY badhakar ${currentQty + 1} ki` });
    } else {
      const emptyIdx = updatedRows.findIndex(it => !it.item_id && !it.item_name);
      const newRow = {
        item_id: found.id,
        item_name: found.name,
        hsn_code: found.hsn_code || '',
        quantity: 1,
        unit: found.unit || 'PCS',
        rate: found.purchase_price || found.sale_price || 0,
        discount: 0,
        tax_rate: found.tax_rate || 0,
        tax_amount: 0,
        total: 0
      };

      if (emptyIdx !== -1) {
        updatedRows[emptyIdx] = newRow;
        recalculateRow(updatedRows, emptyIdx);
      } else {
        updatedRows.push(newRow);
        recalculateRow(updatedRows, updatedRows.length - 1);
      }
      setScanFeedback({ type: 'success', message: `✓ Added "${found.name}"` });
    }

    setBarcodeQuery('');
    setTimeout(() => setScanFeedback(null), 3000);
  };

  // Calculation totals
  const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.quantity || 0) * parseFloat(item.rate || 0)), 0);
  const totalDiscount = items.reduce((sum, item) => sum + (parseFloat(item.discount || 0)), 0);
  const totalTax = items.reduce((sum, item) => sum + (parseFloat(item.tax_amount || 0)), 0);
  const grandTotal = Math.round(subtotal - totalDiscount + totalTax);
  const balanceDue = Math.max(0, grandTotal - (parseFloat(paidAmount) || 0));

  const handleSaveInvoice = async (saveAndNew = false) => {
    if (!selectedParty) {
      alert('Kripya Party select karein (+ Add Party par click karein)!');
      return;
    }

    const validItems = items.filter(it => it.item_name.trim() !== '');
    if (validItems.length === 0) {
      alert('Kripya kam se kam ek item add karein!');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        txn_no: `PUR-${invoiceNo}`,
        type: 'Purchase Invoices',
        date: invoiceDate,
        party_id: selectedParty.id,
        party_name: selectedParty.name,
        due_date: dueDate || '',
        due_in: dueDate ? `Due on ${dueDate}` : '-',
        subtotal: subtotal,
        discount: totalDiscount,
        tax_amount: totalTax,
        amount: grandTotal,
        paid_amount: parseFloat(paidAmount) || 0,
        balance_due: balanceDue,
        payment_type: paymentType,
        notes: notes || (originalInvoiceNo ? `Original Invoice No: ${originalInvoiceNo}` : ''),
        items: validItems
      };

      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setIsSubmitting(false);
        showToast('Purchase Invoice safalta se save ho gayi!');
        if (saveAndNew) {
          // Reset form for next invoice
          setInvoiceNo(String(parseInt(invoiceNo || '0') + 1));
          setSelectedParty(null);
          setItems([{ item_id: null, item_name: '', hsn_code: '', quantity: 1, unit: 'PCS', rate: 0, discount: 0, tax_rate: 18, tax_amount: 0, total: 0 }]);
          setPaidAmount(0);
          setNotes('');
        } else {
          if (onSuccess) onSuccess(data.id);
          else if (onExit) onExit();
        }
      } else {
        alert(data.error || 'Invoice save karne me error aayi');
        setIsSubmitting(false);
      }
    } catch (e) {
      alert('Network error while saving invoice');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans select-none pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold z-50 animate-in fade-in slide-in-from-top-2 duration-200 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. TOP HEADER matching media_1792767114074.png */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onExit}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
            <span>Exit</span>
          </button>
          <h1 className="text-base font-bold text-slate-900 tracking-tight">
            Create Purchase Invoice
          </h1>
        </div>

        {/* Center Mode Switch */}
        <div className="hidden md:flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs shadow-2xs">
          <button
            onClick={() => setMode('edit')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
              mode === 'edit'
                ? 'bg-white text-indigo-600 shadow-xs border border-indigo-200 font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>✏️ Edit Mode</span>
          </button>
          <button
            onClick={() => {
              setMode('preview');
              showToast('Preview Mode: Layout finalized');
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
              mode === 'preview'
                ? 'bg-white text-indigo-600 shadow-xs border border-indigo-200 font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>👁 Preview Mode</span>
          </button>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => showToast('Upload using Phone: Scan QR code with mobile camera')}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-orange-50/50 text-[#ea580c] border border-[#ea580c] rounded-lg text-xs font-semibold transition shadow-2xs cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5 text-[#ea580c]" />
            <span>Upload using Phone</span>
          </button>

          <button
            onClick={() => showToast('Purchase Invoice Settings')}
            className="p-2 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-lg transition shadow-2xs cursor-pointer"
            title="Settings"
          >
            <Settings className="w-4 h-4 text-slate-600" />
          </button>

          <button
            onClick={() => handleSaveInvoice(true)}
            disabled={isSubmitting}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition shadow-2xs cursor-pointer disabled:opacity-50"
          >
            Save & New
          </button>

          <button
            onClick={() => handleSaveInvoice(false)}
            disabled={isSubmitting}
            className="px-4 py-1.5 bg-[#5c5be5] hover:bg-[#4f46e5] text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
          >
            <span>Save</span>
          </button>

          <button
            onClick={() => showToast('Shortcuts: Ctrl+S to Save, Alt+A to Add Item')}
            className="p-2 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-lg transition shadow-2xs cursor-pointer"
            title="Shortcuts"
          >
            <Keyboard className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE: Two-column layout matching screenshot */}
      <div className="flex-1 p-6 flex flex-col lg:flex-row gap-6 max-w-[1600px] mx-auto w-full">
        
        {/* LEFT COLUMN: Autofill this bill (Powered by Mira AI) matching screenshot */}
        {showAutofillBox && (
          <div className="w-full lg:w-80 shrink-0 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#ea580c] to-[#f97316] text-white flex items-center justify-center shadow-xs">
                    <ScanLine className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-slate-900 tracking-tight">
                      Autofill this bill
                    </h2>
                    <p className="text-[11px] font-semibold text-[#ea580c] flex items-center space-x-1">
                      <Sparkles className="w-3 h-3 text-[#f97316]" />
                      <span>Powered by Mira AI</span>
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAutofillBox(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Dotted Upload Area matching screenshot */}
              <div 
                onClick={() => {
                  showToast('Demo AI Extraction: Populating sample invoice items...');
                  if (inventoryItems.length > 0) {
                    const sample = inventoryItems.slice(0, 3);
                    const filled = sample.map((it, idx) => ({
                      item_id: it.id,
                      item_name: it.name,
                      hsn_code: it.hsn_code || '8528',
                      quantity: 2,
                      unit: it.unit || 'PCS',
                      rate: it.purchase_price || it.sale_price || 1000,
                      discount: 0,
                      tax_rate: 18,
                      tax_amount: parseFloat((((it.purchase_price || 1000) * 2 * 0.18)).toFixed(2)),
                      total: Math.round(((it.purchase_price || 1000) * 2) * 1.18)
                    }));
                    setItems(filled);
                  }
                }}
                className="border-2 border-dashed border-[#fdba74] bg-[#fffaf5] hover:bg-[#fff7ed] transition rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer group"
              >
                <div className="flex items-center space-x-1.5 text-[#ea580c] text-xs font-bold mb-1">
                  <Upload className="w-4 h-4 text-[#ea580c]" />
                  <span>Drag & Drop or Upload file</span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium">
                  (PDF, JPG, JPEG & PNG file supported, max 5MB)
                </p>
              </div>

              {/* Proceed Button */}
              <button
                onClick={() => showToast('Upload a bill file to extract party & items')}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-400 font-semibold text-xs rounded-xl transition cursor-pointer"
              >
                Proceed
              </button>
            </div>

            {/* Quick Tips Box matching screenshot */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-2">
              <div className="flex items-center space-x-1.5 text-[#ea580c] text-xs font-bold">
                <Lightbulb className="w-3.5 h-3.5 text-[#ea580c]" />
                <span>Quick Tips</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Any Party / Item tagged <span className="inline-block bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-sm">New</span> will be created and added to your inventory
              </p>
              <div className="flex items-center space-x-1 pt-1 justify-center">
                <span className="w-1.5 h-1.5 bg-slate-800 rounded-full"></span>
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
              </div>
            </div>
          </div>
        )}

        {/* RIGHT COLUMN: MAIN INVOICE FORM matching screenshot */}
        <div className="flex-1 space-y-4">
          
          {/* 1. Auto-SMS Banner matching screenshot */}
          {showAutoSmsBanner && (
            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800">
                    Invoice Auto-SMS to Party is turned on
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    An SMS with the invoice details and link is sent to the party after the invoice has been created
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => showToast('Auto-SMS Settings updated')}
                  className="px-3.5 py-1.5 bg-[#5c5be5] hover:bg-[#4f46e5] text-white text-xs font-semibold rounded-lg transition cursor-pointer shadow-xs"
                >
                  Change Settings
                </button>
                <button
                  onClick={() => setShowAutoSmsBanner(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* 2. Bill From & Invoice Details Boxes (Side-by-side grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Bill From Box matching screenshot */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Bill From</span>
                <button 
                  onClick={() => showToast('Party fields settings')}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              </div>

              {selectedParty ? (
                <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900">{selectedParty.name}</h4>
                    {selectedParty.phone && (
                      <p className="text-xs text-slate-500 font-mono">Phone: {selectedParty.phone}</p>
                    )}
                    {selectedParty.gstin && (
                      <p className="text-xs text-slate-500 font-mono">GSTIN: {selectedParty.gstin}</p>
                    )}
                    {selectedParty.address && (
                      <p className="text-[11px] text-slate-400">{selectedParty.address}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedParty(null)}
                    className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
                  >
                    Change
                  </button>
                </div>
              ) : (
                /* Large blue dashed box: + Add Party matching screenshot */
                <div
                  onClick={() => setShowPartyModal(true)}
                  className="border-2 border-dashed border-[#93c5fd] hover:border-blue-500 bg-white hover:bg-blue-50/20 transition rounded-xl py-12 flex flex-col items-center justify-center cursor-pointer group"
                >
                  <span className="text-xs font-bold text-blue-600 group-hover:underline flex items-center space-x-1">
                    <Plus className="w-4 h-4 text-blue-600" />
                    <span>Add Party</span>
                  </span>
                </div>
              )}
            </div>

            {/* Invoice Details Box matching screenshot */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Invoice Details</span>
                <button 
                  onClick={() => showToast('Invoice fields settings')}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2.5">
                {/* Purchase Invoice No. */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Purchase Invoice No.
                  </label>
                  <input
                    type="text"
                    value={invoiceNo}
                    onChange={(e) => setInvoiceNo(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 shadow-2xs"
                  />
                </div>

                {/* Purchase Invoice Date */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Purchase Invoice Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 shadow-2xs"
                    />
                  </div>
                </div>

                {/* Original Invoice No. */}
                <div>
                  <input
                    type="text"
                    placeholder="Original Invoice No."
                    value={originalInvoiceNo}
                    onChange={(e) => setOriginalInvoiceNo(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs placeholder:text-slate-400 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 shadow-2xs"
                  />
                </div>

                {/* + Add Due Date (Dashed button) matching screenshot */}
                {showDueDateInput ? (
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 shadow-2xs"
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowDueDateInput(true)}
                    className="w-full py-2 border border-dashed border-[#93c5fd] hover:border-blue-500 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50/20 transition cursor-pointer flex items-center justify-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5 text-blue-600" />
                    <span>Add Due Date</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 3. Line Items Table Section matching screenshot */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f8fafc] text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">NO</th>
                    <th className="py-2.5 px-3 min-w-[220px]">ITEMS</th>
                    <th className="py-2.5 px-3 w-24">HSN</th>
                    <th className="py-2.5 px-3 w-24">QTY</th>
                    <th className="py-2.5 px-3 w-28">PRICE/ITEM (₹)</th>
                    <th className="py-2.5 px-3 w-24">DISCOUNT</th>
                    <th className="py-2.5 px-3 w-24">TAX</th>
                    <th className="py-2.5 px-3 w-28 text-right">AMOUNT (₹)</th>
                    <th className="py-2.5 px-2 w-10"></th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {items.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 text-center text-slate-400 font-medium">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          placeholder="Type or select item..."
                          value={row.item_name}
                          onChange={(e) => handleItemChange(idx, 'item_name', e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs font-medium text-slate-900 focus:ring-1 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          placeholder="HSN"
                          value={row.hsn_code}
                          onChange={(e) => handleItemChange(idx, 'hsn_code', e.target.value)}
                          className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-xs text-slate-700"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            min="1"
                            value={row.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                            className="w-14 px-2 py-1.5 border border-slate-300 rounded-md text-xs font-semibold text-slate-900"
                          />
                          <span className="text-[10px] text-slate-500">{row.unit || 'PCS'}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          value={row.rate}
                          onChange={(e) => handleItemChange(idx, 'rate', e.target.value)}
                          className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-xs font-semibold text-slate-900"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          value={row.discount}
                          onChange={(e) => handleItemChange(idx, 'discount', e.target.value)}
                          className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-xs text-slate-700"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <select
                          value={row.tax_rate}
                          onChange={(e) => handleItemChange(idx, 'tax_rate', e.target.value)}
                          className="w-full px-1.5 py-1.5 border border-slate-300 rounded-md text-xs text-slate-700 bg-white"
                        >
                          <option value="0">0%</option>
                          <option value="5">5%</option>
                          <option value="12">12%</option>
                          <option value="18">18%</option>
                          <option value="28">28%</option>
                        </select>
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900 whitespace-nowrap">
                        ₹ {row.total.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeItemRow(idx)}
                          className="p-1 text-slate-400 hover:text-red-500 rounded-md transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Row inside Items box matching screenshot: + Add Item and Scan Barcode */}
            <div className="p-3 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-3">
              {/* Wide dashed blue button: + Add Item */}
              <button
                type="button"
                onClick={addItemRow}
                className="flex-1 w-full py-2.5 border-2 border-dashed border-[#93c5fd] hover:border-blue-500 bg-white hover:bg-blue-50/20 text-blue-600 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center space-x-1"
              >
                <Plus className="w-4 h-4 text-blue-600" />
                <span>Add Item</span>
              </button>

              {/* Scan Barcode button matching screenshot */}
              <button
                type="button"
                onClick={() => {
                  setShowBarcodeBox(!showBarcodeBox);
                  setTimeout(() => {
                    if (barcodeInputRef.current) barcodeInputRef.current.focus();
                  }, 100);
                }}
                className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 shadow-2xs shrink-0"
              >
                <ScanLine className="w-4 h-4 text-slate-600" />
                <span>Scan Barcode</span>
              </button>
            </div>

            {/* Expandable Barcode Scanner Row */}
            {showBarcodeBox && (
              <div className="bg-blue-50/60 p-3.5 border-t border-blue-200 flex items-center space-x-3">
                <div className="relative flex-1">
                  <ScanLine className="w-4 h-4 text-blue-600 absolute left-3 top-1/2 -translate-y-1/2 stroke-[2.5]" />
                  <input
                    ref={barcodeInputRef}
                    type="text"
                    placeholder="Scan Barcode or type 12-digit code (e.g. 706421053767) - Enter to auto add"
                    value={barcodeQuery}
                    onChange={(e) => setBarcodeQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleBarcodeProcess(barcodeQuery);
                      }
                    }}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-blue-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleBarcodeProcess(barcodeQuery)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
                >
                  Add
                </button>
              </div>
            )}

            {scanFeedback && (
              <div className={`px-4 py-2 text-xs font-semibold ${scanFeedback.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>
                {scanFeedback.message}
              </div>
            )}
          </div>

          {/* 4. Bottom Totals and Payment Mode */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Payment Type & Notes */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Payment Mode
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Cash', 'Bank', 'Online', 'Credit'].map(mode => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setPaymentType(mode)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          paymentType === mode
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Notes / Terms
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Enter special purchase notes or invoice terms..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Totals Summary */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal (Excl. Tax)</span>
                  <span className="font-semibold text-slate-900">₹ {subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Total Discount</span>
                  <span className="font-semibold text-red-600">- ₹ {totalDiscount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Total GST Tax</span>
                  <span className="font-semibold text-slate-900">+ ₹ {totalTax.toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-black text-slate-900">
                  <span>Grand Total</span>
                  <span className="text-indigo-600 text-base">₹ {grandTotal.toLocaleString('en-IN')}</span>
                </div>

                {paymentType !== 'Credit' && (
                  <div className="pt-2 border-t border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700">Amount Paid Now</span>
                      <input
                        type="number"
                        value={paidAmount}
                        onChange={(e) => setPaidAmount(e.target.value)}
                        className="w-28 px-2 py-1 bg-white border border-slate-300 rounded-md text-right font-bold text-slate-900"
                      />
                    </div>
                    <div className="flex justify-between text-xs font-semibold text-slate-600">
                      <span>Balance Due</span>
                      <span className="text-red-600">₹ {balanceDue.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Final Action Bar */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={onExit}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveInvoice(true)}
                disabled={isSubmitting}
                className="px-4 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-100 cursor-pointer"
              >
                Save & New
              </button>
              <button
                type="button"
                onClick={() => handleSaveInvoice(false)}
                disabled={isSubmitting}
                className="px-6 py-2 bg-[#5c5be5] hover:bg-[#4f46e5] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
              >
                Save Invoice
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PARTY SELECTOR MODAL */}
      {showPartyModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Select Supplier / Party</h3>
              <button onClick={() => setShowPartyModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <input
                type="text"
                placeholder="Search party by name or phone..."
                value={partySearch}
                onChange={(e) => setPartySearch(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500"
              />

              <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-lg">
                {parties
                  .filter(p => !partySearch || p.name.toLowerCase().includes(partySearch.toLowerCase()) || (p.phone && p.phone.includes(partySearch)))
                  .map(party => (
                    <div
                      key={party.id}
                      onClick={() => {
                        setSelectedParty(party);
                        setShowPartyModal(false);
                      }}
                      className="p-3 hover:bg-indigo-50/60 transition cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-xs text-slate-900">{party.name}</div>
                        <div className="text-[11px] text-slate-500">{party.phone || 'No Phone'}</div>
                      </div>
                      <span className="text-[11px] font-mono text-slate-600">
                        Bal: ₹{Number(party.current_balance || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
              </div>

              {/* Or Quick Add New Party */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-600">Or Quick Create Party:</span>
                <input
                  type="text"
                  placeholder="New Supplier Name"
                  value={newPartyName}
                  onChange={(e) => setNewPartyName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
                <button
                  type="button"
                  onClick={async () => {
                    if (!newPartyName.trim()) return;
                    try {
                      const res = await fetch('/api/parties', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: newPartyName.trim(), phone: newPartyPhone, type: 'supplier' })
                      });
                      const data = await res.json();
                      if (data.id) {
                        const newP = { id: data.id, name: newPartyName.trim(), phone: newPartyPhone };
                        setSelectedParty(newP);
                        setShowPartyModal(false);
                        fetchParties();
                      }
                    } catch (e) {
                      alert('Failed to create party');
                    }
                  }}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition"
                >
                  Create & Select
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
