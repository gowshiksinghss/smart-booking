import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { FileOutput } from 'lucide-react';
import { buildingsList, departmentsList } from '../../mock/mockRooms';

const AnalyticsExport = () => {
  const { triggerToast } = useOutletContext();

  const handleExportPDF = () => {
    triggerToast("Generating audit report PDF...");
    setTimeout(() => {
      alert("Academic Classroom Audit Report downloaded to downloads folder.");
    }, 1500);
  };

  const handleExportCSV = () => {
    triggerToast("Compiling allocation spreadsheet...");
    setTimeout(() => {
      alert("Room bookings ledger exported to CSV file successfully.");
    }, 1500);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm text-slate-800 animate-fadeIn">
      <div>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
          <FileOutput className="w-4.5 h-4.5 text-blue-600" />
          <span>Institutional Audit & Export Engine</span>
        </h3>
        <p className="text-[11px] text-slate-500 mt-1">
          Select ledger filters to download official records for the Bannari Amman Academic Office.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 border border-slate-200 p-6 rounded-2xl">
        {/* Audit ledger filter card */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Report Ledger Filters</h4>
          
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Target Block</label>
              <select className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-700 outline-none">
                <option>All Blocks</option>
                {buildingsList.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Academic Department</label>
              <select className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-700 outline-none">
                <option>All Departments</option>
                {departmentsList.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Date Range</label>
              <select className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-700 outline-none">
                <option>This Week</option>
                <option>Current Semester</option>
                <option>Yearly Archive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Export Trigger card */}
        <div className="bg-white border border-slate-250 rounded-xl p-5 flex flex-col justify-center space-y-3 shadow-sm">
          <h5 className="text-xs font-bold text-slate-800 text-center uppercase tracking-wider">Export Action Targets</h5>
          <p className="text-[10px] text-slate-500 text-center leading-relaxed font-semibold">
            Generate authenticated documents verifying classroom booking compliance, attendance stats, and equipment usage audits.
          </p>

          <div className="space-y-2">
            <button
              onClick={handleExportPDF}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold py-3 rounded-xl uppercase tracking-widest cursor-pointer shadow shadow-blue-500/10 flex items-center justify-center space-x-2"
            >
              <span>Download PDF Report</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="w-full bg-slate-900 hover:bg-slate-800 text-[10px] text-white font-bold py-3 rounded-xl uppercase tracking-widest cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>Download CSV Sheet</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsExport;
