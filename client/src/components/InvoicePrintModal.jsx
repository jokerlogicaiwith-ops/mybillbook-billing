import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Printer, Share2, FileText, Receipt, CheckCircle2, ChevronRight, Settings2 } from 'lucide-react';

export default function InvoicePrintModal({ isOpen, onClose, txnId }) {
  const [invoice, setInvoice] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [printFormat, setPrintFormat] = useState('a4'); // 'a4' | 'pos'
  const [posPaperWidth, setPosPaperWidth] = useState('80mm'); // '80mm' | '58mm'

  useEffect(() => {
    if (isOpen && txnId) {
      loadInvoiceDetails();
    }
  }, [isOpen, txnId]);

  const loadInvoiceDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/transactions/${txnId}`);
      const data = await res.json();
      setInvoice(data);

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

  const executePrint = (format = printFormat, width = posPaperWidth) => {
    setPrintFormat(format);
    if (width) setPosPaperWidth(width);

    // Dynamic @page styling to ensure exact sizing for A4 (1-page) or POS Thermal roll
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

  if (!isOpen) return null;

  let printRoot = typeof document !== 'undefined' ? document.getElementById('print-root') : null;
  if (!printRoot && typeof document !== 'undefined') {
    printRoot = document.createElement('div');
    printRoot.id = 'print-root';
    document.body.appendChild(printRoot);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[96vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
        
        {/* Top Control Header (Never printed) */}
        <div className="p-3.5 px-5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          
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
                <span>A4 (1 Page)</span>
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
              className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs ${
                printFormat === 'a4'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
              title="Print standard A4 invoice guaranteed on 1 single page"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print A4</span>
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
              className="p-1 text-slate-400 hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Informational Sub-bar */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 py-1.5 flex items-center justify-between text-[11px] text-slate-600">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-700">Preview Mode:</span>
            {printFormat === 'a4' ? (
              <span className="text-blue-700 font-bold flex items-center space-x-1">
                <span>📄 Full A4 Tax Invoice (Strict 1-Page Layout)</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded font-medium">✓ Fits Exactly 1 Page</span>
              </span>
            ) : (
              <span className="text-amber-800 font-bold flex items-center space-x-1">
                <span>🧾 Thermal POS Receipt ({posPaperWidth === '80mm' ? '3 Inch Standard' : '2 Inch Mini POS'})</span>
                <span className="bg-amber-100 text-amber-900 text-[10px] px-1.5 py-0.2 rounded font-medium">✓ For POS Printer Machine</span>
              </span>
            )}
          </div>
          <span className="text-slate-400 hidden sm:inline">Choose your preferred printer format above before clicking Print</span>
        </div>

        {/* Interactive Screen Preview Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-200/80 flex justify-center items-start">
          {loading ? (
            <div className="p-16 text-center text-slate-500 font-medium">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              Loading invoice details...
            </div>
          ) : !invoice ? (
            <div className="p-16 text-center text-red-500 font-medium">Invoice not found!</div>
          ) : printFormat === 'a4' ? (
            // A4 Preview
            <div className="bg-white shadow-xl rounded-sm border border-slate-300 w-full max-w-[210mm] transition-all">
              <A4InvoiceLayout invoice={invoice} qrCodeUrl={qrCodeUrl} />
            </div>
          ) : (
            // POS Machine Preview (Realistic Receipt Roll)
            <div className={`bg-white shadow-2xl rounded-sm border border-slate-400 mx-auto transition-all ${
              posPaperWidth === '80mm' ? 'w-[340px]' : 'w-[280px]'
            }`}>
              <div className="bg-amber-100 text-amber-900 text-[10px] text-center font-bold py-1 border-b border-amber-200 uppercase tracking-wider">
                POS Machine Thermal Receipt ({posPaperWidth})
              </div>
              <POSReceiptLayout invoice={invoice} qrCodeUrl={qrCodeUrl} paperWidth={posPaperWidth} />
            </div>
          )}
        </div>

      </div>

      {/* React Portal: Injects clean printable layout into #print-root (isolated from interactive app) */}
      {printRoot && invoice && createPortal(
        printFormat === 'a4' ? (
          <div className="print-page-break-avoid w-full bg-white text-slate-900 font-sans p-0 m-0">
            <A4InvoiceLayout invoice={invoice} qrCodeUrl={qrCodeUrl} isPrintView />
          </div>
        ) : (
          <div className="print-page-break-avoid w-full bg-white text-slate-900 font-mono p-0 m-0">
            <POSReceiptLayout invoice={invoice} qrCodeUrl={qrCodeUrl} paperWidth={posPaperWidth} isPrintView />
          </div>
        ),
        printRoot
      )}

    </div>
  );
}

/**
 * 1-PAGE GUARANTEED A4 INVOICE TEMPLATE
 * Designed with precise proportions and compact margins so it never spills over onto page 2!
 */
function A4InvoiceLayout({ invoice, qrCodeUrl, isPrintView = false }) {
  const company = invoice.company || {};
  const party = invoice.party || {};
  const isPaid = invoice.status === 'Paid' || invoice.balance_due <= 0;

  return (
    <div className={`bg-white text-slate-900 font-sans ${isPrintView ? 'p-6 max-h-[275mm] overflow-hidden' : 'p-6 sm:p-7'}`}>
      
      {/* Header: Company & Invoice details */}
      <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-start">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-black tracking-tight text-slate-950 uppercase leading-none">
            {company.name || 'APOORV'}
          </h1>
          <p className="text-[11px] text-slate-600 font-medium">
            {company.tagline || 'Quality Feeds & Engineering Solutions'}
          </p>
          <p className="text-[11px] text-slate-600 max-w-sm">
            {company.address || 'Main Road, Samastipur, Bihar - 848101'}
          </p>
          <p className="text-[11px] text-slate-800 font-semibold">
            Phone: <span className="font-mono">{company.phone || '8130140936'}</span>
            {company.gstin && (
              <span> | GSTIN: <span className="font-mono">{company.gstin}</span></span>
            )}
          </p>
        </div>

        <div className="text-right space-y-0.5">
          <div className="inline-block bg-slate-950 text-white px-2.5 py-0.5 font-bold text-xs tracking-wider uppercase rounded-xs mb-1">
            {invoice.type === 'Sales Invoices' ? 'TAX INVOICE' : (invoice.type || 'TAX INVOICE').toUpperCase()}
          </div>
          <p className="text-[11px] text-slate-600">
            Invoice No: <span className="font-bold font-mono text-slate-950">{invoice.txn_no}</span>
          </p>
          <p className="text-[11px] text-slate-600">
            Date: <span className="font-bold text-slate-950">{invoice.date}</span>
          </p>
          <p className="text-[11px] text-slate-600">
            Payment Mode: <span className="font-bold text-slate-950">{invoice.payment_type || 'Credit'}</span>
          </p>
          <p className="text-[11px] text-slate-600">
            Sales Staff: <span className="font-bold text-slate-950">{invoice.staff_name || 'Admin'}</span>
            {invoice.staff_code && (
              <span className="font-mono text-slate-600 font-semibold ml-1">({invoice.staff_code})</span>
            )}
          </p>
        </div>
      </div>

      {/* Bill To & Payment Summary Row */}
      <div className="py-2.5 border-b border-slate-300 grid grid-cols-2 gap-3 text-xs">
        <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
            Billed To / Party Details:
          </span>
          <p className="font-bold text-xs text-slate-950">{invoice.party_name}</p>
          {party.address && <p className="text-slate-600 text-[11px] mt-0.5">{party.address}</p>}
          {party.phone && <p className="text-slate-600 text-[11px]">Phone: <span className="font-mono">{party.phone}</span></p>}
          {party.gstin && <p className="text-slate-800 font-semibold text-[11px]">GSTIN: <span className="font-mono">{party.gstin}</span></p>}
          <p className="text-slate-500 text-[10px]">State: {party.state || 'Bihar'}</p>
        </div>

        <div className="bg-slate-50 p-2.5 rounded border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
              Payment Status:
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
              isPaid ? 'bg-emerald-100 text-emerald-800' :
              invoice.status === 'Partial' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
            }`}>
              {invoice.status || 'UNPAID'}
            </span>
          </div>
          <div className="mt-1 text-right">
            <span className="text-[10px] text-slate-500">Balance Due:</span>
            <p className="text-base font-black text-red-600 font-mono leading-none mt-0.5">
              ₹{invoice.balance_due?.toLocaleString('en-IN') || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="py-2.5">
        <table className="w-full text-left text-[11px] border border-slate-300">
          <thead className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
            <tr>
              <th className="p-1.5 border-r border-slate-300 text-center w-8">#</th>
              <th className="p-1.5 border-r border-slate-300">Item Description</th>
              <th className="p-1.5 border-r border-slate-300 text-center w-14">HSN</th>
              <th className="p-1.5 border-r border-slate-300 text-center w-12">Qty</th>
              <th className="p-1.5 border-r border-slate-300 text-right w-16">Rate (₹)</th>
              <th className="p-1.5 border-r border-slate-300 text-center w-12">GST</th>
              <th className="p-1.5 text-right w-20">Total (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {invoice.items && invoice.items.length > 0 ? (
              invoice.items.map((it, idx) => (
                <tr key={it.id || idx}>
                  <td className="p-1.5 border-r border-slate-300 text-center text-slate-500 font-mono text-[10px]">{idx + 1}</td>
                  <td className="p-1.5 border-r border-slate-300 font-semibold text-slate-900">{it.item_name}</td>
                  <td className="p-1.5 border-r border-slate-300 text-center font-mono text-[10px] text-slate-600">{it.hsn_code || '-'}</td>
                  <td className="p-1.5 border-r border-slate-300 text-center font-bold">{it.quantity} {it.unit}</td>
                  <td className="p-1.5 border-r border-slate-300 text-right font-mono">{it.rate?.toLocaleString('en-IN')}</td>
                  <td className="p-1.5 border-r border-slate-300 text-center text-slate-600">{it.tax_rate}%</td>
                  <td className="p-1.5 text-right font-bold font-mono">₹{it.total?.toLocaleString('en-IN')}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="p-2.5 text-center text-slate-400 italic">Standard Goods / Service Entry</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Totals & UPI QR Code Section */}
      <div className="py-2 grid grid-cols-12 gap-3 border-t border-slate-300">
        {/* UPI QR & Bank Details */}
        <div className="col-span-7 flex space-x-3 items-center bg-slate-50 p-2.5 rounded border border-slate-200">
          {qrCodeUrl && (
            <div className="p-1 bg-white border border-slate-300 rounded shrink-0">
              <img src={qrCodeUrl} alt="UPI QR Code" className="w-16 h-16 object-contain" />
            </div>
          )}
          <div className="text-[10px] space-y-0.5">
            <p className="font-bold text-slate-900 flex items-center space-x-1">
              <span>Scan & Pay via UPI</span>
            </p>
            <p className="text-slate-600 font-mono text-[9px]">UPI: {company.upi_id || '8130140936@upi'}</p>
            <p className="text-slate-500 text-[9px]">Bank: State Bank of India</p>
            <p className="text-slate-500 font-mono text-[9px]">A/C: 38920199281 | IFSC: SBIN0000123</p>
          </div>
        </div>

        {/* Calculations */}
        <div className="col-span-5 space-y-1 text-[11px]">
          <div className="flex justify-between text-slate-600">
            <span>Taxable Amount:</span>
            <span className="font-mono">₹{invoice.subtotal?.toLocaleString('en-IN') || 0}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>GST Tax Amount:</span>
            <span className="font-mono">₹{invoice.tax_amount?.toLocaleString('en-IN') || 0}</span>
          </div>
          <div className="flex justify-between font-bold text-xs text-slate-950 pt-1 border-t border-slate-300">
            <span>Total Amount:</span>
            <span className="font-mono">₹{invoice.amount?.toLocaleString('en-IN') || 0}</span>
          </div>
          <div className="flex justify-between text-emerald-700 font-semibold text-[10px]">
            <span>Received / Paid:</span>
            <span className="font-mono">₹{invoice.paid_amount?.toLocaleString('en-IN') || 0}</span>
          </div>
          <div className="flex justify-between font-bold text-[11px] text-red-600 pt-0.5 border-t border-slate-200">
            <span>Balance Due:</span>
            <span className="font-mono">₹{invoice.balance_due?.toLocaleString('en-IN') || 0}</span>
          </div>
        </div>
      </div>

      {/* Footer Terms & Signature */}
      <div className="mt-4 pt-3 border-t border-slate-300 grid grid-cols-2 gap-3 text-[9px]">
        <div>
          <span className="font-bold text-slate-800 uppercase block mb-0.5">Terms & Conditions:</span>
          <p className="text-slate-600 whitespace-pre-line leading-relaxed">
            {company.terms || '1. Goods once sold will not be taken back.\n2. Interest @ 18% p.a. will be charged if payment is not received within due date.\n3. Subject to local jurisdiction.'}
          </p>
        </div>
        <div className="text-right flex flex-col justify-between items-end">
          <span className="font-bold text-slate-800">For {company.name || 'APOORV'}</span>
          <div className="mt-4 border-t border-slate-400 pt-0.5 w-36 text-center text-slate-500 text-[8px] space-y-0.5">
            <div>Authorized Signatory</div>
            {invoice.staff_name && (
              <div className="text-[8px] text-slate-600 font-medium">Billed By: {invoice.staff_name} {invoice.staff_code ? `(${invoice.staff_code})` : ''}</div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

/**
 * POS THERMAL RECEIPT TEMPLATE
 * Designed for POS thermal receipt printers (80mm / 3 inch or 58mm / 2 inch roll).
 * Uses continuous paper roll layout, high-contrast thermal fonts, compact dividers, and thermal UPI QR.
 */
function POSReceiptLayout({ invoice, qrCodeUrl, paperWidth = '80mm', isPrintView = false }) {
  const company = invoice.company || {};
  const party = invoice.party || {};
  const is58 = paperWidth === '58mm';

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
        {(invoice.staff_name || invoice.staff_code) && (
          <div className="flex justify-between text-[9px] text-slate-800">
            <span>Staff / Billed:</span>
            <span className="font-bold">{invoice.staff_name} {invoice.staff_code ? `(${invoice.staff_code})` : ''}</span>
          </div>
        )}
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
      <div className="py-1 space-y-1.5 text-[10px]">
        {invoice.items && invoice.items.length > 0 ? (
          invoice.items.map((it, idx) => (
            <div key={it.id || idx}>
              <div className="font-semibold truncate">{it.item_name}</div>
              <div className="flex justify-between text-slate-700 text-[9px]">
                <span>
                  {it.quantity} {it.unit} x ₹{it.rate} ({it.tax_rate}% GST)
                </span>
                <span className="font-bold font-mono text-slate-950 text-[10px]">
                  ₹{it.total?.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-slate-500 py-1">General Goods / Service</div>
        )}
      </div>

      {/* Dashed Separator */}
      <div className="border-b border-dashed border-slate-800 my-1.5" />

      {/* Totals Summary */}
      <div className="space-y-1 text-[11px]">
        <div className="flex justify-between text-slate-700">
          <span>Subtotal / Taxable:</span>
          <span className="font-mono">₹{invoice.subtotal?.toLocaleString('en-IN') || 0}</span>
        </div>
        <div className="flex justify-between text-slate-700">
          <span>GST Tax:</span>
          <span className="font-mono">₹{invoice.tax_amount?.toLocaleString('en-IN') || 0}</span>
        </div>
        <div className="flex justify-between font-black text-sm pt-1 border-t border-slate-400">
          <span>TOTAL AMOUNT:</span>
          <span className="font-mono">₹{invoice.amount?.toLocaleString('en-IN') || 0}</span>
        </div>
        <div className="flex justify-between text-slate-800 text-[10px]">
          <span>Paid / Received:</span>
          <span className="font-mono">₹{invoice.paid_amount?.toLocaleString('en-IN') || 0}</span>
        </div>
        <div className="flex justify-between font-black text-xs text-red-600 pt-0.5 border-t border-dashed border-slate-400">
          <span>BALANCE DUE:</span>
          <span className="font-mono">₹{invoice.balance_due?.toLocaleString('en-IN') || 0}</span>
        </div>
      </div>

      {/* Dashed Separator */}
      <div className="border-b border-dashed border-slate-800 my-2" />

      {/* UPI QR Code for instant payment */}
      {qrCodeUrl && (
        <div className="text-center py-1">
          <p className="font-bold text-[10px] uppercase tracking-wider mb-1">
            Scan & Pay via UPI
          </p>
          <div className="inline-block p-1 bg-white border border-slate-800 rounded">
            <img src={qrCodeUrl} alt="UPI QR" className={`${is58 ? 'w-20 h-20' : 'w-24 h-24'} mx-auto object-contain`} />
          </div>
          <p className="text-[9px] text-slate-600 font-mono mt-0.5">{company.upi_id || '8130140936@upi'}</p>
        </div>
      )}

      {/* Thank You Note & Cut Guide */}
      <div className="text-center pt-2 text-[9px] text-slate-600 space-y-1">
        <p className="font-bold text-slate-900 uppercase">*** THANK YOU! VISIT AGAIN ***</p>
        <p>Goods once sold will not be returned.</p>
        <div className="pt-2 text-slate-400 text-[8px] tracking-widest font-mono">
          ✄ - - - - - CUT HERE - - - - - ✄
        </div>
      </div>

    </div>
  );
}
