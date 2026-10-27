import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Boxes, 
  Tag, 
  ShoppingBag, 
  BarChart3, 
  Building2, 
  Settings, 
  Plus, 
  ChevronRight, 
  ChevronDown, 
  ShieldCheck,
  Award,
  Sparkles,
  Receipt,
  FileSpreadsheet,
  Repeat,
  ScanLine,
  Users2,
  Check,
  Pencil
} from 'lucide-react';
import CreateBusinessModal from './CreateBusinessModal';
import EditBusinessModal from './EditBusinessModal';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  onOpenInvoiceModal, 
  company,
  onRefreshCompany,
  onRefreshDashboard,
  salesSubTab = 'invoices',
  setSalesSubTab,
  itemsSubTab = 'inventory',
  setItemsSubTab,
  purchasesSubTab = 'invoices',
  setPurchasesSubTab,
  currentUser,
  onOpenLoginModal
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
  const [companiesList, setCompaniesList] = useState([]);
  const [isCreateBusinessModalOpen, setIsCreateBusinessModalOpen] = useState(false);
  const [isEditBusinessModalOpen, setIsEditBusinessModalOpen] = useState(false);
  const [companyToEdit, setCompanyToEdit] = useState(null);
  const [salesExpanded, setSalesExpanded] = useState(true);
  const [itemsExpanded, setItemsExpanded] = useState(true);
  const [purchasesExpanded, setPurchasesExpanded] = useState(true);
  const [showMoreAccounting, setShowMoreAccounting] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await fetch('/api/companies');
      const data = await res.json();
      if (Array.isArray(data)) {
        setCompaniesList(data);
      }
    } catch (err) {
      console.error('Error fetching companies in Sidebar:', err);
    }
  };

  const handleSwitchCompany = async (companyId) => {
    try {
      const res = await fetch(`/api/companies/${companyId}/activate`, {
        method: 'PUT'
      });
      const data = await res.json();
      if (data.success) {
        setCompanyDropdownOpen(false);
        fetchCompanies();
        if (onRefreshCompany) onRefreshCompany();
        if (onRefreshDashboard) onRefreshDashboard();
      }
    } catch (err) {
      console.error('Error switching company:', err);
    }
  };

  const itemsSubmenuItems = [
    { id: 'inventory', label: 'Inventory' },
    { id: 'godown', label: 'Godown (Warehouse)' }
  ];

  const handleSelectItemsSubItem = (subId) => {
    setActiveTab('items');
    if (setItemsSubTab) {
      setItemsSubTab(subId);
    }
  };

  const salesSubmenuItems = [
    { id: 'invoices', label: 'Sales Invoices' },
    { id: 'quotation', label: 'Quotation / Estimate' },
    { id: 'payment-in', label: 'Payment In', hasAiBadge: true },
    { id: 'sales-return', label: 'Sales Return' },
    { id: 'credit-note', label: 'Credit Note' },
    { id: 'delivery-challan', label: 'Delivery Challan' },
    { id: 'proforma', label: 'Proforma Invoice' },
  ];

  const handleSelectSalesSubItem = (subId) => {
    setActiveTab('sales');
    if (setSalesSubTab) {
      setSalesSubTab(subId);
    }
  };

  const purchasesSubmenuItems = [
    { id: 'invoices', label: 'Purchase Invoices' },
    { id: 'payment-out', label: 'Payment Out' },
    { id: 'purchase-return', label: 'Purchase Return' },
    { id: 'debit-note', label: 'Debit Note' },
    { id: 'purchase-orders', label: 'Purchase Orders' }
  ];

  const handleSelectPurchasesSubItem = (subId) => {
    setActiveTab('purchases');
    if (setPurchasesSubTab) {
      setPurchasesSubTab(subId);
    }
  };

  return (
    <>
    <aside className="w-64 bg-[#111625] text-slate-300 flex flex-col h-screen fixed left-0 top-0 select-none border-r border-slate-800/90 z-30 font-sans">
      {/* 1. Business Header matching screenshot with Switcher Dropdown */}
      <div className="p-4 border-b border-slate-800/60 relative">
        <div 
          onClick={() => {
            fetchCompanies();
            setCompanyDropdownOpen(!companyDropdownOpen);
          }}
          className="flex items-center justify-between cursor-pointer p-1 -m-1 rounded-xl hover:bg-slate-800/40 transition group"
        >
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-[#1d4ed8] text-white font-bold flex items-center justify-center text-lg shadow-sm shrink-0">
              {company?.name ? company.name.charAt(0).toUpperCase() : 'V'}
            </div>
            <div className="overflow-hidden min-w-0">
              <h2 className="font-semibold text-white text-sm tracking-wide truncate group-hover:text-blue-200">
                {company?.name || 'VSRM COMPUTER CLASSES'}
              </h2>
              <p className="text-xs text-slate-400 font-mono truncate">
                {company?.phone || '8936863035'}
              </p>
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ml-1.5 ${companyDropdownOpen ? 'rotate-180 text-white' : ''}`} />
        </div>

        {/* Business Switcher Dropdown */}
        {companyDropdownOpen && (
          <div className="absolute top-16 left-3 right-3 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Your Businesses</span>
              <span className="text-[10px] font-semibold text-slate-500">{companiesList.length} Businesses</span>
            </div>

            <div className="max-h-48 overflow-y-auto py-1">
              {companiesList.map((c) => {
                const isActive = c.is_active === 1 || c.name === company?.name;
                return (
                  <div
                    key={c.id}
                    className={`w-full px-3 py-2 text-xs flex items-center justify-between hover:bg-blue-50/80 transition group ${
                      isActive ? 'bg-blue-50/70 font-bold text-blue-700' : 'text-slate-700'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSwitchCompany(c.id)}
                      className="flex-1 text-left truncate mr-2 cursor-pointer"
                    >
                      <div className="truncate text-xs font-bold">{c.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{c.phone}</div>
                    </button>

                    <div className="flex items-center space-x-1 shrink-0">
                      {isActive && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      <button
                        type="button"
                        title="Edit Business Name & Settings (पूरा सेटिंग्स पेज खोलें)"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSwitchCompany(c.id);
                          setActiveTab('settings');
                          setCompanyDropdownOpen(false);
                        }}
                        className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-md transition cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-1.5 border-t border-slate-100 px-2 pb-1">
              <button
                type="button"
                onClick={() => {
                  setCompanyDropdownOpen(false);
                  setIsCreateBusinessModalOpen(true);
                }}
                className="w-full py-2 px-3 bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold text-xs rounded-lg flex items-center justify-center space-x-1.5 transition shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>+ Create New Business</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. Main Action Button: + Create Sales Invoice ▾ matching screenshot */}
      <div className="p-3 relative">
        <div className="flex rounded-lg shadow-xs overflow-hidden bg-[#e2e8f0] hover:bg-white transition-colors">
          <button 
            onClick={() => onOpenInvoiceModal('Sales Invoices')}
            className="flex-1 py-2.5 px-3 bg-[#e2e8f0] text-slate-900 font-bold text-xs flex items-center justify-center space-x-1.5 hover:bg-slate-200 transition border-r border-slate-300"
          >
            <Plus className="w-4 h-4 text-slate-800 stroke-[2.5]" />
            <span>Create Sales Invoice</span>
          </button>
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="px-2 bg-[#e2e8f0] text-slate-700 hover:bg-slate-200 flex items-center justify-center transition"
          >
            <ChevronDown className="w-4 h-4 text-slate-700" />
          </button>
        </div>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute top-14 left-3 right-3 bg-white text-slate-800 rounded-lg shadow-xl py-1 z-50 text-xs font-medium border border-slate-200 animate-in fade-in slide-in-from-top-1 duration-150">
            <button 
              onClick={() => { onOpenInvoiceModal('Sales Invoices'); setDropdownOpen(false); }}
              className="w-full text-left px-3 py-2 hover:bg-indigo-50 hover:text-indigo-600 flex items-center justify-between"
            >
              <span>Sales Invoice</span>
              <span className="text-[10px] text-slate-400 font-mono">Alt + S</span>
            </button>
            <button 
              onClick={() => { onOpenInvoiceModal('Quotation / Estimate'); setDropdownOpen(false); }}
              className="w-full text-left px-3 py-2 hover:bg-indigo-50 hover:text-indigo-600 flex items-center justify-between"
            >
              <span>Quotation / Estimate</span>
              <span className="text-[10px] text-slate-400 font-mono">Alt + Q</span>
            </button>
            <button 
              onClick={() => { onOpenInvoiceModal('Payment In'); setDropdownOpen(false); }}
              className="w-full text-left px-3 py-2 hover:bg-indigo-50 hover:text-indigo-600 flex items-center justify-between"
            >
              <span>Payment In</span>
              <span className="text-[10px] text-slate-400 font-mono">Alt + R</span>
            </button>
            <button 
              onClick={() => { onOpenInvoiceModal('Purchase Bills'); setDropdownOpen(false); }}
              className="w-full text-left px-3 py-2 hover:bg-indigo-50 hover:text-indigo-600 flex items-center justify-between"
            >
              <span>Purchase Bill</span>
              <span className="text-[10px] text-slate-400 font-mono">Alt + P</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. Navigation List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-4 py-1 custom-scrollbar">
        {/* GENERAL Section */}
        <div>
          <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            GENERAL
          </div>
          <div className="space-y-0.5">
            {/* Dashboard */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'dashboard' 
                  ? 'bg-[#232f4b] text-white shadow-xs font-semibold' 
                  : 'hover:bg-slate-800/60 text-slate-300 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <LayoutDashboard className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>Dashboard</span>
              </div>
            </button>

            {/* Parties */}
            <button
              onClick={() => setActiveTab('parties')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'parties' 
                  ? 'bg-[#232f4b] text-white shadow-xs font-semibold' 
                  : 'hover:bg-slate-800/60 text-slate-300 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Users className={`w-4 h-4 ${activeTab === 'parties' ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>Parties</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {/* Staff & Users */}
            <button
              onClick={() => setActiveTab('staff')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'staff' || activeTab === 'manage-users' || activeTab === 'staff-payroll'
                  ? 'bg-[#232f4b] text-white shadow-xs font-semibold' 
                  : 'hover:bg-slate-800/60 text-slate-300 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Users2 className={`w-4 h-4 ${activeTab === 'staff' || activeTab === 'manage-users' ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>Staff & Users (स्टाफ)</span>
              </div>
              <span className="text-[10px] bg-indigo-900/60 text-indigo-300 font-bold px-1.5 py-0.2 rounded border border-indigo-700/50">
                New
              </span>
            </button>

            {/* My Staff / Accountant Personal Portal */}
            {currentUser && !currentUser.is_admin && (
              <button
                onClick={() => setActiveTab('staff-portal')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'staff-portal' 
                    ? 'bg-indigo-900/50 text-white shadow-xs font-semibold border border-indigo-700/60' 
                    : 'hover:bg-slate-800/60 text-indigo-300 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Award className={`w-4 h-4 ${activeTab === 'staff-portal' ? 'text-amber-400' : 'text-amber-500'}`} />
                  <span className="font-bold">My Portal (मेरा कमीशन)</span>
                </div>
                <span className="text-[10px] bg-emerald-900/60 text-emerald-300 font-bold px-1.5 py-0.2 rounded border border-emerald-700/50">
                  {currentUser.commission_rate}%
                </span>
              </button>
            )}

            {/* Items (Accordion with Chevron) */}
            <div>
              <button
                onClick={() => {
                  setItemsExpanded(!itemsExpanded);
                  setActiveTab('items');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'items'
                    ? 'text-white' 
                    : 'hover:bg-slate-800/60 text-slate-300 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Boxes className={`w-4 h-4 ${activeTab === 'items' ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span className="font-semibold">Items</span>
                </div>
                {itemsExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              {/* Items Submenu */}
              {itemsExpanded && (
                <div className="mt-0.5 ml-4 pl-3 border-l border-slate-700/60 space-y-0.5 animate-in fade-in duration-150">
                  {itemsSubmenuItems.map((sub) => {
                    const isSelected = activeTab === 'items' && itemsSubTab === sub.id;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => handleSelectItemsSubItem(sub.id)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-md text-[11px] transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#25324e] text-white font-semibold shadow-xs'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                        }`}
                      >
                        <span className="truncate">{sub.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sales (Accordion with Chevron) */}
            <div>
              <button
                onClick={() => {
                  setSalesExpanded(!salesExpanded);
                  setActiveTab('sales');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'sales'
                    ? 'text-white' 
                    : 'hover:bg-slate-800/60 text-slate-300 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Tag className={`w-4 h-4 ${activeTab === 'sales' ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span className="font-semibold">Sales</span>
                </div>
                {salesExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              {/* Submenu under Sales matching MyBillBook */}
              {salesExpanded && (
                <div className="space-y-0.5 my-1">
                  {salesSubmenuItems.map((sub) => {
                    const isSubActive = activeTab === 'sales' && salesSubTab === sub.id;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => handleSelectSalesSubItem(sub.id)}
                        className={`w-full flex items-center justify-between pl-8 pr-3 py-2 rounded-xl text-xs transition-all ${
                          isSubActive 
                            ? 'bg-[#25324e] text-white font-semibold shadow-xs' 
                            : 'text-slate-300/80 hover:text-white hover:bg-slate-800/50'
                        }`}
                      >
                        <span className="truncate">{sub.label}</span>
                        {sub.hasAiBadge && (
                          <span className="inline-flex items-center space-x-0.5 bg-[#ea580c] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-xs">
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>AI</span>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Purchases (Accordion with Chevron) matching MyBillBook screenshot */}
            <div>
              <button
                onClick={() => {
                  setPurchasesExpanded(!purchasesExpanded);
                  setActiveTab('purchases');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'purchases'
                    ? 'text-white' 
                    : 'hover:bg-slate-800/60 text-slate-300 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <ShoppingBag className={`w-4 h-4 ${activeTab === 'purchases' ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span className="font-semibold">Purchases</span>
                </div>
                {purchasesExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              {/* Submenu under Purchases matching MyBillBook screenshot */}
              {purchasesExpanded && (
                <div className="space-y-0.5 my-1">
                  {purchasesSubmenuItems.map((sub) => {
                    const isSubActive = activeTab === 'purchases' && purchasesSubTab === sub.id;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => handleSelectPurchasesSubItem(sub.id)}
                        className={`w-full flex items-center justify-between pl-8 pr-3 py-2 rounded-xl text-xs transition-all ${
                          isSubActive 
                            ? 'bg-[#25324e] text-white font-semibold shadow-xs' 
                            : 'text-slate-300/80 hover:text-white hover:bg-slate-800/50'
                        }`}
                      >
                        <span className="truncate">{sub.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Reports */}
            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'reports' 
                  ? 'bg-[#232f4b] text-white shadow-xs font-semibold' 
                  : 'hover:bg-slate-800/60 text-slate-300 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <BarChart3 className={`w-4 h-4 ${activeTab === 'reports' ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>Reports</span>
              </div>
            </button>
          </div>
        </div>

        {/* ACCOUNTING SOLUTIONS Section matching screenshot */}
        <div>
          <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            ACCOUNTING SOLUTIONS
          </div>
          <div className="space-y-0.5">
            <button
              onClick={() => setActiveTab('cash-bank')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'cash-bank' 
                  ? 'bg-[#232f4b] text-white shadow-xs font-semibold' 
                  : 'hover:bg-slate-800/60 text-slate-300 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Building2 className={`w-4 h-4 ${activeTab === 'cash-bank' ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>Cash & Bank</span>
              </div>
            </button>

            {/* Scroll for more options pill matching screenshot */}
            <div className="pt-1.5 px-3">
              <button
                onClick={() => setShowMoreAccounting(!showMoreAccounting)}
                className="w-full py-1 px-2.5 rounded-full bg-[#1e293b]/80 hover:bg-[#1e293b] text-[10px] font-semibold text-slate-300 flex items-center justify-center space-x-1 shadow-2xs border border-slate-700/40 transition"
              >
                <span>Scroll for more options</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showMoreAccounting ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {showMoreAccounting && (
              <div className="space-y-0.5 pt-1.5 animate-in fade-in duration-150">
                <button
                  onClick={() => setActiveTab('e-invoicing')}
                  className="w-full flex items-center space-x-3 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800/50"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
                  <span>E-Invoicing</span>
                </button>
                <button
                  onClick={() => setActiveTab('automated-bills')}
                  className="w-full flex items-center space-x-3 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800/50"
                >
                  <Repeat className="w-3.5 h-3.5 text-slate-500" />
                  <span>Automated Bills</span>
                </button>
                <button
                  onClick={() => setActiveTab('pos-billing')}
                  className="w-full flex items-center space-x-3 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800/50"
                >
                  <ScanLine className="w-3.5 h-3.5 text-slate-500" />
                  <span>POS Billing</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Bottom Pinned Items: User Session, Settings & Security Badges */}
      <div className="p-3 border-t border-slate-800/80 bg-[#0d131f] space-y-2">
        {/* User Session Switcher Box */}
        <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center space-x-2 overflow-hidden min-w-0">
            <div className={`w-7 h-7 rounded-lg font-bold flex items-center justify-center text-xs text-white shrink-0 ${
              currentUser?.is_admin 
                ? 'bg-amber-600' 
                : ((currentUser?.role || '').toLowerCase().includes('account') ? 'bg-purple-600' : 'bg-indigo-600')
            }`}>
              {currentUser?.is_admin ? '👑' : (currentUser?.name?.charAt(0).toUpperCase() || 'U')}
            </div>
            <div className="overflow-hidden min-w-0">
              <div className="text-xs font-bold text-white truncate">{currentUser?.name || 'Admin'}</div>
              <div className="text-[10px] text-slate-400 truncate">
                {currentUser?.is_admin ? 'Owner / Admin' : `${currentUser?.role || 'Staff'} • ${currentUser?.staff_code}`}
              </div>
            </div>
          </div>
          <button
            onClick={onOpenLoginModal}
            title="Switch Staff / Login (लॉगिन बदलें)"
            className="p-1 rounded-md bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white transition text-[10px] font-bold px-1.5 shrink-0"
          >
            स्विच
          </button>
        </div>

        <button
          onClick={() => setActiveTab('settings')}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'settings' 
              ? 'bg-[#232f4b] text-white shadow-xs font-semibold' 
              : 'hover:bg-slate-800/60 text-slate-300 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>Settings</span>
        </button>

        <div className="flex items-center justify-center space-x-3 text-[10px] text-slate-400 pt-1">
          <div className="flex items-center space-x-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>100% Secure</span>
          </div>
          <span>•</span>
          <div className="flex items-center space-x-1">
            <Award className="w-3 h-3 text-blue-400" />
            <span>ISO Certified</span>
          </div>
        </div>
      </div>
    </aside>

    {/* Create New Business Modal from Sidebar */}
    <CreateBusinessModal
      isOpen={isCreateBusinessModalOpen}
      onClose={() => setIsCreateBusinessModalOpen(false)}
      onCompanyCreated={() => {
        fetchCompanies();
        if (onRefreshCompany) onRefreshCompany();
        if (onRefreshDashboard) onRefreshDashboard();
      }}
    />

    {/* Edit Business Name & Details Modal from Sidebar */}
    <EditBusinessModal
      isOpen={isEditBusinessModalOpen}
      company={companyToEdit || company}
      onClose={() => setIsEditBusinessModalOpen(false)}
      onUpdated={(updated) => {
        fetchCompanies();
        if (onRefreshCompany) onRefreshCompany();
        if (onRefreshDashboard) onRefreshDashboard();
      }}
    />
    </>
  );
}
