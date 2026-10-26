import React, { useState, useEffect } from 'react';
import { 
  UserCheck, IndianRupee, Percent, TrendingUp, FileText, 
  Plus, Search, KeyRound, CheckCircle2, Eye, EyeOff, 
  ArrowUpRight, Phone, Shield, Award, Calendar, RefreshCw
} from 'lucide-react';

export default function StaffPortalView({ 
  currentUser, 
  onOpenInvoiceModal, 
  onViewInvoice, 
  onOpenLoginModal 
}) {
  const [loading, setLoading] = useState(true);
  const [portalData, setPortalData] = useState(null);
  const [search, setSearch] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Password change state
  const [showPasswordBox, setShowPasswordBox] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  useEffect(() => {
    if (currentUser?.id) {
      fetchPortalData();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const fetchPortalData = async () => {
    if (!currentUser?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/staff/${currentUser.id}/portal`);
      const data = await res.json();
      if (data.success) {
        setPortalData(data);
      }
    } catch (err) {
      console.error('Failed to load staff portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match');
      return;
    }
    if (newPassword.length < 3) {
      setPassError('Password must be at least 3 characters');
      return;
    }

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staff_id: currentUser.id,
          old_password: oldPassword,
          new_password: newPassword
        })
      });
      const data = await res.json();
      if (data.success) {
        setPassSuccess('Password updated successfully!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          setShowPasswordBox(false);
          setPassSuccess('');
        }, 2000);
      } else {
        setPassError(data.error || 'Failed to update password');
      }
    } catch (err) {
      setPassError('Network error while updating password');
    }
  };

  if (!currentUser || currentUser.is_admin) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">
          Admin / Owner Account Active
        </h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          You are currently logged in as Owner/Admin. To test or view a specific Staff/Accountant commission portal, please switch to their staff login.
        </p>
        <button
          onClick={onOpenLoginModal}
          className="bg-[#4f46e5] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md hover:bg-[#4338ca] transition inline-flex items-center space-x-2"
        >
          <UserCheck className="w-4 h-4" />
          <span>Login as Staff / Accountant (स्टाफ लॉगिन)</span>
        </button>
      </div>
    );
  }

  const staff = portalData?.staff || currentUser;
  const stats = portalData?.stats || {
    total_sales_count: 0,
    total_sales_amount: 0,
    total_commission: 0,
    commission_rate: currentUser.commission_rate || 5
  };
  const transactions = portalData?.transactions || [];

  const filteredTxns = transactions.filter(t => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (t.party_name || '').toLowerCase().includes(q) ||
           (t.txn_no || '').toLowerCase().includes(q) ||
           (t.date || '').includes(q);
  });

  const isAccountant = (staff.role || '').toLowerCase().includes('account');

  return (
    <div className="bg-[#f8fafc] min-h-screen text-slate-800 font-sans pb-16">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-medium z-50 flex items-center space-x-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-6 py-6 border-b border-indigo-900/60 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className={`w-14 h-14 rounded-2xl font-black flex items-center justify-center text-xl shadow-inner ${
              isAccountant ? 'bg-purple-600 text-white' : 'bg-indigo-600 text-white'
            }`}>
              {staff.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-xl font-black tracking-tight">{staff.name}</h1>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                  isAccountant 
                    ? 'bg-purple-900/80 text-purple-200 border-purple-700' 
                    : 'bg-indigo-900/80 text-indigo-200 border-indigo-700'
                }`}>
                  {staff.role || 'Sales Executive'}
                </span>
                <span className="text-xs bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded border border-slate-700">
                  {staff.staff_code}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-1.5 font-medium">
                {staff.phone && (
                  <span className="flex items-center space-x-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{staff.phone}</span>
                  </span>
                )}
                <span>•</span>
                <span className="text-emerald-400 font-bold">
                  Assigned Commission: {staff.commission_rate}% on Billed Amount
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => onOpenInvoiceModal('Sales Invoices')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg transition flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ Create Bill (मेरे नाम से बिल बनाएं)</span>
            </button>
            <button
              onClick={() => setShowPasswordBox(!showPasswordBox)}
              className="bg-white/10 hover:bg-white/20 text-white px-3 py-2.5 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5"
            >
              <KeyRound className="w-4 h-4" />
              <span>Change PIN</span>
            </button>
            <button
              onClick={onOpenLoginModal}
              className="bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white px-3 py-2.5 rounded-xl text-xs font-semibold transition"
            >
              Switch User
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">

        {/* Password Change Box (Collapsible) */}
        {showPasswordBox && (
          <div className="bg-white rounded-2xl border border-indigo-200 p-5 shadow-md animate-in slide-in-from-top-2 duration-200">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
              <KeyRound className="w-4 h-4 text-indigo-600" />
              <span>Change Login Password / PIN for {staff.name}</span>
            </h3>

            {passError && (
              <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-semibold">
                {passError}
              </div>
            )}
            {passSuccess && (
              <div className="mb-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-xs font-semibold">
                {passSuccess}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs items-end">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Current PIN / Password</label>
                <input
                  type="password"
                  placeholder="e.g. 1234"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">New PIN / Password</label>
                <input
                  type="password"
                  required
                  placeholder="Enter new PIN"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Confirm New PIN</label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter new PIN"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 text-xs font-medium"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition"
                >
                  Update PIN
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordBox(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold py-2 px-3 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 4 KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: My Total Sales */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                My Total Sales Billed (कुल बिक्री)
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                ₹{Number(stats.total_sales_amount || 0).toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                Across {stats.total_sales_count || 0} invoices
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: My Total Commission Earned */}
          <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl border border-indigo-200 p-5 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                My Commission Earned (मेरा कमीशन)
              </span>
              <div className="text-2xl font-black text-indigo-950 mt-1">
                ₹{Number(stats.total_commission || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-indigo-600 font-bold mt-0.5">
                Payable directly to you
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <IndianRupee className="w-6 h-6 stroke-[2.5]" />
            </div>
          </div>

          {/* Card 3: Invoices Count */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Bills Generated (कुल बिल)
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {stats.total_sales_count || 0} Bills
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Billed with your Staff ID
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
          </div>

          {/* Card 4: Commission Rate */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Commission Rate (कमीशन दर)
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {parseFloat(staff.commission_rate || 0).toFixed(1)}%
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Per sales invoice amount
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <Percent className="w-6 h-6 stroke-[2.5]" />
            </div>
          </div>

        </div>

        {/* Ledger & Invoices Table Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          
          {/* Table Header & Search */}
          <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <span>My Billed Invoices & Commission Breakdown</span>
                <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full">
                  {filteredTxns.length} Invoices
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                All bills generated by you are listed below with your calculated commission.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search invoice or customer..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 w-56"
                />
              </div>
              <button
                onClick={fetchPortalData}
                title="Refresh"
                className="p-1.5 border border-slate-300 rounded-lg hover:bg-slate-100 text-slate-600 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#f8fafc] text-slate-600 border-b border-slate-200 font-semibold select-none">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Invoice No</th>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4 text-right">Invoice Amount</th>
                  <th className="py-3 px-4 text-center">Commission %</th>
                  <th className="py-3 px-4 text-right">My Commission (₹)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center w-24">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan="9" className="py-12 text-center text-slate-400">Loading your invoices...</td>
                  </tr>
                ) : filteredTxns.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <FileText className="w-8 h-8 text-slate-300" />
                        <p className="font-semibold text-slate-600">No Invoices Billed Yet</p>
                        <p className="text-[11px] text-slate-400">
                          Click "+ Create Bill" above to generate your first invoice and earn commission.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTxns.map((txn, idx) => {
                    const invAmt = parseFloat(txn.amount) || 0;
                    const commRate = parseFloat(txn.staff_commission_rate || staff.commission_rate || 0);
                    const commAmt = txn.staff_commission_amount 
                      ? parseFloat(txn.staff_commission_amount) 
                      : (invAmt * commRate) / 100;

                    return (
                      <tr key={txn.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 text-center text-slate-400 font-mono text-[11px]">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {txn.date}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                            {txn.txn_no}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {txn.party_name}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                          ₹{invAmt.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full text-[11px] border border-emerald-200">
                            {commRate.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-extrabold text-indigo-600">
                          ₹{commAmt.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full ${
                            txn.status === 'Paid' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : (txn.status === 'Partial' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800')
                          }`}>
                            {txn.status || 'Paid'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => onViewInvoice && onViewInvoice(txn.id)}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center justify-center space-x-1 mx-auto"
                          >
                            <span>View</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>
    </div>
  );
}
