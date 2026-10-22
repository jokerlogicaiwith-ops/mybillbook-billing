import React, { useState, useEffect } from 'react';
import { Plus, Search, Package, AlertTriangle, CheckCircle, Tag, ScanLine, Sparkles, Printer } from 'lucide-react';
import ViewBarcodeModal from './ViewBarcodeModal';

export default function ItemsView() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [companyName, setCompanyName] = useState('CreaNext');

  // Barcode Modal State
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [barcodeModalItem, setBarcodeModalItem] = useState(null);

  const [newItem, setNewItem] = useState({
    name: '',
    item_code: '',
    hsn_code: '',
    category: 'General',
    unit: 'PCS',
    sale_price: '',
    purchase_price: '',
    tax_rate: 18,
    stock_qty: '',
    low_stock_limit: 5
  });

  useEffect(() => {
    fetchItems();
    fetchCompany();
  }, [search, categoryFilter]);

  const fetchCompany = async () => {
    try {
      const res = await fetch('/api/company');
      const data = await res.json();
      if (data && data.name) {
        setCompanyName(data.name);
      }
    } catch (err) {
      console.error('Failed to fetch company', err);
    }
  };

  const fetchItems = async () => {
    try {
      let url = '/api/items?';
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (categoryFilter !== 'all') url += `category=${encodeURIComponent(categoryFilter)}`;
      const res = await fetch(url);
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Generate 12-digit barcode number (like in myBillBook screenshot: 706421053767)
  const generateBarcodeNumber = () => {
    const prefix = '7064';
    const rest = Math.floor(10000000 + Math.random() * 90000000).toString();
    return prefix + rest;
  };

  const handleOpenBarcode = (item) => {
    setBarcodeModalItem(item);
    setShowBarcodeModal(true);
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    try {
      // If barcode / item_code is blank, auto-assign 12-digit barcode
      const finalItemCode = newItem.item_code?.trim() || generateBarcodeNumber();

      const payload = {
        ...newItem,
        item_code: finalItemCode
      };

      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setNewItem({
          name: '',
          item_code: '',
          hsn_code: '',
          category: 'General',
          unit: 'PCS',
          sale_price: '',
          purchase_price: '',
          tax_rate: 18,
          stock_qty: '',
          low_stock_limit: 5
        });
        fetchItems();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const totalStockValue = items.reduce((sum, item) => sum + (item.stock_qty * item.purchase_price), 0);
  const lowStockCount = items.filter(item => item.stock_qty <= item.low_stock_limit).length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Inventory & Items</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage stock levels, wholesale/retail pricing, HSN, GST & Barcode</p>
        </div>
        <button
          onClick={() => {
            setNewItem({
              name: '',
              item_code: generateBarcodeNumber(), // Auto assign barcode on new item
              hsn_code: '',
              category: 'General',
              unit: 'PCS',
              sale_price: '',
              purchase_price: '',
              tax_rate: 18,
              stock_qty: '',
              low_stock_limit: 5
            });
            setShowAddModal(true);
          }}
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow transition"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Add New Product</span>
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Products</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{items.length} Items</span>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Stock Valuation</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">₹{totalStockValue.toLocaleString('en-IN')}</span>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <Tag className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Low Stock Alerts</span>
            <span className={`text-2xl font-black mt-1 block ${lowStockCount > 0 ? 'text-amber-500' : 'text-slate-400'}`}>
              {lowStockCount} Items
            </span>
          </div>
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search items by name, barcode (e.g. 706421053767), or HSN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Item Name</th>
              <th className="py-3 px-4">Barcode / Code</th>
              <th className="py-3 px-4">HSN</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4 text-center">Stock</th>
              <th className="py-3 px-4 text-right">Sale Price</th>
              <th className="py-3 px-4 text-right">Purchase Price</th>
              <th className="py-3 px-4 text-center">Tax %</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {items.map(it => {
              const isLow = it.stock_qty <= it.low_stock_limit;
              return (
                <tr key={it.id} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <div>{it.name}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    {it.item_code ? (
                      <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-700 font-semibold">
                        {it.item_code}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">-</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">{it.hsn_code || '-'}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-semibold">
                      {it.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                      isLow ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {it.stock_qty} {it.unit}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900 font-mono">
                    ₹{it.sale_price?.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-600 font-mono">
                    ₹{it.purchase_price?.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-center font-semibold text-blue-600">
                    {it.tax_rate}%
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <button
                      onClick={() => handleOpenBarcode(it)}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[11px] font-bold border border-blue-200 transition shadow-2xs"
                      title="View & Print Barcode Label (like myBillBook)"
                    >
                      <ScanLine className="w-3.5 h-3.5" />
                      <span>View Barcode</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">Add Product / Item</h3>
            <form onSubmit={handleCreateItem} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 font-semibold"
                  placeholder="e.g. DEMO ITEM"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">Item Code / Barcode</label>
                    <button
                      type="button"
                      onClick={() => setNewItem({ ...newItem, item_code: generateBarcodeNumber() })}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-0.5"
                      title="Auto generate 12-digit barcode"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>⚡ Auto Generate</span>
                    </button>
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={newItem.item_code}
                      onChange={(e) => setNewItem({ ...newItem, item_code: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-2.5 font-mono text-xs font-semibold"
                      placeholder="e.g. 706421053767"
                    />
                    {newItem.item_code && (
                      <button
                        type="button"
                        onClick={() => handleOpenBarcode({ ...newItem, id: 'NEW' })}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[11px] whitespace-nowrap flex items-center space-x-1 border border-slate-200"
                        title="Preview Barcode Sticker"
                      >
                        <ScanLine className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">HSN / SAC Code</label>
                  <input
                    type="text"
                    value={newItem.hsn_code}
                    onChange={(e) => setNewItem({ ...newItem, hsn_code: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 font-mono"
                    placeholder="2309"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sale Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newItem.sale_price}
                    onChange={(e) => setNewItem({ ...newItem, sale_price: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 font-bold text-emerald-600"
                    placeholder="1000"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Purchase Price (₹)</label>
                  <input
                    type="number"
                    value={newItem.purchase_price}
                    onChange={(e) => setNewItem({ ...newItem, purchase_price: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 font-bold"
                    placeholder="800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tax Rate</label>
                  <select
                    value={newItem.tax_rate}
                    onChange={(e) => setNewItem({ ...newItem, tax_rate: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                  >
                    <option value="0">0% GST</option>
                    <option value="5">5% GST</option>
                    <option value="12">12% GST</option>
                    <option value="18">18% GST</option>
                    <option value="28">28% GST</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Opening Stock Qty</label>
                  <input
                    type="number"
                    value={newItem.stock_qty}
                    onChange={(e) => setNewItem({ ...newItem, stock_qty: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 font-bold"
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Measuring Unit</label>
                  <select
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                  >
                    <option value="PCS">Pieces (PCS)</option>
                    <option value="BAG">Bags (BAG)</option>
                    <option value="KG">Kilograms (KG)</option>
                    <option value="BOX">Boxes (BOX)</option>
                    <option value="ROLL">Rolls (ROLL)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-lg font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Barcode Modal */}
      <ViewBarcodeModal
        isOpen={showBarcodeModal}
        onClose={() => setShowBarcodeModal(false)}
        item={barcodeModalItem}
        companyName={companyName}
      />
    </div>
  );
}
