import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Check, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  ChevronDown, 
  ChevronUp, 
  Info, 
  Palette, 
  Eye, 
  Sliders, 
  Printer, 
  FileText, 
  QrCode, 
  CheckCircle2, 
  Building2, 
  HelpCircle 
} from 'lucide-react';

export default function InvoiceSettingsView({ company, onBackToDashboard }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Theme selection
  const [themeMode, setThemeMode] = useState('themes'); // 'themes' or 'custom'
  const [selectedTheme, setSelectedTheme] = useState('Stylish'); // 'Stylish', 'Luxury', 'Advanced GST (Tally)'
  const [selectedColor, setSelectedColor] = useState('#5c5be5'); // default Indigo matching screenshot

  // ThemeStore festive carousel state
  const [storeSlide, setStoreSlide] = useState(0);

  // Theme Settings toggles (matching Screenshot 2)
  const [showPartyBalance, setShowPartyBalance] = useState(true);
  const [enableFreeQty, setEnableFreeQty] = useState(true);
  const [showItemDescription, setShowItemDescription] = useState(true);
  const [showAlternateUnit, setShowAlternateUnit] = useState(false);
  const [showPhoneNumber, setShowPhoneNumber] = useState(true);
  const [showTime, setShowTime] = useState(false);
  const [priceHistory, setPriceHistory] = useState(false);
  const [autoApplyLuxuryTheme, setAutoApplyLuxuryTheme] = useState(true);

  // Accordion open/close states
  const [openAccordions, setOpenAccordions] = useState({
    invoiceDetails: false,
    partyDetails: false,
    itemColumns: false,
    miscDetails: false
  });

  // Accordion details states
  const [invoiceTitle, setInvoiceTitle] = useState('TAX INVOICE');
  const [invoicePrefix, setInvoicePrefix] = useState('INV-');
  const [showDueDate, setShowDueDate] = useState(true);
  const [showPoDetails, setShowPoDetails] = useState(true);
  const [showEwayBill, setShowEwayBill] = useState(true);
  const [showVehicleNo, setShowVehicleNo] = useState(true);

  const [showShippingAddress, setShowShippingAddress] = useState(true);
  const [showPartyGstin, setShowPartyGstin] = useState(true);
  const [showPartyPan, setShowPartyPan] = useState(true);
  const [showPlaceOfSupply, setShowPlaceOfSupply] = useState(true);
  const [showPartyPhone, setShowPartyPhone] = useState(true);

  const [showHsn, setShowHsn] = useState(true);
  const [showBatch, setShowBatch] = useState(false);
  const [showSerial, setShowSerial] = useState(false);
  const [showMrp, setShowMrp] = useState(false);
  const [showDiscount, setShowDiscount] = useState(true);
  const [showTax, setShowTax] = useState(true);
  const [showFreeQuantity, setShowFreeQuantity] = useState(false);
  const [showCess, setShowCess] = useState(false);

  const [showTerms, setShowTerms] = useState(true);
  const [showBankDetails, setShowBankDetails] = useState(true);
  const [showUpiQr, setShowUpiQr] = useState(true);
  const [showSignature, setShowSignature] = useState(true);
  const [showGreeting, setShowGreeting] = useState(true);
  const [greetingText, setGreetingText] = useState('Thank you for your business!');
  const [showTagline, setShowTagline] = useState(true);

  // Color Swatches matching screenshot
  const colorPalette = [
    { name: 'Indigo', hex: '#5c5be5' },
    { name: 'Royal Blue', hex: '#2563eb' },
    { name: 'Emerald Green', hex: '#059669' },
    { name: 'Crimson Red', hex: '#dc2626' },
    { name: 'Warm Orange', hex: '#ea580c' },
    { name: 'Slate Black', hex: '#1e293b' },
    { name: 'Purple', hex: '#9333ea' },
    { name: 'Teal', hex: '#0d9488' }
  ];

  // Festive Themes in ThemeStore Carousel
  const festivalThemes = [
    { id: 'dhanteras', name: 'Dhanteras', subtitle: 'Gold & Prosperity', bg: 'from-amber-100 to-yellow-50', border: 'border-amber-300' },
    { id: 'diwali', name: 'Diwali', subtitle: 'Festival of Lights', bg: 'from-orange-100 to-amber-50', border: 'border-orange-300' },
    { id: 'chhath', name: 'Chhath Puja', subtitle: 'Sun Worship Special', bg: 'from-rose-100 to-orange-50', border: 'border-rose-300' },
    { id: 'navaratri', name: 'Navaratri', subtitle: 'Divine Celebrations', bg: 'from-red-100 to-pink-50', border: 'border-red-300' },
    { id: 'newyear', name: 'New Year', subtitle: 'Fresh Beginnings', bg: 'from-blue-100 to-indigo-50', border: 'border-blue-300' }
  ];

  useEffect(() => {
    fetchInvoiceSettings();
  }, [company?.id]);

  const fetchInvoiceSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/company/invoice-settings');
      const data = await res.json();
      if (data && data.settings) {
        const s = data.settings;
        if (s.theme) setSelectedTheme(s.theme);
        if (s.theme_color) setSelectedColor(s.theme_color);
        if (s.show_party_balance !== undefined) setShowPartyBalance(Boolean(s.show_party_balance));
        if (s.enable_free_qty !== undefined) setEnableFreeQty(Boolean(s.enable_free_qty));
        if (s.show_item_description !== undefined) setShowItemDescription(Boolean(s.show_item_description));
        if (s.show_alternate_unit !== undefined) setShowAlternateUnit(Boolean(s.show_alternate_unit));
        if (s.show_phone_number !== undefined) setShowPhoneNumber(Boolean(s.show_phone_number));
        if (s.show_time !== undefined) setShowTime(Boolean(s.show_time));
        if (s.price_history !== undefined) setPriceHistory(Boolean(s.price_history));
        if (s.auto_apply_luxury_theme !== undefined) setAutoApplyLuxuryTheme(Boolean(s.auto_apply_luxury_theme));
        if (s.invoice_title) setInvoiceTitle(s.invoice_title);
        if (s.invoice_prefix) setInvoicePrefix(s.invoice_prefix);
        if (s.show_due_date !== undefined) setShowDueDate(Boolean(s.show_due_date));
        if (s.show_po_details !== undefined) setShowPoDetails(Boolean(s.show_po_details));
        if (s.show_eway_bill !== undefined) setShowEwayBill(Boolean(s.show_eway_bill));
        if (s.show_vehicle_no !== undefined) setShowVehicleNo(Boolean(s.show_vehicle_no));
        if (s.show_shipping_address !== undefined) setShowShippingAddress(Boolean(s.show_shipping_address));
        if (s.show_party_gstin !== undefined) setShowPartyGstin(Boolean(s.show_party_gstin));
        if (s.show_party_pan !== undefined) setShowPartyPan(Boolean(s.show_party_pan));
        if (s.show_place_of_supply !== undefined) setShowPlaceOfSupply(Boolean(s.show_place_of_supply));
        if (s.show_party_phone !== undefined) setShowPartyPhone(Boolean(s.show_party_phone));
        if (s.show_hsn !== undefined) setShowHsn(Boolean(s.show_hsn));
        if (s.show_batch !== undefined) setShowBatch(Boolean(s.show_batch));
        if (s.show_serial !== undefined) setShowSerial(Boolean(s.show_serial));
        if (s.show_mrp !== undefined) setShowMrp(Boolean(s.show_mrp));
        if (s.show_discount !== undefined) setShowDiscount(Boolean(s.show_discount));
        if (s.show_tax !== undefined) setShowTax(Boolean(s.show_tax));
        if (s.show_free_quantity !== undefined) setShowFreeQuantity(Boolean(s.show_free_quantity));
        if (s.show_cess !== undefined) setShowCess(Boolean(s.show_cess));
        if (s.show_terms !== undefined) setShowTerms(Boolean(s.show_terms));
        if (s.show_bank_details !== undefined) setShowBankDetails(Boolean(s.show_bank_details));
        if (s.show_upi_qr !== undefined) setShowUpiQr(Boolean(s.show_upi_qr));
        if (s.show_signature !== undefined) setShowSignature(Boolean(s.show_signature));
        if (s.show_greeting !== undefined) setShowGreeting(Boolean(s.show_greeting));
        if (s.greeting_text) setGreetingText(s.greeting_text);
        if (s.show_tagline !== undefined) setShowTagline(Boolean(s.show_tagline));
      }
    } catch (err) {
      console.error('Error fetching invoice settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      const payload = {
        theme: selectedTheme,
        theme_color: selectedColor,
        show_party_balance: showPartyBalance,
        enable_free_qty: enableFreeQty,
        show_item_description: showItemDescription,
        show_alternate_unit: showAlternateUnit,
        show_phone_number: showPhoneNumber,
        show_time: showTime,
        price_history: priceHistory,
        auto_apply_luxury_theme: autoApplyLuxuryTheme,
        invoice_title: invoiceTitle,
        invoice_prefix: invoicePrefix,
        show_due_date: showDueDate,
        show_po_details: showPoDetails,
        show_eway_bill: showEwayBill,
        show_vehicle_no: showVehicleNo,
        show_shipping_address: showShippingAddress,
        show_party_gstin: showPartyGstin,
        show_party_pan: showPartyPan,
        show_place_of_supply: showPlaceOfSupply,
        show_party_phone: showPartyPhone,
        show_hsn: showHsn,
        show_batch: showBatch,
        show_serial: showSerial,
        show_mrp: showMrp,
        show_discount: showDiscount,
        show_tax: showTax,
        show_free_quantity: showFreeQuantity,
        show_cess: showCess,
        show_terms: showTerms,
        show_bank_details: showBankDetails,
        show_upi_qr: showUpiQr,
        show_signature: showSignature,
        show_greeting: showGreeting,
        greeting_text: greetingText,
        show_tagline: showTagline
      };

      const res = await fetch('/api/company/invoice-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error saving invoice settings:', err);
      alert('Settings save karne mein error aayi');
    } finally {
      setSaving(false);
    }
  };

  const toggleAccordion = (key) => {
    setOpenAccordions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleNextStoreSlide = () => {
    setStoreSlide(prev => (prev + 1) % festivalThemes.length);
  };

  const handlePrevStoreSlide = () => {
    setStoreSlide(prev => (prev - 1 + festivalThemes.length) % festivalThemes.length);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f8fafc]">
      
      {/* Top Header matching Screenshot */}
      <div className="bg-white border-b border-slate-200 px-8 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Invoice Settings</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Customize your invoice appearance, theme, colors, and bill fields</p>
        </div>

        <div className="flex items-center space-x-3">
          {savedSuccess && (
            <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Saved Successfully!</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleSaveChanges}
            disabled={saving}
            className={`px-6 py-2 bg-[#5c5be5] hover:bg-[#4a49c9] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center space-x-1.5 ${
              saving ? 'opacity-70 cursor-wait' : ''
            }`}
          >
            {saving ? (
              <span>Saving...</span>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Workspace: Left Center Canvas (Invoice Preview) + Right Side Settings Panel */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* ========================================================================= */}
        {/* CENTER: Live Interactive A4 Invoice Preview */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-start bg-[#f1f5f9]/70">
          
          <div className="w-full max-w-3xl mb-3 flex items-center justify-between px-2 text-xs text-slate-500 font-medium">
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4 text-[#5c5be5]" />
              <span className="font-bold text-slate-700">Live Preview: {selectedTheme} Theme</span>
              <span 
                className="w-3 h-3 rounded-full border border-white shadow-2xs inline-block" 
                style={{ backgroundColor: selectedColor }}
              />
            </div>
            <span className="text-[11px] text-slate-400">Updates live as you change options on the right</span>
          </div>

          {/* Rendered Invoice Paper */}
          <div 
            className={`w-full max-w-3xl bg-white rounded-lg shadow-xl border overflow-hidden transition-all duration-200 ${
              selectedTheme === 'Luxury' 
                ? 'border-amber-400/60 ring-4 ring-amber-100/50' 
                : 'border-slate-200'
            }`}
            style={{ minHeight: '800px' }}
          >
            {/* Top decorative color bar */}
            <div className="h-2.5 w-full" style={{ backgroundColor: selectedColor }} />

            <div className="p-8 space-y-6">
              
              {/* Header section */}
              <div className="flex items-start justify-between border-b pb-5" style={{ borderColor: `${selectedColor}30` }}>
                <div className="space-y-1.5 max-w-md">
                  {company?.logo_url ? (
                    <img src={company.logo_url} alt="Logo" className="h-12 object-contain mb-2" />
                  ) : (
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-lg mb-2 shadow-xs"
                      style={{ backgroundColor: selectedColor }}
                    >
                      {(company?.name || 'V').charAt(0)}
                    </div>
                  )}
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    {company?.name || 'VSRM COMPUTER CLASSES'}
                  </h2>
                  {showTagline && company?.tagline && (
                    <p className="text-[11px] font-semibold text-slate-500 italic">
                      "{company.tagline}"
                    </p>
                  )}
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {company?.address || 'Near Kashipur Chowk Samastipur 848101'}
                  </p>
                  <div className="flex flex-wrap gap-x-4 text-xs text-slate-600 pt-0.5">
                    {showPhoneNumber && <span><strong>Phone:</strong> {company?.phone || '8936863035'}</span>}
                    {company?.email && <span><strong>Email:</strong> {company.email}</span>}
                  </div>
                  {company?.gstin && (
                    <p className="text-xs text-slate-800 font-mono font-bold">
                      <strong>GSTIN:</strong> {company.gstin}
                    </p>
                  )}
                </div>

                {/* Right side of invoice header */}
                <div className="text-right space-y-2">
                  <span 
                    className="inline-block px-3 py-1 rounded-md text-xs font-black tracking-wider uppercase text-white shadow-2xs"
                    style={{ backgroundColor: selectedColor }}
                  >
                    {invoiceTitle}
                  </span>

                  <div className="text-xs text-slate-600 space-y-1 pt-1 font-mono">
                    <p><span className="text-slate-400">Invoice No:</span> <strong className="text-slate-900">{invoicePrefix}0042</strong></p>
                    <p><span className="text-slate-400">Date:</span> <strong>05-Nov-2026</strong></p>
                    {showDueDate && (
                      <p><span className="text-slate-400">Due Date:</span> <strong>20-Nov-2026</strong></p>
                    )}
                    {showTime && (
                      <p><span className="text-slate-400">Time:</span> <strong>11:45 AM</strong></p>
                    )}
                    {showPoDetails && (
                      <p><span className="text-slate-400">PO No:</span> <strong>PO-2026-981</strong></p>
                    )}
                    {showEwayBill && (
                      <p><span className="text-slate-400">E-Way No:</span> <strong className="text-emerald-700 font-bold">2410 8892 4112</strong></p>
                    )}
                    {showVehicleNo && (
                      <p><span className="text-slate-400">Vehicle No:</span> <strong>BR-01-GB-4592</strong></p>
                    )}
                  </div>
                </div>
              </div>

              {/* Bill To & Ship To Details */}
              <div className="grid grid-cols-2 gap-6 bg-slate-50/80 p-4 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Bill To (Customer Details)
                  </span>
                  <p className="font-bold text-slate-900 text-sm">ANAND ENTERPRISES</p>
                  <p className="text-slate-600 mt-0.5">Main Road, Tajpur, Samastipur - 848130</p>
                  {showPartyPhone && <p className="text-slate-600 mt-0.5 font-mono"><strong>Phone:</strong> 9835123456</p>}
                  {showPartyGstin && <p className="text-slate-700 mt-0.5 font-mono"><strong>GSTIN:</strong> 10AAACB2233M1ZT</p>}
                  {showPartyPan && <p className="text-slate-700 mt-0.5 font-mono"><strong>PAN:</strong> AAACB2233M</p>}
                  {showPlaceOfSupply && <p className="text-slate-600 mt-0.5"><strong>Place of Supply:</strong> Bihar (10)</p>}
                  {showPartyBalance && (
                    <div className="mt-2 inline-flex items-center space-x-1.5 px-2 py-1 bg-amber-50 text-amber-800 rounded-md border border-amber-200/60 font-semibold text-[11px]">
                      <span>Previous Ledger Balance:</span>
                      <strong>₹14,500.00</strong>
                    </div>
                  )}
                </div>

                {showShippingAddress && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Ship To (Delivery Address)
                    </span>
                    <p className="font-semibold text-slate-900">ANAND ENTERPRISES WAREHOUSE</p>
                    <p className="text-slate-600 mt-0.5">Plot No. 42, Industrial Growth Center, Samastipur 848101</p>
                    <p className="text-slate-500 text-[11px] mt-1 font-italic">Dispatch via: Road Transport (VSRM Cargo)</p>
                  </div>
                )}
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr 
                      className="border-y text-slate-700 font-bold"
                      style={{ 
                        backgroundColor: `${selectedColor}12`,
                        borderColor: `${selectedColor}40`
                      }}
                    >
                      <th className="py-2.5 px-2 text-center w-10">#</th>
                      <th className="py-2.5 px-2">Item Name & Description</th>
                      {showHsn && <th className="py-2.5 px-2 text-center">HSN</th>}
                      {showBatch && <th className="py-2.5 px-2 text-center">Batch</th>}
                      {showSerial && <th className="py-2.5 px-2 text-center">Serial No</th>}
                      {showMrp && <th className="py-2.5 px-2 text-right">MRP</th>}
                      <th className="py-2.5 px-2 text-center">Qty</th>
                      {showFreeQuantity && <th className="py-2.5 px-2 text-center text-emerald-700">Free</th>}
                      {showAlternateUnit && <th className="py-2.5 px-2 text-center">Alt Unit</th>}
                      <th className="py-2.5 px-2 text-right">Rate</th>
                      {showDiscount && <th className="py-2.5 px-2 text-right">Disc %</th>}
                      {showTax && <th className="py-2.5 px-2 text-center">GST %</th>}
                      {showCess && <th className="py-2.5 px-2 text-right">Cess</th>}
                      <th className="py-2.5 px-2 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-3 px-2 text-center font-mono text-slate-400">1</td>
                      <td className="py-3 px-2">
                        <p className="font-bold text-slate-900">ADCA Computer Course Package</p>
                        {showItemDescription && (
                          <p className="text-[11px] text-slate-500 mt-0.5">Advanced Diploma 1 Year with Certification & GST</p>
                        )}
                      </td>
                      {showHsn && <td className="py-3 px-2 text-center font-mono text-slate-600">9992</td>}
                      {showBatch && <td className="py-3 px-2 text-center font-mono text-slate-600">B-2026A</td>}
                      {showSerial && <td className="py-3 px-2 text-center font-mono text-slate-600">SR-4501</td>}
                      {showMrp && <td className="py-3 px-2 text-right font-mono text-slate-400 line-through">₹8,000</td>}
                      <td className="py-3 px-2 text-center font-bold text-slate-800">2 PCS</td>
                      {showFreeQuantity && <td className="py-3 px-2 text-center font-bold text-emerald-600">1 PCS</td>}
                      {showAlternateUnit && <td className="py-3 px-2 text-center text-slate-500">2 BATCH</td>}
                      <td className="py-3 px-2 text-right font-mono text-slate-800">₹6,500.00</td>
                      {showDiscount && <td className="py-3 px-2 text-right font-mono text-slate-600">5%</td>}
                      {showTax && <td className="py-3 px-2 text-center font-mono text-slate-600">18%</td>}
                      {showCess && <td className="py-3 px-2 text-right font-mono text-slate-600">0%</td>}
                      <td className="py-3 px-2 text-right font-bold text-slate-900">₹14,573.00</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-2 text-center font-mono text-slate-400">2</td>
                      <td className="py-3 px-2">
                        <p className="font-bold text-slate-900">Tally Prime with GST Certification</p>
                        {showItemDescription && (
                          <p className="text-[11px] text-slate-500 mt-0.5">Accounting & e-Invoicing Hands-on Practical Lab</p>
                        )}
                      </td>
                      {showHsn && <td className="py-3 px-2 text-center font-mono text-slate-600">9992</td>}
                      {showBatch && <td className="py-3 px-2 text-center font-mono text-slate-600">B-2026B</td>}
                      {showSerial && <td className="py-3 px-2 text-center font-mono text-slate-600">SR-4502</td>}
                      {showMrp && <td className="py-3 px-2 text-right font-mono text-slate-400 line-through">₹5,000</td>}
                      <td className="py-3 px-2 text-center font-bold text-slate-800">1 PCS</td>
                      {showFreeQuantity && <td className="py-3 px-2 text-center font-bold text-emerald-600">-</td>}
                      {showAlternateUnit && <td className="py-3 px-2 text-center text-slate-500">1 BATCH</td>}
                      <td className="py-3 px-2 text-right font-mono text-slate-800">₹4,200.00</td>
                      {showDiscount && <td className="py-3 px-2 text-right font-mono text-slate-600">0%</td>}
                      {showTax && <td className="py-3 px-2 text-center font-mono text-slate-600">18%</td>}
                      {showCess && <td className="py-3 px-2 text-right font-mono text-slate-600">0%</td>}
                      <td className="py-3 px-2 text-right font-bold text-slate-900">₹4,956.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Total Calculation & Payment Summary */}
              <div className="grid grid-cols-2 gap-6 pt-2 border-t border-slate-200">
                
                {/* Left side: Bank, UPI QR & Terms */}
                <div className="space-y-4 text-xs">
                  {showBankDetails && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Bank Account Details</span>
                      <p><strong>Bank:</strong> State Bank of India</p>
                      <p><strong>A/C No:</strong> 38920199281</p>
                      <p><strong>IFSC:</strong> SBIN0000123 (Samastipur Main)</p>
                      <p><strong>UPI ID:</strong> {company?.upi_id || '8936863035@upi'}</p>
                    </div>
                  )}

                  {showUpiQr && (
                    <div className="flex items-center space-x-3 p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl">
                      <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 flex items-center justify-center p-1 shadow-2xs">
                        <QrCode className="w-10 h-10 text-slate-900" />
                      </div>
                      <div className="text-[11px]">
                        <span className="font-bold text-emerald-900 block">Scan & Pay via UPI</span>
                        <span className="text-slate-500">GPay / PhonePe / Paytm / BHIM</span>
                      </div>
                    </div>
                  )}

                  {showTerms && (
                    <div className="text-[11px] text-slate-500 space-y-1">
                      <span className="font-bold text-slate-700 block">Terms & Conditions:</span>
                      <p className="whitespace-pre-line leading-relaxed">
                        {company?.terms || '1. Goods once sold will not be taken back.\n2. Invoices are subject to Samastipur jurisdiction.'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Right side: Amount calculation block */}
                <div className="space-y-2 text-xs">
                  <div className="space-y-1.5 pb-2 text-slate-700 border-b border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Sub Total:</span>
                      <span className="font-mono font-semibold">₹16,550.00</span>
                    </div>
                    {showDiscount && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Discount:</span>
                        <span className="font-mono font-semibold">- ₹650.00</span>
                      </div>
                    )}
                    {showTax && (
                      <>
                        <div className="flex justify-between text-slate-600">
                          <span>CGST (9%):</span>
                          <span className="font-mono font-semibold">₹1,431.00</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>SGST (9%):</span>
                          <span className="font-mono font-semibold">₹1,431.00</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div 
                    className="flex justify-between items-center p-2.5 rounded-xl font-black text-sm text-white shadow-xs"
                    style={{ backgroundColor: selectedColor }}
                  >
                    <span>Total Amount:</span>
                    <span className="text-base font-mono">₹19,529.00</span>
                  </div>

                  <div className="flex justify-between pt-1 text-slate-600 font-medium">
                    <span>Received / Paid:</span>
                    <span className="font-mono font-bold text-emerald-600">₹10,000.00</span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-bold">
                    <span>Balance Due:</span>
                    <span className="font-mono text-red-600">₹9,529.00</span>
                  </div>

                  {/* Authorized Signatory */}
                  {showSignature && (
                    <div className="pt-6 text-right">
                      {company?.signature_url ? (
                        <img src={company.signature_url} alt="Signature" className="h-10 ml-auto object-contain mb-1" />
                      ) : (
                        <div className="h-10 font-script text-slate-400 text-sm italic pr-2">Authorized Sign</div>
                      )}
                      <p className="text-[11px] font-bold text-slate-800">For {company?.name || 'VSRM COMPUTER CLASSES'}</p>
                      <p className="text-[10px] text-slate-400">Authorized Signatory</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Greeting Note */}
              {showGreeting && (
                <div 
                  className="pt-3 border-t text-center text-xs font-semibold"
                  style={{ color: selectedColor, borderColor: `${selectedColor}25` }}
                >
                  {greetingText}
                </div>
              )}

            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT: Dedicated Settings & Theme Options matching Screenshot 1 & 2 */}
        {/* ========================================================================= */}
        <div className="w-full lg:w-96 bg-white border-l border-slate-200 overflow-y-auto select-none p-5 space-y-6 shrink-0 shadow-sm">
          
          {/* 1. ThemeStore Festive Carousel matching Screenshot 1 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800">
                <Sparkles className="w-4 h-4 text-[#5c5be5]" />
                <span>ThemeStore</span>
                <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
              </div>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={handlePrevStoreSlide}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-500 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextStoreSlide}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-500 transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Festival Theme Cards Preview Carousel */}
            <div className="grid grid-cols-3 gap-2">
              {festivalThemes.slice(storeSlide, storeSlide + 3).concat(
                festivalThemes.slice(0, Math.max(0, storeSlide + 3 - festivalThemes.length))
              ).slice(0, 3).map((item) => (
                <div 
                  key={item.id}
                  onClick={() => {
                    setSelectedTheme('Luxury');
                    setSelectedColor('#ea580c');
                  }}
                  className={`bg-gradient-to-b ${item.bg} border ${item.border} rounded-xl p-2 flex flex-col items-center text-center cursor-pointer hover:shadow-md transition-all group`}
                >
                  <div className="w-full h-14 bg-white/80 rounded-md border border-white shadow-2xs mb-1.5 flex flex-col p-1 overflow-hidden">
                    <div className="h-1.5 w-8 bg-amber-400 rounded-full mb-1"></div>
                    <div className="h-1 w-full bg-slate-200 rounded-full mb-0.5"></div>
                    <div className="h-1 w-3/4 bg-slate-200 rounded-full mb-1"></div>
                    <div className="mt-auto h-2 w-full bg-amber-100 rounded-xs"></div>
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 group-hover:text-[#5c5be5] transition truncate w-full">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* 2. Themes Selection (Radio & Cards) matching Screenshot 1 */}
          <div className="space-y-3">
            <label className="flex items-center space-x-2.5 cursor-pointer">
              <input
                type="radio"
                name="themeOption"
                checked={themeMode === 'themes'}
                onChange={() => setThemeMode('themes')}
                className="w-4 h-4 text-[#5c5be5] focus:ring-[#5c5be5]"
              />
              <span className="text-xs font-bold text-slate-800">Themes</span>
            </label>

            {/* Thermal Theme Notification Banner matching Screenshot 1 */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-2.5 flex items-start space-x-2 text-[11px] text-amber-900 leading-tight">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                Thermal theme was used previously. To manage preferences, visit{' '}
                <span className="font-bold text-blue-600 underline cursor-pointer">Thermal Settings</span>.
              </div>
            </div>

            {/* Themes Cards Grid matching Screenshot 1 */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              
              {/* Theme 1: Stylish */}
              <div 
                onClick={() => setSelectedTheme('Stylish')}
                className={`border rounded-xl p-2 flex flex-col items-center cursor-pointer transition relative ${
                  selectedTheme === 'Stylish' 
                    ? 'border-[#5c5be5] ring-2 ring-[#eeeffe] bg-blue-50/30' 
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="w-full h-16 bg-white border border-slate-200 rounded-md p-1 flex flex-col shadow-2xs mb-1.5 overflow-hidden">
                  <div className="h-2 w-8 bg-[#5c5be5] rounded-xs mb-1"></div>
                  <div className="h-1 w-full bg-slate-200 rounded-xs mb-0.5"></div>
                  <div className="h-1 w-2/3 bg-slate-200 rounded-xs mb-1"></div>
                  <div className="mt-auto h-2 w-full bg-slate-100 rounded-xs"></div>
                </div>
                <span className="text-[11px] font-bold text-slate-700">Stylish</span>
              </div>

              {/* Theme 2: Luxury (with red/orange NEW badge) */}
              <div 
                onClick={() => setSelectedTheme('Luxury')}
                className={`border rounded-xl p-2 flex flex-col items-center cursor-pointer transition relative ${
                  selectedTheme === 'Luxury' 
                    ? 'border-[#5c5be5] ring-2 ring-[#eeeffe] bg-blue-50/30' 
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <span className="absolute -top-1.5 -left-1 px-1 py-0.2 bg-red-500 text-white text-[9px] font-black rounded shadow-xs">
                  NEW
                </span>
                <div className="w-full h-16 bg-amber-50/50 border border-amber-200 rounded-md p-1 flex flex-col shadow-2xs mb-1.5 overflow-hidden">
                  <div className="h-2 w-8 bg-amber-500 rounded-xs mb-1"></div>
                  <div className="h-1 w-full bg-amber-200 rounded-xs mb-0.5"></div>
                  <div className="h-1 w-2/3 bg-amber-200 rounded-xs mb-1"></div>
                  <div className="mt-auto h-2 w-full bg-amber-200/50 rounded-xs"></div>
                </div>
                <span className="text-[11px] font-bold text-slate-700">Luxury</span>
              </div>

              {/* Theme 3: Advanced GST (Tally) */}
              <div 
                onClick={() => setSelectedTheme('Advanced GST (Tally)')}
                className={`border rounded-xl p-2 flex flex-col items-center cursor-pointer transition relative ${
                  selectedTheme === 'Advanced GST (Tally)' 
                    ? 'border-[#5c5be5] ring-2 ring-[#eeeffe] bg-blue-50/30' 
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="w-full h-16 bg-white border border-slate-200 rounded-md p-1 flex flex-col shadow-2xs mb-1.5 overflow-hidden">
                  <div className="h-2 w-full bg-slate-700 rounded-xs mb-1"></div>
                  <div className="grid grid-cols-3 gap-0.5 mb-1">
                    <div className="h-1 bg-slate-200"></div>
                    <div className="h-1 bg-slate-200"></div>
                    <div className="h-1 bg-slate-200"></div>
                  </div>
                  <div className="mt-auto h-2 w-full bg-slate-100 rounded-xs"></div>
                </div>
                <span className="text-[10px] font-bold text-slate-700 text-center leading-tight">Advanced GST</span>
              </div>

              {/* Theme 4: See All */}
              <div 
                onClick={() => setSelectedTheme('Stylish')}
                className="border border-slate-200 hover:border-slate-300 rounded-xl p-2 flex flex-col items-center justify-center cursor-pointer transition bg-slate-50/50"
              >
                <span className="text-xs font-bold text-blue-600">See All</span>
              </div>

            </div>

            {/* Create Custom Theme Radio matching Screenshot 1 */}
            <div className="pt-2">
              <label className="flex items-center space-x-2.5 cursor-pointer mb-2">
                <input
                  type="radio"
                  name="themeOption"
                  checked={themeMode === 'custom'}
                  onChange={() => setThemeMode('custom')}
                  className="w-4 h-4 text-[#5c5be5] focus:ring-[#5c5be5]"
                />
                <span className="text-xs font-bold text-slate-800 flex items-center space-x-1">
                  <span>Create Custom Theme</span>
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                </span>
              </label>

              <button
                type="button"
                onClick={() => alert('Custom theme builder: Design your header, custom fonts, borders, and margins.')}
                className="w-full py-2 bg-[#5c5be5] hover:bg-[#4a49c9] text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
              >
                Create your own theme
              </button>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* 3. Select Color Swatches matching Screenshot 1 */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-slate-800 block">Select Color</span>
            <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
              {colorPalette.map((color) => {
                const isSelected = selectedColor === color.hex;
                return (
                  <button
                    key={color.hex}
                    type="button"
                    title={color.name}
                    onClick={() => setSelectedColor(color.hex)}
                    className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center cursor-pointer ${
                      isSelected ? 'ring-2 ring-offset-2 ring-[#5c5be5] scale-110' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.hex }}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* 4. Theme Settings Checkboxes matching Screenshot 2 */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-800">Theme Settings</span>
              <span className="px-1.5 py-0.2 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-sm">
                New
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700 font-medium">
              
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPartyBalance}
                  onChange={(e) => setShowPartyBalance(e.target.checked)}
                  className="w-4 h-4 rounded text-[#5c5be5] focus:ring-[#5c5be5]"
                />
                <span>Show party balance in invoice</span>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableFreeQty}
                  onChange={(e) => setEnableFreeQty(e.target.checked)}
                  className="w-4 h-4 rounded text-[#5c5be5] focus:ring-[#5c5be5]"
                />
                <span>Enable free item quantity</span>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showItemDescription}
                  onChange={(e) => setShowItemDescription(e.target.checked)}
                  className="w-4 h-4 rounded text-[#5c5be5] focus:ring-[#5c5be5]"
                />
                <span>Show item description in invoice</span>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAlternateUnit}
                  onChange={(e) => setShowAlternateUnit(e.target.checked)}
                  className="w-4 h-4 rounded text-[#5c5be5] focus:ring-[#5c5be5]"
                />
                <span>Show Alternate Unit in Invoice</span>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPhoneNumber}
                  onChange={(e) => setShowPhoneNumber(e.target.checked)}
                  className="w-4 h-4 rounded text-[#5c5be5] focus:ring-[#5c5be5]"
                />
                <span>Show phone number on Invoice</span>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showTime}
                  onChange={(e) => setShowTime(e.target.checked)}
                  className="w-4 h-4 rounded text-[#5c5be5] focus:ring-[#5c5be5]"
                />
                <span className="flex items-center space-x-1">
                  <span>Show time on Invoices</span>
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                </span>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={priceHistory}
                  onChange={(e) => setPriceHistory(e.target.checked)}
                  className="w-4 h-4 rounded text-[#5c5be5] focus:ring-[#5c5be5]"
                />
                <span className="flex items-center space-x-1">
                  <span>Price History</span>
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                </span>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoApplyLuxuryTheme}
                  onChange={(e) => setAutoApplyLuxuryTheme(e.target.checked)}
                  className="w-4 h-4 rounded text-[#5c5be5] focus:ring-[#5c5be5]"
                />
                <span>Auto-apply luxury theme for sharing</span>
              </label>

            </div>
          </div>

          <hr className="border-slate-100" />

          {/* 5. Accordions matching Screenshot 2 */}
          <div className="space-y-2">
            
            {/* Accordion 1: Invoice Details */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => toggleAccordion('invoiceDetails')}
                className="w-full px-4 py-3 bg-white hover:bg-slate-50 transition flex items-center justify-between text-xs font-bold text-slate-800"
              >
                <span>Invoice Details</span>
                {openAccordions.invoiceDetails ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </button>

              {openAccordions.invoiceDetails && (
                <div className="p-4 bg-slate-50/50 border-t border-slate-100 space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Invoice Title</label>
                    <input
                      type="text"
                      value={invoiceTitle}
                      onChange={(e) => setInvoiceTitle(e.target.value)}
                      placeholder="TAX INVOICE"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Invoice Prefix</label>
                    <input
                      type="text"
                      value={invoicePrefix}
                      onChange={(e) => setInvoicePrefix(e.target.value)}
                      placeholder="INV-"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-2 pt-1 font-medium text-slate-700">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" checked={showDueDate} onChange={(e) => setShowDueDate(e.target.checked)} className="rounded text-[#5c5be5]" />
                      <span>Show Payment Due Date</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" checked={showPoDetails} onChange={(e) => setShowPoDetails(e.target.checked)} className="rounded text-[#5c5be5]" />
                      <span>Show Purchase Order (PO) Details</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" checked={showEwayBill} onChange={(e) => setShowEwayBill(e.target.checked)} className="rounded text-[#5c5be5]" />
                      <span>Show E-Way Bill Number on Invoice</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" checked={showVehicleNo} onChange={(e) => setShowVehicleNo(e.target.checked)} className="rounded text-[#5c5be5]" />
                      <span>Show Transport Vehicle Number</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Accordion 2: Party Details */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => toggleAccordion('partyDetails')}
                className="w-full px-4 py-3 bg-white hover:bg-slate-50 transition flex items-center justify-between text-xs font-bold text-slate-800"
              >
                <span>Party Details</span>
                {openAccordions.partyDetails ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </button>

              {openAccordions.partyDetails && (
                <div className="p-4 bg-slate-50/50 border-t border-slate-100 space-y-2.5 text-xs font-medium text-slate-700">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={showShippingAddress} onChange={(e) => setShowShippingAddress(e.target.checked)} className="rounded text-[#5c5be5]" />
                    <span>Show Shipping / Delivery Address</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={showPartyGstin} onChange={(e) => setShowPartyGstin(e.target.checked)} className="rounded text-[#5c5be5]" />
                    <span>Show Party GSTIN</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={showPartyPan} onChange={(e) => setShowPartyPan(e.target.checked)} className="rounded text-[#5c5be5]" />
                    <span>Show Party PAN Number</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={showPlaceOfSupply} onChange={(e) => setShowPlaceOfSupply(e.target.checked)} className="rounded text-[#5c5be5]" />
                    <span>Show Place of Supply & State Code</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={showPartyPhone} onChange={(e) => setShowPartyPhone(e.target.checked)} className="rounded text-[#5c5be5]" />
                    <span>Show Party Mobile Number</span>
                  </label>
                </div>
              )}
            </div>

            {/* Accordion 3: Item Table Columns */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => toggleAccordion('itemColumns')}
                className="w-full px-4 py-3 bg-white hover:bg-slate-50 transition flex items-center justify-between text-xs font-bold text-slate-800"
              >
                <span>Item Table Columns</span>
                {openAccordions.itemColumns ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </button>

              {openAccordions.itemColumns && (
                <div className="p-4 bg-slate-50/50 border-t border-slate-100 space-y-2.5 text-xs font-medium text-slate-700">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={showHsn} onChange={(e) => setShowHsn(e.target.checked)} className="rounded text-[#5c5be5]" />
                    <span>Show HSN / SAC Code Column</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={showBatch} onChange={(e) => setShowBatch(e.target.checked)} className="rounded text-[#5c5be5]" />
                    <span>Show Batch Number & Expiry Date</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={showSerial} onChange={(e) => setShowSerial(e.target.checked)} className="rounded text-[#5c5be5]" />
                    <span>Show Serial Number / IMEI Column</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={showMrp} onChange={(e) => setShowMrp(e.target.checked)} className="rounded text-[#5c5be5]" />
                    <span>Show MRP Column</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={showDiscount} onChange={(e) => setShowDiscount(e.target.checked)} className="rounded text-[#5c5be5]" />
                    <span>Show Discount Column</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={showTax} onChange={(e) => setShowTax(e.target.checked)} className="rounded text-[#5c5be5]" />
                    <span>Show GST Tax Rate & Amount</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={showFreeQuantity} onChange={(e) => setShowFreeQuantity(e.target.checked)} className="rounded text-[#5c5be5]" />
                    <span>Show Free Quantity Column</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={showCess} onChange={(e) => setShowCess(e.target.checked)} className="rounded text-[#5c5be5]" />
                    <span>Show Cess Column</span>
                  </label>
                </div>
              )}
            </div>

            {/* Accordion 4: Miscellaneous Details */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => toggleAccordion('miscDetails')}
                className="w-full px-4 py-3 bg-white hover:bg-slate-50 transition flex items-center justify-between text-xs font-bold text-slate-800"
              >
                <div className="flex items-center space-x-2">
                  <span>Miscellaneous Details</span>
                  <span className="px-1.5 py-0.2 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-sm">
                    New
                  </span>
                </div>
                {openAccordions.miscDetails ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </button>

              {openAccordions.miscDetails && (
                <div className="p-4 bg-slate-50/50 border-t border-slate-100 space-y-3 text-xs">
                  <div className="space-y-2.5 font-medium text-slate-700">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" checked={showBankDetails} onChange={(e) => setShowBankDetails(e.target.checked)} className="rounded text-[#5c5be5]" />
                      <span>Show Bank Account Details</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" checked={showUpiQr} onChange={(e) => setShowUpiQr(e.target.checked)} className="rounded text-[#5c5be5]" />
                      <span>Show Dynamic UPI QR Code for instant payment</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" checked={showTerms} onChange={(e) => setShowTerms(e.target.checked)} className="rounded text-[#5c5be5]" />
                      <span>Show Terms & Conditions</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" checked={showSignature} onChange={(e) => setShowSignature(e.target.checked)} className="rounded text-[#5c5be5]" />
                      <span>Show Authorized Signatory signature image</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" checked={showTagline} onChange={(e) => setShowTagline(e.target.checked)} className="rounded text-[#5c5be5]" />
                      <span>Show Company Tagline under business name</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" checked={showGreeting} onChange={(e) => setShowGreeting(e.target.checked)} className="rounded text-[#5c5be5]" />
                      <span>Show Greeting / Thank You Note at bottom</span>
                    </label>
                  </div>

                  {showGreeting && (
                    <div className="pt-2">
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">Greeting Text</label>
                      <input
                        type="text"
                        value={greetingText}
                        onChange={(e) => setGreetingText(e.target.value)}
                        placeholder="Thank you for your business!"
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleSaveChanges}
              disabled={saving}
              className="w-full py-2.5 bg-[#5c5be5] hover:bg-[#4a49c9] text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Changes...' : 'Save Invoice Preferences'}</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
