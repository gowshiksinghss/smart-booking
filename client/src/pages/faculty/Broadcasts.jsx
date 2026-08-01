import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Megaphone, Send, Trash } from 'lucide-react';
import { departmentsList } from '../../mock/mockRooms';

const Broadcasts = () => {
  const navigate = useNavigate();
  const { notificationList, setNotificationList, surveys, setSurveys, triggerToast } = useOutletContext();

  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifTargetType, setNotifTargetType] = useState('Department');
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

  const handleSendBroadcast = (e) => {
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

    const newNotification = {
      id: "n-" + Math.floor(Math.random() * 1000),
      title: notifTitle,
      message: notifMessage,
      sender: "Dr. Rajesh Kumar",
      targetType: notifTargetType,
      targetValue: notifTargetType === 'Department' ? notifTargetValue : rollTags,
      timestamp: new Date().toISOString(),
      attachedSurveyId: finalSurveyId
    };

    setNotificationList([newNotification, ...notificationList]);
    triggerToast("Broadcast dispatch successful!");
    setNotifTitle('');
    setNotifMessage('');
    navigate('/faculty/dashboard');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-slate-800 animate-fadeIn">
      
      {/* Broadcast Form */}
      <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
            <Megaphone className="w-4.5 h-4.5 text-amber-500" />
            <span>Targeted Announcement Dispatcher</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Publish alerts visible to specific student roll lists or entire academic branches.</p>
        </div>

        <form onSubmit={handleSendBroadcast} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Announcement Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. AI Lab Exam rescheduled"
                value={notifTitle}
                onChange={(e) => setNotifTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl p-2.5 text-xs text-slate-800 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Target Scope</label>
              <div className="flex space-x-2">
                <select
                  value={notifTargetType}
                  onChange={(e) => setNotifTargetType(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 outline-none"
                >
                  <option value="Department">Department</option>
                  <option value="RollNumbers">Roll Lists</option>
                </select>
                
                {notifTargetType === 'Department' ? (
                  <select
                    value={notifTargetValue}
                    onChange={(e) => setNotifTargetValue(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 outline-none"
                  >
                    {departmentsList.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="e.g. 21CS001, 21CS045"
                    value={rollTags}
                    onChange={(e) => setRollTags(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl p-2 text-xs text-slate-800 outline-none transition-all"
                  />
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Message Body *</label>
            <textarea
              required
              rows={4}
              placeholder="Type details of your notification dispatch..."
              value={notifMessage}
              onChange={(e) => setNotifMessage(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl p-2.5 text-xs text-slate-800 outline-none transition-all resize-none"
            ></textarea>
          </div>

          {/* Send Survey Options */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
            <h4 className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Send Survey Gateway Integration</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Select Existing Survey</label>
                <select
                  disabled={buildCustomSurvey}
                  value={attachedSurveyId}
                  onChange={(e) => setAttachedSurveyId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs outline-none focus:border-blue-500 text-slate-700 disabled:opacity-50"
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
                  Build Custom Survey for this Alert
                </label>
              </div>
            </div>

            {buildCustomSurvey && (
              <div className="space-y-4 pt-3 border-t border-slate-200/60 animate-fadeIn">
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Survey Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Broadcast Feedback Gate"
                    value={customSurveyTitle}
                    onChange={(e) => setCustomSurveyTitle(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs outline-none focus:border-blue-500 text-slate-700 font-semibold"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Questions list</span>
                    <div className="flex space-x-1.5">
                      <button
                        type="button"
                        onClick={() => addCustomQuestion('rating')}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-0.5 rounded text-[9px] font-bold cursor-pointer transition-colors"
                      >
                        + Rating
                      </button>
                      <button
                        type="button"
                        onClick={() => addCustomQuestion('choice')}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-0.5 rounded text-[9px] font-bold cursor-pointer transition-colors"
                      >
                        + Choices
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {customSurveyQuestions.map((q, idx) => (
                      <div key={q.id} className="bg-white border border-slate-150 p-2.5 rounded-lg flex justify-between items-start space-x-2 shadow-sm">
                        <div className="flex-1 space-y-1">
                          <span className="text-[9px] font-mono text-[#0052cc] font-extrabold uppercase">Q{idx + 1} ({q.type})</span>
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
                              placeholder="Comma separated options"
                              className="w-full bg-slate-50 border border-slate-200 rounded p-1 text-[9px] outline-none text-slate-500"
                            />
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCustomQuestion(q.id)}
                          className="text-red-500 hover:bg-red-50 p-1 rounded cursor-pointer mt-1"
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
            className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-3 rounded-xl shadow-lg shadow-amber-500/10 flex items-center justify-center space-x-2 uppercase tracking-widest transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Dispatch Announcement</span>
          </button>
        </form>
      </div>

      {/* Sidebar: Broadcast alerts log */}
      <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-2">
          <Megaphone className="w-4 h-4 text-amber-500" />
          <span>Sent Alerts Log</span>
        </h3>

        <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
          {notificationList.map((n) => (
            <div key={n.id} className="bg-slate-50 border border-slate-250 rounded-xl p-3 text-[10px] text-slate-650 space-y-1">
              <div className="flex justify-between font-bold text-slate-800">
                <span>{n.title}</span>
                <span className="text-[8px] text-slate-400 font-semibold">{new Date(n.timestamp).toLocaleDateString()}</span>
              </div>
              <p className="text-slate-500 line-clamp-2">{n.message}</p>
              {n.attachedSurveyId && (
                <span className="inline-block bg-blue-50 text-[#0052cc] text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-blue-100 mt-1">
                  📋 Linked Survey
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Broadcasts;
