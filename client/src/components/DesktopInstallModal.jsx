import React from 'react';
import { X, Monitor, Download, CheckCircle2, Sparkles } from 'lucide-react';

export default function DesktopInstallModal({ isOpen, onClose, onDirectInstall, hasDeferredPrompt }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 text-white p-5 flex items-center justify-between border-b-2 border-amber-500">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-400">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-amber-400 flex items-center gap-1.5">
                कंप्यूटर डेस्कटॉप पर VSRM Shop आइकॉन कैसे लाएं?
              </h3>
              <p className="text-xs text-slate-300">
                1-Click Desktop Shortcut & Installation Guide
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-sm text-slate-700">

          {/* Option 1: Browser 1-Click Install */}
          <div className="p-4 rounded-xl border-2 border-blue-200 bg-blue-50/50 hover:bg-blue-50 transition">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">1</span>
                <h4 className="font-bold text-blue-950 text-sm">
                  Google Chrome / Edge से सीधा इनस्टॉल (सबसे आसान)
                </h4>
              </div>
              <span className="text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full">
                Recommended
              </span>
            </div>

            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              अगर आप Chrome या Edge ब्राउज़र में हैं, तो सीधे ब्राउज़र से 1-क्लिक में VSRM Shop आपके डेस्कटॉप पर आ जाएगा:
            </p>

            <div className="space-y-1.5 text-xs text-slate-700 bg-white p-3 rounded-lg border border-blue-100 mb-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>ऊपर एड्रेस बार (URL bar) में दाईं तरफ <strong>'Install' (🖥️ या ⊕)</strong> आइकॉन पर क्लिक करें।</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>या Chrome के ऊपर दाईं तरफ <strong>3 डॉट्स (⋮) &gt; 'Save and share' &gt; 'Install VSRM Shop'</strong> चुनें।</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>पॉपअप में <strong>'Create Desktop shortcut'</strong> पर टिक रहने दें — आपके डेस्कटॉप पर गोल्डन लोगो बन जाएगा!</span>
              </div>
            </div>

            {hasDeferredPrompt && (
              <button
                onClick={() => {
                  onDirectInstall && onDirectInstall();
                  onClose();
                }}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                अभी डेस्कटॉप पर इनस्टॉल करें (Install to Desktop)
              </button>
            )}
          </div>

          {/* Option 2: Windows Software (.exe) Package */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/70 transition">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-slate-700 text-white text-xs font-bold flex items-center justify-center">2</span>
              <h4 className="font-bold text-slate-900 text-sm">
                Windows सॉफ्टवेयर (.exe) से डेस्कटॉप शॉर्टकट बनाना
              </h4>
            </div>

            <p className="text-xs text-slate-600 mb-2 leading-relaxed">
              अगर आपने Windows सॉफ्टवेयर जिप फाइल डाउनलोड की है:
            </p>

            <ol className="list-decimal list-inside space-y-1 text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200 mb-3">
              <li>डाउनलोड की गई <strong>VSRM-Shop-Windows.zip</strong> को Extract (अनज़िप) करें।</li>
              <li>फ़ोल्डर के अंदर <strong>'Create-Desktop-Shortcut.bat'</strong> पर डबल-क्लिक करें।</li>
              <li>यह अपने आप आपके <strong>Windows Desktop और Start Menu</strong> पर गोल्डन लोगो वाला शॉर्टकट बना देगा!</li>
              <li>इसके बाद ग्राहक कभी भी डेस्कटॉप आइकॉन पर डबल क्लिक करके सीधे बिलिंग शुरू कर सकता है।</li>
            </ol>

            <a
              href="/vsrm-shop-windows.zip"
              download="VSRM-Shop-Windows.zip"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shadow-sm transition text-xs"
            >
              <Download className="w-4 h-4 text-blue-300" />
              Windows PC सॉफ्टवेयर डाउनलोड करें (VSRM-Shop-Windows.zip)
            </a>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>सहायता: +91 8130140936 (APOORV)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
          >
            समझ गया (Close)
          </button>
        </div>

      </div>
    </div>
  );
}
