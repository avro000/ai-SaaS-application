import { useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../UI/LoadingSpinner';
import { HiOutlineDocumentText, HiOutlineClipboardCopy } from 'react-icons/hi';

const DocumentSummarizer = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');

  const handleSubmit = async () => {
    if (!text.trim()) return toast.error('Please paste some text to summarize');
    setLoading(true);
    try {
      const res = await api.post('/tools/summarize', { text });
      setResult(res.data.output);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Summarization failed');
    } finally {
      setLoading(false);
    }
  };

  const copyText = (t) => {
    navigator.clipboard.writeText(t);
    toast.success('Copied!');
  };

  const tabs = [
    { id: 'summary', label: 'Summary' },
    { id: 'keyPoints', label: 'Key Points' },
    { id: 'actions', label: 'Action Items' },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-900 flex items-center gap-2">
          <HiOutlineDocumentText className="w-6 h-6 text-warm-500" />
          Document Summarizer
        </h1>
        <p className="text-ink-400 mt-1">Paste any long text and get a concise summary with key points and action items.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-600 mb-1.5">Your Text</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="textarea-warm text-sm"
              rows={18}
              placeholder="Paste an article, document, meeting notes, or any long text here..."
            />
            <p className="text-xs text-ink-300 mt-1">{text.split(/\s+/).filter(Boolean).length} words</p>
          </div>
          <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full">
            {loading ? 'Summarizing...' : 'Summarize'}
          </button>
        </div>

        {/* Output */}
        <div className="space-y-4">
          {loading && <LoadingSpinner text="Reading and summarizing..." />}
          {result && !loading && (
            <div className="space-y-4 animate-fade-in-up">
              {/* Meta */}
              <div className="flex flex-wrap gap-2">
                {result.sentiment && (
                  <span className={`badge ${
                    result.sentiment === 'positive' ? 'badge-sage' : 
                    result.sentiment === 'negative' ? 'badge-berry' : 'badge-earth'
                  }`}>
                    {result.sentiment}
                  </span>
                )}
                {result.topics?.map((t, i) => (
                  <span key={i} className="badge badge-warm">{t}</span>
                ))}
                {result.wordCountOriginal && result.wordCountSummary && (
                  <span className="badge badge-earth">
                    {result.wordCountOriginal} → {result.wordCountSummary} words
                  </span>
                )}
              </div>

              {/* Tabs */}
              <div className="flex gap-1 p-1 bg-earth-50 rounded-xl">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-white text-ink-800 shadow-sm'
                        : 'text-ink-400 hover:text-ink-600'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              {activeTab === 'summary' && result.summary && (
                <div className="card-warm p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-ink-700">Summary</h3>
                    <button onClick={() => copyText(result.summary)} className="btn-secondary text-xs py-1 px-3 flex items-center gap-1">
                      <HiOutlineClipboardCopy className="w-3.5 h-3.5" /> Copy
                    </button>
                  </div>
                  <p className="text-sm text-ink-600 leading-relaxed whitespace-pre-wrap">{result.summary}</p>
                </div>
              )}

              {activeTab === 'keyPoints' && result.keyPoints?.length > 0 && (
                <div className="card-warm p-5">
                  <h3 className="font-semibold text-ink-700 mb-3">Key Points</h3>
                  <div className="space-y-3">
                    {result.keyPoints.map((kp, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-cream-50 rounded-xl">
                        <span className={`badge mt-0.5 ${
                          kp.importance === 'high' ? 'badge-warm' : kp.importance === 'medium' ? 'badge-earth' : 'badge-sage'
                        }`}>
                          {kp.importance}
                        </span>
                        <p className="text-sm text-ink-600 flex-1">{kp.point}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'actions' && result.actionItems?.length > 0 && (
                <div className="card-warm p-5">
                  <h3 className="font-semibold text-ink-700 mb-3">Action Items</h3>
                  <div className="space-y-2">
                    {result.actionItems.map((a, i) => (
                      <div key={i} className="flex items-start gap-3 py-2 border-b border-earth-50 last:border-0">
                        <div className={`w-5 h-5 rounded-md border-2 flex-shrink-0 mt-0.5 ${
                          a.priority === 'high' ? 'border-warm-400' : 'border-earth-300'
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm text-ink-700">{a.action}</p>
                          <span className={`badge text-xs mt-1 ${a.priority === 'high' ? 'badge-warm' : 'badge-earth'}`}>
                            {a.priority} priority
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.rawText && (
                <div className="card-warm p-5">
                  <p className="text-sm text-ink-600 whitespace-pre-wrap leading-relaxed">{result.rawText}</p>
                </div>
              )}
            </div>
          )}
          {!result && !loading && (
            <div className="flex flex-col items-center justify-center h-64 text-ink-300">
              <HiOutlineDocumentText className="w-12 h-12 mb-3" />
              <p className="text-sm">Your summary will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentSummarizer;
