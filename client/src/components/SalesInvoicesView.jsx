import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Calendar, 
  Layers, 
  FileText, 
  Settings, 
  Printer, 
  ArrowUpDown, 
  AlertTriangle, 
  MoreVertical,
  CheckCircle2,
  Clock,
  XCircle,
  HelpCircle,
  Download,
  Share2,
  Trash2,
  Copy,
  Receipt,
  Sparkles,
  ChevronDown,
  Check,
  Truck,
  RotateCcw,
  CreditCard,
  Send,
  FileCheck2
} from 'lucide-react';

export default function SalesInvoicesView({ 
  onOpenInvoiceModal, 
  onViewInvoice, 
  subTab = 'invoices',
  onSelectSubTab
}) {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    card1: { label: 'Total Sales', value: 3303846, format: 'currency' },
    card2: { label: 'Paid', value: 213350, format: 'currency', color: 'text-emerald-600' },
    card3: { label: 'Unpaid', value: 3090496, format: 'currency', color: 'text-red-600' },
    card4: { label: 'Cancelled', value: '-', format: 'raw' }
  });
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState('Last 365 Days');
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [isBulkDropdownOpen, setIsBulkDropdownOpen] = useState(false);
  const [isReportsDropdownOpen, setIsReportsDropdownOpen] = useState(false);
  const [selectedTxnIds, setSelectedTxnIds] = useState([]);
  const [sortField, setSortField] = useState('date');
  const [sortAsc, setSortAsc] = useState(false);
  const [actionMenuOpenId, setActionMenuOpenId] = useState(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const getTypeParam = () => {
    switch (subTab) {
      case 'quotation': return 'Quotation / Estimate';
      case 'payment-in': return 'Payment In';
      case 'sales-return': return 'Sales Return';
      case 'credit-note': return 'Credit Note';
      case 'delivery-challan': return 'Delivery Challan';
      case 'proforma': return 'Proforma Invoice';
      default: return 'Sales Invoices';
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, [subTab]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const fetchSalesData = async () => {
    try {
      const typeParam = getTypeParam();

      // 1. Fetch transactions
      const res = await fetch(`/api/transactions?type=${encodeURIComponent(typeParam)}`);
      const data = await res.json();
      setTransactions(Array.isArray(data) ? data : []);

      // 2. Fetch stats
      const statsRes = await fetch(`/api/sales/stats?type=${encodeURIComponent(typeParam)}`);
      const statsData = await statsRes.json();
      if (statsData && statsData.card1) {
        setStats(statsData);
      }
    } catch (err) {
      console.error('Failed to load sales data:', err);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
      }
    } catch (e) {}
    return dateStr;
  };

  const formatValue = (val, format = 'currency') => {
    if (val === undefined || val === null || val === '-') return '-';
    if (format === 'count') return String(val);
    if (format === 'raw') return String(val);
    const num = Number(val) || 0;
    return '₹ ' + num.toLocaleString('en-IN');
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedTxnIds(filteredTransactions.map(t => t.id));
    } else {
      setSelectedTxnIds([]);
    }
  };

  const handleToggleSelectRow = (id, e) => {
    e.stopPropagation();
    setSelectedTxnIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  // Convert Quote or Proforma to real Sales Invoice
  const handleConvertToSalesInvoice = async (txn) => {
    try {
      const rand = Math.floor(1230 + Math.random() * 50);
      const newInvoice = {
        txn_no: `A/SL/${rand}`,
        type: 'Sales Invoices',
        date: new Date().toISOString().split('T')[0],
        party_id: txn.party_id,
        party_name: txn.party_name,
        subtotal: txn.subtotal,
        discount: txn.discount || 0,
        tax_amount: txn.tax_amount || 0,
        amount: txn.amount,
        paid_amount: 0,
        payment_type: 'Credit',
        notes: `Converted from ${txn.type} (${txn.txn_no})`
      };

      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInvoice)
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Successfully converted to Sales Invoice ${newInvoice.txn_no}!`);
        if (onSelectSubTab) onSelectSubTab('invoices');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter & sort transactions
  const filteredTransactions = transactions.filter(t => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchNo = (t.txn_no || '').toLowerCase().includes(q) || (t.display_txn_no || '').toLowerCase().includes(q);
      const matchParty = (t.party_name || '').toLowerCase().includes(q);
      const matchSalesman = (t.salesman_name || t.staff_name || '').toLowerCase().includes(q) || (t.salesman_code || t.staff_code || '').toLowerCase().includes(q);
      const matchAmount = String(t.amount || '').includes(q);
      if (!matchNo && !matchParty && !matchSalesman && !matchAmount) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortField === 'amount') {
      return sortAsc ? (a.amount - b.amount) : (b.amount - a.amount);
    }
    if (sortField === 'date') {
      return sortAsc ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date);
    }
    return 0;
  });

  const getSubTabHeading = () => {
    switch (subTab) {
      case 'quotation': return 'Quotations / Estimates';
      case 'payment-in': return 'Payment In';
      case 'sales-return': return 'Sales Return';
      case 'credit-note': return 'Credit Notes';
      case 'delivery-challan': return 'Delivery Challans';
      case 'proforma': return 'Proforma Invoices';
      default: return 'Sales Invoices';
    }
  };

  const getCreateButtonText = () => {
    switch (subTab) {
      case 'quotation': return 'Create Quotation';
      case 'payment-in': return 'Record Payment In';
      case 'sales-return': return 'Create Sales Return';
      case 'credit-note': return 'Create Credit Note';
      case 'delivery-challan': return 'Create Delivery Challan';
      case 'proforma': return 'Create Proforma Invoice';
      default: return 'Create Sales Invoice';
    }
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Document Number', 'Party Name', 'Due / Reference', 'Amount', 'Status'];
    const rows = filteredTransactions.map(t => [
      t.date,
      t.display_txn_no || t.txn_no,
      `"${t.party_name}"`,
      `"${t.due_in || '-'}"`,
      t.amount,
      t.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${getSubTabHeading().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsBulkDropdownOpen(false);
  };

  return (
    <div className="p-6 space-y-5 max-w-[1550px] mx-auto text-slate-800">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center space-x-2 text-xs font-bold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header with Page Title and Action Icons matching MyBillBook */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {getSubTabHeading()}
        </h1>

        <div className="flex items-center space-x-2.5">
          {/* Reports Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsReportsDropdownOpen(!isReportsDropdownOpen)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-blue-500 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-50 transition shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Reports</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {isReportsDropdownOpen && (
              <div className="absolute right-0 mt-1 w-52 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-50 text-xs font-medium">
                <button 
                  onClick={() => setIsReportsDropdownOpen(false)}
                  className="w-full text-left px-3 py-2 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-between"
                >
                  <span>{getSubTabHeading()} Summary Report</span>
                </button>
                <button 
                  onClick={() => setIsReportsDropdownOpen(false)}
                  className="w-full text-left px-3 py-2 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-between"
                >
                  <span>Party-wise Report</span>
                </button>
                <button 
                  onClick={() => setIsReportsDropdownOpen(false)}
                  className="w-full text-left px-3 py-2 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-between"
                >
                  <span>Item Sales Report</span>
                </button>
                <button 
                  onClick={() => setIsReportsDropdownOpen(false)}
                  className="w-full text-left px-3 py-2 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-between"
                >
                  <span>GSTR-1 Report</span>
                </button>
              </div>
            )}
          </div>

          {/* Settings button with red notification indicator */}
          <button 
            title="Sales Settings"
            onClick={() => onOpenInvoiceModal(getTypeParam())}
            className="relative p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg transition shadow-2xs"
          >
            <Settings className="w-4 h-4 text-slate-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
          </button>

          {/* Thermal / Receipt Print Icon */}
          <button 
            title="Thermal / Barcode Print"
            onClick={() => window.print()}
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg transition shadow-2xs"
          >
            <Printer className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards (4 Cards in a Row) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white rounded-xl p-4 border-2 border-[#5c54e5] ring-2 ring-indigo-50 shadow-xs transition">
          <div className="flex items-center space-x-2 text-[#5c54e5] text-xs font-semibold">
            {subTab === 'delivery-challan' ? <Truck className="w-4 h-4" /> :
             subTab === 'sales-return' ? <RotateCcw className="w-4 h-4" /> :
             subTab === 'credit-note' ? <CreditCard className="w-4 h-4" /> :
             <Receipt className="w-4 h-4 stroke-[2.2]" />}
            <span>{stats.card1?.label || 'Total'}</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-sans tracking-tight">
            {formatValue(stats.card1?.value, stats.card1?.format)}
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs transition">
          <div className={`flex items-center space-x-2 text-xs font-semibold ${stats.card2?.color || 'text-emerald-600'}`}>
            <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
            <span>{stats.card2?.label || 'Paid'}</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-sans tracking-tight">
            {formatValue(stats.card2?.value, stats.card2?.format)}
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs transition">
          <div className={`flex items-center space-x-2 text-xs font-semibold ${stats.card3?.color || 'text-red-600'}`}>
            <Clock className="w-4 h-4 stroke-[2.2]" />
            <span>{stats.card3?.label || 'Unpaid'}</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-sans tracking-tight">
            {formatValue(stats.card3?.value, stats.card3?.format)}
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs transition">
          <div className="flex items-center space-x-2 text-slate-500 text-xs font-semibold">
            <XCircle className="w-4 h-4 stroke-[2.2]" />
            <span>{stats.card4?.label || 'Cancelled'}</span>
          </div>
          <div className="text-2xl font-bold text-slate-500 mt-2 font-sans">
            {stats.card4?.value || '-'}
          </div>
        </div>
      </div>

      {/* 3. Action and Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        {/* Left Side: Search + Date Range */}
        <div className="flex items-center space-x-3 flex-1">
          {/* Search Box */}
          <div className="relative w-10 sm:w-64 focus-within:w-72 transition-all">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-400" />
            </div>
            <input 
              type="text"
              placeholder={`Search in ${getSubTabHeading()}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-2xs transition"
            />
          </div>

          {/* Date Range Dropdown with dual calendar icons */}
          <div className="relative">
            <button
              onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
              className="flex items-center space-x-2 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50 transition shadow-2xs"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-semibold text-slate-800">{dateRange}</span>
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {isDateDropdownOpen && (
              <div className="absolute left-0 mt-1 w-44 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-50 text-xs font-medium">
                {['Today', 'This Week', 'This Month', 'Last 30 Days', 'Last 365 Days', 'All Time'].map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setDateRange(option);
                      setIsDateDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-slate-50 ${
                      dateRange === option ? 'text-indigo-600 font-bold bg-indigo-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>{option}</span>
                    {dateRange === option && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Bulk Actions + Primary Purple Button */}
        <div className="flex items-center space-x-2.5">
          {/* Bulk Actions Button */}
          <div className="relative">
            <button
              onClick={() => setIsBulkDropdownOpen(!isBulkDropdownOpen)}
              className="flex items-center space-x-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition shadow-2xs"
            >
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>Bulk Actions</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {isBulkDropdownOpen && (
              <div className="absolute right-0 mt-1 w-52 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-50 text-xs font-medium">
                <button
                  onClick={handleExportCSV}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center space-x-2 text-slate-700"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Export to Excel / CSV</span>
                </button>
                <button
                  onClick={() => {
                    alert('WhatsApp reminders queued for selected parties!');
                    setIsBulkDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center space-x-2 text-slate-700"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Send WhatsApp Reminders</span>
                </button>
                <button
                  onClick={() => {
                    window.print();
                    setIsBulkDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center space-x-2 text-slate-700"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span>Print Selected</span>
                </button>
              </div>
            )}
          </div>

          {/* Primary Action Purple Button */}
          <button
            onClick={() => onOpenInvoiceModal(getTypeParam())}
            className="flex items-center space-x-1.5 px-4 py-2 bg-[#5c54e5] hover:bg-[#4f46e5] active:bg-[#4338ca] text-white rounded-lg text-xs font-bold shadow-sm transition"
          >
            <span>{getCreateButtonText()}</span>
          </button>
        </div>
      </div>

      {/* 4. Data Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#f8fafc] text-slate-600 font-bold border-b border-slate-200 select-none">
              <tr>
                <th className="py-3 px-3.5 w-10 text-center">
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={filteredTransactions.length > 0 && selectedTxnIds.length === filteredTransactions.length}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </th>
                <th 
                  onClick={() => toggleSort('date')}
                  className="py-3 px-3.5 cursor-pointer hover:text-slate-900 transition whitespace-nowrap"
                >
                  <div className="flex items-center space-x-1">
                    <span>Date</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3.5 whitespace-nowrap">
                  {subTab === 'quotation' ? 'Quotation Number' :
                   subTab === 'payment-in' ? 'Receipt Number' :
                   subTab === 'sales-return' ? 'Return Number' :
                   subTab === 'credit-note' ? 'Credit Note #' :
                   subTab === 'delivery-challan' ? 'Challan Number' :
                   subTab === 'proforma' ? 'Proforma Number' : 'Invoice Number'}
                </th>
                <th className="py-3 px-3.5 whitespace-nowrap">Party Name</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Salesman</th>
                <th className="py-3 px-3.5 whitespace-nowrap">
                  {subTab === 'quotation' || subTab === 'proforma' ? 'Valid Till' :
                   subTab === 'payment-in' ? 'Payment Mode' :
                   subTab === 'delivery-challan' ? 'Vehicle / Transport' : 'Due In'}
                </th>
                <th 
                  onClick={() => toggleSort('amount')}
                  className="py-3 px-3.5 cursor-pointer hover:text-slate-900 transition whitespace-nowrap"
                >
                  <div className="flex items-center space-x-1">
                    <span>Amount</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3.5 whitespace-nowrap">Status</th>
                <th className="py-3 px-3.5 w-12 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">No {getSubTabHeading()} Found</p>
                    <p className="text-xs text-slate-400 mt-1">Click "{getCreateButtonText()}" to add your first record</p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((txn) => {
                  const isSelected = selectedTxnIds.includes(txn.id);
                  const isOverdue = txn.due_in && txn.due_in.toLowerCase().includes('overdue');
                  const isActionOpen = actionMenuOpenId === txn.id;

                  return (
                    <tr 
                      key={txn.id} 
                      onClick={() => onViewInvoice(txn.id)}
                      className={`transition cursor-pointer group ${
                        isSelected 
                          ? 'bg-[#f4f2ff] hover:bg-[#ede9fe]' 
                          : 'hover:bg-slate-50/80 bg-white'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-3.5 text-center" onClick={(e) => handleToggleSelectRow(txn.id, e)}>
                        <input 
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleToggleSelectRow(txn.id, e)}
                          className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-3.5 text-slate-700 whitespace-nowrap font-medium">
                        {formatDate(txn.date)}
                      </td>

                      {/* Document / Invoice Number */}
                      <td className="py-3.5 px-3.5 text-slate-900 font-mono font-semibold whitespace-nowrap">
                        {txn.display_txn_no || txn.txn_no}
                      </td>

                      {/* Party Name */}
                      <td className="py-3.5 px-3.5 text-slate-900 font-semibold whitespace-nowrap uppercase tracking-tight">
                        {txn.party_name}
                      </td>

                      {/* Salesman */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <div className="font-semibold text-slate-800 text-xs">
                          {txn.salesman_name || txn.staff_name || 'Direct / Store'}
                        </div>
                        {(txn.salesman_code || txn.staff_code) && (
                          <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.2 rounded">
                            {txn.salesman_code || txn.staff_code}
                          </span>
                        )}
                      </td>

                      {/* Due In / Valid Till / Mode */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        {isOverdue ? (
                          <span className="text-[#dc2626] font-medium">
                            {txn.due_in}
                          </span>
                        ) : subTab === 'payment-in' ? (
                          <span className="text-slate-800 font-semibold bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                            {txn.payment_type || 'Bank (UPI)'}
                          </span>
                        ) : (
                          <span className="text-slate-500">
                            {txn.due_in || '-'}
                          </span>
                        )}
                      </td>

                      {/* Amount with unpaid subtext */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <div className="font-bold text-slate-900">
                          {formatValue(txn.amount, 'currency')}
                        </div>
                        {txn.balance_due > 0 && txn.status !== 'Paid' && subTab === 'invoices' && (
                          <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                            ({formatValue(txn.balance_due, 'currency')} unpaid)
                          </div>
                        )}
                      </td>

                      {/* Status Badge + Warning Triangle */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            txn.status === 'Partially Paid' || txn.status === 'Open'
                              ? 'bg-[#fef9c3] text-[#a16207]' 
                              : txn.status === 'Paid' || txn.status === 'Converted' || txn.status === 'Delivered' || txn.status === 'Active' || txn.status === 'Refunded' || txn.status === 'Adjusted'
                              ? 'bg-[#dcfce7] text-[#15803d]' 
                              : txn.status === 'In Transit'
                              ? 'bg-[#fef3c7] text-[#b45309]'
                              : txn.status === 'Unpaid' 
                              ? 'bg-[#fee2e2] text-[#dc2626]' 
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {txn.status}
                          </span>

                          {txn.has_warning && (
                            <AlertTriangle 
                              className="w-4 h-4 text-red-500 stroke-[2.2] shrink-0" 
                              title="Invoice past due credit period"
                            />
                          )}
                        </div>
                      </td>

                      {/* Action ⋮ */}
                      <td className="py-3.5 px-3.5 text-center relative" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setActionMenuOpenId(isActionOpen ? null : txn.id)}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {isActionOpen && (
                          <div className="absolute right-2 top-10 w-48 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-50 text-xs font-medium text-left">
                            <button
                              onClick={() => {
                                onViewInvoice(txn.id);
                                setActionMenuOpenId(null);
                              }}
                              className="w-full px-3 py-2 hover:bg-indigo-50 hover:text-indigo-600 flex items-center space-x-2"
                            >
                              <FileText className="w-3.5 h-3.5 text-slate-500" />
                              <span>View / Print</span>
                            </button>

                            {/* Convert to Sales Invoice option for Quotation and Proforma */}
                            {(subTab === 'quotation' || subTab === 'proforma') && (
                              <button
                                onClick={() => {
                                  handleConvertToSalesInvoice(txn);
                                  setActionMenuOpenId(null);
                                }}
                                className="w-full px-3 py-2 hover:bg-indigo-50 text-indigo-700 font-bold flex items-center space-x-2 border-y border-indigo-50"
                              >
                                <FileCheck2 className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Convert to Sales Invoice</span>
                              </button>
                            )}

                            <button
                              onClick={() => {
                                alert(`Downloading PDF for ${txn.txn_no}`);
                                setActionMenuOpenId(null);
                              }}
                              className="w-full px-3 py-2 hover:bg-indigo-50 hover:text-indigo-600 flex items-center space-x-2"
                            >
                              <Download className="w-3.5 h-3.5 text-slate-500" />
                              <span>Download PDF</span>
                            </button>
                            <button
                              onClick={() => {
                                const msg = `Dear ${txn.party_name}, details for your ${txn.type} (${txn.txn_no}) for ${formatValue(txn.amount, 'currency')}. Thank you!`;
                                window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                                setActionMenuOpenId(null);
                              }}
                              className="w-full px-3 py-2 hover:bg-indigo-50 hover:text-indigo-600 flex items-center space-x-2"
                            >
                              <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Share on WhatsApp</span>
                            </button>
                            {subTab === 'invoices' && (
                              <button
                                onClick={() => {
                                  onOpenInvoiceModal('Payment In');
                                  setActionMenuOpenId(null);
                                }}
                                className="w-full px-3 py-2 hover:bg-indigo-50 hover:text-indigo-600 flex items-center space-x-2"
                              >
                                <Receipt className="w-3.5 h-3.5 text-blue-600" />
                                <span>Record Payment</span>
                              </button>
                            )}
                            <button
                              onClick={() => {
                                onOpenInvoiceModal(getTypeParam());
                                setActionMenuOpenId(null);
                              }}
                              className="w-full px-3 py-2 hover:bg-indigo-50 hover:text-indigo-600 flex items-center space-x-2"
                            >
                              <Copy className="w-3.5 h-3.5 text-slate-500" />
                              <span>Duplicate {subTab === 'invoices' ? 'Invoice' : 'Record'}</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Bottom Right Floating Help Button (?) matching screenshot */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setShowHelpModal(true)}
          title="Help & Shortcuts"
          className="w-10 h-10 rounded-full bg-[#1e293b] hover:bg-slate-900 text-white font-bold flex items-center justify-center shadow-lg transition hover:scale-105 active:scale-95"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 flex items-center space-x-2">
                <HelpCircle className="w-5 h-5 text-indigo-600" />
                <span>Sales Invoices Guide & Shortcuts</span>
              </h3>
              <button 
                onClick={() => setShowHelpModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>
            <div className="text-xs text-slate-600 space-y-2.5 leading-relaxed">
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="font-medium">Create New Sales Invoice</span>
                <kbd className="px-2 py-0.5 bg-slate-100 border rounded font-mono text-[10px]">Alt + S</kbd>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="font-medium">Create Quotation / Estimate</span>
                <kbd className="px-2 py-0.5 bg-slate-100 border rounded font-mono text-[10px]">Alt + Q</kbd>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="font-medium">Record Payment In</span>
                <kbd className="px-2 py-0.5 bg-slate-100 border rounded font-mono text-[10px]">Alt + R</kbd>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="font-medium">Search Records</span>
                <kbd className="px-2 py-0.5 bg-slate-100 border rounded font-mono text-[10px]">Ctrl + /</kbd>
              </div>
              <p className="pt-2 text-slate-500">
                All data is stored directly in your local SQLite engine. No monthly subscription or renewal is required.
              </p>
            </div>
            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
