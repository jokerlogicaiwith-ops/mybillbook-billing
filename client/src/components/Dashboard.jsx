import React from 'react';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Building2, 
  ExternalLink, 
  RefreshCw,
  Sparkles,
  Package,
  CreditCard,
  UserCheck,
  Receipt,
  Eye,
  CheckCircle,
  Clock
} from 'lucide-react';

export default function Dashboard({ 
  dashboardData, 
  loading, 
  onRefresh, 
  onOpenInvoiceModal,
  onViewInvoice,
  setActiveTab
}) {
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
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
      {/* Active System Banner (Replaces "Plan Expired" banner) */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-700 text-white rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
            <CheckCircle className="w-6 h-6 text-emerald-200" />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-wide">
              Lifetime Free Plan Active &bull; No Renewal Required!
            </h3>
            <p className="text-xs text-emerald-100">
              Aapka Sara Data Aapke System Par Safe Hai. GST Invoicing, Inventory & Accounts 100% Free Hain.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => onOpenInvoiceModal('Sales Invoices')}
            className="px-4 py-2 bg-white text-emerald-800 font-bold rounded-lg text-xs hover:bg-emerald-50 transition shadow-sm whitespace-nowrap"
          >
            + Create New Invoice
          </button>
        </div>
      </div>

      {/* Feature / Promotion Cards (Exact replica of the 3 cards in screenshot) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition">
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 text-sm">Unable to manage inventory?</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Scan bills now. Convert them to purchases and track live warehouse stock anytime.
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <button 
              onClick={() => setActiveTab('items')}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center space-x-1"
            >
              <span>Manage Inventory Now &rarr;</span>
            </button>
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500">
              <Package className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition">
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 text-sm">Pending ₹{((dashboardData?.toCollect || 3096016) / 100000).toFixed(1)} Lakh stuck?</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Send automatic UPI payment reminders & QR bills to all of your parties for 2x faster recovery.
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <button 
              onClick={() => setActiveTab('parties')}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
            >
              <span>View Outstanding Parties &rarr;</span>
            </button>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition">
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 text-sm">Manage Staff & Users</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Assign multi-user roles, billing counter access, and track daily sales summaries.
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <button 
              onClick={() => setActiveTab('staff')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            >
              <span>Manage Users Now &rarr;</span>
            </button>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Business Overview Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Business Overview</h2>
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <span>Last Update: {dashboardData?.lastUpdated || '14 Oct 2026 | 05:36 PM'}</span>
            <button 
              onClick={onRefresh}
              className="p-1 hover:text-blue-600 transition"
              title="Refresh Stats"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* 3 Main Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: To Collect */}
          <div 
            onClick={() => setActiveTab('parties')}
            className="bg-white border border-slate-200 rounded-xl p-5 hover:border-emerald-300 hover:shadow-sm cursor-pointer transition relative group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-600">
                <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
                <span>To Collect</span>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
            </div>
            <div className="mt-3 text-2xl font-extrabold text-slate-900 tracking-tight">
              {formatCurrency(dashboardData?.toCollect || 3096016)}
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Total receivables from customer accounts</p>
          </div>

          {/* Card 2: To Pay */}
          <div 
            onClick={() => setActiveTab('purchases')}
            className="bg-white border border-slate-200 rounded-xl p-5 hover:border-red-300 hover:shadow-sm cursor-pointer transition relative group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-red-500">
                <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                <span>To Pay</span>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-red-500 transition" />
            </div>
            <div className="mt-3 text-2xl font-extrabold text-slate-900 tracking-tight">
              {formatCurrency(dashboardData?.toPay || 2592460)}
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Total pending payables to suppliers</p>
          </div>

          {/* Card 3: Total Cash + Bank Balance */}
          <div 
            onClick={() => setActiveTab('cash-bank')}
            className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm cursor-pointer transition relative group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-600">
                <Building2 className="w-4 h-4 text-slate-500" />
                <span>Total Cash + Bank Balance</span>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
            </div>
            <div className="mt-3 text-2xl font-extrabold text-slate-900 tracking-tight">
              {formatCurrency(dashboardData?.totalBank || 214805)}
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Liquid balance across all accounts</p>
          </div>
        </div>
      </div>

      {/* Latest Transactions Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Latest Transactions</h3>
          <button 
            onClick={() => setActiveTab('sales')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700"
          >
            See All Transactions
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Txn No</th>
                <th className="py-3 px-4">Party Name</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {dashboardData?.latestTransactions && dashboardData.latestTransactions.length > 0 ? (
                dashboardData.latestTransactions.map((txn) => {
                  return (
                    <tr key={txn.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {formatDate(txn.date)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                          txn.type === 'Sales Invoices' ? 'bg-blue-50 text-blue-700' :
                          txn.type === 'Quotation / Estimate' ? 'bg-amber-50 text-amber-700' :
                          txn.type === 'Payment In' ? 'bg-emerald-50 text-emerald-700' :
                          'bg-purple-50 text-purple-700'
                        }`}>
                          {txn.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-800 whitespace-nowrap">
                        {txn.txn_no}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-xs truncate">
                        {txn.party_name}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                        {formatCurrency(txn.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button 
                          onClick={() => onViewInvoice(txn.id)}
                          className="inline-flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 font-semibold px-2.5 py-1 rounded-md hover:bg-blue-50 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View / Print</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    No transactions found. Click "+ Create Sales Invoice" above to add your first bill!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
          <button 
            onClick={() => setActiveTab('sales')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            See All Transactions &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
