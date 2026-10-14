import React, { useState, useEffect } from 'react';
import { X, Printer, Download, Share2, CheckCircle2 } from 'lucide-react';

export default function InvoicePrintModal({ isOpen, onClose, txnId }) {
  const [invoice, setInvoice] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(true);

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

      // Generate UPI QR Code if balance due > 0
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

  const handlePrint = () => {
    window.print();
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
        
        {/* Top Control Bar (Hidden during print) */}
        <div className="p-4 px-6 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-sm">Invoice Preview: {invoice?.txn_no}</span>
            <span className="text-xs bg-blue-600 px-2 py-0.5 rounded font-mono">
              {invoice?.type}
            </span>
          </div>

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
                  className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-lg transition border border-slate-700"
                  title="Copy customer view link"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </button>

                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition"
                >
                  <span>WhatsApp Bill</span>
                </a>
              </>
            )}

            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-100 flex justify-center">
          {loading ? (
            <div className="p-12 text-center text-slate-500 font-medium">Loading Invoice...</div>
          ) : !invoice ? (
            <div className="p-12 text-center text-red-500 font-medium">Invoice not found!</div>
          ) : (
            <div 
              id="printable-invoice"
              className="bg-white w-full max-w-3xl p-8 shadow-sm border border-slate-300 rounded-sm text-slate-900 font-sans"
            >
              {/* Header */}
              <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-slate-950 uppercase">
                    {invoice.company?.name || 'APOORV'}
                  </h1>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    {invoice.company?.tagline || 'Quality Feeds & Engineering Solutions'}
                  </p>
                  <p className="text-xs text-slate-600 mt-1 max-w-sm">
                    {invoice.company?.address || 'Main Road, Samastipur, Bihar'}
                  </p>
                  <p className="text-xs text-slate-800 font-semibold mt-0.5">
                    Phone: <span className="font-mono">{invoice.company?.phone || '8130140936'}</span> | GSTIN: <span className="font-mono">{invoice.company?.gstin || '10AABCA1234F1Z5'}</span>
                  </p>
                </div>

                <div className="text-right">
                  <div className="inline-block bg-slate-900 text-white px-3 py-1 font-bold text-sm tracking-wider uppercase rounded-xs mb-2">
                    {invoice.type === 'Sales Invoices' ? 'TAX INVOICE' : invoice.type.toUpperCase()}
                  </div>
                  <p className="text-xs text-slate-600">
                    Invoice No: <span className="font-bold font-mono text-slate-950">{invoice.txn_no}</span>
                  </p>
                  <p className="text-xs text-slate-600">
                    Date: <span className="font-bold text-slate-950">{invoice.date}</span>
                  </p>
                  <p className="text-xs text-slate-600">
                    Payment Mode: <span className="font-bold text-slate-950">{invoice.payment_type}</span>
                  </p>
                </div>
              </div>

              {/* Bill To */}
              <div className="py-4 border-b border-slate-300 grid grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-3 rounded border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Billed To / Party Details:
                  </span>
                  <p className="font-bold text-sm text-slate-900">{invoice.party_name}</p>
                  {invoice.party?.address && (
                    <p className="text-slate-600 mt-0.5">{invoice.party.address}</p>
                  )}
                  {invoice.party?.phone && (
                    <p className="text-slate-600 mt-0.5">Phone: {invoice.party.phone}</p>
                  )}
                  {invoice.party?.gstin && (
                    <p className="text-slate-800 font-semibold mt-0.5">GSTIN: {invoice.party.gstin}</p>
                  )}
                  <p className="text-slate-600">State: {invoice.party?.state || 'Bihar'}</p>
                </div>

                <div className="bg-slate-50 p-3 rounded border border-slate-200 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Payment Status & Due:
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        invoice.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                        invoice.status === 'Partial' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {invoice.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 text-right">
                    <span className="text-[11px] text-slate-500">Balance Due:</span>
                    <p className="text-lg font-black text-red-600 font-mono">
                      ₹{invoice.balance_due?.toLocaleString('en-IN') || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="py-4">
                <table className="w-full text-left text-xs border border-slate-300">
                  <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                    <tr>
                      <th className="p-2 border-r border-slate-300 text-center w-8">#</th>
                      <th className="p-2 border-r border-slate-300">Item Description</th>
                      <th className="p-2 border-r border-slate-300 text-center w-16">HSN</th>
                      <th className="p-2 border-r border-slate-300 text-center w-14">Qty</th>
                      <th className="p-2 border-r border-slate-300 text-right w-20">Rate (₹)</th>
                      <th className="p-2 border-r border-slate-300 text-center w-14">GST</th>
                      <th className="p-2 text-right w-24">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {invoice.items && invoice.items.length > 0 ? (
                      invoice.items.map((it, idx) => (
                        <tr key={it.id || idx}>
                          <td className="p-2 border-r border-slate-300 text-center text-slate-500">{idx + 1}</td>
                          <td className="p-2 border-r border-slate-300 font-semibold">{it.item_name}</td>
                          <td className="p-2 border-r border-slate-300 text-center font-mono text-[11px]">{it.hsn_code || '-'}</td>
                          <td className="p-2 border-r border-slate-300 text-center font-bold">{it.quantity} {it.unit}</td>
                          <td className="p-2 border-r border-slate-300 text-right font-mono">{it.rate?.toLocaleString('en-IN')}</td>
                          <td className="p-2 border-r border-slate-300 text-center text-slate-600">{it.tax_rate}%</td>
                          <td className="p-2 text-right font-bold font-mono">₹{it.total?.toLocaleString('en-IN')}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="p-3 text-center text-slate-400">Standard Service / Goods Entry</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Totals & UPI QR Code Section */}
              <div className="py-2 grid grid-cols-12 gap-4 border-t border-slate-300">
                {/* QR Code & Bank Info */}
                <div className="col-span-7 flex space-x-4 items-center bg-slate-50 p-3 rounded border border-slate-200">
                  {qrCodeUrl && (
                    <div className="p-1 bg-white border border-slate-200 rounded shadow-xs">
                      <img src={qrCodeUrl} alt="UPI QR Code" className="w-24 h-24 object-contain" />
                    </div>
                  )}
                  <div className="text-[11px] space-y-1">
                    <p className="font-bold text-slate-900 flex items-center space-x-1">
                      <span>Scan & Pay via UPI</span>
                    </p>
                    <p className="text-slate-600 font-mono text-[10px]">UPI: {invoice.company?.upi_id || '8130140936@upi'}</p>
                    <p className="text-slate-500 text-[10px]">Bank: State Bank of India</p>
                    <p className="text-slate-500 font-mono text-[10px]">A/C: 38920199281 | IFSC: SBIN0000123</p>
                  </div>
                </div>

                {/* Calculation Summary */}
                <div className="col-span-5 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Taxable Amount:</span>
                    <span className="font-mono">₹{invoice.subtotal?.toLocaleString('en-IN') || 0}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>GST Tax:</span>
                    <span className="font-mono">₹{invoice.tax_amount?.toLocaleString('en-IN') || 0}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-slate-950 pt-1 border-t border-slate-300">
                    <span>Total Amount:</span>
                    <span className="font-mono">₹{invoice.amount?.toLocaleString('en-IN') || 0}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 text-xs font-semibold">
                    <span>Received / Paid:</span>
                    <span className="font-mono">₹{invoice.paid_amount?.toLocaleString('en-IN') || 0}</span>
                  </div>
                  <div className="flex justify-between font-bold text-xs text-red-600 pt-1 border-t border-slate-200">
                    <span>Balance Due:</span>
                    <span className="font-mono">₹{invoice.balance_due?.toLocaleString('en-IN') || 0}</span>
                  </div>
                </div>
              </div>

              {/* Footer Terms & Signature */}
              <div className="mt-6 pt-4 border-t border-slate-300 grid grid-cols-2 gap-4 text-[10px]">
                <div>
                  <span className="font-bold text-slate-800 uppercase block mb-1">Terms & Conditions:</span>
                  <p className="text-slate-600 whitespace-pre-line leading-relaxed">
                    {invoice.company?.terms || '1. Goods once sold will not be taken back.\n2. Interest @ 18% p.a. will be charged for delayed payments.'}
                  </p>
                </div>
                <div className="text-right flex flex-col justify-between items-end">
                  <span className="font-bold text-slate-800">For {invoice.company?.name || 'APOORV'}</span>
                  <div className="mt-8 border-t border-slate-400 pt-1 w-36 text-center text-slate-500">
                    Authorized Signatory
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
