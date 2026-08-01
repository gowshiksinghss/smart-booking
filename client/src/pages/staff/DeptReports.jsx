import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { BarChart3, Download } from 'lucide-react';

const DeptReports = () => {
  const { reports } = useOutletContext();

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm text-slate-800 animate-fadeIn">
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-sm font-bold text-[#0052cc] uppercase tracking-wider flex items-center space-x-2">
            <BarChart3 className="w-4.5 h-4.5 text-amber-500" />
            <span>Department Resource Usage Report</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Monthly breakdown of classroom utilization rates and active lecture bookings.</p>
        </div>
        
        <button 
          onClick={() => alert("Usage CSV Export simulation complete.")}
          className="bg-slate-900 hover:bg-slate-800 text-[10px] font-bold text-white py-2.5 px-4 rounded-xl flex items-center space-x-1.5 uppercase cursor-pointer transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV Data</span>
        </button>
      </div>

      {/* Graphical Analytics Charts via CSS Bar elements */}
      <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-8 shadow-sm">
        <div className="flex justify-between items-end h-48 px-4 border-b border-slate-200 pb-2">
          {reports.map((report) => (
            <div key={report.month} className="flex flex-col items-center space-y-3 w-1/12 group relative cursor-pointer">
              {/* Tooltip on hover */}
              <div className="opacity-0 group-hover:opacity-100 bg-slate-900 text-white text-[9px] px-2.5 py-1 rounded absolute -top-8 transition-opacity whitespace-nowrap shadow-xl z-10">
                Rate: {report.utilizationRate}% | Hours: {report.hoursBooked}h
              </div>

              {/* Graphical bar */}
              <div className="w-full bg-slate-250 bg-slate-200 rounded-t-lg relative h-40 flex items-end">
                <div 
                  className="w-full bg-gradient-to-t from-blue-600 to-indigo-500 rounded-t-lg transition-all duration-700"
                  style={{ height: `${report.utilizationRate}%` }}
                ></div>
              </div>

              {/* Month Label */}
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{report.month.slice(0, 3)}</span>
            </div>
          ))}
        </div>

        {/* Metrics cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 p-4 rounded-xl text-center shadow-sm">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-bold">Average Utilization</span>
            <span className="text-xl font-black text-slate-900 mt-1 block">69.2%</span>
          </div>
          <div className="bg-white border border-slate-200 p-4 rounded-xl text-center shadow-sm">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-bold">Peak Utilization Month</span>
            <span className="text-xl font-black text-emerald-600 mt-1 block">July (88%)</span>
          </div>
          <div className="bg-white border border-slate-200 p-4 rounded-xl text-center shadow-sm">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-bold">Total Academic Hours Logged</span>
            <span className="text-xl font-black text-blue-600 mt-1 block">1,810 Hours</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeptReports;
