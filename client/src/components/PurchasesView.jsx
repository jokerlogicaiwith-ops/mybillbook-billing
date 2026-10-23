import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Calendar, 
  FileText, 
  Settings, 
  Printer, 
  ArrowUpDown, 
  MoreVertical,
  CheckCircle2,
  HelpCircle,
  Download,
  Share2,
  Trash2,
  Copy,
  Receipt,
  ChevronDown,
  ShoppingBag,
  ShoppingCart,
  ScanLine,
  Keyboard,
  Eye,
  BarChart3,
  X
} from 'lucide-react';

export default function PurchasesView({ 
  onOpenInvoiceModal, 
  onViewInvoice, 
  subTab = 'invoices',
  onSelectSubTab
}) {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalPurchases: 0,
    paid: 0,
    unpaid: 0,
    card1: { label: 'Total Purchases', value: 0 },
    card2: { label: 'Paid', value: 0 },
    card3: { label: 'Unpaid', value: 0 }
  });
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState('Last 365 Days');
  const [activeSubFilter, setActiveSubFilter] = useState('all'); // 'all' or 'incomplete'
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [isReportsDropdownOpen, setIsReportsDropdownOpen] = useState(false);
  const [sortField, setSortField] = useState('date');
  const [sortAsc, setSortAsc] = useState(false);
  const [actionMenuOpenId, setActionMenuOpenId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const getTypeParam = () => {
    switch (subTab) {
      case 'payment-out': return 'Payment Out';
      case 'purchase-return': return 'Purchase Return';
      case 'debit-note': return 'Debit Note';
      case 'purchase-orders': return 'Purchase Orders';
      default: return 'Purchase Invoices';
    }
  };

  const getSubTabTitle = () => {
    switch (subTab) {
      case 'payment-out': return 'Payment Out';
      case 'purchase-return': return 'Purchase Return';
      case 'debit-note': return 'Debit Note';
      case 'purchase-orders': return 'Purchase Orders';
      default: return 'Purchase Invoices';
    }
  };

  const getCreateButtonLabel = () => {
    switch (subTab) {
      case 'payment-out': return 'Record Payment Out';
      case 'purchase-return': return 'Create Purchase Return';
      case 'debit-note': return 'Create Debit Note';
      case 'purchase-orders': return 'Create Purchase Order';
      default: return 'Create Purchase Invoice';
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  useEffect(() => {
    fetchPurchaseData();
  }, [subTab]);

  const fetchPurchaseData = async () => {
    try {
      const typeParam = getTypeParam();

      // 1. Fetch transactions
      const res = await fetch(`/api/transactions?type=${encodeURIComponent(typeParam)}`);
      const data = await res.json();
      setTransactions(Array.isArray(data) ? data : []);

      // 2. Fetch stats
      const statsRes = await fetch(`/api/purchases/stats?type=${encodeURIComponent(typeParam)}`);
      const statsData = await statsRes.json();
      if (statsData) {
        setStats(statsData);
      }
    } catch (err) {
      console.error('Failed to load purchase data:', err);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      }
      return dateStr;
    } catch (e) {
      return dateStr;
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleDeleteTxn = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Kya aap sach me ye purchase invoice delete karna chahte hain?')) return;
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Purchase record safalta se delete ho gaya');
        fetchPurchaseData();
      } else {
        alert(data.error || 'Delete failed');
      }
    } catch (err) {
      alert('Network error while deleting');
    }
    setActionMenuOpenId(null);
  };

  // Filter by transaction type & search query
  let filteredTxns = transactions.filter(t => {
    if (activeSubFilter === 'incomplete') return false;
    const typeParam = getTypeParam();
    if (typeParam === 'Purchase Invoices') {
      if (t.type !== 'Purchase Invoices' && t.type !== 'Purchase Bills') return false;
    } else {
      if (t.type !== typeParam) return false;
    }
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (t.txn_no && t.txn_no.toLowerCase().includes(q)) ||
      (t.party_name && t.party_name.toLowerCase().includes(q)) ||
      (t.amount && String(t.amount).includes(q))
    );
  });

  // Sort transactions
  filteredTxns.sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];
    if (sortField === 'amount') {
      valA = Number(valA) || 0;
      valB = Number(valB) || 0;
    }
    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 p-6 space-y-5 font-sans relative">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold z-50 animate-in fade-in slide-in-from-top-2 duration-200 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header matching MyBillBook screenshot */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {getSubTabTitle()}
          </h1>

          {/* Sub-toggle pills: All Invoices & Incomplete Scans */}
          <div className="inline-flex items-center bg-white rounded-lg p-0.5 border border-slate-200 text-xs shadow-2xs">
            <button
              onClick={() => setActiveSubFilter('all')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-medium transition ${
                activeSubFilter === 'all'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span>All Invoices</span>
            </button>
            <button
              onClick={() => {
                setActiveSubFilter('incomplete');
                showToast('Incomplete Scans: 0 pending scans');
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-medium transition ${
                activeSubFilter === 'incomplete'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ScanLine className="w-3.5 h-3.5 text-slate-400" />
              <span>Incomplete Scans</span>
            </button>
          </div>
        </div>

        {/* Action icons on right matching screenshot */}
        <div className="flex items-center space-x-2">
          {/* Reports dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsReportsDropdownOpen(!isReportsDropdownOpen)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50/80 hover:bg-blue-100 text-[#0284c7] border border-blue-200 rounded-lg text-xs font-semibold transition"
            >
              <BarChart3 className="w-3.5 h-3.5 text-[#0284c7]" />
              <span>Reports</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#0284c7]" />
            </button>
            {isReportsDropdownOpen && (
              <div className="absolute right-0 mt-1 w-52 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-50 text-xs animate-in fade-in duration-150">
                <button 
                  onClick={() => { setIsReportsDropdownOpen(false); showToast('Opening Purchase Summary Report...'); }}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700"
                >
                  Purchase Summary Report
                </button>
                <button 
                  onClick={() => { setIsReportsDropdownOpen(false); showToast('Opening GSTR-2 Purchase Report...'); }}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700"
                >
                  GSTR-2 Purchase Report
                </button>
                <button 
                  onClick={() => { setIsReportsDropdownOpen(false); showToast('Opening Supplier Outstanding Report...'); }}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700"
                >
                  Supplier Outstanding
                </button>
              </div>
            )}
          </div>

          {/* Settings icon button with red badge dot */}
          <button
            onClick={() => showToast('Purchase Settings & Preferences')}
            className="relative p-2 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-lg transition shadow-2xs cursor-pointer"
            title="Purchase Settings"
          >
            <Settings className="w-4 h-4 text-slate-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Keyboard shortcuts icon button */}
          <button
            onClick={() => showToast('Keyboard Shortcuts: Alt + P for New Purchase')}
            className="p-2 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-lg transition shadow-2xs cursor-pointer"
            title="Keyboard Shortcuts"
          >
            <Keyboard className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>

      {/* 3 KPI Summary Cards matching MyBillBook screenshot */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Total Purchases */}
        <div className="bg-[#f1f4ff] border border-[#c7d2fe] rounded-xl p-4 transition shadow-2xs">
          <div className="flex items-center space-x-2 text-[#4f46e5] text-xs font-semibold mb-1">
            <ShoppingBag className="w-4 h-4 text-[#4f46e5]" />
            <span>Total Purchases</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            ₹ {stats.totalPurchases.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Card 2: Paid */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 transition shadow-2xs">
          <div className="flex items-center space-x-2 text-emerald-600 text-xs font-semibold mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Paid</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            ₹ {stats.paid.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Card 3: Unpaid */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 transition shadow-2xs">
          <div className="flex items-center space-x-2 text-red-600 text-xs font-semibold mb-1">
            <Receipt className="w-4 h-4 text-red-500" />
            <span>Unpaid</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            ₹ {stats.unpaid.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Filter and Action Toolbar matching MyBillBook screenshot */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-3 flex-1">
          {/* Search Icon & input */}
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 shadow-2xs"
            />
          </div>

          {/* Date range picker button with calendar icons on both sides */}
          <div className="relative">
            <button
              onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
              className="flex items-center space-x-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{dateRange}</span>
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {isDateDropdownOpen && (
              <div className="absolute left-0 mt-1 w-44 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-50 text-xs animate-in fade-in duration-150">
                {['Today', 'Yesterday', 'This Week', 'This Month', 'This Quarter', 'This Financial Year', 'Last 365 Days', 'All Time'].map(d => (
                  <button
                    key={d}
                    onClick={() => { setDateRange(d); setIsDateDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-2 hover:bg-indigo-50 hover:text-indigo-600 ${dateRange === d ? 'font-bold text-indigo-600 bg-indigo-50/50' : 'text-slate-700'}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Primary Action Button: Create Purchase Invoice */}
        <button
          onClick={() => onOpenInvoiceModal(getTypeParam())}
          className="px-4 py-2.5 bg-[#5c5be5] hover:bg-[#4f46e5] text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center justify-center space-x-1.5 cursor-pointer"
        >
          <span>{getCreateButtonLabel()}</span>
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8fafc] text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th 
                  onClick={() => handleSort('date')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100/70 select-none"
                >
                  <div className="flex items-center space-x-1">
                    <span>Date</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4">
                  {subTab === 'payment-out' ? 'Ref No.' : subTab === 'purchase-orders' ? 'Order Number' : 'Purchase Invoice Number'}
                </th>
                <th className="py-3 px-4">Party Name</th>
                <th className="py-3 px-4">Due In</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right"></th>
              </tr>
            </thead>

            {filteredTxns.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={7} className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      {/* Empty shopping cart with X matching MyBillBook screenshot */}
                      <div className="relative inline-flex items-center justify-center mb-1">
                        <ShoppingCart className="w-14 h-14 text-slate-300 stroke-[1.2]" />
                        <X className="w-4 h-4 text-slate-400 stroke-[3] absolute top-1 right-1" />
                      </div>
                      <p className="text-slate-500 text-xs font-medium">
                        No Transactions Matching the current filter
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody className="divide-y divide-slate-100">
                {filteredTxns.map((t) => {
                  const isPaid = t.status === 'Paid' || (t.paid_amount >= t.amount && t.amount > 0);
                  const isUnpaid = t.status === 'Unpaid' || (t.balance_due > 0 && !t.paid_amount);
                  const isPartial = t.status === 'Partially Paid' || (t.paid_amount > 0 && t.balance_due > 0);

                  return (
                    <tr 
                      key={t.id}
                      onClick={() => onViewInvoice && onViewInvoice(t.id)}
                      className="hover:bg-slate-50/80 transition cursor-pointer"
                    >
                      <td className="py-3 px-4 font-medium text-slate-700 whitespace-nowrap">
                        {formatDate(t.date)}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900 whitespace-nowrap">
                        {t.txn_no}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {t.party_name || '-'}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {t.due_in || '-'}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        ₹ {Number(t.amount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isPaid ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          isPartial ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          isUnpaid ? 'bg-red-50 text-red-700 border border-red-200' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {t.status || (isPaid ? 'Paid' : 'Unpaid')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActionMenuOpenId(actionMenuOpenId === t.id ? null : t.id);
                          }}
                          className="p-1 hover:bg-slate-200 rounded-md text-slate-400 hover:text-slate-700 transition"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {actionMenuOpenId === t.id && (
                          <div 
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-4 mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-50 text-xs font-medium animate-in fade-in duration-100"
                          >
                            <button
                              onClick={() => {
                                setActionMenuOpenId(null);
                                if (onViewInvoice) onViewInvoice(t.id);
                              }}
                              className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center space-x-2"
                            >
                              <Printer className="w-3.5 h-3.5 text-slate-500" />
                              <span>View / Print</span>
                            </button>
                            <button
                              onClick={(e) => handleDeleteTxn(t.id, e)}
                              className="w-full text-left px-3 py-1.5 hover:bg-red-50 text-red-600 flex items-center space-x-2"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            )}
          </table>
        </div>
      </div>

      {/* Floating Bottom Right Buttons matching MyBillBook screenshot */}
      <div className="fixed bottom-6 right-6 flex items-center space-x-2 z-40">
        <button
          onClick={() => showToast('Pending Actions: All sync tasks complete')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg flex items-center space-x-1.5 transition cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Pending Actions</span>
          <span className="w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">1</span>
        </button>

        <button
          onClick={() => showToast('Help & Support: 24x7 MyBillBook Assistance')}
          className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-slate-800 transition cursor-pointer"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
