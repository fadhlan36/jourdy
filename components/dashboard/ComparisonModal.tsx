"use client";
import { X } from "lucide-react";

interface ComparisonModalProps {
  originalText: string;
  refinedText: string;
  onClose: () => void;
  onApply: () => void;
}

export function ComparisonModal({
  originalText,
  refinedText,
  onClose,
  onApply,
}: ComparisonModalProps) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 md:p-6">
      <div className="bg-white w-full max-w-5xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
              AI Refinement
            </h3>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">
              Struktur lebih rapi, makna tetap sama.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-3 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {/* Draft Asli */}
          <div className="p-8">
            <div className="flex items-center gap-2 mb-6">
              <span className="h-2 w-2 rounded-full bg-slate-300" />
              <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Draft Asli
              </p>
            </div>
            <div className="text-slate-400 text-base md:text-lg font-medium leading-relaxed h-[300px] md:h-[400px] overflow-y-auto pr-4 custom-scrollbar">
              {originalText}
            </div>
          </div>

          {/* Saran Jourdy */}
          <div className="p-8 bg-indigo-50/20">
            <div className="flex items-center gap-2 mb-6">
              <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
              <p className="text-[12px] font-black text-indigo-500 uppercase tracking-[0.2em]">
                Saran Jourdy
              </p>
            </div>
            <div className="text-slate-900 text-base md:text-lg font-bold leading-relaxed h-[300px] md:h-[400px] overflow-y-auto pr-4 custom-scrollbar">
              {refinedText}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 bg-white border-t border-slate-100 flex flex-col md:flex-row gap-4 justify-end items-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full md:w-auto px-8 py-4 rounded-2xl font-black text-[14px] uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
          >
            Abaikan
          </button>
          <button
            type="button"
            onClick={onApply}
            className="w-full md:w-auto px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[14px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all"
          >
            Terapkan Perubahan
          </button>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
