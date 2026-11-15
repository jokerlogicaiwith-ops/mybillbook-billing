import React from 'react';
import { 
  Printer, 
  Megaphone, 
  Gift, 
  Users, 
  MessageCircle, 
  HelpCircle,
  RefreshCw,
  CheckCircle2,
  Smartphone,
  Download,
  Monitor,
  Menu
} from 'lucide-react';

export default function Header({ 
  title, 
  onRefresh, 
  isRefreshing, 
  onOpenInvoiceModal, 
  onSelectTab,
  currentUser,
  onOpenLoginModal,
  onToggleMobileSidebar
}) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center space-x-2 sm:space-x-3">
        {onToggleMobileSidebar && (
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            title="Open Menu"
            className="lg:hidden p-2 -ml-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition shrink-0 cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight truncate">{title}</h1>
        <div className="hidden sm:flex items-center px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold space-x-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Lifetime Active (No Renewal Required)</span>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <a 
          href="/vsrm-shop.apk"
          download="VSRM-Shop.apk"
          title="Direct Download & Install Android App (VSRM Shop APK)"
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-xs hover:shadow-md transition transform hover:scale-[1.02] mr-1"
        >
          <Smartphone className="w-4 h-4 text-emerald-200" />
          <span className="hidden md:inline">Android App</span>
          <span className="md:hidden">APK</span>
          <Download className="w-3.5 h-3.5 text-white" />
        </a>

        <a 
          href="/vsrm-shop-windows.zip"
          download="VSRM-Shop-Windows.zip"
          title="Download Windows PC Desktop Software (VSRM Shop .exe)"
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-xs hover:shadow-md transition transform hover:scale-[1.02] mr-1"
        >
          <Monitor className="w-4 h-4 text-blue-200" />
          <span className="hidden md:inline">Windows Software</span>
          <span className="md:hidden">PC .exe</span>
          <Download className="w-3.5 h-3.5 text-white" />
        </a>

        <button 
          title="Print POS / Thermal Receipt"
          onClick={() => onOpenInvoiceModal && onOpenInvoiceModal('Sales Invoices')}
          className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
        >
          <Printer className="w-5 h-5" />
        </button>

        <button 
          title="Announcements" 
          className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
        >
          <Megaphone className="w-5 h-5" />
        </button>

        <button 
          title="Offers & Rewards" 
          className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
        >
          <Gift className="w-5 h-5" />
        </button>

        <button 
          title="Manage Staff & Users" 
          onClick={() => onSelectTab && onSelectTab('staff')}
          className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
        >
          <Users className="w-5 h-5" />
        </button>

        <button 
          title="WhatsApp Support" 
          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
        >
          <MessageCircle className="w-5 h-5" />
        </button>

        <button 
          title="Help & Guides" 
          className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        {onRefresh && (
          <button 
            title="Refresh Data"
            onClick={onRefresh}
            className={`p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition ${isRefreshing ? 'animate-spin' : ''}`}
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        )}

        {/* User Account / Staff Login Badge */}
        <button
          onClick={onOpenLoginModal}
          title="Switch Staff / Accountant Login (स्टाफ लॉगिन / बदलें)"
          className="ml-2 flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50/60 hover:border-indigo-300 transition text-left shadow-2xs"
        >
          <div className={`w-7 h-7 rounded-lg font-bold flex items-center justify-center text-xs text-white shrink-0 ${
            currentUser?.is_admin 
              ? 'bg-amber-600' 
              : ((currentUser?.role || '').toLowerCase().includes('account') ? 'bg-purple-600' : 'bg-indigo-600')
          }`}>
            {currentUser?.is_admin ? '👑' : (currentUser?.name?.charAt(0).toUpperCase() || 'U')}
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-bold text-slate-900 leading-tight flex items-center space-x-1">
              <span className="truncate max-w-[110px]">{currentUser?.name || 'Admin'}</span>
              <span className="text-[10px] text-indigo-600 font-semibold">(लॉगिन)</span>
            </div>
            <div className="text-[10px] text-slate-500 leading-tight">
              {currentUser?.is_admin ? 'Owner / Admin' : `${currentUser?.role || 'Staff'} • ${currentUser?.commission_rate || 0}%`}
            </div>
          </div>
        </button>
      </div>
    </header>
  );
}
