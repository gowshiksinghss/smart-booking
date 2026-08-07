import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Megaphone, Send, Trash, Shield } from 'lucide-react';
import { departmentsList } from '../../mock/mockRooms';
import { api } from '../../utils/api';

const AdminBroadcasts = () => {
  const navigate = useNavigate();
  const { 
    notificationList, 
    setNotificationList, 
    surveys, 
    setSurveys, 
    triggerToast,
    refreshData 
  } = useOutletContext();

  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifTargetType, setNotifTargetType] = useState('All');
  const [notifTargetValue, setNotifTargetValue] = useState(departmentsList[0]);
  const [rollTags, setRollTags] = useState('');

  // Survey integration state
  const [attachedSurveyId, setAttachedSurveyId] = useState('');
  const [buildCustomSurvey, setBuildCustomSurvey] = useState(false);
  const [customSurveyTitle, setCustomSurveyTitle] = useState('');
  const [customSurveyQuestions, setCustomSurveyQuestions] = useState([
    { id: 'csq-1', text: 'Rate this session utility:', type: 'rating' }
  ]);

  const addCustomQuestion = (type) => {
    const newQ = {
      id: `csq-${Date.now()}`,
      text: type === 'rating' ? 'Rate the presentation:' : 'Select option:',
      type,
      options: type === 'choice' ? ['Good', 'Average', 'Bad'] : undefined
    };
    setCustomSurveyQuestions([...customSurveyQuestions, newQ]);
  };

  const removeCustomQuestion = (id) => {
    setCustomSurveyQuestions(customSurveyQuestions.filter(q => q.id !== id));
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!notifTitle || !notifMessage) {
      triggerToast("Please fill in all broadcast details.");
      return;
    }

    let finalSurveyId = '';

    if (buildCustomSurvey) {
      const newSurvey = {
        id: `survey-${Date.now()}`,
        title: customSurveyTitle || `${notifTitle} Feedback`,
        questions: customSurveyQuestions
      };
      setSurveys(prev => [...prev, newSurvey]);
      finalSurveyId = newSurvey.id;
    } else if (attachedSurveyId) {
      finalSurveyId = attachedSurveyId;
    }

    try {
      await api.createNotification({
        title: notifTitle,
        message: notifMessage,
        targetType: notifTargetType,
        targetValue: notifTargetType === 'All' ? 'All' 
                     : notifTargetType === 'Department' ? notifTargetValue 
                     : rollTags
      });

      triggerToast("Broadcast dispatch successful!");
      setNotifTitle('');
      setNotifMessage('');
      if (refreshData) {
        await refreshData();
      }
    } catch (err) {
      triggerToast(`Failed to dispatch broadcast: ${err.message}`);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-slate-800 animate-fadeIn">
      
      {/* Broadcast Form */}
      <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
            <Megaphone className="w-4.5 h-4.5 text-amber-500" />
            <span>Administrative Broadcast Dispatcher</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Publish institutional alerts visible system-wide, to specific departments, or designated student roll numbers.</p>
        </div>

        <form onSubmit={handleSendBroadcast} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Broadcast Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Campus Wi-Fi Scheduled Downtime"
                value={notifTitle}
                onChange={(e) => setNotifTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl p-2.5 text-xs text-slate-800 outline-none transition-all font-semibold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Alert Scope</label>
              <div className="flex space-x-2">
                <select
                  value={notifTargetType}
                  onChange={(e) => setNotifTargetType(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 outline-none font-bold"
                >
                  <option value="All">All Users</option>
                  <option value="Department">Department</option>
                  <option value="RollNumbers">Roll Lists</option>
                </select>
                
                {notifTargetType === 'Department' && (
                  <select
                    value={notifTargetValue}
                    onChange={(e) => setNotifTargetValue(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 outline-none font-semibold"
                  >
                    {departmentsList.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                )}

                {notifTargetType === 'RollNumbers' && (
                  <input
                    type="text"
                    required
                    placeholder="e.g. 21CS001, 21CS045"
                    value={rollTags}
                    onChange={(e) => setRollTags(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl p-2 text-xs text-slate-800 outline-none transition-all font-semibold"
                  />
                )}

                {notifTargetType === 'All' && (
                  <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-400 select-none flex items-center justify-center font-bold">
                    System-wide Dispatch
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Broadcast Message *</label>
            <textarea
              required
              rows={4}
              placeholder="Type details of your administrative alert..."
              value={notifMessage}
              onChange={(e) => setNotifMessage(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl p-2.5 text-xs text-slate-800 outline-none transition-all resize-none font-medium"
            ></textarea>
          </div>

          {/* Send Survey Options */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
            <h4 className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Survey Integration Gate</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Select Pre-configured Survey</label>
                <select
                  disabled={buildCustomSurvey}
                  value={attachedSurveyId}
                  onChange={(e) => setAttachedSurveyId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs outline-none focus:border-blue-500 text-slate-700 disabled:opacity-50 font-semibold"
                >
                  <option value="">-- No Survey Selected --</option>
                  {surveys.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                </select>
              </div>

              <div className="flex items-center pt-5">
                <input
                  type="checkbox"
                  id="buildCustomSurvey"
                  checked={buildCustomSurvey}
                  onChange={(e) => {
                    setBuildCustomSurvey(e.target.checked);
                    if (e.target.checked) setAttachedSurveyId('');
                  }}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="buildCustomSurvey" className="text-xs font-bold text-slate-800 cursor-pointer select-none ml-2">
                  Construct Custom Feedback Sheet
                </label>
              </div>
            </div>

            {buildCustomSurvey && (
              <div className="space-y-4 pt-3 border-t border-slate-200/60 animate-fadeIn">
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Survey Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Institutional Infrastructure Feedback"
                    value={customSurveyTitle}
                    onChange={(e) => setCustomSurveyTitle(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs outline-none focus:border-blue-500 text-slate-700 font-semibold"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Questions List</span>
                    <div className="flex space-x-1.5">
                      <button
                        type="button"
                        onClick={() => addCustomQuestion('rating')}
                        className="bg-slate-200 hover:bg-slate-350 text-slate-700 px-2 py-0.5 rounded text-[9px] font-black cursor-pointer transition-all"
                      >
                        + Rating
                      </button>
                      <button
                        type="button"
                        onClick={() => addCustomQuestion('choice')}
                        className="bg-slate-200 hover:bg-slate-355 text-slate-700 px-2 py-0.5 rounded text-[9px] font-black cursor-pointer transition-all"
                      >
                        + Choices
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {customSurveyQuestions.map((q, idx) => (
                      <div key={q.id} className="bg-white border border-slate-150 p-2.5 rounded-lg flex justify-between items-start space-x-2 shadow-sm">
                        <div className="flex-1 space-y-1">
                          <span className="text-[9px] font-mono text-blue-700 font-extrabold uppercase">Question {idx + 1} ({q.type})</span>
                          <input
                            type="text"
                            value={q.text}
                            onChange={(e) => {
                              const newQs = [...customSurveyQuestions];
                              newQs[idx].text = e.target.value;
                              setCustomSurveyQuestions(newQs);
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded p-1 text-[10px] outline-none text-slate-700 font-medium"
                          />
                          {q.type === 'choice' && (
                            <input
                              type="text"
                              value={q.options?.join(', ')}
                              onChange={(e) => {
                                const newQs = [...customSurveyQuestions];
                                newQs[idx].options = e.target.value.split(',').map(s => s.trim());
                                setCustomSurveyQuestions(newQs);
                              }}
                              placeholder="Comma separated options (e.g. Good, Average, Poor)"
                              className="w-full bg-slate-50 border border-slate-200 rounded p-1 text-[9px] outline-none text-slate-500"
                            />
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCustomQuestion(q.id)}
                          className="text-rose-600 hover:bg-rose-50 p-1.5 rounded cursor-pointer mt-1"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3 rounded-xl shadow-lg shadow-blue-500/10 flex items-center justify-center space-x-2 uppercase tracking-widest transition-all cursor-pointer font-black"
          >
            <Send className="w-4 h-4" />
            <span>Dispatch Broadcast</span>
          </button>
        </form>
      </div>

      {/* Sidebar: Sent Alerts Log */}
      <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm text-left">
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-100 pb-3">
          <Megaphone className="w-4 h-4 text-blue-600" />
          <span>Active Broadcast Log</span>
        </h3>

        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {notificationList.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400 font-semibold">
              No alerts currently dispatched.
            </div>
          ) : (
            notificationList.map((n) => {
              const senderName = typeof n.sender === 'object' ? `${n.sender?.name} (${n.sender?.role})` : (n.sender || 'Admin');
              return (
                <div key={n._id || n.id} className="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl p-3 text-[10px] text-slate-600 space-y-1.5 transition-all">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span className="truncate max-w-[140px]">{n.title}</span>
                    <span className="text-[8.5px] text-slate-400 font-mono">{n.createdAt ? new Date(n.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-550 leading-relaxed font-medium">{n.message}</p>
                  
                  <div className="flex items-center justify-between pt-1 text-[8.5px] border-t border-slate-200/50 mt-1">
                    <span className="font-extrabold text-blue-700 flex items-center space-x-0.5">
                      <Shield className="w-3 h-3 text-blue-600" />
                      <span>{senderName}</span>
                    </span>
                    <span className="bg-slate-200 text-slate-700 font-black px-1.5 py-0.25 rounded uppercase">
                      {n.targetType}: {n.targetValue || 'All'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
};

export default AdminBroadcasts;
