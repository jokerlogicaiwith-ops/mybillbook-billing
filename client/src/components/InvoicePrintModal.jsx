import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Printer, Share2, FileText, Receipt, CheckCircle2, ChevronRight, Settings2, Copy, Layers, Check } from 'lucide-react';

/**
 * Converts numbers into standard Indian Currency Words format
 * e.g., 224200 -> "Two Lakh Twenty Four Thousand Two Hundred Rupees Only"
 */
function numberToIndianWords(num) {
  if (!num || isNaN(num)) return 'Zero Rupees Only';
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const n = Math.floor(Math.abs(num));
  if (n === 0) return 'Zero Rupees Only';

  const inWords = (n) => {
    let str = '';
    if (n >= 10000000) {
      str += inWords(Math.floor(n / 10000000)) + 'Crore ';
      n %= 10000000;
    }
    if (n >= 100000) {
      str += inWords(Math.floor(n / 100000)) + 'Lakh ';
      n %= 100000;
    }
    if (n >= 1000) {
      str += inWords(Math.floor(n / 1000)) + 'Thousand ';
      n %= 1000;
    }
    if (n >= 100) {
      str += inWords(Math.floor(n / 100)) + 'Hundred ';
      n %= 100;
    }
    if (n > 0) {
      if (n < 20) {
        str += a[n];
      } else {
        str += b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : ' ');
      }
    }
    return str;
  };

  const words = inWords(n).trim();
  const paise = Math.round((Math.abs(num) - n) * 100);
  let result = words + ' Rupees';
  if (paise > 0) {
    result += ' and ' + inWords(paise).trim() + ' Paise';
  }
  return result + ' Only';
}

const COPY_TYPES = [
  { id: 'original', label: 'Original for Recipient', title: 'Original for Recipient', docType: 'tax_invoice', defaultChecked: true },
  { id: 'duplicate', label: 'Duplicate for Transporter', title: 'Duplicate for Transporter', docType: 'tax_invoice', defaultChecked: true },
  { id: 'triplicate', label: 'Triplicate for Supplier', title: 'Triplicate for Supplier', docType: 'tax_invoice', defaultChecked: true },
  { id: 'delivery', label: 'Delivery Note', title: 'DELIVERY NOTE', docType: 'delivery_note', defaultChecked: false },
  { id: 'packing', label: 'Packing Slip', title: 'PACKING SLIP', docType: 'packing_slip', defaultChecked: false }
];

export default function InvoicePrintModal({ isOpen, onClose, txnId }) {
  const [invoice, setInvoice] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [printFormat, setPrintFormat] = useState('a4'); // 'a4' | 'pos'
  const [posPaperWidth, setPosPaperWidth] = useState('80mm'); // '80mm' | '58mm'
  const [staffList, setStaffList] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [localStaffName, setLocalStaffName] = useState('');
  const [localStaffCode, setLocalStaffCode] = useState('');

  // Multi-copy state (Original, Duplicate, Triplicate, Delivery Note, Packing Slip)
  const [copiesConfig, setCopiesConfig] = useState({
    original: true,
    duplicate: true,
    triplicate: true,
    delivery: false,
    packing: false
  });
  const [previewTab, setPreviewTab] = useState('all'); // 'all' or copyId

  useEffect(() => {
    if (isOpen && txnId) {
      loadInvoiceDetails();
      loadStaffList();
    }
  }, [isOpen, txnId]);

  const loadStaffList = async () => {
    try {
      const res = await fetch('/api/staff');
      const data = await res.json();
      if (Array.isArray(data)) setStaffList(data);
    } catch (e) {}
  };

  const loadInvoiceDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/transactions/${txnId}`);
      const data = await res.json();
      setInvoice(data);
      setLocalStaffName(data.staff_name || '');
      setLocalStaffCode(data.staff_code || '');
      setSelectedStaffId(data.staff_id ? String(data.staff_id) : '');

      // Generate UPI QR Code if balance due > 0 or total amount
      const upiId = data.company?.upi_id || '8130140936@upi';
      const amount = data.balance_due > 0 ? data.balance_due : data.amount;
      const qrRes = await fetch(`/api/qrcode?upi_id=${encodeURIComponent(upiId)}&name=${encodeURIComponent(data.company?.name || 'Apoorv')}&amount=${amount}&note=${encodeURIComponent(data.txn_no)}`);
      const qrData = await qrRes.json();
      setQrCodeUrl(qrData.qrDataUrl);
    } catch (err) {
      console.error('Failed to load invoice', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStaffChange = async (e) => {
    const sId = e.target.value;
    setSelectedStaffId(sId);
    const chosen = staffList.find(s => s.id === parseInt(sId));
    const newName = chosen ? chosen.name : '';
    const newCode = chosen ? chosen.staff_code : '';
    setLocalStaffName(newName);
    setLocalStaffCode(newCode);

    try {
      await fetch(`/api/transactions/${invoice?.id || txnId}/staff`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staff_id: sId ? parseInt(sId) : null })
      });
    } catch (err) {
      console.error('Failed to update invoice staff', err);
    }
  };

  const executePrint = (format = printFormat, width = posPaperWidth) => {
    setPrintFormat(format);
    if (width) setPosPaperWidth(width);

    // Dynamic @page styling to ensure exact sizing for A4 or POS Thermal roll
    let styleEl = document.getElementById('dynamic-print-style');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'dynamic-print-style';
      document.head.appendChild(styleEl);
    }

    if (format === 'a4') {
      styleEl.innerHTML = `
        @page {
          size: A4 portrait;
          margin: 6mm 8mm;
        }
      `;
    } else {
      styleEl.innerHTML = `
        @page {
          size: ${width} auto;
          margin: 2mm 3mm;
        }
      `;
    }

    // Small delay so React Portal renders the selected format before browser takes snapshot
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const getCustomerLink = () => {
    if (!invoice) return '';
    return `${window.location.origin}/bill/${encodeURIComponent(invoice.txn_no || invoice.id)}`;
  };

  const getWhatsAppUrl = () => {
    if (!invoice) return '#';
    const cleanPhone = invoice.party?.phone ? '91' + String(invoice.party.phone).replace(/[^0-9]/g, '') : '';
    const link = getCustomerLink();
    const text = `Namaste ${invoice.party_name}, aapka bill #${invoice.txn_no} amounting to Rs.${invoice.amount} generate ho gaya hai. Yahan click karke bill dekhein:\n${link}`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  // Active selected copies
  const activeCopies = COPY_TYPES.filter(c => copiesConfig[c.id]);

  if (!isOpen) return null;

  let printRoot = typeof document !== 'undefined' ? document.getElementById('print-root') : null;
  if (!printRoot && typeof document !== 'undefined') {
    printRoot = document.createElement('div');
    printRoot.id = 'print-root';
    document.body.appendChild(printRoot);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-1 sm:p-3 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[98vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
        
        {/* Top Control Header (Never printed) */}
        <div className="p-3 px-4 sm:px-5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          
          {/* Left: Invoice info and Format Switcher */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:block">
              <span className="font-bold text-sm text-slate-100">Bill: {invoice?.txn_no || '...'}</span>
              <span className="ml-2 text-[10px] bg-blue-600/80 px-2 py-0.5 rounded font-mono uppercase text-blue-100">
                {invoice?.type || 'Sales Invoice'}
              </span>
            </div>

            {/* Mode Tabs: A4 vs POS Machine */}
            <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setPrintFormat('a4')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-bold transition ${
                  printFormat === 'a4'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>A4 GST Invoice ({activeCopies.length} {activeCopies.length === 1 ? 'Page' : 'Copies'})</span>
              </button>

              <button
                type="button"
                onClick={() => setPrintFormat('pos')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-bold transition ${
                  printFormat === 'pos'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>POS Thermal Machine</span>
              </button>
            </div>

            {/* Thermal Width Selector if POS format selected */}
            {printFormat === 'pos' && (
              <div className="flex items-center space-x-1 bg-slate-800/80 px-2 py-1 rounded-md text-[11px] border border-slate-700">
                <span className="text-slate-400">Roll:</span>
                <button
                  type="button"
                  onClick={() => setPosPaperWidth('80mm')}
                  className={`px-1.5 py-0.5 rounded font-bold ${
                    posPaperWidth === '80mm' ? 'bg-amber-400 text-slate-950' : 'text-slate-300 hover:text-white'
                  }`}
                  title="3 Inch / 80mm Standard POS Thermal Paper"
                >
                  80mm (3")
                </button>
                <button
                  type="button"
                  onClick={() => setPosPaperWidth('58mm')}
                  className={`px-1.5 py-0.5 rounded font-bold ${
                    posPaperWidth === '58mm' ? 'bg-amber-400 text-slate-950' : 'text-slate-300 hover:text-white'
                  }`}
                  title="2 Inch / 58mm Handheld Mini POS Paper"
                >
                  58mm (2")
                </button>
              </div>
            )}
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center space-x-2">
            {invoice && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    const link = getCustomerLink();
                    navigator.clipboard.writeText(link);
                    alert('Customer Bill Link copied to clipboard!\n\n' + link);
                  }}
                  className="hidden md:inline-flex items-center space-x-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-lg transition border border-slate-700"
                  title="Copy customer view link"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </button>

                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noreferrer"
                  className="hidden sm:inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition shadow-xs"
                >
                  <span>WhatsApp</span>
                </a>
              </>
            )}

            {/* Direct Print A4 Button */}
            <button
              onClick={() => executePrint('a4')}
              className={`inline-flex items-center space-x-1 px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-xs ${
                printFormat === 'a4'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
              title="Print standard A4 invoice with all selected copies"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print A4 ({activeCopies.length} {activeCopies.length === 1 ? 'Copy' : 'Copies'})</span>
            </button>

            {/* Direct Print POS Button */}
            <button
              onClick={() => executePrint('pos')}
              className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs ${
                printFormat === 'pos'
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold'
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700'
              }`}
              title="Print POS Thermal machine receipt"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Print POS Machine</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Copies Selector Bar (MyBillBook 3-Ply & Multiple Copy feature) */}
        {printFormat === 'a4' && (
          <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2.5 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                <Copy className="w-3.5 h-3.5 text-blue-600" />
                <span>Invoice Copies (जितने कॉपी चाहिए टिक करें):</span>
              </span>

              {/* Quick Preset Buttons */}
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => {
                    setCopiesConfig({ original: true, duplicate: false, triplicate: false, delivery: false, packing: false });
                    setPreviewTab('all');
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold border transition ${
                    copiesConfig.original && !copiesConfig.duplicate && !copiesConfig.triplicate && !copiesConfig.delivery && !copiesConfig.packing
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  1 Copy
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCopiesConfig({ original: true, duplicate: true, triplicate: false, delivery: false, packing: false });
                    setPreviewTab('all');
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold border transition ${
                    copiesConfig.original && copiesConfig.duplicate && !copiesConfig.triplicate && !copiesConfig.delivery && !copiesConfig.packing
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  2 Copies (Org + Dup)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCopiesConfig({ original: true, duplicate: true, triplicate: true, delivery: false, packing: false });
                    setPreviewTab('all');
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold border transition ${
                    copiesConfig.original && copiesConfig.duplicate && copiesConfig.triplicate && !copiesConfig.delivery && !copiesConfig.packing
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                  title="Standard GST 3-Ply (Original for Recipient, Duplicate for Transporter, Triplicate for Supplier)"
                >
                  3 Copies (Standard 3-Ply GST)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCopiesConfig({ original: true, duplicate: true, triplicate: true, delivery: true, packing: true });
                    setPreviewTab('all');
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold border transition ${
                    copiesConfig.original && copiesConfig.duplicate && copiesConfig.triplicate && copiesConfig.delivery && copiesConfig.packing
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                  title="All 5 Documents: 3 GST Invoices + Delivery Note + Packing Slip"
                >
                  All 5 Docs
                </button>
              </div>
            </div>

            {/* Individual Checkbox Toggles */}
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-slate-800">
              {COPY_TYPES.map(c => (
                <label key={c.id} className="flex items-center space-x-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={Boolean(copiesConfig[c.id])}
                    onChange={(e) => {
                      const next = { ...copiesConfig, [c.id]: e.target.checked };
                      // At least one must be checked
                      if (Object.values(next).some(Boolean)) {
                        setCopiesConfig(next);
                      }
                    }}
                    className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                  />
                  <span className={c.docType === 'delivery_note' ? 'text-indigo-900 font-bold' : c.docType === 'packing_slip' ? 'text-teal-900 font-bold' : ''}>
                    {c.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Page Switcher Sub-bar if Multiple Copies are Active */}
        {printFormat === 'a4' && activeCopies.length > 1 && (
          <div className="bg-slate-100/90 border-b border-slate-200 px-6 py-1.5 flex items-center justify-between text-[11px]">
            <div className="flex items-center space-x-1.5 overflow-x-auto">
              <span className="text-slate-500 font-medium mr-1">Preview Page:</span>
              <button
                type="button"
                onClick={() => setPreviewTab('all')}
                className={`px-2 py-0.5 rounded font-bold transition ${
                  previewTab === 'all' ? 'bg-slate-800 text-white shadow-2xs' : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
                }`}
              >
                All Pages ({activeCopies.length})
              </button>
              {activeCopies.map((c, i) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setPreviewTab(c.id)}
                  className={`px-2 py-0.5 rounded font-bold transition ${
                    previewTab === c.id ? 'bg-blue-600 text-white shadow-2xs' : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
                  }`}
                >
                  Page {i + 1}: {c.label.split(' ')[0]}
                </button>
              ))}
            </div>
            <span className="text-slate-400 hidden md:inline">Print command will print all {activeCopies.length} pages in exact sequence</span>
          </div>
        )}

        {/* Interactive Screen Preview Container */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-200/90 flex justify-center items-start">
          {loading ? (
            <div className="p-16 text-center text-slate-500 font-medium">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              Loading invoice details...
            </div>
          ) : !invoice ? (
            <div className="p-16 text-center text-red-500 font-medium">Invoice not found!</div>
          ) : printFormat === 'a4' ? (
            // A4 Multi-Copy Preview
            <div className="w-full max-w-[210mm] space-y-6">
              {activeCopies
                .filter(c => previewTab === 'all' || previewTab === c.id)
                .map((copyItem, idx) => (
                  <div key={copyItem.id} className="relative bg-white shadow-xl rounded-sm border border-slate-400 transition-all">
                    {/* Screen Page Badge */}
                    <div className="bg-slate-800 text-white text-[10px] font-bold px-3 py-1 flex items-center justify-between border-b border-slate-700 print:hidden">
                      <span>📄 Copy {idx + 1} of {activeCopies.length}: <span className="text-blue-300 uppercase">{copyItem.label}</span></span>
                      <span className="text-slate-400 font-mono">MyBillBook Standard GST Layout</span>
                    </div>

                    <A4GSTInvoiceLayout 
                      invoice={invoice} 
                      copyId={copyItem.id}
                      copyType={copyItem.docType}
                      copyTitle={copyItem.title}
                      staffName={localStaffName || invoice.staff_name} 
                      staffCode={localStaffCode || invoice.staff_code}
                      staffList={staffList}
                      selectedStaffId={selectedStaffId}
                      onStaffChange={handleStaffChange}
                      qrCodeUrl={qrCodeUrl}
                    />
                  </div>
                ))}
            </div>
          ) : (
            // POS Machine Preview (Realistic Receipt Roll)
            <div className={`bg-white shadow-2xl rounded-sm border border-slate-400 mx-auto transition-all ${
              posPaperWidth === '80mm' ? 'w-[340px]' : 'w-[280px]'
            }`}>
              <div className="bg-amber-100 text-amber-900 text-[10px] text-center font-bold py-1 border-b border-amber-200 uppercase tracking-wider">
                POS Machine Thermal Receipt ({posPaperWidth})
              </div>
              <POSReceiptLayout 
                invoice={invoice} 
                qrCodeUrl={qrCodeUrl} 
                paperWidth={posPaperWidth} 
                staffName={localStaffName || invoice.staff_name} 
                staffCode={localStaffCode || invoice.staff_code}
                staffList={staffList}
                selectedStaffId={selectedStaffId}
                onStaffChange={handleStaffChange}
              />
            </div>
          )}
        </div>

      </div>

      {/* React Portal: Injects clean printable layout into #print-root (isolated from interactive app) */}
      {printRoot && invoice && createPortal(
        printFormat === 'a4' ? (
          <div className="w-full bg-white text-slate-950 font-sans p-0 m-0">
            {activeCopies.map((copyItem, idx) => (
              <div 
                key={copyItem.id} 
                className={`print-page-break-avoid ${idx < activeCopies.length - 1 ? 'page-break-after-always' : ''}`}
                style={{
                  pageBreakAfter: idx < activeCopies.length - 1 ? 'always' : 'auto',
                  breakAfter: idx < activeCopies.length - 1 ? 'page' : 'auto'
                }}
              >
                <A4GSTInvoiceLayout 
                  invoice={invoice} 
                  copyId={copyItem.id}
                  copyType={copyItem.docType}
                  copyTitle={copyItem.title}
                  staffName={localStaffName || invoice.staff_name} 
                  staffCode={localStaffCode || invoice.staff_code}
                  qrCodeUrl={qrCodeUrl}
                  isPrintView
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="print-page-break-avoid w-full bg-white text-slate-900 font-mono p-0 m-0">
            <POSReceiptLayout 
              invoice={invoice} 
              qrCodeUrl={qrCodeUrl} 
              paperWidth={posPaperWidth} 
              staffName={localStaffName || invoice.staff_name} 
              staffCode={localStaffCode || invoice.staff_code}
              isPrintView 
            />
          </div>
        ),
        printRoot
      )}

    </div>
  );
}

/**
 * EXACT MYBILLBOOK GST TAX INVOICE TEMPLATE (1:1 REPLICA OF OFFICIAL PDF)
 * Features:
 * - Solid outer border box
 * - Centered Company Details
 * - TAX INVOICE title with 3 Copy Checkboxes (Original / Duplicate / Triplicate)
 * - 2-Column Metadata (Reverse charge, Invoice No, Date, State & Code, Challan, Vehicle, Supply)
 * - 2-Column Party Details (Receiver / Billed To & Consignee / Shipped To)
 * - Full GST items table with HSN/SAC, QTY, Rate, Taxable Value, CGST, SGST, Total
 * - Total Amount in Words (Indian numbering: Lakhs, Crores)
 * - Complete Bank Details table & Terms
 * - Total Before Tax, CGST, SGST, GST Tax Amount, Final Amount
 * - Certified True & Correct, Company Name, Staff Billed By, and Authorised Signatory
 */
function A4GSTInvoiceLayout({ 
  invoice, 
  copyId = 'original',
  copyType = 'tax_invoice',
  copyTitle = 'Original for Recipient',
  qrCodeUrl, 
  isPrintView = false, 
  staffName, 
  staffCode, 
  staffList = [], 
  selectedStaffId = '', 
  onStaffChange 
}) {
  const company = invoice.company || {};
  const party = invoice.party || {};
  const bank = invoice.bank || {};
  const items = invoice.items || [];

  const currentStaffName = staffName !== undefined && staffName !== '' ? staffName : (invoice.staff_name || 'Admin');
  const currentStaffCode = staffCode !== undefined && staffCode !== '' ? staffCode : invoice.staff_code;

  // Calculate totals
  const totalQty = items.reduce((sum, item) => sum + (parseFloat(item.quantity) || 1), 0);
  const taxableTotal = items.reduce((sum, item) => {
    const rate = parseFloat(item.rate) || 0;
    const qty = parseFloat(item.quantity) || 1;
    const discount = parseFloat(item.discount) || 0;
    return sum + (rate * qty - discount);
  }, 0) || (invoice.subtotal || invoice.amount);

  const totalGstAmount = parseFloat(invoice.tax_amount) || 0;
  // Standard intra-state split (CGST 50% + SGST 50%)
  const cgstAmount = totalGstAmount / 2;
  const sgstAmount = totalGstAmount / 2;
  const grandTotal = parseFloat(invoice.amount) || (taxableTotal + totalGstAmount);

  const amountInWords = numberToIndianWords(grandTotal);

  return (
    <div className={`bg-white text-slate-950 font-sans leading-tight border-2 border-black ${
      isPrintView ? 'p-0 w-full min-h-[285mm] max-h-[290mm]' : 'p-0 w-full'
    }`}>
      
      {/* 1. TOP COMPANY HEADER (Centered) */}
      <div className="text-center py-2.5 px-4 border-b border-black">
        <h1 className="text-lg font-black uppercase tracking-wide text-black">
          {company.name || 'AVYAAN'}
        </h1>
        <p className="text-[10px] text-slate-800 font-medium mt-0.5">
          {company.address || company.billing_address || 'WARD 11, TAJPUR, THANA ROAD, Kasbey Ahar, Samastipur, Bihar, 848130'}
        </p>
        <p className="text-[10px] text-slate-800 font-semibold mt-0.5">
          {company.phone || '9470605923'}
          {company.email && `, ${company.email}`}
        </p>
        {company.gstin && (
          <p className="text-[10px] font-bold text-black mt-0.5">
            GSTIN : <span className="font-mono">{company.gstin}</span>
          </p>
        )}
      </div>

      {/* 2. TITLE BAR WITH COPY CHECKBOXES */}
      <div className="relative border-b border-black flex items-center justify-center py-1.5 bg-slate-50/50 min-h-[36px]">
        {/* Main Document Title */}
        <h2 className="text-sm font-black uppercase tracking-widest text-black">
          {copyType === 'delivery_note' ? 'DELIVERY NOTE' : copyType === 'packing_slip' ? 'PACKING SLIP' : 'TAX INVOICE'}
        </h2>

        {/* Right Corner: Original / Duplicate / Triplicate Checkboxes (for Tax Invoice) */}
        {copyType === 'tax_invoice' && (
          <div className="absolute right-0 top-0 bottom-0 border-l border-black text-[8px] flex flex-col justify-center bg-white">
            <div className={`px-2 py-0.5 border-b border-black flex items-center space-x-1.5 ${copyId === 'original' ? 'bg-slate-200/90 font-black' : 'text-slate-600'}`}>
              <span className="w-3 text-center font-bold">{copyId === 'original' ? '✓' : ''}</span>
              <span>Original for Recipient</span>
            </div>
            <div className={`px-2 py-0.5 border-b border-black flex items-center space-x-1.5 ${copyId === 'duplicate' ? 'bg-slate-200/90 font-black' : 'text-slate-600'}`}>
              <span className="w-3 text-center font-bold">{copyId === 'duplicate' ? '✓' : ''}</span>
              <span>Duplicate for Transporter</span>
            </div>
            <div className={`px-2 py-0.5 flex items-center space-x-1.5 ${copyId === 'triplicate' ? 'bg-slate-200/90 font-black' : 'text-slate-600'}`}>
              <span className="w-3 text-center font-bold">{copyId === 'triplicate' ? '✓' : ''}</span>
              <span>Triplicate for Supplier</span>
            </div>
          </div>
        )}
      </div>

      {/* 3. METADATA ROW (Reverse Charge, Invoice No, Date, State, Challan, Vehicle, Supply) */}
      <div className="grid grid-cols-2 text-[10px] border-b border-black">
        {/* Left Col */}
        <div className="p-2 border-r border-black space-y-0.5">
          <div className="flex">
            <span className="w-28 font-semibold text-slate-800">Reverse Charge</span>
            <span className="mr-2">:</span>
            <span className="font-medium">No</span>
          </div>
          <div className="flex">
            <span className="w-28 font-semibold text-slate-800">Invoice No.</span>
            <span className="mr-2">:</span>
            <span className="font-bold font-mono text-black">{invoice.txn_no}</span>
          </div>
          <div className="flex">
            <span className="w-28 font-semibold text-slate-800">Invoice Date</span>
            <span className="mr-2">:</span>
            <span className="font-medium">{invoice.date}</span>
          </div>
          <div className="flex items-center justify-between pr-2">
            <div className="flex">
              <span className="w-28 font-semibold text-slate-800">State</span>
              <span className="mr-2">:</span>
              <span className="font-medium">{party.state || 'Bihar'}</span>
            </div>
            <div className="border border-black px-1.5 py-0.2 text-[9px] flex items-center space-x-1">
              <span className="text-[8px] font-semibold">State Code</span>
              <span className="font-bold">: 10</span>
            </div>
          </div>
        </div>

        {/* Right Col */}
        <div className="p-2 space-y-0.5">
          <div className="flex">
            <span className="w-28 font-semibold text-slate-800">Challan No.</span>
            <span className="mr-2">:</span>
            <span className="font-mono">{invoice.challan_no || ''}</span>
          </div>
          <div className="flex">
            <span className="w-28 font-semibold text-slate-800">Vehicle No.</span>
            <span className="mr-2">:</span>
            <span className="font-mono">{invoice.vehicle_no || ''}</span>
          </div>
          <div className="flex">
            <span className="w-28 font-semibold text-slate-800">Date of Supply</span>
            <span className="mr-2">:</span>
            <span>{invoice.date}</span>
          </div>
          <div className="flex">
            <span className="w-28 font-semibold text-slate-800">Place of Supply</span>
            <span className="mr-2">:</span>
            <span>{party.state || 'Bihar'}</span>
          </div>
        </div>
      </div>

      {/* 4. PARTY DETAILS (Receiver & Consignee Columns) */}
      <div className="grid grid-cols-2 text-[10px] border-b border-black">
        {/* Left: Receiver / Billed To */}
        <div className="border-r border-black flex flex-col justify-between">
          <div className="bg-slate-100/70 border-b border-black text-center py-1 font-bold text-[9px] uppercase tracking-wide">
            Details of Receiver | Billed to:
          </div>
          <div className="p-2 space-y-0.5 flex-1">
            <div className="flex">
              <span className="w-16 font-semibold text-slate-800">Name</span>
              <span className="mr-2">:</span>
              <span className="font-bold text-black">{invoice.party_name}</span>
            </div>
            <div className="flex">
              <span className="w-16 font-semibold text-slate-800">Address</span>
              <span className="mr-2">:</span>
              <span className="text-[9.5px] leading-tight">{party.address || 'Tajpur Samastipur, Bihar - 848130'}</span>
            </div>
            <div className="flex">
              <span className="w-16 font-semibold text-slate-800">MOBILE</span>
              <span className="mr-2">:</span>
              <span className="font-mono font-medium">{party.phone || '7462927889'}</span>
            </div>
            {party.gstin && (
              <div className="flex">
                <span className="w-16 font-semibold text-slate-800">GSTIN</span>
                <span className="mr-2">:</span>
                <span className="font-mono font-bold">{party.gstin}</span>
              </div>
            )}
            <div className="flex items-center justify-between pr-2 pt-0.5">
              <div className="flex">
                <span className="w-16 font-semibold text-slate-800">State</span>
                <span className="mr-2">:</span>
                <span>{party.state || 'Bihar'}</span>
              </div>
              <div className="border border-black px-1.5 py-0.2 text-[9px] flex items-center space-x-1">
                <span className="text-[8px] font-semibold">State Code</span>
                <span className="font-bold">: 10</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Consignee / Shipped To */}
        <div className="flex flex-col justify-between">
          <div className="bg-slate-100/70 border-b border-black text-center py-1 font-bold text-[9px] uppercase tracking-wide">
            Details of Consignee | Shipped to:
          </div>
          <div className="p-2 space-y-0.5 flex-1">
            <div className="flex">
              <span className="w-16 font-semibold text-slate-800">Name</span>
              <span className="mr-2">:</span>
              <span className="font-bold text-black">{invoice.party_name}</span>
            </div>
            <div className="flex">
              <span className="w-16 font-semibold text-slate-800">Address</span>
              <span className="mr-2">:</span>
              <span className="text-[9.5px] leading-tight">{party.address || 'Tajpur Samastipur, Bihar - 848130'}</span>
            </div>
            <div className="flex">
              <span className="w-16 font-semibold text-slate-800">MOBILE</span>
              <span className="mr-2">:</span>
              <span className="font-mono font-medium">{party.phone || '7462927889'}</span>
            </div>
            {party.gstin && (
              <div className="flex">
                <span className="w-16 font-semibold text-slate-800">GSTIN</span>
                <span className="mr-2">:</span>
                <span className="font-mono font-bold">{party.gstin}</span>
              </div>
            )}
            <div className="flex items-center justify-between pr-2 pt-0.5">
              <div className="flex">
                <span className="w-16 font-semibold text-slate-800">State</span>
                <span className="mr-2">:</span>
                <span>{party.state || 'Bihar'}</span>
              </div>
              <div className="border border-black px-1.5 py-0.2 text-[9px] flex items-center space-x-1">
                <span className="text-[8px] font-semibold">State Code</span>
                <span className="font-bold">: 10</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. ITEMS TABLE */}
      {copyType === 'tax_invoice' ? (
        // Standard Tax Invoice Table with CGST & SGST columns
        <div className="border-b border-black">
          <table className="w-full text-[9px] text-left border-collapse">
            <thead>
              <tr className="border-b border-black font-bold text-center bg-slate-100/50">
                <th className="py-1 px-1 border-r border-black w-8">Sr.<br/>No.</th>
                <th className="py-1 px-1.5 border-r border-black text-left">Name of product</th>
                <th className="py-1 px-1 border-r border-black w-14">HSN/SAC</th>
                <th className="py-1 px-1 border-r border-black w-10">QTY</th>
                <th className="py-1 px-1 border-r border-black w-10">Unit</th>
                <th className="py-1 px-1.5 border-r border-black w-16 text-right">Rate</th>
                <th className="py-1 px-1.5 border-r border-black w-20 text-right">Taxable<br/>Value</th>
                <th className="py-0.5 px-0.5 border-r border-black w-28 text-center" colSpan="2">
                  <div className="border-b border-black pb-0.5">CGST</div>
                  <div className="grid grid-cols-2 pt-0.5">
                    <span className="border-r border-black">Rate</span>
                    <span>Amount</span>
                  </div>
                </th>
                <th className="py-0.5 px-0.5 border-r border-black w-28 text-center" colSpan="2">
                  <div className="border-b border-black pb-0.5">SGST</div>
                  <div className="grid grid-cols-2 pt-0.5">
                    <span className="border-r border-black">Rate</span>
                    <span>Amount</span>
                  </div>
                </th>
                <th className="py-1 px-1.5 w-20 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => {
                const qty = parseFloat(it.quantity) || 1;
                const rate = parseFloat(it.rate) || 0;
                const taxRate = parseFloat(it.tax_rate) !== undefined ? parseFloat(it.tax_rate) : 18;
                const taxableVal = (qty * rate) - (parseFloat(it.discount) || 0);
                const halfTaxRate = taxRate / 2;
                const cgst = (taxableVal * halfTaxRate) / 100;
                const sgst = (taxableVal * halfTaxRate) / 100;
                const itemTotal = taxableVal + cgst + sgst;

                return (
                  <tr key={it.id || idx} className="border-b border-black/40 align-top">
                    <td className="py-1.5 px-1 border-r border-black text-center font-mono">{idx + 1}</td>
                    <td className="py-1.5 px-1.5 border-r border-black font-semibold text-black leading-tight">
                      {it.item_name}
                    </td>
                    <td className="py-1.5 px-1 border-r border-black text-center font-mono">{it.hsn_code || '8536'}</td>
                    <td className="py-1.5 px-1 border-r border-black text-center font-bold font-mono">{qty}</td>
                    <td className="py-1.5 px-1 border-r border-black text-center uppercase">{it.unit || 'PCS'}</td>
                    <td className="py-1.5 px-1.5 border-r border-black text-right font-mono">{rate.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="py-1.5 px-1.5 border-r border-black text-right font-mono font-medium">{taxableVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="py-1.5 px-1 border-r border-black text-center font-mono w-14">{halfTaxRate.toFixed(2)}%</td>
                    <td className="py-1.5 px-1 border-r border-black text-right font-mono w-14">{cgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="py-1.5 px-1 border-r border-black text-center font-mono w-14">{halfTaxRate.toFixed(2)}%</td>
                    <td className="py-1.5 px-1 border-r border-black text-right font-mono w-14">{sgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="py-1.5 px-1.5 text-right font-bold font-mono text-black">{itemTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                );
              })}

              {/* Min-height spacer rows if few items */}
              {items.length < 3 && Array.from({ length: 3 - items.length }).map((_, i) => (
                <tr key={`spacer-${i}`} className="border-b border-black/20 text-transparent select-none">
                  <td className="py-2 px-1 border-r border-black">&nbsp;</td>
                  <td className="py-2 px-1.5 border-r border-black">&nbsp;</td>
                  <td className="py-2 px-1 border-r border-black">&nbsp;</td>
                  <td className="py-2 px-1 border-r border-black">&nbsp;</td>
                  <td className="py-2 px-1 border-r border-black">&nbsp;</td>
                  <td className="py-2 px-1.5 border-r border-black">&nbsp;</td>
                  <td className="py-2 px-1.5 border-r border-black">&nbsp;</td>
                  <td className="py-2 px-1 border-r border-black">&nbsp;</td>
                  <td className="py-2 px-1 border-r border-black">&nbsp;</td>
                  <td className="py-2 px-1 border-r border-black">&nbsp;</td>
                  <td className="py-2 px-1 border-r border-black">&nbsp;</td>
                  <td className="py-2 px-1.5">&nbsp;</td>
                </tr>
              ))}

              {/* Total Quantity Row matching PDF */}
              <tr className="border-t-2 border-black font-black text-[9.5px] bg-slate-100/60">
                <td className="py-1 px-1.5 border-r border-black text-center" colSpan="3">Total Quantity</td>
                <td className="py-1 px-1 border-r border-black text-center font-mono font-black">{totalQty}</td>
                <td className="py-1 px-1 border-r border-black" colSpan="2"></td>
                <td className="py-1 px-1.5 border-r border-black text-right font-mono">₹{taxableTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="py-1 px-1 border-r border-black text-right font-mono" colSpan="2">₹{cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="py-1 px-1 border-r border-black text-right font-mono" colSpan="2">₹{sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="py-1 px-1.5 text-right font-mono font-black">₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        // Delivery Note / Packing Slip Table (No tax columns)
        <div className="border-b border-black">
          <table className="w-full text-[10px] text-left border-collapse">
            <thead>
              <tr className="border-b border-black font-bold text-center bg-slate-100/50">
                <th className="py-1 px-1.5 border-r border-black w-10">Sr. No.</th>
                <th className="py-1 px-2 border-r border-black text-left">Name of product</th>
                <th className="py-1 px-2 border-r border-black w-24">HSN/SAC</th>
                <th className="py-1 px-2 border-r border-black w-16">QTY</th>
                <th className="py-1 px-2 w-16">Unit</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={it.id || idx} className="border-b border-black/40">
                  <td className="py-2 px-1.5 border-r border-black text-center font-mono">{idx + 1}</td>
                  <td className="py-2 px-2 border-r border-black font-semibold text-black">{it.item_name}</td>
                  <td className="py-2 px-2 border-r border-black text-center font-mono">{it.hsn_code || '8536'}</td>
                  <td className="py-2 px-2 border-r border-black text-center font-bold font-mono">{it.quantity || 1}</td>
                  <td className="py-2 px-2 text-center uppercase">{it.unit || 'PCS'}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-black font-black text-xs bg-slate-100/60">
                <td className="py-1.5 px-2 border-r border-black text-center" colSpan="3">Total Quantity</td>
                <td className="py-1.5 px-2 border-r border-black text-center font-mono">{totalQty}</td>
                <td className="py-1.5 px-2"></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* 6. BOTTOM SUMMARY SECTION */}
      {copyType === 'tax_invoice' ? (
        <div className="grid grid-cols-12 text-[9.5px]">
          {/* Left Column (7 cols = ~58%) */}
          <div className="col-span-7 border-r border-black flex flex-col justify-between">
            {/* Amount in Words */}
            <div className="p-2 border-b border-black">
              <span className="font-bold text-slate-800 block text-[9px] mb-0.5">Total Invoice Amount in words</span>
              <p className="font-black text-[10px] text-black italic">
                {amountInWords}
              </p>
            </div>

            {/* Bank Details */}
            <div className="p-2 border-b border-black bg-slate-50/40">
              <div className="font-bold uppercase text-[9px] text-center border-b border-black/30 pb-1 mb-1">
                Bank Details
              </div>
              <div className="space-y-0.5 text-[9px]">
                <div className="flex">
                  <span className="w-32 text-slate-700">Account Holder Name</span>
                  <span className="mr-1">:</span>
                  <span className="font-bold">{bank.name || company.name || 'AVYAAN'}</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-slate-700">Bank Account Number</span>
                  <span className="mr-1">:</span>
                  <span className="font-mono font-bold">{bank.account_number || '761801010050603'}</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-slate-700">Bank IFSC Code</span>
                  <span className="mr-1">:</span>
                  <span className="font-mono font-bold">{bank.ifsc || 'UBIN0576182'}</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-slate-700">Bank Name</span>
                  <span className="mr-1">:</span>
                  <span className="font-semibold">{bank.bank_name || 'Union Bank of India'}</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-slate-700">Bank Branch Name</span>
                  <span className="mr-1">:</span>
                  <span>{bank.branch || 'KASBA TAJPUR'}</span>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="p-2 flex-1">
              <span className="font-bold uppercase text-[9px] block mb-0.5 text-slate-800">
                Terms And Conditions
              </span>
              <p className="text-[8.5px] text-slate-700 whitespace-pre-line leading-relaxed">
                {company.terms || `1. Goods once sold will not be taken back\n2. interest @ 18% p.a. will be charged if the payment is not made with in the stipulated time.\n3. Subject to (Bihar) jurisdiction only.`}
              </p>
            </div>
          </div>

          {/* Right Column (5 cols = ~42%) */}
          <div className="col-span-5 flex flex-col justify-between">
            {/* Calculation Totals */}
            <div className="p-2 space-y-1 border-b border-black text-[9.5px]">
              <div className="flex justify-between">
                <span className="text-slate-800">Total Amount Before Tax :</span>
                <span className="font-mono font-bold">₹{taxableTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-800">Add : CGST :</span>
                <span className="font-mono">₹{cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-800">Add : SGST :</span>
                <span className="font-mono">₹{sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between font-semibold border-t border-black/30 pt-0.5">
                <span className="text-slate-900">Tax Amount : GST :</span>
                <span className="font-mono">₹{totalGstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between font-black text-[11px] border-t-2 border-black pt-1 bg-slate-100/70 p-1">
                <span>Amount With Tax :</span>
                <span className="font-mono">₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Authorised Signatory Box */}
            <div className="p-3 text-center flex flex-col justify-between min-h-[110px]">
              <div className="text-[8px] text-slate-700">
                Certified that the particular given above are true and correct
              </div>

              <div className="font-bold text-xs uppercase text-black mt-1">
                For, {company.name || 'AVYAAN'}
              </div>

              {/* Staff attribution & Selector */}
              <div className="text-[9px] text-slate-700 mt-2 flex items-center justify-center flex-wrap gap-1">
                <span>Sales Staff:</span>
                <span className="font-bold text-black">{currentStaffName}</span>
                {currentStaffCode ? (
                  <span className="font-mono bg-blue-50 text-blue-900 border border-blue-200 text-[8.5px] font-bold px-1 py-0.2 rounded">
                    ({currentStaffCode})
                  </span>
                ) : (
                  <span className="font-mono text-slate-500 text-[8.5px]">(ADM-001)</span>
                )}

                {/* Inline staff switcher if in screen preview */}
                {!isPrintView && onStaffChange && staffList.length > 0 && (
                  <select
                    value={selectedStaffId}
                    onChange={onStaffChange}
                    className="ml-1 text-[9px] font-bold border border-blue-400 bg-blue-50 text-blue-900 rounded px-1 py-0.2 print:hidden cursor-pointer hover:bg-blue-100"
                    title="Change Staff for this Bill"
                  >
                    <option value="">👤 Change Staff</option>
                    {staffList.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.staff_code})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="mt-6 pt-1 border-t border-black/40 text-[9px] font-bold uppercase tracking-wider text-black">
                Authorised Signatory
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Bottom Signatory for Delivery Note & Packing Slip
        <div className="p-4 flex justify-between items-end min-h-[130px]">
          <div className="text-[9px] text-slate-600 max-w-sm">
            Goods delivered in good condition and as per order specifications.
          </div>

          <div className="text-center w-56">
            <div className="text-[8px] text-slate-700 mb-1">
              Certified that the particular given above are true and correct
            </div>
            <div className="font-bold text-xs uppercase text-black">
              For, {company.name || 'AVYAAN'}
            </div>
            <div className="mt-8 pt-1 border-t border-black text-[9px] font-bold uppercase tracking-wider text-black">
              Authorised Signatory
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

/**
 * POS THERMAL RECEIPT TEMPLATE (Continuous roll for 80mm or 58mm printers)
 */
function POSReceiptLayout({ 
  invoice, 
  qrCodeUrl, 
  paperWidth = '80mm', 
  isPrintView = false,
  staffName,
  staffCode,
  staffList = [],
  selectedStaffId = '',
  onStaffChange
}) {
  const company = invoice.company || {};
  const party = invoice.party || {};
  const is58 = paperWidth === '58mm';
  const currentStaffName = staffName !== undefined && staffName !== '' ? staffName : (invoice.staff_name || 'Admin');
  const currentStaffCode = staffCode !== undefined && staffCode !== '' ? staffCode : invoice.staff_code;

  return (
    <div className={`bg-white text-slate-950 font-mono leading-tight ${
      isPrintView ? 'p-1' : 'p-3'
    } ${is58 ? 'text-[10px]' : 'text-xs'}`}>
      
      {/* POS Store Header */}
      <div className="text-center pb-2">
        <h2 className={`font-black uppercase tracking-tight ${is58 ? 'text-sm' : 'text-base'}`}>
          {company.name || 'APOORV'}
        </h2>
        {company.tagline && (
          <p className="text-[9px] text-slate-700">{company.tagline}</p>
        )}
        <p className="text-[10px] text-slate-800 mt-0.5">{company.address || 'Samastipur, Bihar'}</p>
        <p className="text-[10px] font-bold">Ph: {company.phone || '8130140936'}</p>
        {company.gstin && (
          <p className="text-[9px] font-semibold">GSTIN: {company.gstin}</p>
        )}
      </div>

      {/* Dashed Separator */}
      <div className="border-b border-dashed border-slate-800 my-1.5" />

      {/* Bill & Customer Metadata */}
      <div className="space-y-0.5 text-[10px]">
        <div className="flex justify-between">
          <span>TAX INVOICE:</span>
          <span className="font-bold">{invoice.txn_no}</span>
        </div>
        <div className="flex justify-between">
          <span>Date:</span>
          <span>{invoice.date}</span>
        </div>
        <div className="flex justify-between">
          <span>Mode:</span>
          <span className="font-bold uppercase">{invoice.payment_type || 'Credit'}</span>
        </div>
        <div className="flex justify-between items-center text-[9px] py-0.5 border-b border-dashed border-slate-300">
          <span className="text-slate-700">Sales Staff / Billed:</span>
          <span className="font-bold">
            {currentStaffName} {currentStaffCode ? `(${currentStaffCode})` : '(ADM-001)'}
          </span>
        </div>
        <div className="flex justify-between pt-0.5">
          <span>Customer:</span>
          <span className="font-bold truncate max-w-[150px]">{invoice.party_name}</span>
        </div>
        {party.phone && (
          <div className="flex justify-between text-[9px] text-slate-600">
            <span>Cust Phone:</span>
            <span>{party.phone}</span>
          </div>
        )}
      </div>

      {/* Dashed Separator */}
      <div className="border-b border-dashed border-slate-800 my-1.5" />

      {/* Items Header */}
      <div className="font-bold flex justify-between text-[10px] pb-1 border-b border-slate-400">
        <span>ITEM</span>
        <span>QTY x RATE</span>
        <span className="text-right">TOTAL</span>
      </div>

      {/* Items List */}
      <div className="py-1 space-y-1">
        {invoice.items && invoice.items.map((it, idx) => (
          <div key={it.id || idx} className="text-[10px]">
            <div className="font-semibold text-slate-900">{it.item_name}</div>
            <div className="flex justify-between text-slate-600 text-[9px]">
              <span>{it.quantity} {it.unit || 'PCS'} @ ₹{it.rate} ({it.tax_rate || 18}%)</span>
              <span className="font-bold text-slate-950 font-mono">₹{it.total?.toLocaleString('en-IN')}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Dashed Separator */}
      <div className="border-b border-dashed border-slate-800 my-1.5" />

      {/* Financials & Tax */}
      <div className="space-y-0.5 text-[10px]">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span className="font-mono">₹{invoice.subtotal?.toLocaleString('en-IN')}</span>
        </div>
        {invoice.discount > 0 && (
          <div className="flex justify-between text-emerald-700">
            <span>Discount:</span>
            <span className="font-mono">-₹{invoice.discount?.toLocaleString('en-IN')}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>GST Tax:</span>
          <span className="font-mono">₹{invoice.tax_amount?.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between font-black text-xs pt-1 border-t border-slate-800">
          <span>GRAND TOTAL:</span>
          <span className="font-mono">₹{invoice.amount?.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between text-[10px] text-emerald-800 font-semibold">
          <span>Paid:</span>
          <span className="font-mono">₹{invoice.paid_amount?.toLocaleString('en-IN') || 0}</span>
        </div>
        {invoice.balance_due > 0 && (
          <div className="flex justify-between text-[10px] font-bold text-red-700">
            <span>Balance Due:</span>
            <span className="font-mono">₹{invoice.balance_due?.toLocaleString('en-IN')}</span>
          </div>
        )}
      </div>

      {/* QR Code if Balance or Amount > 0 */}
      {qrCodeUrl && (
        <div className="text-center pt-2 pb-1 border-t border-dashed border-slate-800 mt-2">
          <p className="text-[8px] font-bold uppercase tracking-wider mb-1">Scan & Pay via UPI</p>
          <img src={qrCodeUrl} alt="UPI QR" className="w-24 h-24 mx-auto border border-black p-0.5" />
          <p className="text-[8px] text-slate-700 font-mono mt-0.5">{company.upi_id || '8130140936@upi'}</p>
        </div>
      )}

      {/* Footer */}
      <div className="text-center pt-2 border-t border-dashed border-slate-800 mt-2 text-[9px] text-slate-600 space-y-0.5">
        <p className="font-bold text-slate-800">Thank you for your business!</p>
        <p className="text-[8px]">Invoices subject to local jurisdiction.</p>
      </div>

    </div>
  );
}
