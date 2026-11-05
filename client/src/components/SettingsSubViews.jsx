import React, { useState } from 'react';
import { 
  Printer, 
  Bell, 
  Share2, 
  Crown, 
  Gift, 
  HelpCircle, 
  User, 
  Check, 
  Copy, 
  Send, 
  Download, 
  Phone, 
  MessageSquare, 
  Mail, 
  Play, 
  CheckCircle2, 
  ShieldCheck, 
  Smartphone, 
  Save, 
  ChevronDown, 
  ChevronUp, 
  Lock, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

/* ========================================================================= */
/* 1. PRINT SETTINGS VIEW */
/* ========================================================================= */
export function PrintSettingsView({ company }) {
  const [printerType, setPrinterType] = useState('regular'); // 'regular' or 'thermal'
  const [paperSize, setPaperSize] = useState('A4');
  const [thermalWidth, setThermalWidth] = useState('3inch');
  const [orientation, setOrientation] = useState('portrait');
  const [margins, setMargins] = useState('standard');
  const [autoPrint, setAutoPrint] = useState(true);
  const [printLogo, setPrintLogo] = useState(true);
  const [printSignature, setPrintSignature] = useState(true);
  const [printCopies, setPrintCopies] = useState({
    original: true,
    transporter: true,
    supplier: true,
    eway: true
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f8fafc]">
      <div className="bg-white border-b border-slate-200 px-8 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Print Settings</h1>
            <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-sm">New</span>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Configure Thermal and Regular A4/A5 printer preferences and copies</p>
        </div>
        <div className="flex items-center space-x-3">
          {saved && (
            <span className="text-xs font-bold text-emerald-600 flex items-center space-x-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Saved!</span>
            </span>
          )}
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-[#5c5be5] hover:bg-[#4a49c9] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center space-x-1.5"
          >
            <Save className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      <div className="p-8 max-w-4xl mx-auto w-full space-y-6">
        {/* Printer Type Selector */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">1. Select Default Printer Type</h2>
          <div className="grid grid-cols-2 gap-4">
            <div
              onClick={() => setPrinterType('regular')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-center space-x-4 ${
                printerType === 'regular' ? 'border-[#5c5be5] bg-blue-50/30' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-[#5c5be5] flex items-center justify-center font-bold text-lg">
                <Printer className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Regular Laser / Inkjet</h3>
                <p className="text-xs text-slate-500">A4, A5 Full-page GST Tax Invoices & Reports</p>
              </div>
            </div>

            <div
              onClick={() => setPrinterType('thermal')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-center space-x-4 ${
                printerType === 'thermal' ? 'border-[#5c5be5] bg-blue-50/30' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg">
                <Printer className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Thermal POS Printer (POS Receipt)</h3>
                <p className="text-xs text-slate-500">2-inch (58mm), 3-inch (80mm) or 4-inch roll paper</p>
              </div>
            </div>
          </div>

          {printerType === 'thermal' && (
            <div className="pt-2 flex items-center space-x-4 text-xs font-semibold">
              <span className="text-slate-600">Thermal Roll Width:</span>
              {['2inch (58mm)', '3inch (80mm)', '4inch (100mm)'].map((size) => (
                <label key={size} className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="thermalWidth"
                    checked={thermalWidth === size}
                    onChange={() => setThermalWidth(size)}
                    className="text-[#5c5be5]"
                  />
                  <span>{size}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Copies Configuration */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">2. Default Print Copies</h2>
          <p className="text-xs text-slate-500">Select which copies to print automatically upon clicking Print</p>
          <div className="grid grid-cols-2 gap-3 text-xs font-medium text-slate-700">
            <label className="flex items-center space-x-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
              <input
                type="checkbox"
                checked={printCopies.original}
                onChange={(e) => setPrintCopies(prev => ({ ...prev, original: e.target.checked }))}
                className="w-4 h-4 rounded text-[#5c5be5]"
              />
              <span>Original for Recipient (Customer Copy)</span>
            </label>
            <label className="flex items-center space-x-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
              <input
                type="checkbox"
                checked={printCopies.transporter}
                onChange={(e) => setPrintCopies(prev => ({ ...prev, transporter: e.target.checked }))}
                className="w-4 h-4 rounded text-[#5c5be5]"
              />
              <span>Duplicate for Transporter (Vehicle Copy)</span>
            </label>
            <label className="flex items-center space-x-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
              <input
                type="checkbox"
                checked={printCopies.supplier}
                onChange={(e) => setPrintCopies(prev => ({ ...prev, supplier: e.target.checked }))}
                className="w-4 h-4 rounded text-[#5c5be5]"
              />
              <span>Triplicate for Supplier (Office Copy)</span>
            </label>
            <label className="flex items-center space-x-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
              <input
                type="checkbox"
                checked={printCopies.eway}
                onChange={(e) => setPrintCopies(prev => ({ ...prev, eway: e.target.checked }))}
                className="w-4 h-4 rounded text-[#5c5be5]"
              />
              <span className="font-bold text-emerald-800">E-Way Bill (Government Format with QR)</span>
            </label>
          </div>
        </div>

        {/* Automation Toggles */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">3. Print Automation & Branding</h2>
          <div className="space-y-3 text-xs font-medium text-slate-700">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input type="checkbox" checked={autoPrint} onChange={(e) => setAutoPrint(e.target.checked)} className="w-4 h-4 rounded text-[#5c5be5]" />
              <span>Automatically open system print dialog after saving an invoice</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input type="checkbox" checked={printLogo} onChange={(e) => setPrintLogo(e.target.checked)} className="w-4 h-4 rounded text-[#5c5be5]" />
              <span>Print company logo on top of invoice header</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input type="checkbox" checked={printSignature} onChange={(e) => setPrintSignature(e.target.checked)} className="w-4 h-4 rounded text-[#5c5be5]" />
              <span>Print authorized signature image in footer</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* 2. REMINDERS SETTINGS VIEW */
/* ========================================================================= */
export function RemindersSettingsView({ company }) {
  const [reminderRules, setReminderRules] = useState([
    { id: 1, title: '3 Days Before Due Date', desc: 'Send gentle upcoming payment reminder', active: true, channel: 'WhatsApp & SMS' },
    { id: 2, title: 'On Due Date', desc: 'Send invoice due today alert with payment link', active: true, channel: 'WhatsApp' },
    { id: 3, title: '3 Days After Due Date', desc: 'Send overdue payment follow-up notice', active: true, channel: 'WhatsApp & SMS' },
    { id: 4, title: '7 Days Overdue', desc: 'Send urgent payment reminder with ledger summary', active: false, channel: 'WhatsApp' }
  ]);
  const [testSent, setTestSent] = useState(false);

  const toggleRule = (id) => {
    setReminderRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  const handleSendTest = () => {
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f8fafc]">
      <div className="bg-white border-b border-slate-200 px-8 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Payment Reminders Automation</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Automate WhatsApp & SMS reminders to collect outstanding dues 3x faster</p>
        </div>
        <button
          onClick={handleSendTest}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{testSent ? 'Test WhatsApp Sent!' : 'Send Test WhatsApp Reminder'}</span>
        </button>
      </div>

      <div className="p-8 max-w-4xl mx-auto w-full space-y-6">
        {/* Rules Grid */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Automated Reminder Schedules</h2>
          <div className="space-y-3">
            {reminderRules.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition bg-slate-50/50">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={rule.active}
                    onChange={() => toggleRule(rule.id)}
                    className="w-4 h-4 rounded text-[#5c5be5] mt-0.5 cursor-pointer"
                  />
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{rule.title}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">{rule.desc}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-sm">
                      via {rule.channel}
                    </span>
                  </div>
                </div>
                <span className={`text-xs font-bold ${rule.active ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {rule.active ? 'Active' : 'Disabled'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* WhatsApp Message Preview */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">WhatsApp Message Template Preview</h2>
          <div className="bg-[#efeae2] p-4 rounded-xl max-w-md border border-slate-300 font-sans shadow-inner">
            <div className="bg-white rounded-lg p-3 text-xs text-slate-800 space-y-1.5 shadow-xs">
              <p>Dear <strong>[Customer Name]</strong>,</p>
              <p>Greetings from <strong>{company?.name || 'VSRM COMPUTER CLASSES'}</strong>! 🙏</p>
              <p>This is a gentle reminder that payment of <strong>₹14,500</strong> against Invoice No. <strong>INV-0042</strong> is due on <strong>20-Nov-2026</strong>.</p>
              <p className="text-blue-600 underline">👉 Click here to view & download your bill: https://vsrm.shop/b/INV42</p>
              <p>📲 Pay directly via UPI: <strong>{company?.upi_id || '8936863035@upi'}</strong></p>
              <p className="text-[10px] text-slate-400 pt-1 text-right">11:45 AM ✓✓</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* 3. CA REPORTS SHARING VIEW */
/* ========================================================================= */
export function CaReportsSettingsView({ company }) {
  const [caEmail, setCaEmail] = useState('ca.associates.bihar@gmail.com');
  const [inviteSent, setInviteSent] = useState(false);

  const reportsList = [
    { title: 'GSTR-1 (Sales Return for Filing)', format: 'Excel & JSON', period: 'Monthly / Quarterly' },
    { title: 'GSTR-3B Summary (Tax & ITC Reconciliation)', format: 'Excel & PDF', period: 'Monthly' },
    { title: 'Purchase Register & GSTR-2B Mismatch', format: 'Excel', period: 'Real-time' },
    { title: 'Profit & Loss Statement (P&L)', format: 'PDF & Excel', period: 'FY 2026-27' },
    { title: 'Balance Sheet & Trial Balance', format: 'PDF & Excel', period: 'FY 2026-27' },
    { title: 'Complete Customer & Supplier Ledgers', format: 'Excel', period: 'Full Year' }
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f8fafc]">
      <div className="bg-white border-b border-slate-200 px-8 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">CA Reports Sharing & GST Filing</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Share all tax reports and books of accounts directly with your Chartered Accountant</p>
        </div>
        <button
          onClick={() => {
            setInviteSent(true);
            setTimeout(() => setInviteSent(false), 3000);
          }}
          className="px-5 py-2 bg-[#5c5be5] hover:bg-[#4a49c9] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{inviteSent ? 'Invite Sent to CA!' : 'Send Direct Access to CA'}</span>
        </button>
      </div>

      <div className="p-8 max-w-4xl mx-auto w-full space-y-6">
        {/* CA Profile Box */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Your Appointed Chartered Accountant (C.A.)</h2>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <input
              type="email"
              value={caEmail}
              onChange={(e) => setCaEmail(e.target.value)}
              placeholder="Enter your CA email address"
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
            />
            <button
              onClick={() => alert(`Access link sent to ${caEmail}`)}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition"
            >
              Update CA Email
            </button>
          </div>
          <p className="text-[11px] text-slate-400">Your CA will receive read-only login access to download GST filing reports, without permission to edit bills.</p>
        </div>

        {/* 1-Click Reports Export Table */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Download Official Accounting Reports</h2>
          <div className="divide-y divide-slate-100">
            {reportsList.map((rep, idx) => (
              <div key={idx} className="py-3.5 flex items-center justify-between text-xs">
                <div>
                  <h3 className="font-bold text-slate-800">{rep.title}</h3>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">Format: {rep.format} • Period: {rep.period}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => alert(`Downloading ${rep.title}...`)}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition flex items-center space-x-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* 4. PRICING VIEW */
/* ========================================================================= */
export function PricingSettingsView() {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f8fafc]">
      <div className="bg-white border-b border-slate-200 px-8 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Subscription Plans & Pricing</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Choose the plan that suits your business growth</p>
        </div>
        <div className="flex items-center space-x-2 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold">
          <Crown className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span>Active Plan: Platinum Enterprise (Valid till Dec 2027)</span>
        </div>
      </div>

      <div className="p-8 max-w-5xl mx-auto w-full space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Silver Plan */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5 flex flex-col">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Starter</span>
              <h2 className="text-xl font-black text-slate-900 mt-1">Silver Plan</h2>
              <div className="mt-3 flex items-baseline">
                <span className="text-3xl font-black text-slate-900">₹2,399</span>
                <span className="text-xs text-slate-400 ml-1">/ year</span>
              </div>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-600 flex-1">
              <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-emerald-600" /><span>1 Business Management</span></li>
              <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-emerald-600" /><span>Unlimited Invoices & Quotations</span></li>
              <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-emerald-600" /><span>Basic Accounting & Reports</span></li>
              <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-emerald-600" /><span>Thermal & A4 Invoice Print</span></li>
            </ul>
            <button className="w-full py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl transition">
              Select Silver
            </button>
          </div>

          {/* Gold Plan */}
          <div className="bg-white rounded-2xl border-2 border-[#5c5be5] p-6 shadow-md space-y-5 flex flex-col relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#5c5be5] text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
              Most Popular
            </span>
            <div>
              <span className="text-xs font-bold text-[#5c5be5] uppercase tracking-wider block">Standard</span>
              <h2 className="text-xl font-black text-slate-900 mt-1">Gold Plan</h2>
              <div className="mt-3 flex items-baseline">
                <span className="text-3xl font-black text-slate-900">₹3,999</span>
                <span className="text-xs text-slate-400 ml-1">/ year</span>
              </div>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-600 flex-1">
              <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-emerald-600" /><span>Up to 3 Businesses</span></li>
              <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-emerald-600" /><span>GST E-Way Bill 1-Click Generation</span></li>
              <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-emerald-600" /><span>Barcode Label Printing & Scanner</span></li>
              <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-emerald-600" /><span>Automated WhatsApp Payment Reminders</span></li>
            </ul>
            <button className="w-full py-2.5 bg-[#5c5be5] hover:bg-[#4a49c9] text-white text-xs font-bold rounded-xl transition shadow-xs">
              Upgrade to Gold
            </button>
          </div>

          {/* Platinum Enterprise */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-xl space-y-5 flex flex-col relative">
            <span className="absolute -top-3 right-4 px-3 py-0.5 bg-amber-400 text-slate-900 text-[10px] font-black rounded-full uppercase tracking-wider">
              Current Plan
            </span>
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">Enterprise</span>
              <h2 className="text-xl font-black text-white mt-1">Platinum All-In-One</h2>
              <div className="mt-3 flex items-baseline">
                <span className="text-3xl font-black text-white">₹6,399</span>
                <span className="text-xs text-slate-400 ml-1">/ year</span>
              </div>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-300 flex-1">
              <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-amber-400" /><span>Unlimited Businesses (Multi-Company)</span></li>
              <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-amber-400" /><span>Multiple Staff Roles & Commission Management</span></li>
              <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-amber-400" /><span>Direct CA Reports Sharing Portal</span></li>
              <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-amber-400" /><span>Dedicated 24x7 Account Manager Support</span></li>
            </ul>
            <button className="w-full py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-900 text-xs font-bold rounded-xl transition shadow-xs">
              Renew Platinum
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* 5. REFER & EARN VIEW */
/* ========================================================================= */
export function ReferEarnSettingsView() {
  const [copied, setCopied] = useState(false);
  const referralCode = 'VSRM2026';

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f8fafc]">
      <div className="bg-white border-b border-slate-200 px-8 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Refer & Earn Rewards</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Invite fellow business owners and earn ₹500 cashback for every referral</p>
        </div>
      </div>

      <div className="p-8 max-w-4xl mx-auto w-full space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="px-3 py-1 bg-white/20 text-white rounded-full text-xs font-bold">Partner Program</span>
            <h2 className="text-2xl font-black">Earn ₹500 + 30 Days Free!</h2>
            <p className="text-xs text-blue-100 max-w-md leading-relaxed">
              When your invited friends join MyBillBook and create their first GST invoice, you both get instant wallet rewards and subscription extensions.
            </p>
          </div>
          <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
            <Gift className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Referral Code Box */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Your Exclusive Referral Code</h3>
          <div className="flex items-center space-x-4">
            <div className="px-6 py-3 bg-slate-50 border-2 border-dashed border-[#5c5be5] rounded-xl text-lg font-black font-mono tracking-widest text-[#5c5be5]">
              {referralCode}
            </div>
            <button
              onClick={handleCopy}
              className="px-5 py-3 bg-[#5c5be5] hover:bg-[#4a49c9] text-white text-xs font-bold rounded-xl transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <Copy className="w-4 h-4" />
              <span>{copied ? 'Code Copied!' : 'Copy Code'}</span>
            </button>
            <a
              href={`https://api.whatsapp.com/send?text=Start%20billing%20with%20MyBillBook%20and%20use%20my%20referral%20code%20${referralCode}%20for%20a%20special%20discount:%20https://vsrm.shop`}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1.5 shadow-xs"
            >
              <Send className="w-4 h-4" />
              <span>Share on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* 6. HELP AND SUPPORT VIEW */
/* ========================================================================= */
export function HelpSupportSettingsView() {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f8fafc]">
      <div className="bg-white border-b border-slate-200 px-8 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Help & Customer Support</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">24x7 Dedicated assistance for billing, GST, hardware and e-way bill inquiries</p>
        </div>
      </div>

      <div className="p-8 max-w-4xl mx-auto w-full space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Phone Support</h3>
            <p className="text-xs text-slate-500">Call our dedicated team</p>
            <a href="tel:8936863035" className="text-sm font-black text-blue-600 block pt-1">
              8936863035
            </a>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">WhatsApp Chat</h3>
            <p className="text-xs text-slate-500">Live chat with support</p>
            <a 
              href="https://api.whatsapp.com/send?phone=918936863035&text=Hello%20MyBillBook%20Support" 
              target="_blank" 
              rel="noreferrer"
              className="text-sm font-black text-emerald-600 block pt-1"
            >
              Chat on WhatsApp →
            </a>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Email Helpline</h3>
            <p className="text-xs text-slate-500">Send logs & questions</p>
            <span className="text-xs font-mono font-bold text-slate-700 block pt-1">
              vsrmcomputerclasses@gmail.com
            </span>
          </div>
        </div>

        {/* Video Tutorial Guides */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Training & Video Tutorials</h2>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 transition flex items-center space-x-3 cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Play className="w-4 h-4 fill-red-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">How to create a Tax Invoice in 10 seconds</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">3 min video guide</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 transition flex items-center space-x-3 cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Play className="w-4 h-4 fill-red-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Generating GST E-Way Bill 1-Click with QR</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">2 min video guide</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* 7. ACCOUNT PROFILE VIEW */
/* ========================================================================= */
export function AccountSettingsView({ company }) {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f8fafc]">
      <div className="bg-white border-b border-slate-200 px-8 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Account Profile & Security</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Manage your personal credentials, phone number and login security</p>
        </div>
      </div>

      <div className="p-8 max-w-4xl mx-auto w-full space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Owner Information</h2>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Registered Business Name</label>
              <input type="text" readOnly value={company?.name || 'VSRM COMPUTER CLASSES'} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Registered Phone</label>
              <input type="text" readOnly value={company?.phone || '8936863035'} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 font-mono" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Owner Email</label>
              <input type="email" readOnly value={company?.email || 'vsrmcomputerclasses@gmail.com'} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 font-mono" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">App Security Status</label>
              <div className="flex items-center space-x-2 py-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-emerald-700">100% Secure & ISO Certified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security PIN */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">4-Digit App Security PIN</h2>
          <p className="text-xs text-slate-500">Require PIN every time when opening billing software or switching business</p>
          <div className="flex items-center space-x-4">
            <input type="password" maxLength={4} defaultValue="1234" className="w-32 px-4 py-2 border border-slate-300 rounded-xl text-center text-lg font-mono tracking-widest" />
            <button onClick={() => alert('Security PIN updated!')} className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl">
              Update PIN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
