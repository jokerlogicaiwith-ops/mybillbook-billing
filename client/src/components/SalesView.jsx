import React, { useState, useEffect } from 'react';
import { Plus, Search, Eye, Filter } from 'lucide-react';

export default function SalesView({ onOpenInvoiceModal, onViewInvoice }) {
  const [transactions, setTransactions] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, [filterType, search]);

  const fetchTransactions = async () => {
    try {
      let url = '/api/transactions?';
      if (filterType !== 'all') url += `type=${encodeURIComponent(filterType)}&`;
      if (search) url += `search=${encodeURIComponent(search)}`;
      const res = await fetch(url);
      const data = await res.json();
      setTransactions(data);
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Sales Invoices & Transactions</h2>
          <p className="text-xs text-slate-500 mt-0.5">View and manage all billing records, quotations, and payments</p>
        </div>
        <button
          onClick={() => onOpenInvoiceModal('Sales Invoices')}
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow transition"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Create Sales Invoice</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
          {[
            { id: 'all', label: 'All Invoices' },
            { id: 'Sales Invoices', label: 'Sales Invoices' },
            { id: 'Quotation / Estimate', label: 'Estimates / Quotes' },
            { id: 'Payment In', label: 'Payments' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setFilterType(t.id)}
              className={`px-3 py-1.5 rounded-md transition ${
                filterType === t.id ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search invoice number or party..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Invoice No</th>
              <th className="py-3 px-4">Party Name</th>
              <th className="py-3 px-4 text-right">Total Amount</th>
              <th className="py-3 px-4 text-right">Balance Due</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {transactions.map(txn => (
              <tr key={txn.id} className="hover:bg-slate-50 transition">
                <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">{formatDate(txn.date)}</td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                    txn.type === 'Sales Invoices' ? 'bg-blue-50 text-blue-700' :
                    txn.type === 'Quotation / Estimate' ? 'bg-amber-50 text-amber-700' :
                    txn.type === 'Payment In' ? 'bg-emerald-50 text-emerald-700' : 'bg-purple-50 text-purple-700'
                  }`}>
                    {txn.type}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">{txn.txn_no}</td>
                <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-xs truncate">{txn.party_name}</td>
                <td className="py-3.5 px-4 text-right font-bold text-slate-900 font-mono whitespace-nowrap">
                  ₹{txn.amount?.toLocaleString('en-IN')}
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-red-600 whitespace-nowrap">
                  ₹{txn.balance_due?.toLocaleString('en-IN') || 0}
                </td>
                <td className="py-3.5 px-4 text-center whitespace-nowrap">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    txn.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                    txn.status === 'Partial' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {txn.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center whitespace-nowrap">
                  <button
                    onClick={() => onViewInvoice(txn.id)}
                    className="inline-flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 font-semibold px-2 py-1 rounded hover:bg-blue-50"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View / Print</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
