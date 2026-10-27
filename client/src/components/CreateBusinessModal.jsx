import React, { useState } from 'react';
import { X, Building2, Check, AlertCircle, Plus, MapPin, Phone, Mail, FileText } from 'lucide-react';

export default function CreateBusinessModal({ isOpen, onClose, onCompanyCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    billing_address: '',
    state: 'Bihar',
    pincode: '848101',
    city: 'SAMASTIPUR',
    is_gst_registered: true,
    gstin: '',
    business_type: 'Retailer, Wholesaler, Distributor, Manufacturer, Services',
    industry_type: 'Education-Schooling/Coaching',
    registration_type: 'Proprietorship',
    make_active: true
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const indianStates = [
    'Bihar', 'Delhi', 'Uttar Pradesh', 'Jharkhand', 'West Bengal',
    'Maharashtra', 'Gujarat', 'Rajasthan', 'Punjab', 'Haryana',
    'Madhya Pradesh', 'Odisha', 'Tamil Nadu', 'Karnataka', 'Andhra Pradesh',
    'Telangana', 'Kerala', 'Assam', 'Uttarakhand', 'Himachal Pradesh'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Business Name is required (व्यापार का नाम दर्ज करें)');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          address: formData.billing_address
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create business');
      }

      if (onCompanyCreated) {
        onCompanyCreated(data.company);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#ea580c] to-[#c2410c] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-xs">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Create New Business (नया व्यापार जोड़ें)</h2>
              <p className="text-[11px] text-orange-100">Add a new company profile to manage multiple businesses</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Business Name */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Business Name (व्यापार का नाम) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. VSRM COMPUTER CLASSES"
              className="w-full border border-slate-300 rounded-lg p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-[#ea580c] focus:outline-hidden"
            />
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Company Phone Number (मोबाइल नंबर) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. 8936863035"
                  className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 font-mono text-slate-800 focus:ring-2 focus:ring-[#ea580c] focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Company E-Mail
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. vsrm@business.com"
                  className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-slate-800 focus:ring-2 focus:ring-[#ea580c] focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Billing Address */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Billing Address (पता)
            </label>
            <textarea
              rows="2"
              value={formData.billing_address}
              onChange={(e) => setFormData({ ...formData, billing_address: e.target.value })}
              placeholder="Near Kashipur Chowk Samastipur 848101"
              className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-[#ea580c] focus:outline-hidden"
            />
          </div>

          {/* State, City, Pincode */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">State (राज्य)</label>
              <select
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-[#ea580c]"
              >
                {indianStates.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">City (शहर)</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="SAMASTIPUR"
                className="w-full border border-slate-300 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-[#ea580c]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pincode (पिनकोड)</label>
              <input
                type="text"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                placeholder="848101"
                className="w-full border border-slate-300 rounded-lg p-2 font-mono text-slate-800 focus:ring-2 focus:ring-[#ea580c]"
              />
            </div>
          </div>

          {/* GST Registered & GSTIN */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">Are you GST Registered?</span>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-1.5 cursor-pointer font-semibold text-slate-800">
                  <input
                    type="radio"
                    name="modal_gst"
                    checked={formData.is_gst_registered}
                    onChange={() => setFormData({ ...formData, is_gst_registered: true })}
                    className="text-[#ea580c] focus:ring-[#ea580c]"
                  />
                  <span>Yes</span>
                </label>
                <label className="flex items-center space-x-1.5 cursor-pointer font-semibold text-slate-800">
                  <input
                    type="radio"
                    name="modal_gst"
                    checked={!formData.is_gst_registered}
                    onChange={() => setFormData({ ...formData, is_gst_registered: false })}
                    className="text-[#ea580c] focus:ring-[#ea580c]"
                  />
                  <span>No</span>
                </label>
              </div>
            </div>

            {formData.is_gst_registered && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  GSTIN (जीएसटी नंबर) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                  placeholder="e.g. 10ABFCA4659J1ZQ"
                  className="w-full border border-slate-300 rounded-lg p-2 font-mono uppercase font-bold text-slate-900 focus:ring-2 focus:ring-[#ea580c]"
                />
              </div>
            )}
          </div>

          {/* Business & Industry Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Business Type</label>
              <select
                value={formData.business_type}
                onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-800"
              >
                <option value="Retailer, Wholesaler, Distributor, Manufacturer, Services">All (Retail, Wholesale, Services)</option>
                <option value="Retailer">Retailer (खुदरा विक्रेता)</option>
                <option value="Wholesaler">Wholesaler (थोक विक्रेता)</option>
                <option value="Distributor">Distributor (वितरक)</option>
                <option value="Manufacturer">Manufacturer (निर्माता)</option>
                <option value="Services">Services (सेवाएं / कोचिंग / कंसल्टेंसी)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Industry Type</label>
              <select
                value={formData.industry_type}
                onChange={(e) => setFormData({ ...formData, industry_type: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-800"
              >
                <option value="Education-Schooling/Coaching">Education-Schooling/Coaching</option>
                <option value="Quality Feeds & Engineering Solutions">Quality Feeds & Engineering Solutions</option>
                <option value="Computer & IT Institute">Computer & IT Institute</option>
                <option value="Grocery & FMCG Store">Grocery & FMCG Store</option>
                <option value="Hardware & Sanitary">Hardware & Sanitary</option>
                <option value="Electricals & Electronics">Electricals & Electronics</option>
                <option value="Agriculture & Seeds">Agriculture & Seeds</option>
                <option value="General Trading">General Trading</option>
              </select>
            </div>
          </div>

          {/* Active Checkbox */}
          <div className="pt-2 border-t border-slate-200">
            <label className="flex items-center space-x-2 cursor-pointer font-bold text-slate-800">
              <input
                type="checkbox"
                checked={formData.make_active}
                onChange={(e) => setFormData({ ...formData, make_active: e.target.checked })}
                className="w-4 h-4 text-[#ea580c] rounded border-slate-300 focus:ring-[#ea580c]"
              />
              <span>Set as active business immediately (तुरंत इसी व्यापार पर स्विच करें)</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold rounded-lg shadow-sm transition flex items-center space-x-1.5 disabled:opacity-50"
            >
              {loading ? (
                <span>Creating Business...</span>
              ) : (
                <>
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Create Business (कंपनी जोड़ें)</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
