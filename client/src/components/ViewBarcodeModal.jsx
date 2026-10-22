import React, { useState, useEffect, useRef } from 'react';
import { X, Printer, Download, Sparkles, Copy, Layers } from 'lucide-react';
import JsBarcode from 'jsbarcode';

export default function ViewBarcodeModal({ isOpen, onClose, item, companyName = 'VSRM COMPUTER CLASSES' }) {
  const svgRef = useRef(null);
  const [copies, setCopies] = useState(1);
  const [layout, setLayout] = useState('thermal'); // 'thermal' (50x35mm) or 'a4' (24-up sticker sheet)

  const barcodeValue = item?.item_code || (item?.id ? `7064${String(item.id).padStart(8, '0')}` : '790897163484');
  const itemName = item?.name || 'DEMO ITEM';
  const salePrice = item?.sale_price !== undefined ? parseFloat(item.sale_price).toFixed(2) : '1000.00';
  const displayCompany = companyName || 'VSRM COMPUTER CLASSES';

  useEffect(() => {
    if (isOpen && svgRef.current && barcodeValue) {
      try {
        JsBarcode(svgRef.current, barcodeValue, {
          format: 'CODE128',
          width: 2.2,
          height: 56,
          displayValue: false, // We render the exact number underneath matching screenshot
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
            <div class="company">${displayCompany}</div>
            <div class="barcode-svg">${svgHtml}</div>
            <div class="code-text">${barcodeValue}</div>
            ${itemName !== 'NEW ITEM' && itemName !== 'DEMO ITEM' ? `<div class="item-name">${itemName}</div>` : ''}
            ${salePrice > 0 ? `<div class="price">SP: ₹${salePrice}</div>` : ''}
          </div>
        `;
      }
    } else {
      // A4 Sheet: 3 columns x 8 rows = 24 stickers per sheet
      contentHtml = `<div class="a4-grid">`;
      for (let i = 0; i < numCopies; i++) {
        contentHtml += `
          <div class="a4-label">
            <div class="company">${displayCompany}</div>
            <div class="barcode-svg">${svgHtml}</div>
            <div class="code-text">${barcodeValue}</div>
            ${itemName !== 'NEW ITEM' && itemName !== 'DEMO ITEM' ? `<div class="item-name">${itemName}</div>` : ''}
            ${salePrice > 0 ? `<div class="price">SP: ₹${salePrice}</div>` : ''}
          </div>
        `;
      }
      contentHtml += `</div>`;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Barcode - ${displayCompany} - ${barcodeValue}</title>
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
              margin-bottom: 2px;
            }
            .thermal-label .barcode-svg svg {
              width: 44mm;
              height: 14mm;
            }
            .thermal-label .code-text {
              font-size: 12px;
              font-weight: 700;
              letter-spacing: 2px;
              font-family: monospace;
              margin: 2px 0 0 0;
            }
            .thermal-label .item-name {
              font-size: 9px;
              font-weight: 800;
              text-transform: uppercase;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              max-width: 46mm;
              margin-top: 1px;
            }
            .thermal-label .price {
              font-size: 9px;
              font-weight: 800;
            }

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
              height: 13mm;
            }
            .a4-label .code-text {
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 2px;
              font-family: monospace;
              margin: 2px 0 0 0;
            }
            .a4-label .item-name {
              font-size: 8.5px;
              font-weight: 800;
              text-transform: uppercase;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              max-width: 55mm;
            }
            .a4-label .price {
              font-size: 8.5px;
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
    canvas.width = 460;
    canvas.height = 240;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Header - Company name
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(displayCompany.toUpperCase(), canvas.width / 2, 42);
    
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      const barcodeWidth = 320;
      const barcodeHeight = 70;
      ctx.drawImage(img, (canvas.width - barcodeWidth) / 2, 58, barcodeWidth, barcodeHeight);
      
      ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", monospace';
      ctx.fillStyle = '#0f172a';
      ctx.fillText(barcodeValue, canvas.width / 2, 155);

      if (itemName && itemName !== 'NEW ITEM' && itemName !== 'DEMO ITEM') {
        ctx.font = 'bold 14px sans-serif';
        ctx.fillStyle = '#334155';
        ctx.fillText(itemName.toUpperCase(), canvas.width / 2, 185);
      }
      
      URL.revokeObjectURL(url);
      
      const link = document.createElement('a');
      link.download = `barcode-${barcodeValue}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = url;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
        
        {/* Header - Identical to myBillBook screenshot */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800">View Barcode</h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Center Barcode Display - Exact 1:1 Match with User's myBillBook Screenshot */}
        <div className="p-8 flex flex-col items-center justify-center bg-white">
          <div className="w-full flex flex-col items-center text-center py-4">
            
            {/* Company Name */}
            <h2 className="text-lg font-black text-slate-900 tracking-wider uppercase mb-3">
              {displayCompany}
            </h2>

            {/* Barcode Lines */}
            <div className="flex justify-center my-1 w-full overflow-hidden">
              <svg ref={svgRef} className="max-w-full"></svg>
            </div>

            {/* Barcode Number Below Lines */}
            <div className="text-xl font-bold tracking-[0.25em] text-slate-900 mt-2 font-mono">
              {barcodeValue}
            </div>
          </div>
        </div>

        {/* Print / Label Format Control Bar */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-600">Copies:</span>
            <input
              type="number"
              min="1"
              max="500"
              value={copies}
              onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-16 px-2.5 py-1 border border-slate-300 rounded-md font-bold text-center text-slate-800 bg-white"
            />
            <div className="flex space-x-1">
              {[1, 5, 10, 24].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setCopies(n)}
                  className={`px-2 py-0.5 font-bold rounded text-[11px] border transition ${
                    copies === n ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-1 bg-white p-0.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setLayout('thermal')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition ${
                layout === 'thermal' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Thermal Roll (50x35mm)
            </button>
            <button
              type="button"
              onClick={() => setLayout('a4')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition ${
                layout === 'a4' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              A4 Sheet (24 Stickers)
            </button>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={handleDownload}
            className="flex-1 inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Download PNG</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex-1 inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition"
          >
            <Printer className="w-4 h-4 stroke-[2.5]" />
            <span>Print {copies} Barcode Sticker{copies > 1 ? 's' : ''}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
