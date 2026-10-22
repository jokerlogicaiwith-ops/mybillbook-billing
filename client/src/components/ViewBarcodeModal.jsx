import React, { useEffect, useRef } from 'react';
import { X, Printer, Download, Sparkles } from 'lucide-react';
import JsBarcode from 'jsbarcode';

export default function ViewBarcodeModal({ isOpen, onClose, item, companyName = 'CreaNext' }) {
  const svgRef = useRef(null);

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
          displayValue: false, // We render custom typography underneath
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
    const printWindow = window.open('', '_blank', 'width=450,height=400');
    if (!printWindow) {
      window.print();
      return;
    }

    const svgHtml = svgRef.current ? svgRef.current.outerHTML : '';
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Barcode - ${itemName}</title>
          <style>
            @page {
              size: 50mm 35mm;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 4mm 2mm;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              text-align: center;
              background: #fff;
              color: #000;
              box-sizing: border-box;
            }
            .company {
              font-size: 13px;
              font-weight: 800;
              letter-spacing: 0.5px;
              margin-bottom: 2px;
            }
            .barcode-svg {
              display: flex;
              justify-content: center;
              margin: 2px auto;
            }
            .barcode-svg svg {
              max-width: 90%;
              height: 48px;
            }
            .code-text {
              font-size: 13px;
              font-weight: 700;
              letter-spacing: 2px;
              font-family: monospace;
              margin: 2px 0;
            }
            .item-name {
              font-size: 11px;
              font-weight: 800;
              text-transform: uppercase;
              margin-top: 2px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .price {
              font-size: 11px;
              font-weight: 800;
              margin-top: 1px;
            }
          </style>
        </head>
        <body>
          <div class="company">${companyName}</div>
          <div class="barcode-svg">${svgHtml}</div>
          <div class="code-text">${barcodeValue}</div>
          <div class="item-name">${itemName}</div>
          <div class="price">SP: ₹${salePrice}</div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownload = () => {
    if (!svgRef.current) return;
    
    // Create an image on canvas and download
    const svgElement = svgRef.current;
    const svgString = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    canvas.width = 380;
    canvas.height = 240;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Header
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(companyName, canvas.width / 2, 32);
    
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      // Draw barcode centered
      const barcodeWidth = 260;
      const barcodeHeight = 65;
      ctx.drawImage(img, (canvas.width - barcodeWidth) / 2, 45, barcodeWidth, barcodeHeight);
      
      // Barcode number
      ctx.font = 'bold 16px monospace';
      ctx.fillStyle = '#1e293b';
      ctx.fillText(barcodeValue, canvas.width / 2, 130);
      
      // Item name
      ctx.font = 'bold 15px sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.fillText(itemName.toUpperCase(), canvas.width / 2, 160);
      
      // Price
      ctx.font = 'bold 15px sans-serif';
      ctx.fillStyle = '#334155';
      ctx.fillText(`SP: ₹${salePrice}`, canvas.width / 2, 185);
      
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold text-slate-900">View Barcode</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barcode Display Card (Exact replica of myBillBook) */}
        <div className="p-8 flex flex-col items-center justify-center bg-slate-100/50">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col items-center w-full max-w-xs text-center">
            
            {/* Company Name */}
            <span className="text-base font-extrabold text-slate-900 tracking-wide mb-3">
              {companyName}
            </span>

            {/* Barcode SVG */}
            <div className="flex justify-center my-1 w-full overflow-hidden">
              <svg ref={svgRef} className="max-w-full"></svg>
            </div>

            {/* Barcode Number */}
            <div className="text-sm font-mono font-bold tracking-[0.2em] text-slate-900 mt-2">
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

        {/* Modal Actions */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={handleDownload}
            className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
          >
            <Download className="w-4 h-4" />
            <span>Download PNG</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex-1 inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print Barcode</span>
          </button>
        </div>

      </div>
    </div>
  );
}
