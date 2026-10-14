import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, Building, ShieldCheck } from 'lucide-react';

export default function SettingsView({ company, onSaveCompany }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    gstin: '',
    address: '',
    upi_id: '',
    tagline: '',
    terms: ''
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        phone: company.phone || '',
        email: company.email || '',
        gstin: company.gstin || '',
        address: company.address || '',
        upi_id: company.upi_id || '',
        tagline: company.tagline || '',
        terms: company.terms || ''
      });
    }
  }, [company]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        if (onSaveCompany) onSaveCompany();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Company & Invoice Settings</h2>
        <p className="text-xs text-slate-500 mt-0.5">Customize your business details, GSTIN, and UPI payment credentials</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Business Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Contact Phone Number *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2.5 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">GSTIN Number</label>
              <input
                type="text"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2.5 font-mono uppercase"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">UPI ID (For Invoice QR Code)</label>
              <input
                type="text"
                placeholder="e.g. 8130140936@upi"
                value={formData.upi_id}
                onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2.5 font-mono text-blue-700 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2.5"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Business Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2.5"
                placeholder="e.g. Quality Feeds & Wholesale Traders"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Business Address</label>
            <textarea
              rows="2"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full border border-slate-300 rounded-lg p-2.5"
            ></textarea>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Default Terms & Conditions (Prints on Invoices)</label>
            <textarea
              rows="3"
              value={formData.terms}
              onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
              className="w-full border border-slate-300 rounded-lg p-2.5"
            ></textarea>
          </div>

          <div className="pt-2 flex items-center justify-between">
            {saved ? (
              <span className="flex items-center space-x-1.5 text-xs text-emerald-600 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Settings saved successfully!</span>
              </span>
            ) : <span />}

            <button
              type="submit"
              className="inline-flex items-center space-x-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow transition"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
