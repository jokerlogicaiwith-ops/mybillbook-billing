import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Printer, CheckSquare, Square, Search, QrCode, Barcode, 
  Layers, Package, Sliders, ChevronDown, Check, RefreshCw
} from 'lucide-react';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';

// Mini renderer for preview in the table/card
function MiniCodePreview({ type, value }) {
  const [qrSvg, setQrSvg] = useState('');
  const barcodeRef = useRef(null);

  useEffect(() => {
    if (!value) return;

    if (type === 'qrcode') {
      QRCode.toString(String(value), { type: 'svg', margin: 0, width: 44 })
        .then(svg => setQrSvg(svg))
        .catch(() => setQrSvg(''));
    } else {
      if (barcodeRef.current) {
        try {
          JsBarcode(barcodeRef.current, String(value), {
            format: 'CODE128',
            width: 1.1,
            height: 22,
            displayValue: false,
            margin: 0,
            background: 'transparent',
            lineColor: '#0f172a'
          });
        } catch (e) {
          try {
            JsBarcode(barcodeRef.current, String(value).replace(/[^a-zA-Z0-9]/g, '') || '000000', {
              format: 'CODE128',
              width: 1.1,
              height: 22,
              displayValue: false,
              margin: 0,
              background: 'transparent',
              lineColor: '#0f172a'
            });
          } catch (err) {}
        }
      }
    }
  }, [type, value]);

  if (!value) return <span className="text-slate-400 font-mono text-[11px]">-</span>;

  if (type === 'qrcode') {
    return (
      <div 
        className="w-10 h-10 flex items-center justify-center p-0.5 bg-white border border-slate-200 rounded shadow-2xs [&>svg]:w-full [&>svg]:h-full"
        dangerouslySetInnerHTML={{ __html: qrSvg }}
      />
    );
  }

  return (
    <div className="bg-white px-1.5 py-0.5 border border-slate-200 rounded shadow-2xs flex items-center justify-center">
      <svg ref={barcodeRef} />
    </div>
  );
}

export default function BulkBarcodePrintModal({
  isOpen,
  onClose,
  items = [],
  selectedIds = [],
  companyName = 'APOORV'
}) {
  const [itemConfig, setItemConfig] = useState({});
  const [search, setSearch] = useState('');
  const [codeType, setCodeType] = useState('barcode'); // 'barcode' | 'qrcode'
  const [layout, setLayout] = useState('thermal'); // 'thermal' (50x35mm) | 'a4_24' (24-up) | 'a4_65' (65-up)
  const [includeCompany, setIncludeCompany] = useState(true);
  const [includeName, setIncludeName] = useState(true);
  const [includePrice, setIncludePrice] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Initialize or update selection map whenever modal opens or initial selection changes
  useEffect(() => {
    if (isOpen) {
      const initialMap = {};
      const hasSpecificSelection = Array.isArray(selectedIds) && selectedIds.length > 0;

      items.forEach(it => {
        const isSelected = hasSpecificSelection ? selectedIds.includes(it.id) : true;
        initialMap[it.id] = {
          selected: isSelected,
          copies: 1
        };
      });

      setItemConfig(initialMap);
      setSearch('');
    }
  }, [isOpen, selectedIds, items]);

  if (!isOpen) return null;

  const displayCompany = companyName || 'APOORV';

  // Toggle single item selection
  const toggleItemSelection = (id) => {
    setItemConfig(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        selected: !prev[id]?.selected
      }
    }));
  };

  // Change copies for single item
  const updateItemCopies = (id, newCopies) => {
    const val = Math.max(1, Math.min(500, parseInt(newCopies) || 1));
    setItemConfig(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        copies: val
      }
    }));
  };

  // Bulk Select / Deselect
  const handleSelectAll = (selectState) => {
    setItemConfig(prev => {
      const next = { ...prev };
      filteredItems.forEach(it => {
        if (next[it.id]) {
          next[it.id] = { ...next[it.id], selected: selectState };
        }
      });
      return next;
    });
  };

  // Bulk set copies for selected items
  const handleSetGlobalCopies = (copies) => {
    setItemConfig(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(id => {
        if (next[id].selected) {
          next[id] = { ...next[id], copies: Math.max(1, copies) };
        }
      });
      return next;
    });
  };

  // Set copies matching current stock quantity
  const handleMatchStock = () => {
    setItemConfig(prev => {
      const next = { ...prev };
      items.forEach(it => {
        if (next[it.id] && next[it.id].selected) {
          const stock = Math.max(1, Math.round(parseFloat(it.stock_qty) || 1));
          next[it.id] = { ...next[it.id], copies: stock };
        }
      });
      return next;
    });
  };

  // Filter items in modal
  const filteredItems = items.filter(it => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const matchName = (it.name || '').toLowerCase().includes(q);
    const matchCode = (it.item_code || '').toLowerCase().includes(q);
    const matchCat = (it.category || '').toLowerCase().includes(q);
    return matchName || matchCode || matchCat;
  });

  // Calculate totals
  const selectedCount = Object.values(itemConfig).filter(cfg => cfg.selected).length;
  const totalStickers = items.reduce((acc, it) => {
    const cfg = itemConfig[it.id];
    return cfg?.selected ? acc + (cfg.copies || 1) : acc;
  }, 0);

  // Trigger Print Window
  const handlePrint = async () => {
    if (totalStickers === 0) {
      alert('Please select at least 1 item to print.');
      return;
    }

    setIsGenerating(true);

    try {
      // Pre-generate SVG or Canvas for all selected items
      const selectedItemsWithCopies = [];
      for (const item of items) {
        const cfg = itemConfig[item.id];
        if (cfg?.selected && cfg.copies > 0) {
          selectedItemsWithCopies.push({ item, copies: cfg.copies });
        }
      }

      // Generate graphic code SVGs
      const codeGraphicsMap = {};
      for (const { item } of selectedItemsWithCopies) {
        const rawCode = item.item_code || `7064${String(item.id).padStart(8, '0')}`;
        
        if (codeType === 'qrcode') {
          try {
            const svgStr = await QRCode.toString(rawCode, {
              type: 'svg',
              margin: 1,
              width: layout === 'thermal' ? 95 : 75
            });
            codeGraphicsMap[item.id] = svgStr;
          } catch (e) {
            codeGraphicsMap[item.id] = '';
          }
        } else {
          // Barcode SVG
          try {
            const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            JsBarcode(svgEl, String(rawCode), {
              format: 'CODE128',
              width: layout === 'thermal' ? 1.8 : 1.3,
              height: layout === 'thermal' ? 44 : 32,
              displayValue: false,
              margin: 0,
              background: '#ffffff',
              lineColor: '#000000'
            });
            codeGraphicsMap[item.id] = svgEl.outerHTML;
          } catch (e) {
            codeGraphicsMap[item.id] = '';
          }
        }
      }

      // Build printable labels HTML
      let labelsHtml = '';

      if (layout === 'thermal') {
        // Individual label per page for 50x35mm roll
        selectedItemsWithCopies.forEach(({ item, copies }) => {
          const rawCode = item.item_code || `7064${String(item.id).padStart(8, '0')}`;
          const graphicSvg = codeGraphicsMap[item.id] || '';
          const price = item.sale_price !== undefined ? parseFloat(item.sale_price).toFixed(2) : '';

          for (let i = 0; i < copies; i++) {
            labelsHtml += `
              <div class="thermal-label ${codeType === 'qrcode' ? 'layout-qr' : 'layout-barcode'}">
                ${includeCompany ? `<div class="company">${displayCompany}</div>` : ''}
                <div class="code-graphic">${graphicSvg}</div>
                <div class="code-digits">${rawCode}</div>
                ${includeName && item.name ? `<div class="item-name">${item.name}</div>` : ''}
                ${includePrice && price ? `<div class="price">MRP/SP: ₹${price}</div>` : ''}
              </div>
            `;
          }
        });
      } else {
        // A4 grid sheet
        const gridClass = layout === 'a4_65' ? 'a4-grid-65' : 'a4-grid-24';
        labelsHtml = `<div class="${gridClass}">`;

        selectedItemsWithCopies.forEach(({ item, copies }) => {
          const rawCode = item.item_code || `7064${String(item.id).padStart(8, '0')}`;
          const graphicSvg = codeGraphicsMap[item.id] || '';
          const price = item.sale_price !== undefined ? parseFloat(item.sale_price).toFixed(2) : '';

          for (let i = 0; i < copies; i++) {
            labelsHtml += `
              <div class="a4-label ${codeType === 'qrcode' ? 'layout-qr' : 'layout-barcode'}">
                ${includeCompany ? `<div class="company">${displayCompany}</div>` : ''}
                <div class="code-graphic">${graphicSvg}</div>
                <div class="code-digits">${rawCode}</div>
                ${includeName && item.name ? `<div class="item-name">${item.name}</div>` : ''}
                ${includePrice && price ? `<div class="price">₹${price}</div>` : ''}
              </div>
            `;
          }
        });

        labelsHtml += `</div>`;
      }

      const printWindow = window.open('', '_blank', 'width=900,height=700');
      if (!printWindow) {
        window.print();
        setIsGenerating(false);
        return;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Print Stickers - ${displayCompany} (${totalStickers} labels)</title>
            <style>
              * { box-sizing: border-box; }
              body {
                margin: 0;
                padding: 0;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                background: #fff;
                color: #000;
                text-align: center;
              }

              @page {
                ${layout === 'thermal' 
                  ? 'size: 50mm 35mm; margin: 0;' 
                  : 'size: A4 portrait; margin: 6mm 5mm;'}
              }

              /* THERMAL 50x35mm LABEL */
              .thermal-label {
                width: 50mm;
                height: 35mm;
                padding: 2.5mm 2mm;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                page-break-after: always;
                page-break-inside: avoid;
                overflow: hidden;
              }
              .thermal-label .company {
                font-size: 10px;
                font-weight: 800;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                line-height: 1.1;
                margin-bottom: 1.5px;
              }
              .thermal-label .code-graphic svg {
                max-width: 45mm;
                height: auto;
                max-height: 14mm;
              }
              .thermal-label.layout-qr .code-graphic svg {
                max-width: 15mm;
                max-height: 15mm;
              }
              .thermal-label .code-digits {
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 1.5px;
                font-family: monospace;
                margin-top: 1px;
                line-height: 1.1;
              }
              .thermal-label .item-name {
                font-size: 8.5px;
                font-weight: 800;
                text-transform: uppercase;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 46mm;
                margin-top: 1px;
                line-height: 1.1;
              }
              .thermal-label .price {
                font-size: 8.5px;
                font-weight: 800;
                margin-top: 0.5px;
                line-height: 1.1;
              }

              /* A4 24-UP GRID (3 cols x 8 rows) */
              .a4-grid-24 {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 2mm;
                padding: 1mm;
              }
              .a4-grid-24 .a4-label {
                border: 1px dashed #cbd5e1;
                border-radius: 4px;
                height: 33.5mm;
                padding: 2mm 1.5mm;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                overflow: hidden;
                page-break-inside: avoid;
              }
              .a4-label .company {
                font-size: 9.5px;
                font-weight: 800;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                line-height: 1.1;
              }
              .a4-label .code-graphic svg {
                max-width: 52mm;
                max-height: 13mm;
                height: auto;
              }
              .a4-label.layout-qr .code-graphic svg {
                max-width: 14mm;
                max-height: 14mm;
              }
              .a4-label .code-digits {
                font-size: 10.5px;
                font-weight: 700;
                letter-spacing: 1.5px;
                font-family: monospace;
                line-height: 1.1;
                margin-top: 1px;
              }
              .a4-label .item-name {
                font-size: 8px;
                font-weight: 800;
                text-transform: uppercase;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 56mm;
                line-height: 1.1;
                margin-top: 1px;
              }
              .a4-label .price {
                font-size: 8px;
                font-weight: 800;
                line-height: 1.1;
              }

              /* A4 65-UP GRID (5 cols x 13 rows) */
              .a4-grid-65 {
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                gap: 1.5mm;
              }
              .a4-grid-65 .a4-label {
                border: 1px dashed #cbd5e1;
                height: 20mm;
                padding: 1mm;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                overflow: hidden;
                page-break-inside: avoid;
              }
              .a4-grid-65 .company { font-size: 7px; font-weight: 800; }
              .a4-grid-65 .code-graphic svg { max-width: 32mm; max-height: 8mm; }
              .a4-grid-65 .code-digits { font-size: 7.5px; font-weight: 700; font-family: monospace; }
              .a4-grid-65 .item-name { font-size: 6.5px; font-weight: 700; max-width: 34mm; overflow: hidden; }
              .a4-grid-65 .price { font-size: 6.5px; font-weight: 700; }
            </style>
          </head>
          <body>
            ${labelsHtml}
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() { window.close(); }, 800);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (err) {
      console.error('Print generation failed:', err);
      alert('Failed to generate print job. Check console.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Sample item for live preview card
  const sampleItem = items.find(it => itemConfig[it.id]?.selected) || items[0] || {
    name: 'SAMPLE PRODUCT',
    item_code: '706499391455',
    sale_price: 1250
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* 1. Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Printer className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <span>Print Barcode & QR Stickers</span>
                <span className="text-xs bg-indigo-100 text-indigo-700 font-semibold px-2 py-0.5 rounded-full">
                  बल्क प्रिंटर
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Select items to print stickers. Choose between Barcode zebra lines or QR code.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Format & Layout Toolbar */}
        <div className="px-6 py-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Sticker Type Toggle: Barcode vs QR */}
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-700">Code Type:</span>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setCodeType('barcode')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-bold transition ${
                  codeType === 'barcode' 
                    ? 'bg-indigo-600 text-white shadow-2xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Barcode className="w-3.5 h-3.5" />
                <span>Barcode (लकीरें)</span>
              </button>
              <button
                type="button"
                onClick={() => setCodeType('qrcode')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-bold transition ${
                  codeType === 'qrcode' 
                    ? 'bg-indigo-600 text-white shadow-2xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>QR Code (2D)</span>
              </button>
            </div>
          </div>

          {/* Paper Format Toggle */}
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-700">Paper Size:</span>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setLayout('thermal')}
                className={`px-3 py-1.5 rounded-md font-bold transition ${
                  layout === 'thermal' 
                    ? 'bg-indigo-600 text-white shadow-2xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Thermal Roll (50×35mm)
              </button>
              <button
                type="button"
                onClick={() => setLayout('a4_24')}
                className={`px-3 py-1.5 rounded-md font-bold transition ${
                  layout === 'a4_24' 
                    ? 'bg-indigo-600 text-white shadow-2xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                A4 Sheet (24 Stickers)
              </button>
              <button
                type="button"
                onClick={() => setLayout('a4_65')}
                className={`px-3 py-1.5 rounded-md font-bold transition ${
                  layout === 'a4_65' 
                    ? 'bg-indigo-600 text-white shadow-2xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                A4 (65 Compact)
              </button>
            </div>
          </div>

          {/* Label Content Toggles */}
          <div className="flex items-center space-x-3 text-slate-600 font-medium">
            <label className="flex items-center space-x-1 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={includeCompany} 
                onChange={(e) => setIncludeCompany(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Company</span>
            </label>
            <label className="flex items-center space-x-1 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={includeName} 
                onChange={(e) => setIncludeName(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Item Name</span>
            </label>
            <label className="flex items-center space-x-1 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={includePrice} 
                onChange={(e) => setIncludePrice(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Price</span>
            </label>
          </div>

        </div>

        {/* 3. Sub-bar: Search, Select All/None, Global Copies */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          <div className="flex items-center space-x-3">
            {/* Search items inside modal */}
            <div className="relative w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search items to select..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1 bg-white text-xs border border-slate-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Select All / Deselect All */}
            <button
              type="button"
              onClick={() => handleSelectAll(true)}
              className="font-bold text-indigo-600 hover:text-indigo-800 transition"
            >
              Select All
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={() => handleSelectAll(false)}
              className="font-bold text-slate-600 hover:text-slate-800 transition"
            >
              Deselect All
            </button>
          </div>

          {/* Quick Copies Presets */}
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-600">Set copies:</span>
            {[1, 2, 5, 10].map(n => (
              <button
                key={n}
                type="button"
                onClick={() => handleSetGlobalCopies(n)}
                className="px-2 py-0.5 bg-white border border-slate-200 hover:border-indigo-400 rounded text-[11px] font-bold text-slate-700 hover:bg-indigo-50 transition shadow-2xs"
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              onClick={handleMatchStock}
              title="Set copies matching available stock quantity for each item"
              className="px-2 py-0.5 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded text-[11px] font-bold text-indigo-700 transition"
            >
              = Stock Qty
            </button>
          </div>

        </div>

        {/* 4. Main Body: Items Selection Table + Live Preview sidebar */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          
          {/* Left Table: Select Items & Individual Copies */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 border-r border-slate-200 max-h-[50vh]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold select-none z-10">
                <tr>
                  <th className="py-2 px-3 w-8 text-center">
                    <input 
                      type="checkbox"
                      checked={filteredItems.length > 0 && filteredItems.every(it => itemConfig[it.id]?.selected)}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </th>
                  <th className="py-2 px-3">Item Name</th>
                  <th className="py-2 px-3 w-28">Code Preview</th>
                  <th className="py-2 px-3 w-24">Stock</th>
                  <th className="py-2 px-3 w-24">Price</th>
                  <th className="py-2 px-3 w-32 text-center">Copies</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400">
                      No items matched your search.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map(item => {
                    const cfg = itemConfig[item.id] || { selected: false, copies: 1 };
                    const isSelected = cfg.selected;
                    const rawCode = item.item_code || `7064${String(item.id).padStart(8, '0')}`;

                    return (
                      <tr 
                        key={item.id}
                        onClick={() => toggleItemSelection(item.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-indigo-50/40 hover:bg-indigo-50/70' : 'hover:bg-slate-50 text-slate-500'
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <input 
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleItemSelection(item.id)}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                        </td>

                        {/* Item Name */}
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-900 line-clamp-1">{item.name}</div>
                          {item.category && (
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                              {item.category}
                            </span>
                          )}
                        </td>

                        {/* Code + Live Mini Barcode / QR */}
                        <td className="py-2.5 px-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex flex-col items-start">
                            <MiniCodePreview type={codeType} value={rawCode} />
                            <span className="font-mono text-[10px] font-semibold text-slate-700 mt-0.5">
                              {rawCode}
                            </span>
                          </div>
                        </td>

                        {/* Stock */}
                        <td className="py-2.5 px-3 font-medium">
                          {item.stock_qty !== undefined ? `${item.stock_qty} ${item.unit || 'PCS'}` : '-'}
                        </td>

                        {/* Selling Price */}
                        <td className="py-2.5 px-3 font-medium">
                          {item.sale_price ? `₹ ${parseFloat(item.sale_price).toFixed(2)}` : '-'}
                        </td>

                        {/* Copies input with +/- */}
                        <td className="py-2.5 px-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              type="button"
                              disabled={!isSelected || cfg.copies <= 1}
                              onClick={() => updateItemCopies(item.id, cfg.copies - 1)}
                              className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none transition"
                            >
                              -
                            </button>
                            <input 
                              type="number"
                              min="1"
                              max="500"
                              disabled={!isSelected}
                              value={cfg.copies}
                              onChange={(e) => updateItemCopies(item.id, e.target.value)}
                              className="w-12 text-center py-1 bg-white border border-slate-300 rounded text-xs font-bold disabled:opacity-40"
                            />
                            <button
                              type="button"
                              disabled={!isSelected}
                              onClick={() => updateItemCopies(item.id, cfg.copies + 1)}
                              className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none transition"
                            >
                              +
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

          {/* Right Sidebar: Live Sticker Preview */}
          <div className="w-full md:w-64 bg-slate-50 p-4 flex flex-col justify-between border-t md:border-t-0 border-slate-200">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Live Sticker Sample
                </span>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                  {layout === 'thermal' ? '50x35mm Roll' : 'A4 Sheet'}
                </span>
              </div>

              {/* Sample Sticker Card */}
              <div className="bg-white border-2 border-indigo-200 rounded-xl p-3 shadow-md flex flex-col items-center text-center space-y-1">
                {includeCompany && (
                  <div className="text-[11px] font-black uppercase tracking-wider text-slate-900">
                    {displayCompany}
                  </div>
                )}
                
                <div className="my-1">
                  <MiniCodePreview type={codeType} value={sampleItem.item_code || '706499391455'} />
                </div>

                <div className="font-mono text-xs font-bold tracking-widest text-slate-900">
                  {sampleItem.item_code || '706499391455'}
                </div>

                {includeName && (
                  <div className="text-[10px] font-bold text-slate-800 uppercase line-clamp-1 max-w-[180px]">
                    {sampleItem.name}
                  </div>
                )}

                {includePrice && (
                  <div className="text-[10px] font-extrabold text-slate-900">
                    MRP: ₹ {parseFloat(sampleItem.sale_price || 1250).toFixed(2)}
                  </div>
                )}
              </div>

              {/* Tip info */}
              <div className="mt-3 p-2.5 bg-blue-50 border border-blue-100 rounded-lg text-[11px] text-blue-900 leading-relaxed">
                💡 <b>चयनित स्टिकर</b>: आप सिर्फ़ उन्हीं आइटम्स का चुनाव कर सकते हैं जिनकी ज़रूरत है। प्रिंट बटन दबाते ही प्रिंटर डायलॉग खुल जाएगा।
              </div>
            </div>

            {/* Quick summary stats */}
            <div className="mt-4 pt-3 border-t border-slate-200 text-xs space-y-1">
              <div className="flex justify-between text-slate-500">
                <span>Selected Items:</span>
                <span className="font-bold text-slate-800">{selectedCount} items</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Total Stickers:</span>
                <span className="font-bold text-indigo-600 text-sm">{totalStickers} stickers</span>
              </div>
            </div>

          </div>

        </div>

        {/* 5. Modal Footer Actions */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-600">
            <span className="font-semibold">{selectedCount} items selected</span> ({totalStickers} total sticker copies)
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isGenerating || totalStickers === 0}
              onClick={handlePrint}
              className="px-5 py-2 bg-[#6366f1] hover:bg-[#4f46e5] text-white text-xs font-bold rounded-lg shadow-md hover:shadow-lg transition flex items-center space-x-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Preparing Print...</span>
                </>
              ) : (
                <>
                  <Printer className="w-4 h-4 stroke-[2.4]" />
                  <span>Print {totalStickers} Sticker{totalStickers > 1 ? 's' : ''} (प्रिंट करें)</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
