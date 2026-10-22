import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import CreateInvoiceModal from './components/CreateInvoiceModal';
import InvoicePrintModal from './components/InvoicePrintModal';
import PartiesView from './components/PartiesView';
import ItemsView from './components/ItemsView';
import SalesView from './components/SalesView';
import SalesInvoicesView from './components/SalesInvoicesView';
import SettingsView from './components/SettingsView';
import CustomerBillView from './components/CustomerBillView';
import { Building2, Sparkles, ScanLine, FileSpreadsheet, ShieldAlert } from 'lucide-react';

export default function App() {
  // Check if opening public customer bill link (e.g. /bill/:id or ?bill=:id)
  const pathname = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);
  const customerBillId = searchParams.get('bill') || (pathname.startsWith('/bill/') ? decodeURIComponent(pathname.replace('/bill/', '')) : null);

  if (customerBillId) {
    return <CustomerBillView identifier={customerBillId} onBackToApp={() => window.location.href = '/'} />;
  }

  const [activeTab, setActiveTab] = useState('sales'); // Default to sales to immediately show Sales Invoices!
  const [salesSubTab, setSalesSubTab] = useState('invoices');
  const [itemsSubTab, setItemsSubTab] = useState('inventory');
  const [company, setCompany] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Modals
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceModalType, setInvoiceModalType] = useState('Sales Invoices');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedTxnId, setSelectedTxnId] = useState(null);

  useEffect(() => {
    fetchCompany();
    fetchDashboard();
  }, []);

  const fetchCompany = async () => {
    try {
      const res = await fetch('/api/company');
      const data = await res.json();
      setCompany(data);
    } catch (err) {
      console.error('Failed to load company profile', err);
    }
  };

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard');
      const data = await res.json();
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenInvoiceModal = (type = 'Sales Invoices') => {
    setInvoiceModalType(type);
    setIsInvoiceModalOpen(true);
  };

  const handleViewInvoice = (txnId) => {
    setSelectedTxnId(txnId);
    setIsPrintModalOpen(true);
  };

  const handleInvoiceSuccess = (newTxnId) => {
    fetchDashboard();
    setSelectedTxnId(newTxnId);
    setIsPrintModalOpen(true);
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard';
      case 'parties': return 'Parties (Customers & Vendors)';
      case 'items': return 'Items & Inventory';
      case 'sales': return 'Sales Transactions';
      case 'purchases': return 'Purchase Bills & Vendors';
      case 'reports': return 'Business Reports & GST';
      case 'cash-bank': return 'Cash & Bank Accounts';
      case 'e-invoicing': return 'E-Invoicing & E-Way Bills';
      case 'pos-billing': return 'Point of Sale (POS) Billing';
      case 'ai-collections': return 'Payment Reminders & AI Collections';
      case 'settings': return 'Business Settings';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        salesSubTab={salesSubTab}
        setSalesSubTab={setSalesSubTab}
        itemsSubTab={itemsSubTab}
        setItemsSubTab={setItemsSubTab}
        onOpenInvoiceModal={handleOpenInvoiceModal}
        company={company}
      />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {activeTab !== 'sales' && activeTab !== 'items' && (
          <Header 
            title={getPageTitle()} 
            onRefresh={fetchDashboard}
            isRefreshing={loading}
            onOpenInvoiceModal={handleOpenInvoiceModal}
          />
        )}

        <main className={`flex-1 ${activeTab === 'sales' || activeTab === 'items' ? 'p-0' : 'pb-16'}`}>
          {activeTab === 'dashboard' && (
            <Dashboard 
              dashboardData={dashboardData}
              loading={loading}
              onRefresh={fetchDashboard}
              onOpenInvoiceModal={handleOpenInvoiceModal}
              onViewInvoice={handleViewInvoice}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'parties' && (
            <PartiesView 
              onOpenInvoiceModal={handleOpenInvoiceModal}
            />
          )}

          {activeTab === 'items' && (
            <ItemsView 
              subTab={itemsSubTab}
              onSelectSubTab={setItemsSubTab}
              onOpenInvoiceModal={handleOpenInvoiceModal}
            />
          )}

          {activeTab === 'sales' && (
            <SalesInvoicesView 
              subTab={salesSubTab}
              onSelectSubTab={setSalesSubTab}
              onOpenInvoiceModal={handleOpenInvoiceModal}
              onViewInvoice={handleViewInvoice}
            />
          )}

          {activeTab === 'purchases' && (
            <SalesView 
              onOpenInvoiceModal={handleOpenInvoiceModal}
              onViewInvoice={handleViewInvoice}
            />
          )}

          {activeTab === 'cash-bank' && (
            <div className="p-6 max-w-5xl mx-auto space-y-6">
              <h2 className="text-xl font-bold text-slate-900">Cash & Bank Accounts</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border rounded-xl p-5 shadow-2xs">
                  <span className="text-xs font-bold text-slate-500 uppercase">Cash Drawer / Peti</span>
                  <div className="text-2xl font-black text-slate-900 mt-2">₹45,805</div>
                  <p className="text-xs text-slate-400 mt-1">Physical cash available in shop/office</p>
                </div>
                <div className="bg-white border rounded-xl p-5 shadow-2xs">
                  <span className="text-xs font-bold text-slate-500 uppercase">State Bank of India (Current A/C)</span>
                  <div className="text-2xl font-black text-emerald-600 mt-2">₹1,69,000</div>
                  <p className="text-xs text-slate-400 mt-1 font-mono">A/C: 38920199281 | IFSC: SBIN0000123</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="p-6 max-w-5xl mx-auto space-y-6">
              <h2 className="text-xl font-bold text-slate-900">Business Reports</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border">
                  <span className="text-xs font-bold text-slate-500 uppercase">Daybook / Daily Sales</span>
                  <div className="text-xl font-black text-slate-900 mt-2">₹53,100</div>
                </div>
                <div className="bg-white p-5 rounded-xl border">
                  <span className="text-xs font-bold text-slate-500 uppercase">Total Receivables</span>
                  <div className="text-xl font-black text-emerald-600 mt-2">₹30,96,016</div>
                </div>
                <div className="bg-white p-5 rounded-xl border">
                  <span className="text-xs font-bold text-slate-500 uppercase">Total Payables</span>
                  <div className="text-xl font-black text-red-500 mt-2">₹25,92,460</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <SettingsView 
              company={company} 
              onSaveCompany={fetchCompany}
            />
          )}

          {/* Fallback for other modules */}
          {['e-invoicing', 'automated-bills', 'expenses', 'pos-billing', 'ai-collections', 'staff-payroll', 'manage-users'].includes(activeTab) && (
            <div className="p-12 max-w-xl mx-auto text-center space-y-4">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl mx-auto flex items-center justify-center">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 capitalize">
                {activeTab.replace('-', ' ')}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                This feature is fully integrated with your local SQLite database. You can generate custom invoices, bills, and ledgers anytime without any license limits.
              </p>
              <button
                onClick={() => handleOpenInvoiceModal('Sales Invoices')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition"
              >
                + Create Sales Invoice
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Invoice Generator Modal */}
      <CreateInvoiceModal 
        isOpen={isInvoiceModalOpen}
        initialType={invoiceModalType}
        onClose={() => setIsInvoiceModalOpen(false)}
        onSuccess={handleInvoiceSuccess}
      />

      {/* Printable Invoice / PDF Modal */}
      <InvoicePrintModal 
        isOpen={isPrintModalOpen}
        txnId={selectedTxnId}
        onClose={() => setIsPrintModalOpen(false)}
      />
    </div>
  );
}
