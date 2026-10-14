import React, { useState, useEffect } from 'react';
import { Printer, Download, ArrowLeft, CheckCircle2, QrCode, Phone, ShieldCheck } from 'lucide-react';

export default function CustomerBillView({ identifier, onBackToApp }) {
  const [bill, setBill] = useState(null);
  const [qrUrl, setQrUrl] = useState('');
  const [upiLink, setUpiLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBill();
  }, [identifier]);

  const loadBill = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/public/bill/${encodeURIComponent(identifier)}`);
      if (!res.ok) throw new Error('Invoice not found');
      const data = await res.json();
      setBill(data);

      const upiId = data.company?.upi_id || '8130140936@upi';
      const amount = data.balance_due > 0 ? data.balance_due : data.amount;
      const qrRes = await fetch(`/api/qrcode?upi_id=${encodeURIComponent(upiId)}&name=${encodeURIComponent(data.company?.name || 'Apoorv')}&amount=${amount}&note=${encodeURIComponent(data.txn_no)}`);
      const qrData = await qrRes.json();
      setQrUrl(qrData.qrDataUrl);
      setUpiLink(qrData.upiString);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-bold text-slate-700">Loading your invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-sm">
          <p className="text-sm font-bold text-red-600 mb-2">Invoice Not Found</p>
          <p className="text-xs text-slate-500 mb-4">The invoice link you clicked is invalid or has expired.</p>
          {onBackToApp && (
            <button onClick={onBackToApp} className="text-xs text-blue-600 font-bold hover:underline">
              Go to Home
            </button>
          )}
        </div>
      </div>
    );
  }

  const isPaid = bill.status === 'Paid' || bill.balance_due <= 0;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-12 font-sans">
      {/* Top Bar for Customer */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-4 py-3 print:hidden">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-slate-900 tracking-tight text-sm">
              {bill.company?.name || 'APOORV'}
            </span>
            <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-medium">
              Bill #{bill.txn_no}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Download PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-4">
        
        {/* Customer Quick Pay Banner */}
        {!isPaid ? (
          <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-5 rounded-2xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200 block">
                Pending Balance Due
              </span>
              <div className="text-2xl font-black mt-0.5">
                ₹{bill.balance_due?.toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-blue-100 mt-1">
                Scan UPI QR Code below or tap to pay with Google Pay / PhonePe / Paytm
              </p>
            </div>

            {upiLink && (
              <a
                href={upiLink}
                className="w-full sm:w-auto text-center px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-lg transition whitespace-nowrap"
              >
                Pay via UPI App &rarr;
              </a>
            )}
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center space-x-3 print:hidden">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <p className="text-xs font-bold">This bill is fully PAID. Thank you!</p>
              <p className="text-[11px] text-emerald-600">Total amount received: ₹{bill.amount?.toLocaleString('en-IN')}</p>
            </div>
          </div>
        )}

        {/* Printable Bill Area */}
        <div id="printable-invoice" className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          
          {/* Company & Bill Title */}
          <div className="border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-2xl font-black uppercase text-slate-950 tracking-tight">
                {bill.company?.name || 'APOORV'}
              </h1>
              {bill.company?.tagline && (
                <p className="text-xs text-slate-500 font-medium">{bill.company.tagline}</p>
              )}
              <p className="text-xs text-slate-600 mt-1 max-w-sm">{bill.company?.address}</p>
              <p className="text-xs font-semibold text-slate-800 mt-0.5">
                Phone: <span className="font-mono">{bill.company?.phone}</span>
                {bill.company?.gstin && <span> | GSTIN: <span className="font-mono">{bill.company.gstin}</span></span>}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-block bg-slate-900 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-sm mb-2">
                {bill.type === 'Sales Invoices' ? 'TAX INVOICE' : bill.type.toUpperCase()}
              </span>
              <p className="text-xs text-slate-600">Invoice No: <span className="font-bold text-slate-900 font-mono">{bill.txn_no}</span></p>
              <p className="text-xs text-slate-600">Date: <span className="font-bold text-slate-900">{bill.date}</span></p>
              <p className="text-xs text-slate-600">Payment Mode: <span className="font-bold text-slate-900">{bill.payment_type}</span></p>
            </div>
          </div>

          {/* Billed To */}
          <div className="py-4 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Billed To:
              </span>
              <p className="font-bold text-sm text-slate-900">{bill.party_name}</p>
              {bill.party?.address && <p className="text-slate-600 mt-0.5">{bill.party.address}</p>}
              {bill.party?.phone && <p className="text-slate-600 mt-0.5">Phone: {bill.party.phone}</p>}
              {bill.party?.gstin && <p className="text-slate-700 font-semibold mt-0.5">GSTIN: {bill.party.gstin}</p>}
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Status:
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                  bill.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                  bill.status === 'Partial' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                }`}>
                  {bill.status.toUpperCase()}
                </span>
              </div>
              <div className="mt-2 sm:text-right">
                <span className="text-[11px] text-slate-500">Balance Due:</span>
                <p className="text-lg font-black text-red-600 font-mono">
                  ₹{bill.balance_due?.toLocaleString('en-IN') || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="py-4 overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                <tr>
                  <th className="p-2.5 border-r border-slate-300 text-center w-8">#</th>
                  <th className="p-2.5 border-r border-slate-300">Item Description</th>
                  <th className="p-2.5 border-r border-slate-300 text-center w-16">HSN</th>
                  <th className="p-2.5 border-r border-slate-300 text-center w-14">Qty</th>
                  <th className="p-2.5 border-r border-slate-300 text-right w-20">Rate (₹)</th>
                  <th className="p-2.5 border-r border-slate-300 text-center w-14">GST</th>
                  <th className="p-2.5 text-right w-24">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {bill.items && bill.items.length > 0 ? (
                  bill.items.map((it, idx) => (
                    <tr key={it.id || idx}>
                      <td className="p-2.5 border-r border-slate-300 text-center text-slate-500">{idx + 1}</td>
                      <td className="p-2.5 border-r border-slate-300 font-semibold">{it.item_name}</td>
                      <td className="p-2.5 border-r border-slate-300 text-center font-mono text-[11px]">{it.hsn_code || '-'}</td>
                      <td className="p-2.5 border-r border-slate-300 text-center font-bold">{it.quantity} {it.unit}</td>
                      <td className="p-2.5 border-r border-slate-300 text-right font-mono">{it.rate?.toLocaleString('en-IN')}</td>
                      <td className="p-2.5 border-r border-slate-300 text-center text-slate-600">{it.tax_rate}%</td>
                      <td className="p-2.5 text-right font-bold font-mono">₹{it.total?.toLocaleString('en-IN')}</td>
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

          {/* QR Code & Total Summary */}
          <div className="py-2 grid grid-cols-1 sm:grid-cols-12 gap-4 border-t border-slate-300">
            {/* UPI QR */}
            <div className="sm:col-span-7 flex space-x-4 items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
              {qrUrl && (
                <div className="p-1 bg-white border border-slate-200 rounded shrink-0">
                  <img src={qrUrl} alt="UPI QR" className="w-24 h-24 object-contain" />
                </div>
              )}
              <div className="text-[11px] space-y-1">
                <p className="font-bold text-slate-900">Scan & Pay using any UPI App</p>
                <p className="text-slate-600 font-mono text-[10px]">UPI: {bill.company?.upi_id || '8130140936@upi'}</p>
                <p className="text-slate-500 text-[10px]">GPay / PhonePe / Paytm / BHIM</p>
              </div>
            </div>

            {/* Calculations */}
            <div className="sm:col-span-5 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Taxable Subtotal:</span>
                <span className="font-mono">₹{bill.subtotal?.toLocaleString('en-IN') || 0}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST Tax Amount:</span>
                <span className="font-mono">₹{bill.tax_amount?.toLocaleString('en-IN') || 0}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-slate-950 pt-1 border-t border-slate-300">
                <span>Total Bill Amount:</span>
                <span className="font-mono">₹{bill.amount?.toLocaleString('en-IN') || 0}</span>
              </div>
              <div className="flex justify-between text-emerald-700 text-xs font-semibold">
                <span>Paid / Received:</span>
                <span className="font-mono">₹{bill.paid_amount?.toLocaleString('en-IN') || 0}</span>
              </div>
              <div className="flex justify-between font-bold text-xs text-red-600 pt-1 border-t border-slate-200">
                <span>Balance Due:</span>
                <span className="font-mono">₹{bill.balance_due?.toLocaleString('en-IN') || 0}</span>
              </div>
            </div>
          </div>

          {/* Terms & Signature */}
          <div className="mt-6 pt-4 border-t border-slate-300 grid grid-cols-2 gap-4 text-[10px]">
            <div>
              <span className="font-bold text-slate-800 uppercase block mb-1">Terms & Conditions:</span>
              <p className="text-slate-600 whitespace-pre-line leading-relaxed">
                {bill.company?.terms || '1. Goods once sold will not be taken back.\n2. Payment terms as agreed.'}
              </p>
            </div>
            <div className="text-right flex flex-col justify-between items-end">
              <span className="font-bold text-slate-800">For {bill.company?.name || 'APOORV'}</span>
              <div className="mt-8 border-t border-slate-400 pt-1 w-36 text-center text-slate-500">
                Authorized Signatory
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
