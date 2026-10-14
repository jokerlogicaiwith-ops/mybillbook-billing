import React, { useState, useEffect } from 'react';
import { Plus, Search, Phone, MapPin, Building, ArrowDownLeft, ArrowUpRight, Check } from 'lucide-react';

export default function PartiesView({ onOpenInvoiceModal }) {
  const [parties, setParties] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newParty, setNewParty] = useState({
    name: '',
    phone: '',
    email: '',
    type: 'customer',
    gstin: '',
    address: '',
    state: 'Bihar',
    opening_balance: 0
  });

  useEffect(() => {
    fetchParties();
  }, [filterType, search]);

  const fetchParties = async () => {
    try {
      let url = `/api/parties?type=${filterType}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const res = await fetch(url);
      const data = await res.json();
      setParties(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateParty = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/parties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newParty)
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setNewParty({
          name: '',
          phone: '',
          email: '',
          type: 'customer',
          gstin: '',
          address: '',
          state: 'Bihar',
          opening_balance: 0
        });
        fetchParties();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const totalReceivables = parties
    .filter(p => p.current_balance > 0)
    .reduce((sum, p) => sum + p.current_balance, 0);

  const totalPayables = parties
    .filter(p => p.current_balance < 0)
    .reduce((sum, p) => sum + Math.abs(p.current_balance), 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Parties Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage Customers, Suppliers, Ledgers and Balances</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow transition"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Add New Party</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Receivables (To Collect)</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">
              ₹{totalReceivables.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <ArrowDownLeft className="w-6 h-6 stroke-[2.5]" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Payables (To Pay)</span>
            <span className="text-2xl font-black text-red-500 mt-1 block">
              ₹{totalPayables.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-500">
            <ArrowUpRight className="w-6 h-6 stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold w-full sm:w-auto">
          {['all', 'customer', 'vendor'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md capitalize transition ${
                filterType === type ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {type === 'all' ? 'All Parties' : type === 'customer' ? 'Customers' : 'Suppliers / Vendors'}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search party name, phone, GSTIN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Parties Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Party Name</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Phone</th>
              <th className="py-3 px-4">GSTIN</th>
              <th className="py-3 px-4 text-right">Balance</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {parties.map(p => {
              const isReceivable = p.current_balance > 0;
              const isPayable = p.current_balance < 0;
              return (
                <tr key={p.id} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <div>{p.name}</div>
                    {p.address && <div className="text-[11px] font-normal text-slate-400">{p.address}</div>}
                  </td>
                  <td className="py-3.5 px-4 capitalize">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      p.type === 'customer' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                    }`}>
                      {p.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono">{p.phone || '-'}</td>
                  <td className="py-3.5 px-4 font-mono text-[11px]">{p.gstin || '-'}</td>
                  <td className="py-3.5 px-4 text-right font-bold whitespace-nowrap">
                    {isReceivable && (
                      <span className="text-emerald-600">₹{p.current_balance.toLocaleString('en-IN')} (Receivable)</span>
                    )}
                    {isPayable && (
                      <span className="text-red-500">₹{Math.abs(p.current_balance).toLocaleString('en-IN')} (Payable)</span>
                    )}
                    {!isReceivable && !isPayable && (
                      <span className="text-slate-400">₹0 (Settled)</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => onOpenInvoiceModal(p.type === 'vendor' ? 'Purchase Bills' : 'Sales Invoices')}
                      className="px-3 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded text-xs font-semibold transition"
                    >
                      + Bill
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Party Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-in fade-in">
            <h3 className="text-base font-bold text-slate-900 mb-4">Add New Party</h3>
            <form onSubmit={handleCreateParty} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Party / Business Name *</label>
                <input
                  type="text"
                  required
                  value={newParty.name}
                  onChange={(e) => setNewParty({ ...newParty, name: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 font-semibold"
                  placeholder="e.g. Divyadrishti Feeds Pvt. Ltd."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Party Type</label>
                  <select
                    value={newParty.type}
                    onChange={(e) => setNewParty({ ...newParty, type: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                  >
                    <option value="customer">Customer (Grahak)</option>
                    <option value="vendor">Vendor / Supplier</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile Number</label>
                  <input
                    type="text"
                    value={newParty.phone}
                    onChange={(e) => setNewParty({ ...newParty, phone: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 font-mono"
                    placeholder="9876543210"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    value={newParty.gstin}
                    onChange={(e) => setNewParty({ ...newParty, gstin: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 font-mono uppercase"
                    placeholder="10AAAAA0000A1Z5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Opening Balance (₹)</label>
                  <input
                    type="number"
                    value={newParty.opening_balance}
                    onChange={(e) => setNewParty({ ...newParty, opening_balance: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 font-bold"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Address</label>
                <textarea
                  rows="2"
                  value={newParty.address}
                  onChange={(e) => setNewParty({ ...newParty, address: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5"
                  placeholder="Street address, City, District"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-lg font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
                >
                  Save Party
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
