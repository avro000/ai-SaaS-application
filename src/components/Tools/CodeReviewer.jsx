import { useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../UI/LoadingSpinner';
import { HiOutlineCode, HiOutlineClipboardCopy, HiOutlineExclamation, HiOutlineLightBulb } from 'react-icons/hi';

const languages = ['javascript', 'python', 'java', 'typescript', 'c++', 'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'sql', 'html', 'css'];

const CodeReviewer = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async () => {
    if (!code.trim()) return toast.error('Please paste some code first');
    setLoading(true);
    try {
      const res = await api.post('/tools/code-review', { code, language });
      setResult(res.data.output);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Review failed');
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied!');
  };

  const severityColor = {
    critical: 'badge-berry',
    warning: 'badge-warm',
    info: 'badge-sage'
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-900 flex items-center gap-2">
          <HiOutlineCode className="w-6 h-6 text-warm-500" />
          Code Reviewer
        </h1>
        <p className="text-ink-400 mt-1">Paste your code and get bug detection, suggestions, and a refactored version.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-ink-600 mb-1.5">Language</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="input-warm">
                {languages.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-600 mb-1.5">Your code</label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="textarea-warm font-mono text-sm"
              rows={16}
              placeholder="Paste your code here..."
            />
          </div>
          <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full">
            {loading ? 'Analyzing...' : 'Review Code'}
          </button>
        </div>

        {/* Output */}
        <div className="space-y-4">
          {loading && <LoadingSpinner text="Analyzing your code..." />}
          {result && !loading && (
            <div className="space-y-4 animate-fade-in-up">
              {/* Score */}
              <div className="card-warm p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-ink-500">Overall Score</p>
                  <span className={`font-display text-3xl font-bold ${
                    (result.overallScore || 0) >= 7 ? 'text-sage-600' : (result.overallScore || 0) >= 4 ? 'text-warm-600' : 'text-berry-500'
                  }`}>
                    {result.overallScore || '?'}/10
                  </span>
                </div>
                {result.summary && <p className="text-sm text-ink-500 mt-2 leading-relaxed">{result.summary}</p>}
              </div>

              {/* Bugs */}
              {result.bugs?.length > 0 && (
                <div className="card-warm p-5">
                  <h3 className="font-semibold text-ink-700 flex items-center gap-2 mb-3">
                    <HiOutlineExclamation className="w-4 h-4 text-berry-500" />
                    Bugs Found ({result.bugs.length})
                  </h3>
                  <div className="space-y-3">
                    {result.bugs.map((bug, i) => (
                      <div key={i} className="p-3 bg-cream-50 rounded-xl">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`badge ${severityColor[bug.severity] || 'badge-earth'}`}>{bug.severity}</span>
                          {bug.line && <span className="text-xs text-ink-400">Line: {bug.line}</span>}
                        </div>
                        <p className="text-sm text-ink-700">{bug.description}</p>
                        {bug.fix && <p className="text-xs text-sage-600 mt-1">💡 {bug.fix}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {result.suggestions?.length > 0 && (
                <div className="card-warm p-5">
                  <h3 className="font-semibold text-ink-700 flex items-center gap-2 mb-3">
                    <HiOutlineLightBulb className="w-4 h-4 text-warm-500" />
                    Suggestions
                  </h3>
                  <div className="space-y-2">
                    {result.suggestions.map((s, i) => (
                      <div key={i} className="flex items-start gap-2 py-2 border-b border-earth-50 last:border-0">
                        <span className={`badge ${s.category === 'security' ? 'badge-berry' : s.category === 'performance' ? 'badge-warm' : 'badge-sage'}`}>
                          {s.category}
                        </span>
                        <p className="text-sm text-ink-600 flex-1">{s.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Refactored Code */}
              {result.refactoredCode && (
                <div className="card-warm p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-ink-700">Refactored Code</h3>
                    <button onClick={() => copyText(result.refactoredCode)} className="btn-secondary text-xs py-1 px-3 flex items-center gap-1">
                      <HiOutlineClipboardCopy className="w-3.5 h-3.5" /> Copy
                    </button>
                  </div>
                  <pre className="bg-ink-900 text-cream-100 rounded-xl p-4 text-sm overflow-x-auto font-mono leading-relaxed">
                    {result.refactoredCode}
                  </pre>
                </div>
              )}

              {result.rawText && (
                <div className="card-warm p-5">
                  <h3 className="font-semibold text-ink-700 mb-2">Analysis</h3>
                  <p className="text-sm text-ink-600 whitespace-pre-wrap leading-relaxed">{result.rawText}</p>
                </div>
              )}
            </div>
          )}
          {!result && !loading && (
            <div className="flex flex-col items-center justify-center h-64 text-ink-300">
              <HiOutlineCode className="w-12 h-12 mb-3" />
              <p className="text-sm">Your review results will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeReviewer;
