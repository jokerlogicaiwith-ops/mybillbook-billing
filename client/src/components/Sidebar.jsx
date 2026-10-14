import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Boxes, 
  TrendingUp, 
  ShoppingBag, 
  BarChart3, 
  Building2, 
  FileSpreadsheet, 
  Repeat, 
  Receipt, 
  ScanLine, 
  Sparkles, 
  CalendarCheck, 
  UserCheck, 
  Settings, 
  Plus, 
  ChevronRight, 
  ChevronDown,
  ShieldCheck,
  Award
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, onOpenInvoiceModal, company }) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const menuItemsGeneral = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'parties', label: 'Parties', icon: Users, hasArrow: true },
    { id: 'items', label: 'Items', icon: Boxes, hasArrow: true },
    { id: 'sales', label: 'Sales', icon: TrendingUp, hasArrow: true },
    { id: 'purchases', label: 'Purchases', icon: ShoppingBag, hasArrow: true },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ];

  const menuItemsAccounting = [
    { id: 'cash-bank', label: 'Cash & Bank', icon: Building2 },
    { id: 'e-invoicing', label: 'E-Invoicing', icon: FileSpreadsheet },
    { id: 'automated-bills', label: 'Automated Bills', icon: Repeat },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'pos-billing', label: 'POS Billing', icon: ScanLine },
  ];

  const menuItemsTools = [
    { id: 'ai-collections', label: 'AI Collections', icon: Sparkles, badge: 'New' },
    { id: 'staff-payroll', label: 'Staff Attendance & Payroll', icon: CalendarCheck },
    { id: 'manage-users', label: 'Manage Users', icon: UserCheck },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#111927] text-slate-300 flex flex-col h-screen fixed left-0 top-0 select-none border-r border-slate-800 z-30">
      {/* Business Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-lg shadow-sm">
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

      {/* Main Action Button */}
      <div className="p-3 relative">
        <div className="flex rounded-lg shadow-sm overflow-hidden bg-slate-100 hover:bg-white transition-colors">
          <button 
            onClick={() => onOpenInvoiceModal('Sales Invoices')}
            className="flex-1 py-2.5 px-3 bg-white text-slate-900 font-semibold text-xs flex items-center justify-center space-x-1.5 hover:bg-slate-50 transition border-r border-slate-200"
          >
            <Plus className="w-4 h-4 text-blue-600 stroke-[2.5]" />
            <span>Create Sales Invoice</span>
          </button>
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="px-2 bg-white text-slate-700 hover:bg-slate-50 flex items-center justify-center"
          >
            <ChevronDown className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute top-14 left-3 right-3 bg-white text-slate-800 rounded-lg shadow-xl py-1 z-50 text-xs font-medium border border-slate-200 animate-in fade-in slide-in-from-top-1 duration-150">
            <button 
              onClick={() => { onOpenInvoiceModal('Sales Invoices'); setDropdownOpen(false); }}
              className="w-full text-left px-3 py-2 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-between"
            >
              <span>Sales Invoice</span>
              <span className="text-[10px] text-slate-400">Alt + S</span>
            </button>
            <button 
              onClick={() => { onOpenInvoiceModal('Quotation / Estimate'); setDropdownOpen(false); }}
              className="w-full text-left px-3 py-2 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-between"
            >
              <span>Quotation / Estimate</span>
              <span className="text-[10px] text-slate-400">Alt + Q</span>
            </button>
            <button 
              onClick={() => { onOpenInvoiceModal('Payment In'); setDropdownOpen(false); }}
              className="w-full text-left px-3 py-2 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-between"
            >
              <span>Payment In</span>
              <span className="text-[10px] text-slate-400">Alt + R</span>
            </button>
            <button 
              onClick={() => { onOpenInvoiceModal('Purchase Bills'); setDropdownOpen(false); }}
              className="w-full text-left px-3 py-2 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-between"
            >
              <span>Purchase Bill</span>
              <span className="text-[10px] text-slate-400">Alt + P</span>
            </button>
          </div>
        )}
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-4 py-1">
        {/* General */}
        <div>
          <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400/90 mb-1">
            General
          </div>
          <div className="space-y-0.5">
            {menuItemsGeneral.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive 
                      ? 'bg-[#21304d] text-white shadow-sm font-semibold' 
                      : 'hover:bg-slate-800/60 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.hasArrow && <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Accounting Solutions */}
        <div>
          <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400/90 mb-1">
            Accounting Solutions
          </div>
          <div className="space-y-0.5">
            {menuItemsAccounting.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive 
                      ? 'bg-[#21304d] text-white shadow-sm font-semibold' 
                      : 'hover:bg-slate-800/60 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Business Tools */}
        <div>
          <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400/90 mb-1">
            Business Tools
          </div>
          <div className="space-y-0.5">
            {menuItemsTools.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive 
                      ? 'bg-[#21304d] text-white shadow-sm font-semibold' 
                      : 'hover:bg-slate-800/60 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Trust Badges */}
      <div className="p-3 border-t border-slate-800/80 bg-[#0d131f] flex items-center justify-center space-x-4 text-[11px] text-slate-400 font-medium">
        <div className="flex items-center space-x-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>100% Secure</span>
        </div>
        <div className="flex items-center space-x-1">
          <Award className="w-3.5 h-3.5 text-blue-400" />
          <span>No Renewal</span>
        </div>
      </div>
    </aside>
  );
}
