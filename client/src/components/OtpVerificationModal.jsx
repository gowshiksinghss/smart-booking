import React, { useState, useEffect } from 'react';
import { mockSurveys } from '../mock/mockSurveys';
import { Check, ClipboardList, KeyRound, AlertCircle, Timer, ShieldAlert } from 'lucide-react';

const OtpVerificationModal = ({ isOpen, onClose, room, onVerificationSuccess }) => {
  const [step, setStep] = useState(1); // 1: Survey Gate, 2: OTP Entry, 3: Success State
  
  // Survey Form States
  const [q1Rating, setQ1Rating] = useState(0);
  const [q2Choice, setQ2Choice] = useState('');
  const [surveyErrors, setSurveyErrors] = useState('');

  // OTP Verification States
  const [otpVal, setOtpVal] = useState(['', '', '', '', '', '']);
  const [timerSecs, setTimerSecs] = useState(300); // 5-minute countdown
  const [otpError, setOtpError] = useState('');

  const survey = mockSurveys[0]; // Let's use the first survey
  const correctOtp = room?.currentBooking?.otp || "849201";

  // Countdown timer logic when OTP step is active
  useEffect(() => {
    let interval = null;
    if (step === 2 && timerSecs > 0) {
      interval = setInterval(() => {
        setTimerSecs((prev) => prev - 1);
      }, 1000);
    } else if (timerSecs === 0) {
      setOtpError("OTP expired. Please request a new one from the instructor.");
    }
    return () => clearInterval(interval);
  }, [step, timerSecs]);

  if (!isOpen) return null;

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSurveySubmit = (e) => {
    e.preventDefault();
    if (q1Rating === 0 || !q2Choice) {
      setSurveyErrors("Please complete both questions of the pre-survey.");
      return;
    }
    setSurveyErrors('');
    setStep(2); // Unlock OTP Verification
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otpVal];
    newOtp[index] = value.substring(value.length - 1);
    setOtpVal(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpVal[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleOtpVerify = () => {
    if (timerSecs === 0) {
      setOtpError("OTP has expired.");
      return;
    }
    const enteredOtp = otpVal.join('');
    if (enteredOtp.length < 6) {
      setOtpError("Please enter a full 6-digit OTP code.");
      return;
    }
    if (enteredOtp !== correctOtp) {
      setOtpError("Invalid OTP. Please check the screen or request from faculty.");
      return;
    }

    setOtpError('');
    setStep(3); // Success
    setTimeout(() => {
      onVerificationSuccess();
      onClose();
      // Reset state
      setStep(1);
      setQ1Rating(0);
      setQ2Choice('');
      setOtpVal(['', '', '', '', '', '']);
      setTimerSecs(300);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-scaleIn">
        
        {/* Modal Header */}
        <div className="border-b border-slate-800 p-5 flex items-center justify-between bg-slate-900/50">
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              {room?.currentBooking?.title || "Classroom Check-In"}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">
              Room: {room?.id} | Faculty: {room?.currentBooking?.faculty || "Coordinator"}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 font-semibold text-xs cursor-pointer px-2 py-1 rounded hover:bg-slate-800"
          >
            Cancel
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">

          {/* Workflow Steps Indicator */}
          <div className="flex items-center justify-center space-x-2">
            <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              step === 1 ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'bg-slate-800 text-slate-500'
            }`}>
              <ClipboardList className="w-3.5 h-3.5" />
              <span>1. Feedback Survey</span>
            </div>
            <div className="w-6 border-t border-slate-800"></div>
            <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              step === 2 ? 'bg-violet-600/20 text-violet-400 border border-violet-500/30' : 'bg-slate-800 text-slate-500'
            }`}>
              <KeyRound className="w-3.5 h-3.5" />
              <span>2. OTP Verification</span>
            </div>
          </div>

          {/* Step 1: Pre-Survey Gate */}
          {step === 1 && (
            <form onSubmit={handleSurveySubmit} className="space-y-4">
              <div className="bg-blue-950/20 border border-blue-900/40 p-4 rounded-xl flex items-start space-x-3">
                <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-blue-300 leading-relaxed">
                  <strong>Survey Gate Enabled:</strong> You must answer this feedback survey regarding room resources before the OTP field is unlocked.
                </p>
              </div>

              {surveyErrors && (
                <p className="text-xs text-red-400 font-medium flex items-center space-x-1">
                  <span>●</span> <span>{surveyErrors}</span>
                </p>
              )}

              {/* Question 1 (Rating) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300 tracking-wide">
                  {survey.questions[0].questionText}
                </label>
                <div className="flex items-center space-x-2">
                  {survey.questions[0].options.map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setQ1Rating(num)}
                      className={`w-9 h-9 rounded-lg font-bold text-xs cursor-pointer border transition-all ${
                        q1Rating === num
                          ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/20'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                  <span className="text-[10px] text-slate-500 ml-2">(1 = Poor, 5 = Excellent)</span>
                </div>
              </div>

              {/* Question 2 (Choices) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300 tracking-wide">
                  {survey.questions[1].questionText}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {survey.questions[1].options.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setQ2Choice(opt)}
                      className={`p-2.5 rounded-lg text-left text-xs cursor-pointer border transition-all ${
                        q2Choice === opt
                          ? 'bg-blue-600/10 border-blue-500 text-blue-400 font-semibold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Survey Submit button */}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/10 transition-colors uppercase tracking-widest mt-4 cursor-pointer"
              >
                Submit Feedback & Unlock OTP
              </button>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <div className="space-y-5">
              {/* Countdown timer */}
              <div className="flex items-center justify-between bg-slate-950 border border-slate-800 p-4 rounded-xl">
                <div className="flex items-center space-x-2">
                  <Timer className={`w-4 h-4 ${timerSecs < 60 ? 'text-red-500 animate-pulse' : 'text-slate-400'}`} />
                  <span className="text-xs font-medium text-slate-400">OTP Countdown Session:</span>
                </div>
                <span className={`font-mono text-sm font-bold ${timerSecs < 60 ? 'text-red-400' : 'text-blue-400'}`}>
                  {formatTimer(timerSecs)}
                </span>
              </div>

              {otpError && (
                <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl flex items-center space-x-2.5 text-xs text-red-300">
                  <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}

              {/* OTP Input Fields */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-300 tracking-wide text-center">
                  Enter 6-Digit Verification Code
                </label>
                <div className="flex items-center justify-center space-x-2.5">
                  {otpVal.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-input-${idx}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      disabled={timerSecs === 0}
                      className="w-11 h-12 text-center text-lg font-bold bg-slate-950 border border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-lg outline-none text-violet-400 disabled:opacity-50 transition-all"
                    />
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 text-center">
                  (Demo OTP code: <span className="font-mono text-slate-400 font-semibold">{correctOtp}</span>)
                </p>
              </div>

              {/* Verify OTP Button */}
              <button
                type="button"
                onClick={handleOtpVerify}
                disabled={timerSecs === 0}
                className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-slate-800 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-lg shadow-violet-500/10 disabled:shadow-none transition-colors uppercase tracking-widest mt-4 cursor-pointer"
              >
                Verify Attendance Code
              </button>
            </div>
          )}

          {/* Step 3: Success Screen */}
          {step === 3 && (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 animate-bounce">
                <Check className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-100">Attendance Verified Successfully!</h4>
                <p className="text-xs text-slate-400 mt-1">Your check-in has been logged in the department matrix database.</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default OtpVerificationModal;
