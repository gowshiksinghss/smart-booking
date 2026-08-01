import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Megaphone, Send, Trash } from 'lucide-react';

const Announcements = () => {
  const navigate = useNavigate();
  const { 
    notificationList, setNotificationList, 
    surveys, setSurveys 
  } = useOutletContext();

  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  
  // Custom survey sender state
  const [attachedSurveyId, setAttachedSurveyId] = useState('');
  const [buildCustomSurvey, setBuildCustomSurvey] = useState(false);
  const [customSurveyTitle, setCustomSurveyTitle] = useState('');
  const [customSurveyQuestions, setCustomSurveyQuestions] = useState([
    { id: 'csq-1', text: 'Rate the facility resources:', type: 'rating' }
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

  const handleDispatchAnnouncement = (e) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;

    let finalSurveyId = '';

    if (buildCustomSurvey) {
      const newSurvey = {
        id: `survey-${Date.now()}`,
        title: customSurveyTitle || `${broadcastTitle} Feedback`,
        questions: customSurveyQuestions
      };
      setSurveys(prev => [...prev, newSurvey]);
      finalSurveyId = newSurvey.id;
    } else if (attachedSurveyId) {
      finalSurveyId = attachedSurveyId;
    }

    const newNotification = {
      id: "n-" + Math.floor(Math.random() * 1000),
      title: broadcastTitle,
      message: broadcastMessage,
      sender: "Subramanian M (Staff)",
      targetType: "Department",
      targetValue: "Computer Science and Engineering",
      timestamp: new Date().toISOString(),
      attachedSurveyId: finalSurveyId
    };

    setNotificationList([newNotification, ...notificationList]);
    alert("Department broadcast dispatched to all CS students!");
    setBroadcastTitle('');
    setBroadcastMessage('');
    navigate('/staff/dashboard');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-slate-800 animate-fadeIn">
      
      {/* Announcements Dispatcher Form */}
      <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
            <Megaphone className="w-4.5 h-4.5 text-blue-600" />
            <span>Announcements Board Manager</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Publish global announcements, scheduling notices, or security dispatches to the department.</p>
        </div>

        <form onSubmit={handleDispatchAnnouncement} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Headline Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Server Maintenance Notice"
              value={broadcastTitle}
              onChange={(e) => setBroadcastTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl p-2.5 text-xs text-slate-800 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Alert Content / Message *</label>
            <textarea
              required
              rows={4}
              placeholder="Provide detailed description of the announcement..."
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl p-2.5 text-xs text-slate-800 outline-none resize-none transition-all"
            ></textarea>
          </div>

          {/* Send Survey Options */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
            <h4 className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Attach Survey Gateway Integration</h4>
            
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
                    placeholder="e.g. Lab Satisfaction Survey"
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
                          <span className="text-[9px] font-mono text-blue-600 font-extrabold uppercase">Q{idx + 1} ({q.type})</span>
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
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3 rounded-xl shadow-lg shadow-blue-500/10 flex items-center justify-center space-x-2 uppercase tracking-widest transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Dispatch to All Students</span>
          </button>
        </form>
      </div>

      {/* Sidebar: Sent announcements log */}
      <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-2">
          <Megaphone className="w-4 h-4 text-blue-650" />
          <span>Dispatched Alerts Log</span>
        </h3>

        <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
          {notificationList.map((n) => (
            <div key={n.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[10px] text-slate-650 space-y-1">
              <div className="flex justify-between font-bold text-slate-800">
                <span>{n.title}</span>
                <span className="text-[8px] text-slate-400 font-semibold">{new Date(n.timestamp).toLocaleDateString()}</span>
              </div>
              <p className="text-slate-500 line-clamp-2">{n.message}</p>
              {n.attachedSurveyId && (
                <span className="inline-block bg-blue-50 text-blue-700 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-blue-100 mt-1">
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

export default Announcements;
