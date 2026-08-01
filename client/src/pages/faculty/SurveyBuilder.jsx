import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { ListCollapse, Trash } from 'lucide-react';

const SurveyBuilder = () => {
  const navigate = useNavigate();
  const { surveys, setSurveys, triggerToast } = useOutletContext();

  const [newSurveyTitle, setNewSurveyTitle] = useState('');
  const [newSurveyQuestions, setNewSurveyQuestions] = useState([
    { id: 'nq-1', text: 'Rate the instructor pace today:', type: 'rating' }
  ]);

  // Add question to Builder
  const addQuestionToBuilder = (type) => {
    const newQ = {
      id: `nq-${Date.now()}`,
      text: type === 'rating' ? 'Rate the presentation:' : 'Select option:',
      type,
      options: type === 'choice' ? ['Good', 'Average', 'Bad'] : undefined
    };
    setNewSurveyQuestions([...newSurveyQuestions, newQ]);
  };

  const removeQuestionFromBuilder = (id) => {
    setNewSurveyQuestions(newSurveyQuestions.filter(q => q.id !== id));
  };

  const handleSaveSurvey = (e) => {
    e.preventDefault();
    if (!newSurveyTitle) {
      triggerToast('Please provide a survey title');
      return;
    }
    const newSurvey = {
      id: `survey-${Date.now()}`,
      title: newSurveyTitle,
      questions: newSurveyQuestions
    };
    setSurveys([...surveys, newSurvey]);
    setNewSurveyTitle('');
    setNewSurveyQuestions([{ id: 'nq-1', text: 'Rate the instructor pace today:', type: 'rating' }]);
    triggerToast('Survey Template Created successfully!');
    navigate('/faculty/dashboard');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm text-slate-800 animate-fadeIn">
      <div>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
          <ListCollapse className="w-4.5 h-4.5 text-blue-600" />
          <span>Interactive Survey Builder</span>
        </h3>
        <p className="text-[11px] text-slate-500 mt-1">Design feedback gateways to capture student resource analytics prior to OTP validation.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Templates */}
        <div className="space-y-4">
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Survey Templates</h4>
          <div className="space-y-3">
            {surveys.map(s => (
              <div key={s.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50 hover:bg-slate-100/50 transition-all">
                <p className="text-xs font-bold text-slate-800">{s.title}</p>
                <div className="mt-2 space-y-1">
                  {s.questions.map((q, idx) => (
                    <p key={q.id} className="text-[10px] text-slate-500 flex items-start space-x-1">
                      <span>{idx + 1}.</span>
                      <span>{q.text} <span className="text-[9px] text-[#0052cc] font-bold uppercase font-mono">({q.type})</span></span>
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Build New Template Form */}
        <form onSubmit={handleSaveSurvey} className="border border-slate-200 rounded-xl p-4 bg-white space-y-4 shadow-sm">
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Construct New Template</h4>
          
          <div>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Survey Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Session Feedback Gate C"
              value={newSurveyTitle}
              onChange={(e) => setNewSurveyTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none focus:border-blue-500 text-slate-700"
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">Questions list</label>
              <div className="flex space-x-1.5">
                <button
                  type="button"
                  onClick={() => addQuestionToBuilder('rating')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-[9px] font-bold cursor-pointer"
                >
                  + Rating
                </button>
                <button
                  type="button"
                  onClick={() => addQuestionToBuilder('choice')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-[9px] font-bold cursor-pointer"
                >
                  + Choices
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {newSurveyQuestions.map((q, idx) => (
                <div key={q.id} className="bg-slate-50 border border-slate-150 p-2.5 rounded-lg flex justify-between items-start space-x-2">
                  <div className="flex-1 space-y-1">
                    <span className="text-[9px] font-mono text-[#0052cc] font-extrabold uppercase">Q{idx + 1} ({q.type})</span>
                    <input
                      type="text"
                      value={q.text}
                      onChange={(e) => {
                        const newQs = [...newSurveyQuestions];
                        newQs[idx].text = e.target.value;
                        setNewSurveyQuestions(newQs);
                      }}
                      className="w-full bg-white border border-slate-200 rounded p-1 text-[10px] outline-none text-slate-700"
                    />
                    {q.type === 'choice' && (
                      <input
                        type="text"
                        value={q.options.join(', ')}
                        onChange={(e) => {
                          const newQs = [...newSurveyQuestions];
                          newQs[idx].options = e.target.value.split(',').map(s => s.trim());
                          setNewSurveyQuestions(newQs);
                        }}
                        placeholder="Comma separated options"
                        className="w-full bg-white border border-slate-200 rounded p-1 text-[9px] outline-none text-slate-500"
                      />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeQuestionFromBuilder(q.id)}
                    className="text-red-500 hover:bg-red-50 p-1 rounded cursor-pointer mt-1"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-xl uppercase tracking-widest cursor-pointer mt-2"
          >
            Save Survey Template
          </button>
        </form>
      </div>
    </div>
  );
};

export default SurveyBuilder;
