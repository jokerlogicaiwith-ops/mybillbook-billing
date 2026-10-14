import React, { useState, useEffect } from 'react';
import { Plus, Search, Package, AlertTriangle, CheckCircle, Tag } from 'lucide-react';

export default function ItemsView() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
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
  }, [search, categoryFilter]);

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

  const handleCreateItem = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
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
          <p className="text-xs text-slate-500 mt-0.5">Manage stock levels, wholesale/retail pricing, HSN and GST</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
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
            placeholder="Search items by name, barcode, or HSN code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Item Name</th>
              <th className="py-3 px-4">HSN</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4 text-center">Stock</th>
              <th className="py-3 px-4 text-right">Sale Price</th>
              <th className="py-3 px-4 text-right">Purchase Price</th>
              <th className="py-3 px-4 text-center">Tax %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {items.map(it => {
              const isLow = it.stock_qty <= it.low_stock_limit;
              return (
                <tr key={it.id} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <div>{it.name}</div>
                    {it.item_code && <div className="text-[11px] font-mono text-slate-400">Code: {it.item_code}</div>}
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
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-in fade-in">
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
                  placeholder="e.g. Poultry Feed 50kg Bag"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Item Code / Barcode</label>
                  <input
                    type="text"
                    value={newItem.item_code}
                    onChange={(e) => setNewItem({ ...newItem, item_code: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 font-mono"
                    placeholder="PROD-001"
                  />
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
                    placeholder="1850"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Purchase Price (₹)</label>
                  <input
                    type="number"
                    value={newItem.purchase_price}
                    onChange={(e) => setNewItem({ ...newItem, purchase_price: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 font-bold"
                    placeholder="1600"
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
                  className="px-5 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
