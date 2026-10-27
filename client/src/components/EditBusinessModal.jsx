import React, { useState, useEffect } from 'react';
import { X, Building2, Check, AlertCircle, Save, Phone, Mail, MapPin } from 'lucide-react';

export default function EditBusinessModal({ isOpen, onClose, company, onUpdated }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    billing_address: '',
    gstin: '',
    is_gst_registered: true,
    city: 'SAMASTIPUR',
    state: 'Bihar',
    pincode: '848101'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        phone: company.phone || '',
        email: company.email || '',
        billing_address: company.billing_address || company.address || '',
        gstin: company.gstin || '',
        is_gst_registered: company.is_gst_registered !== undefined ? Boolean(company.is_gst_registered) : true,
        city: company.city || 'SAMASTIPUR',
        state: company.state || 'Bihar',
        pincode: company.pincode || '848101'
      });
    }
  }, [company]);

  if (!isOpen || !company) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Business Name is required (व्यापार का नाम दर्ज करें)');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...company,
          ...formData,
          id: company.id,
          address: formData.billing_address
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update business name');
      }

      if (onUpdated) {
        onUpdated(data.company || { ...company, ...formData });
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Edit Business Name (व्यापार का नाम बदलें)</h2>
              <p className="text-[11px] text-blue-100">Company ID: #{company.id} • {company.name}</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Business Name Field with Prominent Highlight */}
          <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-3.5 space-y-1.5">
            <label className="block font-bold text-blue-900 text-xs">
              Business Name (व्यापार का नया नाम) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. VSRM EDUTECH PVT LTD"
              className="w-full bg-white border border-blue-300 rounded-lg p-2.5 font-bold text-sm text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
            />
            <p className="text-[10px] text-blue-700 font-medium">
              Yehi naam aapke sabhi Bill, Tax Invoice aur Reports par print hoga.
            </p>
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Company Phone Number (मोबाइल)
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="8936863035"
                  className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 font-mono text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                GSTIN (जीएसटी नंबर)
              </label>
              <input
                type="text"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                placeholder="10ABFCA4659J1ZQ"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono uppercase font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
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
              className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-lg transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm transition flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Save className="w-4 h-4 stroke-[2.5]" />
                  <span>Save Changes (नाम सेव करें)</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
