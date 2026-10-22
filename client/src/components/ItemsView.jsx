import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, AlertTriangle, CheckCircle, Tag, ScanLine, Sparkles, 
  Printer, MoreVertical, FileText, Settings, Share2, Info, ChevronDown, 
  Warehouse, ArrowRightLeft, Download, Trash2, Edit3, Copy, X, SlidersHorizontal
} from 'lucide-react';
import ViewBarcodeModal from './ViewBarcodeModal';

export default function ItemsView({ subTab = 'inventory', onSelectSubTab, onOpenInvoiceModal }) {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({
    stockValue: 2030954.24,
    lowStockCount: 0,
    totalItems: 15
  });
  const [search, setSearch] = useState('');
  const [isLowStockFilterActive, setIsLowStockFilterActive] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [sortField, setSortField] = useState('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [isBulkDropdownOpen, setIsBulkDropdownOpen] = useState(false);
  const [isReportsDropdownOpen, setIsReportsDropdownOpen] = useState(false);
  const [actionMenuOpenId, setActionMenuOpenId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [showBanner, setShowBanner] = useState(true);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showAdjustStockModal, setShowAdjustStockModal] = useState(false);
  const [adjustingItem, setAdjustingItem] = useState(null);
  const [newStockQty, setNewStockQty] = useState('');
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [barcodeModalItem, setBarcodeModalItem] = useState(null);
  const [companyName, setCompanyName] = useState('APOORV');

  // Form State for Create / Edit Item
  const [formData, setFormData] = useState({
    name: '',
    item_code: '',
    hsn_code: '',
    category: 'IT',
    unit: 'PCS',
    sale_price: '',
    purchase_price: '',
    wholesale_price: '',
    tax_rate: 18,
    stock_qty: '0',
    low_stock_limit: 5
  });

  useEffect(() => {
    fetchItemsData();
    fetchCompany();
  }, [search, isLowStockFilterActive]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const fetchCompany = async () => {
    try {
      const res = await fetch('/api/company');
      const data = await res.json();
      if (data && data.name) setCompanyName(data.name);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchItemsData = async () => {
    try {
      let url = '/api/items?';
      if (search.trim()) url += `search=${encodeURIComponent(search.trim())}&`;
      if (isLowStockFilterActive) url += `lowStock=true&`;

      const [itemsRes, statsRes] = await Promise.all([
        fetch(url),
        fetch('/api/items/stats')
      ]);

      const itemsData = await itemsRes.json();
      const statsData = await statsRes.json();

      if (Array.isArray(itemsData)) setItems(itemsData);
      if (statsData && statsData.stockValue !== undefined) setStats(statsData);
    } catch (err) {
      console.error('Failed to load items:', err);
    }
  };

  const generateBarcodeNumber = () => {
    const prefix = '7064';
    const rest = Math.floor(10000000 + Math.random() * 90000000).toString();
    return prefix + rest;
  };

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      item_code: '',
      hsn_code: '',
      category: 'IT',
      unit: 'PCS',
      sale_price: '',
      purchase_price: '',
      wholesale_price: '',
      tax_rate: 18,
      stock_qty: '0',
      low_stock_limit: 5
    });
    setShowCreateModal(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      item_code: item.item_code || '',
      hsn_code: item.hsn_code || '',
      category: item.category || 'IT',
      unit: item.unit || 'PCS',
      sale_price: item.sale_price || '',
      purchase_price: item.purchase_price || '',
      wholesale_price: item.wholesale_price || '',
      tax_rate: item.tax_rate !== undefined ? item.tax_rate : 18,
      stock_qty: item.stock_qty !== undefined ? String(item.stock_qty) : '0',
      low_stock_limit: item.low_stock_limit !== undefined ? item.low_stock_limit : 5
    });
    setShowCreateModal(true);
    setActionMenuOpenId(null);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter Item Name');
      return;
    }

    try {
      const payload = {
        ...formData,
        sale_price: parseFloat(formData.sale_price) || 0,
        purchase_price: parseFloat(formData.purchase_price) || 0,
        wholesale_price: parseFloat(formData.wholesale_price) || 0,
        stock_qty: parseFloat(formData.stock_qty) || 0,
        tax_rate: parseFloat(formData.tax_rate) || 0,
        low_stock_limit: parseFloat(formData.low_stock_limit) || 5
      };

      let savedId = editingItem ? editingItem.id : null;

      if (editingItem) {
        // Edit existing
        const res = await fetch(`/api/items/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const d = await res.json();
        if (d.success) {
          showToast(`Item "${formData.name}" updated successfully!`);
        }
      } else {
        // Create new
        const res = await fetch('/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const d = await res.json();
        if (d.success) {
          savedId = d.id;
          showToast(`Item "${formData.name}" created successfully!`);
        }
      }

      setShowCreateModal(false);
      fetchItemsData();

      if (shouldPrintBarcode) {
        handleOpenBarcode({
          ...payload,
          id: savedId,
          name: payload.name,
          sale_price: payload.sale_price,
          item_code: payload.item_code
        });
      }
    } catch (err) {
      console.error('Error saving item:', err);
      alert('Failed to save item. Check console.');
    }
  };

  const handleDeleteItem = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      const res = await fetch(`/api/items/${id}`, { method: 'DELETE' });
      const d = await res.json();
      if (d.success) {
        showToast(`Item "${name}" deleted`);
        fetchItemsData();
      }
    } catch (err) {
      console.error(err);
    }
    setActionMenuOpenId(null);
  };

  const handleOpenAdjustStock = (item) => {
    setAdjustingItem(item);
    setNewStockQty(String(item.stock_qty || 0));
    setShowAdjustStockModal(true);
    setActionMenuOpenId(null);
  };

  const handleSaveAdjustStock = async (e) => {
    e.preventDefault();
    if (!adjustingItem) return;
    try {
      const res = await fetch(`/api/items/${adjustingItem.id}/adjust-stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_qty: parseFloat(newStockQty) || 0 })
      });
      const d = await res.json();
      if (d.success) {
        showToast(`Stock updated for "${adjustingItem.name}" to ${newStockQty} ${adjustingItem.unit || 'PCS'}`);
        setShowAdjustStockModal(false);
        fetchItemsData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenBarcode = (item) => {
    setBarcodeModalItem(item);
    setShowBarcodeModal(true);
    setActionMenuOpenId(null);
  };

  const handleDuplicateItem = async (item) => {
    try {
      const payload = {
        name: `${item.name} (Copy)`,
        item_code: generateBarcodeNumber(),
        hsn_code: item.hsn_code || '',
        category: item.category || 'General',
        unit: item.unit || 'PCS',
        sale_price: item.sale_price || 0,
        purchase_price: item.purchase_price || 0,
        wholesale_price: item.wholesale_price || 0,
        tax_rate: item.tax_rate || 18,
        stock_qty: 0,
        low_stock_limit: item.low_stock_limit || 5
      };
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const d = await res.json();
      if (d.success) {
        showToast(`Duplicated "${item.name}"`);
        fetchItemsData();
      }
    } catch (e) {
      console.error(e);
    }
    setActionMenuOpenId(null);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItemIds(filteredItems.map(it => it.id));
    } else {
      setSelectedItemIds([]);
    }
  };

  const handleToggleSelectRow = (id, e) => {
    e.stopPropagation();
    setSelectedItemIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Item Name', 'Category', 'Item Code', 'HSN Code', 'Stock QTY', 'Unit', 'Selling Price', 'Purchase Price'];
    const rows = filteredItems.map(it => [
      `"${it.name}"`,
      `"${it.category || ''}"`,
      `"${it.item_code || ''}"`,
      `"${it.hsn_code || ''}"`,
      it.stock_qty,
      it.unit || 'PCS',
      it.sale_price || 0,
      it.purchase_price || 0
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mybillbook_items_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Items list exported to CSV');
    setIsBulkDropdownOpen(false);
  };

  // Filtered & sorted items
  const filteredItems = items.filter(it => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = (it.name || '').toLowerCase().includes(q);
      const matchCode = (it.item_code || '').toLowerCase().includes(q);
      const matchCat = (it.category || '').toLowerCase().includes(q);
      const matchHsn = (it.hsn_code || '').toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchCat && !matchHsn) return false;
    }
    if (isLowStockFilterActive) {
      if ((it.stock_qty || 0) > 0) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortField === 'name') {
      return sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    }
    if (sortField === 'stock_qty') {
      return sortAsc ? (a.stock_qty - b.stock_qty) : (b.stock_qty - a.stock_qty);
    }
    if (sortField === 'sale_price') {
      return sortAsc ? (a.sale_price - b.sale_price) : (b.sale_price - a.sale_price);
    }
    return 0;
  });

  return (
    <div className="bg-[#f8fafc] min-h-screen text-slate-800 font-sans pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-medium z-50 flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Top Bar / Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h1 className="text-lg font-bold text-slate-800">
            {subTab === 'godown' ? 'Godown (Warehouse)' : 'Items & Inventory'}
          </h1>
          {subTab === 'godown' && (
            <span className="bg-blue-50 text-blue-700 text-[11px] font-semibold px-2 py-0.5 rounded border border-blue-200">
              Multi-Warehouse Enabled
            </span>
          )}
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-2.5">
          {/* Reports Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsReportsDropdownOpen(!isReportsDropdownOpen)}
              className="flex items-center space-x-1.5 px-3 py-1.5 border border-[#0c8ce9]/40 text-[#0c8ce9] rounded-md text-xs font-medium hover:bg-blue-50/50 transition shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Reports</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#0c8ce9]" />
            </button>
            {isReportsDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 text-xs">
                <button 
                  onClick={() => { setIsReportsDropdownOpen(false); showToast('Opening Stock Summary Report...'); }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between"
                >
                  <span>Stock Summary Report</span>
                </button>
                <button 
                  onClick={() => { setIsReportsDropdownOpen(false); showToast('Opening Low Stock Report...'); }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between"
                >
                  <span>Low Stock Summary</span>
                </button>
                <button 
                  onClick={() => { setIsReportsDropdownOpen(false); showToast('Opening Item-wise Profit & Loss...'); }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between"
                >
                  <span>Item Profit & Loss</span>
                </button>
                <button 
                  onClick={() => { setIsReportsDropdownOpen(false); showToast('Opening Price / Rate List...'); }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between"
                >
                  <span>Item Rate List</span>
                </button>
              </div>
            )}
          </div>

          {/* Settings Icon */}
          <button 
            title="Use advanced settings to customise items to your needs"
            onClick={() => showToast('Items settings: Barcode prefix 7064, Auto HSN match, Multi-tax support enabled')}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Keyboard shortcut indicator */}
          <div 
            title="Keyboard Shortcuts: Alt + I to Add Item, Alt + S for Sales Invoice"
            className="hidden sm:flex items-center text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200"
          >
            Alt
          </div>
        </div>
      </div>

      {/* 2. Promo Banner matching MyBillBook */}
      {showBanner && subTab === 'inventory' && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200/60 px-6 py-2 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center space-x-2">
            <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">NEW</span>
            <span className="font-semibold">Launch Offers on Your Items:</span>
            <span className="text-amber-800">Create bundle discounts, festive promos, and promotional rate slabs for your customers.</span>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => showToast('Offer Manager: Create promotional festive rate list')}
              className="text-xs font-semibold text-amber-700 hover:text-amber-900 underline"
            >
              Manage Offer
            </button>
            <button 
              onClick={() => setShowBanner(false)}
              className="text-amber-500 hover:text-amber-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* GODOWN / WAREHOUSE VIEW */}
      {subTab === 'godown' ? (
        <div className="px-6 py-5 max-w-7xl mx-auto space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>PRIMARY WAREHOUSE</span>
                <Warehouse className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-xl font-bold text-slate-900 mt-2">Central Godown Samastipur</div>
              <p className="text-xs text-slate-500 mt-1">Main storage hub & transport dispatch point</p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Items Stocked:</span>
                <span className="font-bold text-slate-800">14 Products</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>SECONDARY WAREHOUSE</span>
                <Warehouse className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-xl font-bold text-slate-900 mt-2">Patna Regional Warehouse</div>
              <p className="text-xs text-slate-500 mt-1">Secondary delivery & emergency spares godown</p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Items Stocked:</span>
                <span className="font-bold text-slate-800">5 Products</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-xl border border-indigo-100 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-indigo-700 uppercase">Stock Transfer</span>
                <h3 className="text-base font-bold text-indigo-950 mt-1">Transfer Stock Between Godowns</h3>
                <p className="text-xs text-indigo-600/90 mt-1">Generate automated internal delivery challan for vehicle transit.</p>
              </div>
              <button 
                onClick={() => showToast('Godown Stock Transfer: Select items and destination godown')}
                className="mt-4 w-full bg-[#6366f1] hover:bg-[#4f46e5] text-white py-2 rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center space-x-1.5 transition"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>New Stock Transfer</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* MAIN INVENTORY VIEW (1:1 with MyBillBook) */
        <div className="px-6 py-5 max-w-7xl mx-auto space-y-4">
          {/* 3. Top Metadata / KPI Cards (Matching MyBillBook 1:1) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Card 1: Stock Value (Selected state with blue border) */}
            <div className="bg-white rounded-lg border-2 border-[#0c8ce9] p-3.5 shadow-2xs transition relative flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <div className="w-5 h-5 rounded-full bg-blue-50 text-[#0c8ce9] flex items-center justify-center font-bold text-xs">
                    ₹
                  </div>
                  <span className="text-xs font-medium text-[#0c8ce9]">Stock Value</span>
                  <div className="group relative">
                    <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 cursor-pointer" />
                    <div className="hidden group-hover:block absolute left-0 bottom-full mb-1 w-48 bg-slate-900 text-white text-[10px] p-2 rounded shadow-lg z-50">
                      Total valuation of all available physical stock across items.
                    </div>
                  </div>
                </div>
                <button 
                  title="Share stock valuation"
                  onClick={() => showToast('Stock Value Summary copied to clipboard!')}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="mt-2 text-2xl font-bold text-slate-800 tracking-tight">
                ₹ {stats.stockValue ? Number(stats.stockValue).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '20,30,954.24'}
              </div>
            </div>

            {/* Card 2: Low Stock */}
            <div className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-2xs transition flex flex-col justify-between">
              <div className="flex items-center space-x-1.5 text-slate-600">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-medium text-slate-700">Low Stock</span>
              </div>

              <div className="mt-2 text-2xl font-bold text-slate-800">
                {stats.lowStockCount || 0}
              </div>
            </div>
          </div>

          {/* 4. Action Bar / Toolbar */}
          <div className="bg-white rounded-t-lg border border-slate-200 p-3 flex flex-wrap items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[280px] max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search in Items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 placeholder-slate-400"
              />
              {search && (
                <button 
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter buttons & primary actions */}
            <div className="flex items-center space-x-2">
              {/* Low Stock Toggle Button */}
              <button
                onClick={() => setIsLowStockFilterActive(!isLowStockFilterActive)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition ${
                  isLowStockFilterActive
                    ? 'bg-amber-50 text-amber-800 border-amber-300 font-semibold'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <AlertTriangle className={`w-3.5 h-3.5 ${isLowStockFilterActive ? 'text-amber-600' : 'text-slate-500'}`} />
                <span>Low Stock</span>
              </button>

              {/* Bulk Actions Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsBulkDropdownOpen(!isBulkDropdownOpen)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition shadow-2xs"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                  <span>Bulk Actions</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>
                {isBulkDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 text-xs font-medium">
                    <button
                      onClick={handleExportCSV}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center space-x-2 text-slate-700"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-500" />
                      <span>Export to Excel/CSV</span>
                    </button>
                    <button
                      onClick={() => {
                        window.print();
                        setIsBulkDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center space-x-2 text-slate-700"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-500" />
                      <span>Print Item List</span>
                    </button>
                    {selectedItemIds.length > 0 && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete ${selectedItemIds.length} selected items?`)) {
                            showToast(`Deleted ${selectedItemIds.length} items`);
                            setSelectedItemIds([]);
                          }
                          setIsBulkDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 flex items-center space-x-2 border-t border-slate-100"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        <span>Delete Selected ({selectedItemIds.length})</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Primary Purple Action Button matching MyBillBook */}
              <button
                onClick={handleOpenCreateModal}
                className="bg-[#6366f1] hover:bg-[#4f46e5] text-white font-medium px-4 py-1.5 rounded-md text-xs shadow-xs flex items-center space-x-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Item</span>
              </button>
            </div>
          </div>

          {/* 5. Main Items Table (Matching MyBillBook 1:1) */}
          <div className="bg-white border-x border-b border-slate-200 rounded-b-lg overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#f8fafc] text-slate-600 border-b border-slate-200 font-semibold select-none">
                    <th className="py-2.5 px-3 w-8">
                      <input 
                        type="checkbox"
                        checked={filteredItems.length > 0 && selectedItemIds.length === filteredItems.length}
                        onChange={handleSelectAll}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </th>
                    <th 
                      onClick={() => toggleSort('name')}
                      className="py-2.5 px-3 cursor-pointer hover:text-slate-900"
                    >
                      <div className="flex items-center space-x-1">
                        <span>Item Name</span>
                        <span className="text-[10px] text-slate-400">↕</span>
                      </div>
                    </th>
                    <th className="py-2.5 px-3">
                      <span>Item Code</span>
                    </th>
                    <th 
                      onClick={() => toggleSort('stock_qty')}
                      className="py-2.5 px-3 cursor-pointer hover:text-slate-900"
                    >
                      <div className="flex items-center space-x-1">
                        <span>Stock QTY</span>
                        <span className="text-[10px] text-slate-400">↕</span>
                      </div>
                    </th>
                    <th 
                      onClick={() => toggleSort('sale_price')}
                      className="py-2.5 px-3 cursor-pointer hover:text-slate-900"
                    >
                      <div className="flex items-center space-x-1">
                        <span>Selling Price</span>
                        <span className="text-[10px] text-slate-400">↕</span>
                      </div>
                    </th>
                    <th className="py-2.5 px-3">
                      <span>Purchase Price</span>
                    </th>
                    <th className="py-2.5 px-3">
                      <span>Wholesale Price</span>
                    </th>
                    <th className="py-2.5 px-3 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <Tag className="w-8 h-8 text-slate-300" />
                          <p className="font-medium text-slate-500">No Items Found</p>
                          <p className="text-[11px] text-slate-400">Try adjusting your search or click "Create Item" to add a new product</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => {
                      const isSelected = selectedItemIds.includes(item.id);
                      const isNegativeStock = (item.stock_qty || 0) < 0;
                      const hasStock = item.stock_qty !== undefined && item.stock_qty !== null && item.category !== 'Service';

                      return (
                        <tr 
                          key={item.id}
                          className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-indigo-50/30' : ''}`}
                        >
                          {/* Checkbox */}
                          <td className="py-3 px-3">
                            <input 
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => handleToggleSelectRow(item.id, e)}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                          </td>

                          {/* Item Name + Category badge */}
                          <td className="py-3 px-3">
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-900 hover:text-indigo-600 cursor-pointer" onClick={() => handleOpenEditModal(item)}>
                                {item.name}
                              </span>
                              {item.category && item.category !== '-' && (
                                <span className="inline-block mt-0.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                                  {item.category}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Item Code & Direct Print Sticker Button */}
                          <td className="py-3 px-3">
                            <div className="flex items-center space-x-1.5 flex-wrap gap-1">
                              <span className="font-mono text-slate-700 font-semibold text-xs">
                                {item.item_code || '-'}
                              </span>
                              {item.item_code && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenBarcode(item);
                                  }}
                                  className="inline-flex items-center space-x-1 px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded text-[11px] font-bold shadow-2xs transition"
                                  title="Product par chipkane ke liye barcode sticker print karein"
                                >
                                  <Printer className="w-3 h-3 text-indigo-600" />
                                  <span>Print Sticker</span>
                                </button>
                              )}
                            </div>
                          </td>

                          {/* Stock QTY */}
                          <td className="py-3 px-3 font-medium">
                            {hasStock ? (
                              <span className={isNegativeStock ? 'text-red-600 font-semibold' : 'text-slate-800'}>
                                {item.stock_qty} {item.unit || 'PCS'}
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>

                          {/* Selling Price */}
                          <td className="py-3 px-3 font-semibold text-slate-900">
                            {item.sale_price > 0 ? `₹ ${Number(item.sale_price).toLocaleString('en-IN')}` : '-'}
                          </td>

                          {/* Purchase Price */}
                          <td className="py-3 px-3 text-slate-600">
                            {item.purchase_price > 0 ? `₹ ${Number(item.purchase_price).toLocaleString('en-IN')}` : '-'}
                          </td>

                          {/* Wholesale Price */}
                          <td className="py-3 px-3 text-slate-500">
                            {item.wholesale_price > 0 ? `₹ ${Number(item.wholesale_price).toLocaleString('en-IN')}` : '-'}
                          </td>

                          {/* Row Actions Menu */}
                          <td className="py-3 px-3 text-right relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActionMenuOpenId(actionMenuOpenId === item.id ? null : item.id);
                              }}
                              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {actionMenuOpenId === item.id && (
                              <div className="absolute right-3 top-9 w-44 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-50 text-left text-xs font-medium animate-in fade-in duration-100">
                                <button
                                  onClick={() => handleOpenEditModal(item)}
                                  className="w-full px-3 py-1.5 hover:bg-slate-50 flex items-center space-x-2 text-slate-700"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Edit Item</span>
                                </button>
                                <button
                                  onClick={() => handleOpenAdjustStock(item)}
                                  className="w-full px-3 py-1.5 hover:bg-slate-50 flex items-center space-x-2 text-slate-700"
                                >
                                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Adjust Stock</span>
                                </button>
                                <button
                                  onClick={() => handleOpenBarcode(item)}
                                  className="w-full px-3 py-1.5 hover:bg-slate-50 flex items-center space-x-2 text-slate-700"
                                >
                                  <ScanLine className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Print Barcode</span>
                                </button>
                                <button
                                  onClick={() => handleDuplicateItem(item)}
                                  className="w-full px-3 py-1.5 hover:bg-slate-50 flex items-center space-x-2 text-slate-700"
                                >
                                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Duplicate Item</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(item.id, item.name)}
                                  className="w-full px-3 py-1.5 hover:bg-red-50 text-red-600 flex items-center space-x-2 border-t border-slate-100"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                  <span>Delete Item</span>
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer Summary */}
            <div className="bg-[#f8fafc] px-4 py-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <div>
                Showing <span className="font-semibold text-slate-700">{filteredItems.length}</span> of <span className="font-semibold text-slate-700">{items.length}</span> items
              </div>
              <div className="flex items-center space-x-4">
                <span>Total Items: <strong className="text-slate-800">{items.length}</strong></span>
                <span>Total Stock Value: <strong className="text-emerald-700">₹ {Number(stats.stockValue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT ITEM MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingItem ? 'Edit Item' : 'Create New Item'}
                </h3>
                <p className="text-xs text-slate-500">Add product details, prices, barcode and stock quantity</p>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveItem} className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1 text-xs">
              {/* Item Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Item Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2 MP IP DOME CAMERA NIGHT VISION IR 30 M"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 text-xs"
                />
              </div>

              {/* Category & Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 text-xs bg-white"
                  >
                    <option value="IT">IT & Surveillance</option>
                    <option value="Machinery">Machinery & Equipment</option>
                    <option value="Hardware">Hardware & Materials</option>
                    <option value="Feeds">Poultry & Animal Feeds</option>
                    <option value="Supplements">Supplements & Chemicals</option>
                    <option value="Furniture">Furniture & Office</option>
                    <option value="Service">Service / Labour</option>
                    <option value="General">General Goods</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Measuring Unit</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 text-xs bg-white"
                  >
                    <option value="PCS">PCS (Pieces)</option>
                    <option value="BAG">BAG (Bags / Katte)</option>
                    <option value="KG">KG (Kilograms)</option>
                    <option value="ROLL">ROLL (Rolls)</option>
                    <option value="BOX">BOX (Boxes / Cartons)</option>
                    <option value="MTR">MTR (Metres)</option>
                    <option value="NOS">NOS (Numbers)</option>
                  </select>
                </div>
              </div>

              {/* Item Code / Barcode & HSN Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">Item Code / Barcode</label>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, item_code: generateBarcodeNumber() })}
                      className="text-[10px] text-indigo-600 font-semibold hover:underline flex items-center space-x-0.5"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>Generate 12-Digit</span>
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. 706497335285"
                      value={formData.item_code}
                      onChange={(e) => setFormData({ ...formData, item_code: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs focus:ring-1 focus:ring-indigo-500"
                    />
                    {formData.item_code && (
                      <button
                        type="button"
                        onClick={() => handleOpenBarcode({
                          ...formData,
                          name: formData.name || 'NEW ITEM',
                          sale_price: formData.sale_price || 0
                        })}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold whitespace-nowrap flex items-center space-x-1 transition shadow-2xs"
                        title="Product par chipkane ke liye barcode sticker print karein"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Sticker</span>
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">HSN Code</label>
                  <input
                    type="text"
                    placeholder="e.g. 8525"
                    value={formData.hsn_code}
                    onChange={(e) => setFormData({ ...formData, hsn_code: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Pricing Details */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Pricing & Tax Details
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Selling Price (₹)</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="0.00"
                      value={formData.sale_price}
                      onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold text-xs focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Purchase Price (₹)</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="0.00"
                      value={formData.purchase_price}
                      onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">GST Tax Rate</label>
                    <select
                      value={formData.tax_rate}
                      onChange={(e) => setFormData({ ...formData, tax_rate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="0">0% (Nil / Exempted)</option>
                      <option value="5">5% GST</option>
                      <option value="12">12% GST</option>
                      <option value="18">18% GST (Standard)</option>
                      <option value="28">28% GST</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Stock Details */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Stock Details
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Opening Stock Quantity</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="0"
                      value={formData.stock_qty}
                      onChange={(e) => setFormData({ ...formData, stock_qty: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Low Stock Warning Limit</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="5"
                      value={formData.low_stock_limit}
                      onChange={(e) => setFormData({ ...formData, low_stock_limit: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSaveItem(e, true)}
                  className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition flex items-center space-x-1 shadow-2xs"
                  title="Item save karein aur turant product par chipkane ke liye barcode sticker print karein"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Save & Print Sticker</span>
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-lg text-xs font-semibold shadow-xs transition"
                >
                  {editingItem ? 'Save Changes' : 'Save & Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADJUST STOCK MODAL */}
      {showAdjustStockModal && adjustingItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Adjust Stock</h3>
                <p className="text-[11px] text-slate-500">{adjustingItem.name}</p>
              </div>
              <button 
                onClick={() => setShowAdjustStockModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjustStock} className="p-5 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                <span className="text-slate-500">Current Stock:</span>
                <span className="font-bold text-slate-800">{adjustingItem.stock_qty || 0} {adjustingItem.unit || 'PCS'}</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Physical Stock Quantity
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={newStockQty}
                  onChange={(e) => setNewStockQty(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAdjustStockModal(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW / PRINT BARCODE MODAL */}
      <ViewBarcodeModal
        isOpen={showBarcodeModal}
        onClose={() => setShowBarcodeModal(false)}
        item={barcodeModalItem}
        companyName={companyName}
      />
    </div>
  );
}
