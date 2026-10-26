import React, { useState, useEffect } from 'react';
import { 
  Users2, Plus, Search, Edit3, Trash2, Award, Percent, 
  IndianRupee, Phone, CheckCircle2, X, FileText, ArrowUpRight, 
  UserCheck, ShieldCheck, Sparkles, AlertCircle, TrendingUp,
  KeyRound, Eye, EyeOff, LogIn
} from 'lucide-react';

export default function StaffView({ onOpenInvoiceModal, onViewInvoice, onSwitchUser }) {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState({});
  
  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [selectedStaffSales, setSelectedStaffSales] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    staff_code: '',
    phone: '',
    role: 'Sales Executive',
    commission_rate: 5.0,
    password: '1234',
    status: 'Active'
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const togglePasswordVisibility = (id) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/staff');
      const data = await res.json();
      if (Array.isArray(data)) {
        setStaffList(data);
      }
    } catch (err) {
      console.error('Failed to load staff list:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateStaffCode = () => {
    const nextNum = 101 + (staffList.length || 0);
    return `STF-${nextNum}`;
  };

  const handleOpenCreate = () => {
    setEditingStaff(null);
    setFormData({
      name: '',
      staff_code: generateStaffCode(),
      phone: '',
      role: 'Sales Executive',
      commission_rate: 5.0,
      password: '1234',
      status: 'Active'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (staff) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.name || '',
      staff_code: staff.staff_code || '',
      phone: staff.phone || '',
      role: staff.role || 'Sales Executive',
      commission_rate: staff.commission_rate !== undefined ? staff.commission_rate : 5.0,
      password: staff.password || '1234',
      status: staff.status || 'Active'
    });
    setShowModal(true);
  };

  const handleSaveStaff = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter staff name');
      return;
    }

    try {
      const payload = {
        ...formData,
        commission_rate: parseFloat(formData.commission_rate) || 0,
        password: String(formData.password || '1234').trim()
      };

      if (editingStaff) {
        const res = await fetch(`/api/staff/${editingStaff.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const d = await res.json();
        if (d.success) {
          showToast(`Staff "${formData.name}" updated successfully!`);
        }
      } else {
        const res = await fetch('/api/staff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const d = await res.json();
        if (d.success) {
          showToast(`Staff "${formData.name}" (ID: ${d.staff_code}) created successfully!`);
        }
      }

      setShowModal(false);
      fetchStaff();
    } catch (err) {
      console.error('Error saving staff:', err);
      alert('Failed to save staff');
    }
  };

  const handleDeleteStaff = async (staff) => {
    if (!window.confirm(`Are you sure you want to delete staff "${staff.name}" (${staff.staff_code})?`)) return;
    try {
      const res = await fetch(`/api/staff/${staff.id}`, { method: 'DELETE' });
      const d = await res.json();
      if (d.success) {
        showToast(`Staff "${staff.name}" deleted`);
        fetchStaff();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewStaffSales = (staff) => {
    setSelectedStaffSales(staff);
    setShowSalesModal(true);
  };

  // Filter staff list
  const filteredStaff = staffList.filter(s => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (s.name || '').toLowerCase().includes(q) ||
           (s.staff_code || '').toLowerCase().includes(q) ||
           (s.phone || '').includes(q) ||
           (s.role || '').toLowerCase().includes(q);
  });

  // Calculate totals
  const totalStaffCount = staffList.length;
  const totalSalesRevenue = staffList.reduce((acc, s) => acc + (s.total_sales_amount || 0), 0);
  const totalCommissionPayable = staffList.reduce((acc, s) => acc + (s.total_commission || 0), 0);
  const topPerformer = [...staffList].sort((a, b) => (b.total_sales_amount || 0) - (a.total_sales_amount || 0))[0];

  return (
    <div className="bg-[#f8fafc] min-h-screen text-slate-800 font-sans pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-medium z-50 flex items-center space-x-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
              <span>Staff & Sales Commission</span>
              <span className="text-xs bg-indigo-100 text-indigo-700 font-bold px-2.5 py-0.5 rounded-full">
                स्टाफ व कमीशन
              </span>
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Create sales staff, set individual commission %, and track sales attribution on all invoices.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="bg-[#6366f1] hover:bg-[#4f46e5] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md hover:shadow-lg transition flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Add New Staff (नया स्टाफ जोड़ें)</span>
        </button>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="px-6 py-5 max-w-7xl mx-auto space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Total Staff */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Staff</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{totalStaffCount} Members</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Active team members</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users2 className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2: Total Sales */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Staff Sales</span>
              <div className="text-2xl font-black text-slate-900 mt-1">₹{totalSalesRevenue.toLocaleString('en-IN')}</div>
              <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Billed by staff</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: Total Commission Payable */}
          <div className="bg-white rounded-xl border border-indigo-200 bg-indigo-50/20 p-4 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Total Commission</span>
              <div className="text-2xl font-black text-indigo-950 mt-1">₹{totalCommissionPayable.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
              <p className="text-[11px] text-indigo-600 mt-0.5 font-medium">Earned by staff</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Percent className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>

          {/* Card 4: Top Performer */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center justify-between">
            <div className="overflow-hidden pr-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Top Performer</span>
              <div className="text-base font-bold text-slate-900 truncate mt-1">
                {topPerformer ? topPerformer.name : 'None'}
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                {topPerformer?.staff_code} • {topPerformer?.commission_rate || 0}% Comm.
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
          </div>

        </div>

        {/* 3. Search Bar */}
        <div className="bg-white rounded-t-xl border border-slate-200 p-3 flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by staff name, ID (e.g. STF-101), or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-800">{filteredStaff.length}</span> staff members
          </div>
        </div>

        {/* 4. Staff Table */}
        <div className="bg-white border-x border-b border-slate-200 rounded-b-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#f8fafc] text-slate-600 border-b border-slate-200 font-semibold select-none">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">Staff ID</th>
                  <th className="py-3 px-4">Staff Name & Role</th>
                  <th className="py-3 px-4">Mobile</th>
                  <th className="py-3 px-4 text-center">Password / PIN</th>
                  <th className="py-3 px-4 text-center">Commission %</th>
                  <th className="py-3 px-4 text-right">Total Sales</th>
                  <th className="py-3 px-4 text-right">Commission Earned</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center w-36">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="10" className="py-12 text-center text-slate-400">Loading staff data...</td>
                  </tr>
                ) : filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Users2 className="w-8 h-8 text-slate-300" />
                        <p className="font-semibold text-slate-600">No Staff Found</p>
                        <p className="text-[11px] text-slate-400">Click "+ Add New Staff" to create your first team member</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((staff, idx) => {
                    const isAccountant = (staff.role || '').toLowerCase().includes('account');
                    const isPassVisible = visiblePasswords[staff.id];
                    const pwd = staff.password || '1234';

                    return (
                      <tr key={staff.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 text-center text-slate-400 font-mono text-[11px]">
                          {idx + 1}
                        </td>

                        {/* Staff ID */}
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-200 shadow-2xs">
                            {staff.staff_code}
                          </span>
                        </td>

                        {/* Name & Role */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-2.5">
                            <div className={`w-7 h-7 rounded-full font-bold flex items-center justify-center text-xs text-white ${
                              isAccountant ? 'bg-purple-600' : 'bg-slate-800'
                            }`}>
                              {staff.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                                <span>{staff.name}</span>
                                {isAccountant && (
                                  <span className="text-[9px] bg-purple-100 text-purple-700 font-bold px-1.5 py-0.2 rounded border border-purple-200">
                                    Accountant
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-500 font-medium">
                                {staff.role || 'Sales Executive'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Mobile Phone */}
                        <td className="py-3.5 px-4 font-mono text-slate-700">
                          {staff.phone ? (
                            <div className="flex items-center space-x-1.5">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{staff.phone}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        {/* Password / PIN with show/hide */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex items-center space-x-1.5 bg-slate-100 px-2 py-1 rounded-md border border-slate-200 font-mono text-xs">
                            <KeyRound className="w-3 h-3 text-slate-400" />
                            <span className="font-bold text-slate-700">
                              {isPassVisible ? pwd : '••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(staff.id)}
                              className="text-slate-400 hover:text-slate-700 ml-1 p-0.5"
                              title={isPassVisible ? 'Hide PIN' : 'Show PIN'}
                            >
                              {isPassVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                          </div>
                        </td>

                        {/* Commission % */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center space-x-0.5 bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200 text-xs">
                            <span>{parseFloat(staff.commission_rate || 0).toFixed(1)}%</span>
                          </span>
                        </td>

                        {/* Total Sales */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="font-bold font-mono text-slate-900">
                            ₹{parseFloat(staff.total_sales_amount || 0).toLocaleString('en-IN')}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {staff.total_sales_count || 0} bill{staff.total_sales_count === 1 ? '' : 's'}
                          </div>
                        </td>

                        {/* Total Commission Earned */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="font-extrabold font-mono text-indigo-600 text-xs">
                            ₹{parseFloat(staff.total_commission || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                          </div>
                          <span className="text-[10px] text-emerald-600 font-semibold">Payable</span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                            {staff.status || 'Active'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            {onSwitchUser && (
                              <button
                                onClick={() => onSwitchUser(staff)}
                                title="Login as this staff (इस स्टाफ के रूप में लॉगिन करें)"
                                className="px-1.5 py-1 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-[10px] flex items-center space-x-1 transition"
                              >
                                <LogIn className="w-3 h-3" />
                                <span>Login</span>
                              </button>
                            )}
                            <button
                              onClick={() => handleViewStaffSales(staff)}
                              title="View sales bills by this staff"
                              className="p-1 rounded text-slate-600 hover:bg-slate-100 transition"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenEdit(staff)}
                              title="Edit staff details"
                              className="p-1 rounded text-slate-600 hover:bg-slate-100 transition"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteStaff(staff)}
                              title="Delete staff"
                              className="p-1 rounded text-red-500 hover:bg-red-50 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* 5. ADD / EDIT STAFF MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-indigo-600" />
                <span>{editingStaff ? 'Edit Staff Details' : 'Add New Staff (नया स्टाफ)'}</span>
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="p-6 space-y-4 text-xs">
              {/* Staff ID */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Staff ID (यूनिक आईडी) *</span>
                  <button 
                    type="button" 
                    onClick={() => setFormData({ ...formData, staff_code: generateStaffCode() })}
                    className="text-indigo-600 font-bold hover:underline"
                  >
                    Auto-Generate
                  </button>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. STF-101"
                  value={formData.staff_code}
                  onChange={(e) => setFormData({ ...formData, staff_code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold focus:ring-1 focus:ring-indigo-500 uppercase"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">यह आईडी हर बिल पर "Billed By" में प्रिंट होगी।</p>
              </div>

              {/* Staff Name */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Staff Full Name (नाम) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Mobile Phone */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mobile Number (मोबाइल नंबर)
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Role / Designation */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Role / पद
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold bg-white focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Accountant / C.A.">Accountant / C.A. (अकाउंटेंट / लेखापाल)</option>
                    <option value="Billing Counter">Billing Counter (बिलिंग काउंटर)</option>
                    <option value="Sales Executive">Sales Executive (सेल्स एग्जीक्यूटिव)</option>
                    <option value="Senior Sales">Senior Sales (सीनियर सेल्स)</option>
                    <option value="Store Manager">Store Manager (स्टोर मैनेजर)</option>
                    <option value="Delivery Associate">Delivery Associate (डिलीवरी)</option>
                  </select>
                </div>

                {/* Commission Percentage */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Commission % (कमीशन)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      required
                      placeholder="e.g. 5"
                      value={formData.commission_rate}
                      onChange={(e) => setFormData({ ...formData, commission_rate: e.target.value })}
                      className="w-full pl-3 pr-8 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-1 focus:ring-indigo-500"
                    />
                    <Percent className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              {/* Login Password / PIN */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Login Password / PIN (लॉगिन पासवर्ड) *</span>
                  <span className="text-[10px] text-slate-400">Default: 1234</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1234"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  यह पासवर्ड स्टाफ या अकाउंटेंट लॉगिन के समय उपयोग करेंगे।
                </p>
              </div>

              {/* Status */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium bg-white focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-semibold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-lg font-bold text-xs shadow-xs transition"
                >
                  {editingStaff ? 'Update Staff' : 'Save Staff (सुरक्षित करें)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. STAFF SALES HISTORY MODAL */}
      {showSalesModal && selectedStaffSales && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <span>Sales by: {selectedStaffSales.name}</span>
                  <span className="font-mono text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-bold">
                    {selectedStaffSales.staff_code}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Commission: <b>{selectedStaffSales.commission_rate}%</b> | Total Earned: <b className="text-emerald-700">₹{selectedStaffSales.total_commission?.toFixed(2)}</b>
                </p>
              </div>
              <button 
                onClick={() => setShowSalesModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {!selectedStaffSales.recent_sales || selectedStaffSales.recent_sales.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Abhi tak is staff dwara koi bill nahi banaya gaya hai.
                </div>
              ) : (
                <div className="space-y-2 text-xs">
                  {selectedStaffSales.recent_sales.map(txn => (
                    <div 
                      key={txn.id} 
                      onClick={() => {
                        if (onViewInvoice) onViewInvoice(txn.id);
                        setShowSalesModal(false);
                      }}
                      className="p-3 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 rounded-lg cursor-pointer transition flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-slate-900 flex items-center space-x-2">
                          <span className="font-mono text-indigo-600">{txn.txn_no}</span>
                          <span>•</span>
                          <span>{txn.party_name}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Date: {txn.date} | Mode: {txn.payment_type}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-extrabold text-slate-900 font-mono">₹{txn.amount}</div>
                        <div className="text-[11px] text-emerald-600 font-semibold">
                          Comm: ₹{(txn.staff_commission_amount || (txn.amount * (selectedStaffSales.commission_rate || 0) / 100)).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowSalesModal(false)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
