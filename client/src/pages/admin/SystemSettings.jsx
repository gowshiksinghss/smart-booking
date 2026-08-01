import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Settings, ToggleLeft, ToggleRight } from 'lucide-react';

const SystemSettings = () => {
  const {
    allowExternalDomains, setAllowExternalDomains,
    maintenanceMode, setMaintenanceMode,
    requireSurveyForOtp, setRequireSurveyForOtp
  } = useOutletContext();

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm text-slate-800 animate-fadeIn">
      <div>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
          <Settings className="w-4.5 h-4.5 text-blue-600" />
          <span>System Settings</span>
        </h3>
        <p className="text-[11px] text-slate-500 mt-1">Configure global application parameters, authorization gates, and maintenance cycles.</p>
      </div>

      <div className="max-w-2xl divide-y divide-slate-150">
        <div className="py-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-900">Enforce Google OAuth Domain Lock</p>
            <p className="text-[10px] text-slate-450 font-semibold mt-0.5">Restrict logins exclusively to users ending with @bitsathy.ac.in.</p>
          </div>
          <button 
            onClick={() => setAllowExternalDomains(!allowExternalDomains)}
            className="text-[#0052cc] cursor-pointer"
          >
            {!allowExternalDomains ? <ToggleRight className="w-9 h-9" /> : <ToggleLeft className="w-9 h-9 text-slate-350" />}
          </button>
        </div>

        <div className="py-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-900">Live Attendance pre-session survey gate</p>
            <p className="text-[10px] text-slate-450 font-semibold mt-0.5">Force students to submit a resource feedback survey before entering OTP.</p>
          </div>
          <button 
            onClick={() => setRequireSurveyForOtp(!requireSurveyForOtp)}
            className="text-[#0052cc] cursor-pointer"
          >
            {requireSurveyForOtp ? <ToggleRight className="w-9 h-9" /> : <ToggleLeft className="w-9 h-9 text-slate-350" />}
          </button>
        </div>

        <div className="py-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-900">Global Portal Maintenance Mode</p>
            <p className="text-[10px] text-slate-450 font-semibold mt-0.5">Locks out standard users and shows a maintenance warning card.</p>
          </div>
          <button 
            onClick={() => setMaintenanceMode(!maintenanceMode)}
            className="text-rose-650 cursor-pointer"
          >
            {maintenanceMode ? <ToggleRight className="w-9 h-9" /> : <ToggleLeft className="w-9 h-9 text-slate-355" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
