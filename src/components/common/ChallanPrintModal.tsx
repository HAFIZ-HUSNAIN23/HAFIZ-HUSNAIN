import React from 'react';
import { FeeChallan } from '../../types.js';
import { Printer, X, Download } from 'lucide-react';

interface Props {
  challan: FeeChallan | null;
  onClose: () => void;
}

export const ChallanPrintModal: React.FC<Props> = ({ challan, onClose }) => {
  if (!challan) return null;

  const handlePrint = () => {
    window.print();
  };

  const copyTypes = [
    { title: 'BANK / PAYMENT COPY', subtitle: 'To be retained by Bank/Accounts' },
    { title: 'OFFICE COPY', subtitle: 'To be deposited in Madrasa Office' },
    { title: 'STUDENT COPY', subtitle: 'To be retained by Student/Guardian' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      {/* Modal box */}
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-emerald-800/20 overflow-hidden my-8">
        
        {/* Modal Top Bar (Hidden during print) */}
        <div className="no-print bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center font-serif text-amber-300 text-xl font-bold">
              ق
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-wide">Official Fee Challan Form</h2>
              <p className="text-xs text-emerald-200">Challan No: {challan.challan_no} • Month: {challan.month} {challan.year}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              id="print-challan-btn"
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-semibold rounded-lg shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              id="close-challan-modal-btn"
              className="p-2 text-emerald-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area - 3 Side-by-side or stacked copies */}
        <div id="printable-challan" className="p-6 bg-slate-50 overflow-x-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-w-[760px] print:grid-cols-3 print:gap-2 print:min-w-0 print:p-0">
            {copyTypes.map((copy, index) => (
              <div
                key={index}
                className="bg-white border-2 border-dashed border-emerald-800/40 rounded-xl p-4 flex flex-col justify-between text-xs shadow-xs relative print:rounded-none print:border-solid print:border print:border-emerald-900"
              >
                {/* Header */}
                <div className="text-center border-b border-emerald-800/20 pb-2 mb-2">
                  <div className="text-emerald-900 font-arabic text-sm font-bold tracking-wider mb-0.5">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </div>
                  <h3 className="font-bold text-xs text-emerald-950 uppercase tracking-tight font-serif">
                    Madrassa Arabiyyah Misbah Ul Quran For Huffaz
                  </h3>
                  <div className="text-[10px] text-amber-750 font-semibold uppercase tracking-wider">
                    Islamic Madrasa Lahore
                  </div>
                  <p className="text-[9px] text-slate-500 leading-tight mt-0.5">
                    Karmanwala Bazar, Kot Lakhpat Station, Lahore
                  </p>
                  <p className="text-[9px] text-slate-500">
                    Ph: 03224616821 / 03314925285
                  </p>

                  <div className="mt-2 inline-block px-2 py-0.5 bg-emerald-100 text-emerald-900 font-bold rounded text-[10px] uppercase border border-emerald-300">
                    {copy.title}
                  </div>
                </div>

                {/* Challan Metadata */}
                <div className="space-y-1.5 text-[11px] text-slate-700">
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="font-medium text-slate-500">Challan No:</span>
                    <span className="font-bold text-emerald-900">{challan.challan_no}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="font-medium text-slate-500">Month / Year:</span>
                    <span className="font-semibold">{challan.month} {challan.year}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="font-medium text-slate-500">Issue Date:</span>
                    <span>{challan.issue_date}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="font-medium text-slate-500">Due / Expiry Date:</span>
                    <span className="font-bold text-red-700">{challan.due_date}</span>
                  </div>

                  {/* Student Details */}
                  <div className="bg-emerald-50/50 p-2 rounded-lg border border-emerald-100 my-1 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Student ID:</span>
                      <span className="font-bold text-emerald-950">{challan.student_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Student Name:</span>
                      <span className="font-semibold">{challan.student_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Father Name:</span>
                      <span>{challan.father_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Course:</span>
                      <span className="font-medium text-emerald-800">{challan.course}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Class:</span>
                      <span>{challan.class_name}</span>
                    </div>
                  </div>

                  {/* Payment Breakdown */}
                  <div className="border-t border-b border-slate-200 py-1.5 space-y-1">
                    <div className="flex justify-between">
                      <span>Monthly Tuition Fee:</span>
                      <span>PKR {challan.fee_amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 text-[10px]">
                      <span>Late Surcharge (After 10th):</span>
                      <span>PKR 0.00</span>
                    </div>
                    <div className="flex justify-between font-bold text-emerald-950 text-xs pt-1 border-t border-dashed border-slate-200">
                      <span>Total Payable:</span>
                      <span className="text-emerald-800 font-bold">PKR {challan.fee_amount.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500">Status:</span>
                    <span className={`font-bold px-1.5 py-0.5 rounded text-[9px] ${
                      challan.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {challan.status}
                    </span>
                  </div>
                </div>

                {/* Footer Signatures */}
                <div className="pt-6 mt-3 border-t border-slate-200">
                  <div className="flex justify-between text-[9px] text-slate-500">
                    <div className="text-center">
                      <div className="w-16 border-b border-slate-400 mb-1"></div>
                      <span>Officer / Qari</span>
                    </div>
                    <div className="text-center">
                      <div className="w-16 border-b border-slate-400 mb-1"></div>
                      <span>Bank / Cashier</span>
                    </div>
                  </div>
                  <div className="text-[8px] text-slate-400 text-center mt-2">
                    {copy.subtitle}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="no-print bg-slate-100 px-6 py-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-600">
          <span>* Standard rule: Fee must be deposited on or before the 10th of each month.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-medium cursor-pointer transition-colors"
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
};
