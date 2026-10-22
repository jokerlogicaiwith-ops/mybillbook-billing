import React, { useState, useEffect, useRef } from 'react';
import { X, Printer, Download, Sparkles, Copy, Check, Layers } from 'lucide-react';
import JsBarcode from 'jsbarcode';

export default function ViewBarcodeModal({ isOpen, onClose, item, companyName = 'APOORV' }) {
  const svgRef = useRef(null);
  const [copies, setCopies] = useState(1);
  const [layout, setLayout] = useState('thermal'); // 'thermal' (50x35mm) or 'a4' (24-up sticker sheet)

  const barcodeValue = item?.item_code || (item?.id ? `7064${String(item.id).padStart(8, '0')}` : '706421053767');
  const itemName = item?.name || 'DEMO ITEM';
  const salePrice = item?.sale_price !== undefined ? parseFloat(item.sale_price).toFixed(2) : '1000.00';

  useEffect(() => {
    if (isOpen && svgRef.current && barcodeValue) {
      try {
        JsBarcode(svgRef.current, barcodeValue, {
          format: 'CODE128',
          width: 2,
          height: 52,
          displayValue: false,
          margin: 0,
          background: '#ffffff',
          lineColor: '#000000'
        });
      } catch (err) {
        console.error('JsBarcode rendering error:', err);
      }
    }
  }, [isOpen, barcodeValue]);

  if (!isOpen) return null;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      window.print();
      return;
    }

    const svgHtml = svgRef.current ? svgRef.current.outerHTML : '';
    const numCopies = Math.max(1, parseInt(copies) || 1);

    let contentHtml = '';

    if (layout === 'thermal') {
      // Thermal label roll: 50mm x 35mm per sticker, page-break per label
      for (let i = 0; i < numCopies; i++) {
        contentHtml += `
          <div class="thermal-label">
            <div class="company">${companyName}</div>
            <div class="barcode-svg">${svgHtml}</div>
            <div class="code-text">${barcodeValue}</div>
            <div class="item-name">${itemName}</div>
            <div class="price">SP: ₹${salePrice}</div>
          </div>
        `;
      }
    } else {
      // A4 Sheet: 3 columns x 8 rows = 24 stickers per sheet
      contentHtml = `<div class="a4-grid">`;
      for (let i = 0; i < numCopies; i++) {
        contentHtml += `
          <div class="a4-label">
            <div class="company">${companyName}</div>
            <div class="barcode-svg">${svgHtml}</div>
            <div class="code-text">${barcodeValue}</div>
            <div class="item-name">${itemName}</div>
            <div class="price">SP: ₹${salePrice}</div>
          </div>
        `;
      }
      contentHtml += `</div>`;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Barcode Stickers - ${itemName}</title>
          <style>
            * { box-sizing: border-box; }
            body {
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              text-align: center;
              background: #fff;
              color: #000;
            }

            /* THERMAL LABEL STYLES */
            @page {
              ${layout === 'thermal' ? 'size: 50mm 35mm; margin: 0;' : 'size: A4 portrait; margin: 8mm 6mm;'}
            }
            .thermal-label {
              width: 50mm;
              height: 35mm;
              padding: 3mm 2mm;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              page-break-after: always;
              overflow: hidden;
            }
            .thermal-label .company {
              font-size: 11px;
              font-weight: 800;
              letter-spacing: 0.5px;
              text-transform: uppercase;
              margin-bottom: 1px;
            }
            .thermal-label .barcode-svg svg {
              width: 44mm;
              height: 12mm;
            }
            .thermal-label .code-text {
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 1.5px;
              font-family: monospace;
              margin: 1px 0;
            }
            .thermal-label .item-name {
              font-size: 9px;
              font-weight: 800;
              text-transform: uppercase;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              max-width: 46mm;
            }
            .thermal-label .price {
              font-size: 10px;
              font-weight: 800;
            }

            /* A4 SHEET GRID STYLES (3 x 8 = 24 Labels per page) */
            .a4-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 2.5mm;
              padding: 2mm;
            }
            .a4-label {
              border: 1px dashed #cbd5e1;
              border-radius: 4px;
              padding: 3mm 2mm;
              height: 33mm;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              overflow: hidden;
            }
            .a4-label .company {
              font-size: 10px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .a4-label .barcode-svg svg {
              width: 46mm;
              height: 12mm;
            }
            .a4-label .code-text {
              font-size: 10px;
              font-weight: 700;
              letter-spacing: 1.5px;
              font-family: monospace;
              margin: 1px 0;
            }
            .a4-label .item-name {
              font-size: 9px;
              font-weight: 800;
              text-transform: uppercase;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              max-width: 55mm;
            }
            .a4-label .price {
              font-size: 9px;
              font-weight: 800;
            }
          </style>
        </head>
        <body>
          ${contentHtml}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 700);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownload = () => {
    if (!svgRef.current) return;
    
    const svgElement = svgRef.current;
    const svgString = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 250;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Header
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(companyName, canvas.width / 2, 34);
    
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      const barcodeWidth = 280;
      const barcodeHeight = 65;
      ctx.drawImage(img, (canvas.width - barcodeWidth) / 2, 48, barcodeWidth, barcodeHeight);
      
      ctx.font = 'bold 16px monospace';
      ctx.fillStyle = '#1e293b';
      ctx.fillText(barcodeValue, canvas.width / 2, 136);
      
      ctx.font = 'bold 14px sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.fillText(itemName.toUpperCase(), canvas.width / 2, 166);
      
      ctx.font = 'bold 15px sans-serif';
      ctx.fillStyle = '#334155';
      ctx.fillText(`SP: ₹${salePrice}`, canvas.width / 2, 192);
      
      URL.revokeObjectURL(url);
      
      const link = document.createElement('a');
      link.download = `barcode-sticker-${barcodeValue}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = url;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="p-1 bg-indigo-100 text-indigo-700 rounded-lg">
              <Printer className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Product Barcode Sticker (चिपकाने के लिए)</h3>
              <p className="text-[11px] text-slate-500">Sticker print karein aur product ke box par chipkayein</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sticker Preview Card */}
        <div className="p-6 flex flex-col items-center justify-center bg-slate-100/70">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Sticker Preview
          </div>
          <div className="bg-white border-2 border-dashed border-indigo-300 rounded-xl p-5 shadow-sm flex flex-col items-center w-full max-w-xs text-center relative group">
            
            {/* Sticker Badge */}
            <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 font-bold text-[9px] border border-indigo-200">
              50x35mm
            </span>

            {/* Company Name */}
            <span className="text-sm font-extrabold text-slate-900 tracking-wide mb-2 uppercase">
              {companyName}
            </span>

            {/* Barcode SVG */}
            <div className="flex justify-center my-1 w-full overflow-hidden">
              <svg ref={svgRef} className="max-w-full"></svg>
            </div>

            {/* Barcode Number */}
            <div className="text-sm font-mono font-bold tracking-[0.2em] text-slate-900 mt-1.5">
              {barcodeValue}
            </div>

            {/* Item Name */}
            <div className="text-xs font-black uppercase text-slate-800 mt-1 tracking-tight truncate max-w-[240px]">
              {itemName}
            </div>

            {/* Sale Price */}
            <div className="text-xs font-extrabold text-slate-800 mt-0.5">
              SP: ₹{salePrice}
            </div>
          </div>
        </div>

        {/* Sticker Print Options */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            {/* Number of Copies */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kitne Stickers Chahiye (Copies)?
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={copies}
                  onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-1 focus:ring-indigo-500"
                />
                <div className="flex space-x-1">
                  {[1, 5, 10, 24].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setCopies(n)}
                      className={`px-2 py-1 text-[11px] font-bold rounded border transition ${
                        copies === n 
                          ? 'bg-indigo-600 text-white border-indigo-600' 
                          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Paper Layout */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Printer / Paper Format:
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setLayout('thermal')}
                  className={`px-2 py-1.5 text-[11px] font-bold rounded-lg border text-center transition ${
                    layout === 'thermal'
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-2xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Thermal Roll (1-by-1)
                </button>
                <button
                  type="button"
                  onClick={() => setLayout('a4')}
                  className={`px-2 py-1.5 text-[11px] font-bold rounded-lg border text-center transition ${
                    layout === 'a4'
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-2xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  A4 Sheet (Sheet Page)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={handleDownload}
            className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Download PNG</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex-1 inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition"
          >
            <Printer className="w-4 h-4 stroke-[2.5]" />
            <span>Print {copies} Sticker{copies > 1 ? 's' : ''}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
