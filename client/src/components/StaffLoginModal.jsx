import React, { useState, useEffect } from 'react';
import { 
  UserCheck, Shield, KeyRound, Lock, CheckCircle2, 
  X, ArrowRight, Eye, EyeOff, User, Phone, Sparkles, Building2
} from 'lucide-react';

export default function StaffLoginModal({ isOpen, onClose, onLoginSuccess, currentLoggedInUser }) {
  const [tab, setTab] = useState('staff'); // 'staff' | 'admin'
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [selectedStaff, setSelectedStaff] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchStaff();
      setError('');
      setPassword('');
      setIdentifier('');
      setSelectedStaff(null);
    }
  }, [isOpen]);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/staff');
      const data = await res.json();
      if (Array.isArray(data)) {
        setStaffList(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSelectStaffCard = (staff) => {
    setSelectedStaff(staff);
    setIdentifier(staff.staff_code);
    setPassword('');
    setError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const targetId = tab === 'admin' ? 'admin' : (selectedStaff ? selectedStaff.staff_code : identifier);
    if (!targetId || !targetId.trim()) {
      setError('Please enter Staff ID, Mobile, or Username');
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: targetId,
          password: password.trim()
        })
      });

      const data = await res.json();
      if (data.success && data.user) {
        onLoginSuccess(data.user);
        onClose();
      } else {
        setError(data.error || 'Login failed. Check your password.');
      }
    } catch (err) {
      console.error(err);
      setError('Network error during login');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-[#1e1b4b] text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Staff & Accountant Login</span>
                <span className="text-[10px] bg-indigo-500/40 text-indigo-200 px-2 py-0.5 rounded-full font-semibold">
                  लॉगिन / स्विच
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Login with ID & Password to do billing and track personal commission
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => { setTab('staff'); setError(''); }}
            className={`flex-1 py-3 px-4 text-center border-b-2 transition flex items-center justify-center space-x-2 ${
              tab === 'staff' 
                ? 'border-indigo-600 text-indigo-700 bg-white' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Staff / Accountant Login (स्टाफ / अकाउंटेंट)</span>
          </button>
          <button
            onClick={() => { setTab('admin'); setError(''); setSelectedStaff(null); }}
            className={`flex-1 py-3 px-4 text-center border-b-2 transition flex items-center justify-center space-x-2 ${
              tab === 'admin' 
                ? 'border-indigo-600 text-indigo-700 bg-white' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Admin / Owner Mode (मालिक)</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-medium flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleLoginSubmit} className="p-6 space-y-4 text-xs">
          {tab === 'staff' ? (
            <>
              {/* Quick Staff Selection Chips */}
              <div>
                <label className="block text-slate-600 font-semibold mb-2">
                  Select Staff or Accountant (त्वरित चयन):
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                  {staffList.map((s) => {
                    const isSelected = selectedStaff?.id === s.id;
                    const isAccountant = (s.role || '').toLowerCase().includes('account');
                    return (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => handleSelectStaffCard(s)}
                        className={`text-left p-2.5 rounded-xl border transition-all flex items-start space-x-2.5 ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/70 shadow-xs'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg font-bold flex items-center justify-center text-xs shrink-0 ${
                          isAccountant 
                            ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                            : 'bg-slate-800 text-white'
                        }`}>
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden min-w-0">
                          <div className="font-bold text-slate-900 truncate">{s.name}</div>
                          <div className="text-[10px] text-slate-500 truncate">
                            {s.role} • <span className="font-semibold text-emerald-600">{s.commission_rate}% Comm</span>
                          </div>
                          <span className="text-[9px] font-mono text-indigo-600 bg-indigo-50 px-1 rounded">
                            {s.staff_code}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Or Manual Staff ID / Phone */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Staff ID or Mobile Number (स्टाफ आईडी / मोबाइल) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. STF-103 or 9430987654"
                    value={selectedStaff ? `${selectedStaff.name} (${selectedStaff.staff_code})` : identifier}
                    onChange={(e) => {
                      setSelectedStaff(null);
                      setIdentifier(e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-indigo-500"
                  />
                  {selectedStaff && (
                    <button
                      type="button"
                      onClick={() => { setSelectedStaff(null); setIdentifier(''); }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      Change
                    </button>
                  )}
                </div>
              </div>

              {/* Password / PIN */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700 font-semibold">
                    Staff Password / PIN (पासवर्ड) *
                  </label>
                  <span className="text-[10px] text-indigo-600 font-medium">
                    Default PIN: <strong className="font-mono">1234</strong>
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter 4-digit PIN or password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-3 pr-10 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Admin Mode */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs space-y-1">
                <div className="font-bold flex items-center space-x-1">
                  <Shield className="w-4 h-4 text-amber-600" />
                  <span>Admin / Owner Full Access</span>
                </div>
                <p className="text-[11px] text-amber-700">
                  Admins can manage all staff, adjust commission rates, change passwords, and view total shop financials.
                </p>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Admin Username
                </label>
                <input
                  type="text"
                  disabled
                  value="admin (Owner)"
                  className="w-full px-3 py-2 border border-slate-200 bg-slate-100 rounded-lg text-xs font-bold text-slate-600"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700 font-semibold">
                    Admin Password
                  </label>
                  <span className="text-[10px] text-slate-500">
                    Default: <strong className="font-mono">admin123</strong>
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter admin password (or leave blank for 1234)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-3 pr-10 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-[#4f46e5] hover:bg-[#4338ca] text-white py-2.5 rounded-xl font-bold shadow-md hover:shadow-lg transition flex items-center justify-center space-x-2 text-xs"
            >
              <span>Login & Open Billing (लॉगिन करें)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="text-center text-[11px] text-slate-400 pt-1">
            Note: All invoices billed will automatically be attributed to the logged-in staff/accountant.
          </div>
        </form>

      </div>
    </div>
  );
}
