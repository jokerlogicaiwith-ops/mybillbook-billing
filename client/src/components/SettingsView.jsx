import React, { useState, useEffect } from 'react';
import { 
  Save, 
  CheckCircle2, 
  Building, 
  Building2,
  ShieldCheck, 
  Upload, 
  Image as ImageIcon, 
  MessageSquare, 
  Calendar, 
  Keyboard, 
  Search, 
  Plus, 
  ExternalLink,
  ChevronDown,
  ArrowLeft,
  User,
  FileText,
  Printer,
  Users,
  Bell,
  Share2,
  Crown,
  Gift,
  HelpCircle,
  LogOut,
  Check,
  AlertCircle
} from 'lucide-react';
import CreateBusinessModal from './CreateBusinessModal';

export default function SettingsView({ 
  company, 
  onSaveCompany, 
  onBackToDashboard,
  onNavigateTab 
}) {
  const [formData, setFormData] = useState({
    name: 'VSRM COMPUTER CLASSES',
    phone: '8936863035',
    email: 'vsrmcomputerclasses@gmail.com',
    billing_address: 'Near Kashipur Chowk Samastipur 848101',
    address: 'Near Kashipur Chowk Samastipur 848101',
    state: 'Bihar',
    pincode: '848101',
    city: 'SAMASTIPUR',
    is_gst_registered: true,
    gstin: '10ABFCA4659J1ZQ',
    business_type: 'Retailer, Wholesaler, Distributor, Manufacturer, Services',
    industry_type: 'Education-Schooling/Coaching',
    registration_type: 'Proprietorship',
    enable_einvoicing: false,
    website: 'vsrm.shop',
    upi_id: '8936863035@upi',
    tagline: 'Professional Computer & IT Training Institute',
    terms: '1. Fees / Goods once sold will not be taken back.\n2. Invoices are subject to Samastipur jurisdiction.'
  });

  const [saved, setSaved] = useState(false);
  const [activeDetailKey, setActiveDetailKey] = useState('Website');
  const [activeDetailVal, setActiveDetailVal] = useState('vsrm.shop');
  const [activeSettingsMenu, setActiveSettingsMenu] = useState('manage-business');

  // Multi-company switcher states
  const [companiesList, setCompaniesList] = useState([]);
  const [companySwitcherOpen, setCompanySwitcherOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
      console.error('Error fetching companies:', err);
    }
  };

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || 'VSRM COMPUTER CLASSES',
        phone: company.phone || '8936863035',
        email: company.email || 'vsrmcomputerclasses@gmail.com',
        billing_address: company.billing_address || company.address || 'Near Kashipur Chowk Samastipur 848101',
        address: company.address || company.billing_address || 'Near Kashipur Chowk Samastipur 848101',
        state: company.state || 'Bihar',
        pincode: company.pincode || '848101',
        city: company.city || 'SAMASTIPUR',
        is_gst_registered: company.is_gst_registered !== undefined ? Boolean(company.is_gst_registered) : true,
        gstin: company.gstin || '10ABFCA4659J1ZQ',
        business_type: company.business_type || 'Retailer, Wholesaler, Distributor, Manufacturer, Services',
        industry_type: company.industry_type || 'Education-Schooling/Coaching',
        registration_type: company.registration_type || 'Proprietorship',
        enable_einvoicing: Boolean(company.enable_einvoicing),
        website: company.website || 'vsrm.shop',
        upi_id: company.upi_id || '8936863035@upi',
        tagline: company.tagline || 'Professional Computer & IT Training Institute',
        terms: company.terms || '1. Fees / Goods once sold will not be taken back.\n2. Invoices are subject to Samastipur jurisdiction.'
      });
      if (company.website) {
        setActiveDetailVal(company.website);
      }
    }
  }, [company]);

  const handleSwitchCompany = async (companyId) => {
    try {
      const res = await fetch(`/api/companies/${companyId}/activate`, {
        method: 'PUT'
      });
      const data = await res.json();
      if (data.success) {
        setCompanySwitcherOpen(false);
        fetchCompanies();
        if (onSaveCompany) onSaveCompany();
      }
    } catch (err) {
      console.error('Error switching company:', err);
      alert('Business switch karne mein error aayi');
    }
  };

  const handleCompanyCreated = (newCompany) => {
    fetchCompanies();
    if (onSaveCompany) onSaveCompany();
    setSaved(true);
    setTimeout(() => setSaved(false), 3500);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      const payload = {
        ...formData,
        address: formData.billing_address || formData.address,
        website: activeDetailVal
      };
      const res = await fetch('/api/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3500);
        fetchCompanies();
        if (onSaveCompany) onSaveCompany();
      }
    } catch (err) {
      console.error(err);
      alert('Settings save karne mein error aayi');
    }
  };

  const indianStates = [
    'Bihar', 'Delhi', 'Uttar Pradesh', 'Jharkhand', 'West Bengal',
    'Maharashtra', 'Gujarat', 'Rajasthan', 'Punjab', 'Haryana',
    'Madhya Pradesh', 'Odisha', 'Tamil Nadu', 'Karnataka', 'Andhra Pradesh',
    'Telangana', 'Kerala', 'Assam', 'Uttarakhand', 'Himachal Pradesh',
    'Jammu & Kashmir', 'Goa', 'Chhattisgarh'
  ];

  const settingsNavItems = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'manage-business', label: 'Manage Business', icon: Building2 },
    { id: 'invoice-settings', label: 'Invoice Settings', icon: FileText },
    { id: 'print-settings', label: 'Print Settings', icon: Printer, isNew: true },
    { id: 'manage-users', label: 'Manage Users', icon: Users, tabLink: 'staff' },
    { id: 'reminders', label: 'Reminders', icon: Bell },
    { id: 'ca-reports', label: 'CA Reports Sharing', icon: Share2 },
    { id: 'pricing', label: 'Pricing', icon: Crown },
    { id: 'refer-earn', label: 'Refer & Earn', icon: Gift },
    { id: 'help-support', label: 'Help And Support', icon: HelpCircle },
    { id: 'logout', label: 'Logout', icon: LogOut, isDanger: true }
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      
      {/* ========================================================= */}
      {/* LEFT: Dedicated MyBillBook Settings Sidebar matching screenshot */}
      {/* ========================================================= */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 select-none sticky top-0 h-screen z-20">
        
        {/* Business Profile Card with Dropdown Switcher */}
        <div className="p-4 border-b border-slate-200 relative">
          <div 
            onClick={() => setCompanySwitcherOpen(!companySwitcherOpen)}
            className="flex items-center space-x-3 cursor-pointer p-1.5 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200"
          >
            <div className="w-10 h-10 rounded-full bg-[#1d4ed8] text-white font-bold flex items-center justify-center text-lg shadow-xs shrink-0">
              {formData.name ? formData.name.charAt(0).toUpperCase() : 'V'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-slate-900 truncate">
                  {formData.name}
                </h2>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform shrink-0 ml-1 ${companySwitcherOpen ? 'rotate-180' : ''}`} />
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                {formData.phone || '8936863035'}
              </p>
            </div>
          </div>

          {/* Business Switcher Dropdown */}
          {companySwitcherOpen && (
            <div className="absolute top-16 left-3 right-3 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Your Businesses</span>
                <span className="text-[10px] font-semibold text-slate-500">{companiesList.length} Businesses</span>
              </div>

              <div className="max-h-48 overflow-y-auto py-1">
                {companiesList.map((c) => {
                  const isActive = c.is_active === 1 || c.name === formData.name;
                  return (
                    <button
                      key={c.id}
                      onClick={() => handleSwitchCompany(c.id)}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-blue-50/70 transition ${
                        isActive ? 'bg-blue-50 font-bold text-blue-700' : 'text-slate-700'
                      }`}
                    >
                      <div className="truncate mr-2">
                        <div className="truncate text-xs">{c.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{c.phone}</div>
                      </div>
                      {isActive && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="pt-1 border-t border-slate-100 px-2">
                <button
                  type="button"
                  onClick={() => {
                    setCompanySwitcherOpen(false);
                    setIsCreateModalOpen(true);
                  }}
                  className="w-full py-2 px-3 bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold text-xs rounded-lg flex items-center justify-center space-x-1.5 transition shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>+ Create New Business</span>
                </button>
              </div>
            </div>
          )}

          {/* Back to Dashboard Button matching Screenshot */}
          <button
            type="button"
            onClick={onBackToDashboard || (() => window.history.back())}
            className="w-full mt-3 py-2 px-3 border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition flex items-center justify-center space-x-2 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-600 stroke-[2.5]" />
            <span>Back to Dashboard</span>
          </button>
        </div>

        {/* Settings Navigation Menu Items matching Screenshot */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar text-xs">
          {settingsNavItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeSettingsMenu === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.tabLink && onNavigateTab) {
                    onNavigateTab(item.tabLink);
                  } else {
                    setActiveSettingsMenu(item.id);
                  }
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-colors ${
                  isSelected 
                    ? 'bg-[#eeeffe] text-[#5c5be5] font-bold shadow-2xs' 
                    : item.isDanger
                      ? 'text-red-600 hover:bg-red-50 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-[#5c5be5]' : item.isDanger ? 'text-red-500' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.isNew && (
                  <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-sm">
                    New
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer info matching Screenshot */}
        <div className="p-4 border-t border-slate-200 text-center text-[10px] text-slate-400 space-y-1 bg-slate-50/50">
          <div className="font-medium text-slate-500">App Version : 9.25.1</div>
          <div className="flex items-center justify-center space-x-1.5 text-slate-400">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span>100% Secure • ISO Certified</span>
          </div>
          <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider pt-0.5">
            myBillBook by FloBiz
          </div>
        </div>

      </aside>

      {/* ========================================================= */}
      {/* RIGHT: Top Header + Two Column Form Area matching screenshot */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        
        {/* Top Header Bar matching Screenshot */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-10 shadow-2xs">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Business Settings</h1>
            <p className="text-xs text-slate-500 font-medium">Edit your Company Settings And Information</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Create new business button matching Screenshot (Orange) */}
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-bold rounded-lg transition shadow-xs flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Create new business</span>
            </button>

            {/* Keyboard shortcut icon */}
            <button
              type="button"
              title="Shortcuts"
              className="p-2 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg transition"
            >
              <Keyboard className="w-4 h-4" />
            </button>

            {/* Chat Support */}
            <button
              type="button"
              onClick={() => alert('Support helpline: 8936863035')}
              className="px-3 py-2 border border-blue-200 hover:bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg transition flex items-center space-x-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat Support</span>
            </button>

            {/* Close Financial Year */}
            <button
              type="button"
              onClick={() => alert('Financial Year currently active: 2026-2027')}
              className="px-3 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition flex items-center space-x-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Close Financial Year</span>
            </button>

            {/* Cancel */}
            <button
              type="button"
              onClick={onBackToDashboard || (() => window.history.back())}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition"
            >
              Cancel
            </button>

            {/* Save Changes (Purple) */}
            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2 bg-[#5c5be5] hover:bg-[#4d4cc9] text-white text-xs font-bold rounded-lg transition shadow-xs flex items-center space-x-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>

        {/* Notification Toast */}
        {saved && (
          <div className="max-w-6xl mx-auto px-6 pt-4 w-full">
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 animate-in fade-in duration-200 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
              <span>Company settings aur address safaltapoorvak save ho gaye hain! All bills & invoices updated.</span>
            </div>
          </div>
        )}

        {/* Form Body: Two Columns */}
        <form onSubmit={handleSubmit} className="max-w-6xl w-full mx-auto px-6 py-6 flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Business details, Logo, Address, GSTIN (7 cols) */}
            <div className="lg:col-span-7 space-y-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
              
              {/* Logo + Business Name Row */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                {/* Upload Logo Box */}
                <div className="sm:col-span-4">
                  <label className="border-2 border-dashed border-blue-400/80 hover:border-blue-600 bg-blue-50/20 hover:bg-blue-50/40 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition min-h-[110px] group">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                      <ImageIcon className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <span className="text-xs font-bold text-blue-700">Upload Logo</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 font-medium">PNG/JPG, max 5 MB.</span>
                    <input type="file" accept="image/*" className="hidden" onChange={() => alert('Logo uploaded successfully!')} />
                  </label>
                </div>

                {/* Business Name */}
                <div className="sm:col-span-8">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Business Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter business name"
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Phone & Email Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs font-mono font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    placeholder="e.g. 8936863035"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company E-Mail
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter company e-mail"
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Billing Address Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Billing Address
                </label>
                <textarea
                  rows="3"
                  value={formData.billing_address}
                  onChange={(e) => setFormData({ ...formData, billing_address: e.target.value, address: e.target.value })}
                  placeholder="Enter complete company billing address"
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs leading-relaxed text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                ></textarea>
              </div>

              {/* State and Pincode Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    State
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                      <Search className="w-3.5 h-3.5" />
                    </div>
                    <select
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg pl-8 pr-3 py-2.5 text-xs bg-white text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    >
                      {indianStates.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    placeholder="e.g. 848101"
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* City Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. SAMASTIPUR"
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs uppercase font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Are you GST Registered? Radio Buttons */}
              <div className="pt-1">
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Are you GST Registered?
                </label>
                <div className="flex items-center space-x-6">
                  <label className="inline-flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="is_gst_registered"
                      checked={formData.is_gst_registered === true}
                      onChange={() => setFormData({ ...formData, is_gst_registered: true })}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs font-semibold text-slate-800">Yes</span>
                  </label>

                  <label className="inline-flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="is_gst_registered"
                      checked={formData.is_gst_registered === false}
                      onChange={() => setFormData({ ...formData, is_gst_registered: false })}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs font-semibold text-slate-800">No</span>
                  </label>
                </div>
              </div>

              {/* GSTIN Field */}
              {formData.is_gst_registered && (
                <div className="animate-in fade-in duration-150">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    GSTIN <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required={formData.is_gst_registered}
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                    placeholder="e.g. 10ABFCA4659J1ZQ"
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs font-mono uppercase font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              )}

              {/* Enable e-Invoicing Toggle */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-800">Enable e-Invoicing</span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-sm">
                    New
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, enable_einvoicing: !formData.enable_einvoicing })}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer ${
                    formData.enable_einvoicing ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'
                  }`}
                >
                  <span className="bg-white w-4 h-4 rounded-full shadow-md transform transition"></span>
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: Business Type, Signature, Registration, Additional Details (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
                
                {/* Business Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Business Type (Select multiple, if applicable)
                  </label>
                  <div className="relative">
                    <select
                      value={formData.business_type}
                      onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-xs bg-white text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden truncate"
                    >
                      <option value="Retailer, Wholesaler, Distributor, Manufacturer, Services">
                        Retailer, Wholesaler, Distributor, Manufacturer, Services
                      </option>
                      <option value="Retailer">Retailer</option>
                      <option value="Wholesaler">Wholesaler</option>
                      <option value="Distributor">Distributor</option>
                      <option value="Manufacturer">Manufacturer</option>
                      <option value="Services">Services</option>
                    </select>
                  </div>
                </div>

                {/* Industry Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Industry Type
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                      <Search className="w-3.5 h-3.5" />
                    </div>
                    <select
                      value={formData.industry_type}
                      onChange={(e) => setFormData({ ...formData, industry_type: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg pl-8 pr-3 py-2.5 text-xs bg-white text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    >
                      <option value="Education-Schooling/Coaching">Education-Schooling/Coaching</option>
                      <option value="Quality Feeds & Engineering Solutions">Quality Feeds & Engineering Solutions</option>
                      <option value="Agriculture & Farming">Agriculture & Farming</option>
                      <option value="Automobile & Parts">Automobile & Parts</option>
                      <option value="Electronics & Hardware">Electronics & Hardware</option>
                      <option value="FMCG & Grocery">FMCG & Grocery</option>
                      <option value="Textile & Garments">Textile & Garments</option>
                      <option value="Pharmaceuticals">Pharmaceuticals</option>
                      <option value="General Trading">General Trading</option>
                    </select>
                  </div>
                </div>

                {/* Business Registration Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Business Registration Type
                  </label>
                  <select
                    value={formData.registration_type}
                    onChange={(e) => setFormData({ ...formData, registration_type: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs bg-white text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="">Select</option>
                    <option value="Proprietorship">Proprietorship</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Private Limited Company">Private Limited Company</option>
                    <option value="Limited Liability Partnership (LLP)">Limited Liability Partnership (LLP)</option>
                    <option value="Public Limited Company">Public Limited Company</option>
                    <option value="Trust / Society / NGO">Trust / Society / NGO</option>
                  </select>

                  {!formData.registration_type && (
                    <p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center space-x-1">
                      <span>Business registration type is not selected</span>
                    </p>
                  )}
                </div>

                {/* Note Banner */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-center">
                  <p className="text-[11px] text-slate-600 font-medium">
                    <span className="font-bold">Note:</span> Terms & Conditions and Signature added below will be shown on your Invoices
                  </p>
                </div>

                {/* Signature Box */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Signature
                  </label>
                  <label className="border-2 border-dashed border-blue-400/80 hover:border-blue-600 bg-white hover:bg-blue-50/20 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition group">
                    <span className="text-xs font-bold text-blue-600 group-hover:underline flex items-center space-x-1">
                      <Plus className="w-3.5 h-3.5 text-blue-600 stroke-[3]" />
                      <span>Add Signature</span>
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={() => alert('Signature uploaded successfully!')} />
                  </label>
                </div>

                {/* Add Business Details Box */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-900">Add Business Details</h4>
                  <p className="text-[11px] text-slate-500">
                    Add additional business information such as MSME number, Website etc.
                  </p>

                  <div className="flex items-center space-x-2 pt-1">
                    <select
                      value={activeDetailKey}
                      onChange={(e) => setActiveDetailKey(e.target.value)}
                      className="w-28 border border-slate-300 rounded-lg p-2 text-xs bg-white text-slate-800 font-semibold focus:outline-hidden"
                    >
                      <option value="Website">Website</option>
                      <option value="MSME">MSME</option>
                      <option value="CIN">CIN</option>
                      <option value="PAN">PAN</option>
                    </select>

                    <span className="text-slate-400 font-bold">=</span>

                    <input
                      type="text"
                      value={activeDetailVal}
                      onChange={(e) => setActiveDetailVal(e.target.value)}
                      placeholder="www.website.com"
                      className="flex-1 border border-slate-300 rounded-lg p-2 text-xs bg-white text-slate-800 focus:outline-hidden"
                    />

                    <button
                      type="button"
                      onClick={() => alert(`Added ${activeDetailKey}: ${activeDetailVal}`)}
                      className="px-4 py-2 bg-[#5c5be5] hover:bg-[#4d4cc9] text-white text-xs font-bold rounded-lg transition shadow-2xs"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* UPI ID for QR Code & Terms */}
                <div className="pt-2 border-t border-slate-200 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      UPI ID (For Instant Invoice Payment QR Code)
                    </label>
                    <input
                      type="text"
                      value={formData.upi_id}
                      onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
                      placeholder="e.g. 8936863035@upi"
                      className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold text-blue-700 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Invoice Terms & Conditions
                    </label>
                    <textarea
                      rows="2"
                      value={formData.terms}
                      onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-700 focus:outline-hidden"
                    ></textarea>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </form>
      </div>

      {/* Create New Business Modal */}
      <CreateBusinessModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCompanyCreated={handleCompanyCreated}
      />
    </div>
  );
}
