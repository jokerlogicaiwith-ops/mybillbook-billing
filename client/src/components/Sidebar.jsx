import React, { useState } from 'react';
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
  ScanLine
} from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  onOpenInvoiceModal, 
  company,
  salesSubTab = 'invoices',
  setSalesSubTab,
  itemsSubTab = 'inventory',
  setItemsSubTab
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [salesExpanded, setSalesExpanded] = useState(true);
  const [itemsExpanded, setItemsExpanded] = useState(true);
  const [showMoreAccounting, setShowMoreAccounting] = useState(false);

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

  return (
    <aside className="w-64 bg-[#111625] text-slate-300 flex flex-col h-screen fixed left-0 top-0 select-none border-r border-slate-800/90 z-30 font-sans">
      {/* 1. Business Header matching screenshot */}
      <div className="p-4 border-b border-slate-800/60 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-[#1d4ed8] text-white font-bold flex items-center justify-center text-lg shadow-sm">
            {company?.name ? company.name.charAt(0) : 'A'}
          </div>
          <div className="overflow-hidden">
            <h2 className="font-semibold text-white text-sm tracking-wide truncate">
              {company?.name || 'APOORV'}
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              {company?.phone || '8130140936'}
            </p>
          </div>
        </div>
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

            {/* Purchases */}
            <button
              onClick={() => setActiveTab('purchases')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'purchases' 
                  ? 'bg-[#232f4b] text-white shadow-xs font-semibold' 
                  : 'hover:bg-slate-800/60 text-slate-300 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <ShoppingBag className={`w-4 h-4 ${activeTab === 'purchases' ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>Purchases</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>

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

      {/* 4. Bottom Pinned Items: Settings & Security Badges matching screenshot */}
      <div className="p-3 border-t border-slate-800/80 bg-[#0d131f] space-y-2">
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
  );
}
