import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Calculator, Check, ArrowRight, ScanLine, AlertTriangle, Sparkles } from 'lucide-react';

export default function CreateInvoiceModal({ 
  isOpen, 
  onClose, 
  initialType = 'Sales Invoices', 
  onSuccess 
}) {
  const [txnType, setTxnType] = useState(initialType);
  const [parties, setParties] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [selectedParty, setSelectedParty] = useState('');
  const [customPartyName, setCustomPartyName] = useState('');
  const [partyPhone, setPartyPhone] = useState('');
  const [partyGstin, setPartyGstin] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [txnNo, setTxnNo] = useState('');
  const [paymentType, setPaymentType] = useState('Credit');
  const [paidAmount, setPaidAmount] = useState(0);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Barcode Scanner State
  const [barcodeQuery, setBarcodeQuery] = useState('');
  const [scanFeedback, setScanFeedback] = useState(null);
  const barcodeInputRef = useRef(null);

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

  useEffect(() => {
    if (isOpen) {
      setTxnType(initialType);
      fetchParties();
      fetchItems();
      generateSuggestedTxnNo(initialType);
      setBarcodeQuery('');
      setScanFeedback(null);
      // Auto-focus barcode scanner after modal opens
      setTimeout(() => {
        if (barcodeInputRef.current) barcodeInputRef.current.focus();
      }, 150);
    }
  }, [isOpen, initialType]);

  const generateSuggestedTxnNo = (type) => {
    let prefix = 'INV';
    if (type === 'Sales Invoices') prefix = 'A/SL';
    else if (type === 'Quotation / Estimate') prefix = 'EST';
    else if (type === 'Payment In') prefix = 'PAY';
    else if (type === 'Sales Return') prefix = 'SR';
    else if (type === 'Credit Note') prefix = 'CN';
    else if (type === 'Delivery Challan') prefix = 'DC';
    else if (type === 'Proforma Invoice') prefix = 'PI';
    else if (type === 'Purchase Invoices' || type === 'Purchase Bills') prefix = 'PUR';
    else if (type === 'Payment Out') prefix = 'PAY-OUT';
    else if (type === 'Purchase Return') prefix = 'PR';
    else if (type === 'Debit Note') prefix = 'DN';
    else if (type === 'Purchase Orders') prefix = 'PO';

    const rand = Math.floor(1000 + Math.random() * 9000);
    setTxnNo(`${prefix}-${rand}`);
  };

  const fetchParties = async () => {
    try {
      const res = await fetch('/api/parties');
      const data = await res.json();
      setParties(data);
    } catch (err) {
      console.error('Failed to fetch parties', err);
    }
  };

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/items');
      const data = await res.json();
      setInventoryItems(data);
    } catch (err) {
      console.error('Failed to fetch items', err);
    }
  };

  const handlePartyChange = (e) => {
    const partyId = e.target.value;
    setSelectedParty(partyId);
    if (partyId) {
      const party = parties.find(p => p.id === parseInt(partyId));
      if (party) {
        setCustomPartyName(party.name);
        setPartyPhone(party.phone || '');
        setPartyGstin(party.gstin || '');
      }
    } else {
      setCustomPartyName('');
      setPartyPhone('');
      setPartyGstin('');
    }
  };

  // Web Audio POS Beep synthesizer
  const playAudioFeedback = (isSuccess = true) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (isSuccess) {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch (e) {
      // Audio might be blocked until user interacts
    }
  };

  // Barcode Scan Handler - Auto adds item or increments qty
  const handleBarcodeProcess = (rawCode) => {
    const code = (rawCode || '').trim();
    if (!code) return;

    // Search item by exact item_code / barcode or name or HSN
    const found = inventoryItems.find(i => 
      (i.item_code && i.item_code.toLowerCase() === code.toLowerCase()) ||
      (i.name && i.name.toLowerCase() === code.toLowerCase()) ||
      (i.hsn_code && i.hsn_code === code)
    );

    if (!found) {
      playAudioFeedback(false);
      setScanFeedback({ type: 'error', message: `Item nahi mila barcode "${code}" ke liye!` });
      setTimeout(() => setScanFeedback(null), 3500);
      return;
    }

    // Found item!
    playAudioFeedback(true);
    const rate = txnType === 'Purchase Bills' ? found.purchase_price : found.sale_price;

    let updatedRows = [...items];
    const existingIdx = updatedRows.findIndex(it => it.item_id === found.id);

    if (existingIdx !== -1) {
      // Item already in invoice: Auto increment quantity!
      const currentQty = parseFloat(updatedRows[existingIdx].quantity) || 0;
      const newQty = currentQty + 1;
      updatedRows[existingIdx].quantity = newQty;
      recalculateRow(updatedRows, existingIdx);
      setScanFeedback({ 
        type: 'success', 
        message: `✓ "${found.name}" ki Quantity badhakar ${newQty} kar di!` 
      });
    } else {
      // Not yet in invoice: place in empty row or append new row
      const emptyIdx = updatedRows.findIndex(it => !it.item_id && !it.item_name);
      const newRow = {
        item_id: found.id,
        item_name: found.name,
        hsn_code: found.hsn_code || '',
        quantity: 1,
        unit: found.unit || 'PCS',
        rate: rate,
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

      setScanFeedback({ 
        type: 'success', 
        message: `✓ Item Auto Add hua: "${found.name}" (Rate: ₹${rate})` 
      });
    }

    setBarcodeQuery('');
    setTimeout(() => setScanFeedback(null), 3000);
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  };

  const handleBarcodeKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleBarcodeProcess(barcodeQuery);
    }
  };

  const handleItemSelect = (index, itemId) => {
    const updated = [...items];
    if (itemId) {
      const found = inventoryItems.find(i => i.id === parseInt(itemId));
      if (found) {
        const rate = txnType === 'Purchase Bills' ? found.purchase_price : found.sale_price;
        updated[index] = {
          ...updated[index],
          item_id: found.id,
          item_name: found.name,
          hsn_code: found.hsn_code || '',
          unit: found.unit || 'PCS',
          rate: rate,
          tax_rate: found.tax_rate || 0
        };
      }
    } else {
      updated[index] = {
        ...updated[index],
        item_id: null,
        item_name: '',
        hsn_code: '',
        rate: 0
      };
    }
    recalculateRow(updated, index);
  };

  const handleRowChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    recalculateRow(updated, index);
  };

  const recalculateRow = (rows, index) => {
    const row = rows[index];
    const qty = parseFloat(row.quantity) || 0;
    const rate = parseFloat(row.rate) || 0;
    const disc = parseFloat(row.discount) || 0;
    const taxRate = parseFloat(row.tax_rate) || 0;

    const baseAmount = Math.max(0, qty * rate - disc);
    const taxAmt = (baseAmount * taxRate) / 100;
    const total = baseAmount + taxAmt;

    row.tax_amount = parseFloat(taxAmt.toFixed(2));
    row.total = parseFloat(total.toFixed(2));
    setItems([...rows]);
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
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  // Computations
  const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.quantity || 0) * parseFloat(item.rate || 0)), 0);
  const totalDiscount = items.reduce((sum, item) => sum + (parseFloat(item.discount || 0)), 0);
  const totalTax = items.reduce((sum, item) => sum + (parseFloat(item.tax_amount || 0)), 0);
  const grandTotal = Math.round(subtotal - totalDiscount + totalTax);
  const balanceDue = Math.max(0, grandTotal - (parseFloat(paidAmount) || 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalPartyName = customPartyName.trim();
    if (!finalPartyName) {
      alert('Kripya Party Name select karein ya enter karein!');
      return;
    }

    if (items.length === 0 || !items[0].item_name) {
      alert('Kripya kam se kam ek item add karein!');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        txn_no: txnNo,
        type: txnType,
        date: date,
        party_id: selectedParty ? parseInt(selectedParty) : null,
        party_name: finalPartyName,
        subtotal: subtotal,
        discount: totalDiscount,
        tax_amount: totalTax,
        amount: grandTotal,
        paid_amount: parseFloat(paidAmount) || 0,
        payment_type: paymentType,
        notes: notes,
        items: items
      };

      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setIsSubmitting(false);
        onClose();
        if (onSuccess) onSuccess(data.id);
      } else {
        alert(data.error || 'Invoice save karne mein error aayi');
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      alert('Server error while saving transaction');
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-4 px-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-bold uppercase tracking-wider text-blue-400">
              New Transaction
            </span>
            <div className="flex flex-wrap gap-1 bg-slate-800 p-0.5 rounded-lg text-xs font-semibold">
              {(['Purchase Invoices', 'Purchase Bills', 'Payment Out', 'Purchase Return', 'Debit Note', 'Purchase Orders'].includes(txnType)
                ? [
                    'Purchase Invoices',
                    'Payment Out',
                    'Purchase Return',
                    'Debit Note',
                    'Purchase Orders'
                  ]
                : [
                    'Sales Invoices', 
                    'Quotation / Estimate', 
                    'Payment In', 
                    'Sales Return', 
                    'Credit Note', 
                    'Delivery Challan', 
                    'Proforma Invoice'
                  ]
              ).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { setTxnType(t); generateSuggestedTxnNo(t); }}
                  className={`px-2.5 py-1 rounded-md transition text-[11px] ${
                    txnType === t || (t === 'Purchase Invoices' && txnType === 'Purchase Bills') ? 'bg-indigo-600 text-white shadow-xs font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Party and Date Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Party / Customer Name *
              </label>
              <select
                value={selectedParty}
                onChange={handlePartyChange}
                className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="">-- Select Existing Party or Enter Below --</option>
                {parties.map(p => (
                  <option key={p.id} value={p.id}>{p.name} {p.phone ? `(${p.phone})` : ''}</option>
                ))}
              </select>

              {!selectedParty && (
                <input
                  type="text"
                  placeholder="Or enter new party name..."
                  value={customPartyName}
                  onChange={(e) => setCustomPartyName(e.target.value)}
                  className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2 mt-2 bg-white focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phone & GSTIN
              </label>
              <input
                type="text"
                placeholder="Phone number"
                value={partyPhone}
                onChange={(e) => setPartyPhone(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white mb-2"
              />
              <input
                type="text"
                placeholder="GSTIN (Optional)"
                value={partyGstin}
                onChange={(e) => setPartyGstin(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white uppercase font-mono"
              />
            </div>

            <div>
              <div className="mb-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Invoice / Txn Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Invoice / Bill No.
                </label>
                <input
                  type="text"
                  value={txnNo}
                  onChange={(e) => setTxnNo(e.target.value)}
                  className="w-full text-xs font-mono font-bold text-blue-600 border border-slate-300 rounded-lg p-2 bg-white"
                  required
                />
              </div>
            </div>
          </div>

          {/* Items & Barcode Scanner Section */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            
            {/* Dedicated Barcode Scanner Bar (myBillBook style auto item detection) */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 p-3.5 border-b border-blue-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex-1 flex items-center space-x-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-600">
                    <ScanLine className="w-4 h-4 animate-pulse stroke-[2.5]" />
                  </div>
                  <input
                    ref={barcodeInputRef}
                    type="text"
                    placeholder="📷 Scan Barcode or Enter Code (e.g. 706421053767) - Enter dabate hi Auto Add hoga!"
                    value={barcodeQuery}
                    onChange={(e) => setBarcodeQuery(e.target.value)}
                    onKeyDown={handleBarcodeKeyDown}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-blue-300 rounded-xl text-xs font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-2xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleBarcodeProcess(barcodeQuery)}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1 shadow-2xs whitespace-nowrap"
                >
                  <span>+ Auto Add Item</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                {scanFeedback && (
                  <div className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 animate-in fade-in duration-150 ${
                    scanFeedback.type === 'success' 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs' 
                      : 'bg-red-100 text-red-800 border border-red-300 shadow-2xs'
                  }`}>
                    {scanFeedback.type === 'success' ? (
                      <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-600 stroke-[2.5]" />
                    )}
                    <span>{scanFeedback.message}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={addItemRow}
                  className="inline-flex items-center space-x-1 text-xs font-bold bg-white text-slate-700 border border-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition shadow-2xs whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>+ Manual Row</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5 w-6">#</th>
                    <th className="p-2.5 min-w-[200px]">Item Description / Barcode</th>
                    <th className="p-2.5 w-20">HSN</th>
                    <th className="p-2.5 w-16">Qty</th>
                    <th className="p-2.5 w-20">Unit</th>
                    <th className="p-2.5 w-24">Rate (₹)</th>
                    <th className="p-2.5 w-20">Disc (₹)</th>
                    <th className="p-2.5 w-20">GST %</th>
                    <th className="p-2.5 w-24 text-right">Amount (₹)</th>
                    <th className="p-2.5 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2.5 text-slate-400 font-mono text-center">{idx + 1}</td>
                      <td className="p-2.5">
                        <input
                          type="text"
                          placeholder="Search / enter item or barcode..."
                          list={`items-list-${idx}`}
                          value={row.item_name}
                          onChange={(e) => {
                            const val = e.target.value;
                            const matched = inventoryItems.find(i => 
                              i.name.toLowerCase() === val.toLowerCase() ||
                              (i.item_code && i.item_code.toLowerCase() === val.toLowerCase())
                            );
                            if (matched) {
                              handleItemSelect(idx, matched.id);
                            } else {
                              handleRowChange(idx, 'item_name', val);
                            }
                          }}
                          className="w-full border border-slate-200 rounded p-1.5 font-medium focus:ring-1 focus:ring-blue-500"
                          required
                        />
                        <datalist id={`items-list-${idx}`}>
                          {inventoryItems.map(inv => (
                            <option key={inv.id} value={inv.name}>
                              {inv.item_code ? `[${inv.item_code}] ` : ''}₹{inv.sale_price} (Stock: {inv.stock_qty})
                            </option>
                          ))}
                        </datalist>
                      </td>
                      <td className="p-2.5">
                        <input
                          type="text"
                          value={row.hsn_code}
                          placeholder="HSN"
                          onChange={(e) => handleRowChange(idx, 'hsn_code', e.target.value)}
                          className="w-full border border-slate-200 rounded p-1.5 font-mono text-[11px]"
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          type="number"
                          step="any"
                          min="0.01"
                          value={row.quantity}
                          onChange={(e) => handleRowChange(idx, 'quantity', e.target.value)}
                          className="w-full border border-slate-200 rounded p-1.5 font-bold"
                          required
                        />
                      </td>
                      <td className="p-2.5">
                        <select
                          value={row.unit}
                          onChange={(e) => handleRowChange(idx, 'unit', e.target.value)}
                          className="w-full border border-slate-200 rounded p-1.5 text-[11px]"
                        >
                          <option value="PCS">PCS</option>
                          <option value="BAG">BAG</option>
                          <option value="KG">KG</option>
                          <option value="BOX">BOX</option>
                          <option value="ROLL">ROLL</option>
                          <option value="LTR">LTR</option>
                        </select>
                      </td>
                      <td className="p-2.5">
                        <input
                          type="number"
                          step="any"
                          value={row.rate}
                          onChange={(e) => handleRowChange(idx, 'rate', e.target.value)}
                          className="w-full border border-slate-200 rounded p-1.5 font-semibold text-right"
                          required
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          type="number"
                          step="any"
                          value={row.discount}
                          onChange={(e) => handleRowChange(idx, 'discount', e.target.value)}
                          className="w-full border border-slate-200 rounded p-1.5 text-right"
                        />
                      </td>
                      <td className="p-2.5">
                        <select
                          value={row.tax_rate}
                          onChange={(e) => handleRowChange(idx, 'tax_rate', e.target.value)}
                          className="w-full border border-slate-200 rounded p-1.5 font-semibold text-[11px]"
                        >
                          <option value="0">0%</option>
                          <option value="5">5%</option>
                          <option value="12">12%</option>
                          <option value="18">18%</option>
                          <option value="28">28%</option>
                        </select>
                      </td>
                      <td className="p-2.5 text-right font-bold text-slate-900">
                        ₹{row.total.toLocaleString('en-IN')}
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => removeItemRow(idx)}
                          className="text-slate-400 hover:text-red-500 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment & Summary Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Notes & Payment mode */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Payment Mode
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['Cash', 'Bank', 'Online', 'Credit'].map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPaymentType(mode)}
                      className={`py-2 px-2 text-xs font-bold rounded-lg border transition ${
                        paymentType === mode 
                          ? 'bg-blue-50 border-blue-600 text-blue-700' 
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Terms / Notes
                </label>
                <textarea
                  rows="3"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add payment notes or special terms..."
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
            </div>

            {/* Calculations Box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal (Excl. Tax):</span>
                <span className="font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Discount:</span>
                <span className="font-semibold text-red-500">- ₹{totalDiscount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total GST Tax:</span>
                <span className="font-semibold text-blue-600">+ ₹{totalTax.toLocaleString('en-IN')}</span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-extrabold text-slate-900">
                <span>Grand Total:</span>
                <span className="text-lg text-blue-700">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>

              <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    Amount Received / Paid (₹)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-1.5 font-bold text-right text-emerald-600"
                  />
                </div>
                <div className="text-right">
                  <span className="block text-[11px] font-bold text-slate-500">Balance Due</span>
                  <span className="text-base font-extrabold text-red-600">
                    ₹{balanceDue.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition flex items-center space-x-2"
            >
              <span>{isSubmitting ? 'Saving...' : 'Save & Generate Invoice'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
