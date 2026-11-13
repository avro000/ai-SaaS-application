import { useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../UI/LoadingSpinner';
import { HiOutlineDatabase, HiOutlineClipboardCopy, HiOutlineExclamation } from 'react-icons/hi';

const dialects = ['PostgreSQL', 'MySQL', 'SQLite', 'SQL Server', 'Oracle'];

const SqlGenerator = () => {
  const [schema, setSchema] = useState('');
  const [query, setQuery] = useState('');
  const [dialect, setDialect] = useState('PostgreSQL');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async () => {
    if (!query.trim()) return toast.error('Please describe what query you need');
    setLoading(true);
    try {
      const res = await api.post('/tools/sql-generate', { schema, query, dialect });
      setResult(res.data.output);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const copyText = (t) => {
    navigator.clipboard.writeText(t);
    toast.success('Copied!');
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-900 flex items-center gap-2">
          <HiOutlineDatabase className="w-6 h-6 text-sage-500" />
          SQL Query Writer
        </h1>
        <p className="text-ink-400 mt-1">Describe your data and what you need — get optimized SQL queries with explanations.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-600 mb-1.5">SQL Dialect</label>
            <select value={dialect} onChange={(e) => setDialect(e.target.value)} className="input-warm">
              {dialects.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-600 mb-1.5">
              Table Schema / Context <span className="text-ink-300">(optional but recommended)</span>
            </label>
            <textarea
              value={schema}
              onChange={(e) => setSchema(e.target.value)}
              className="textarea-warm font-mono text-sm"
              rows={6}
              placeholder={"e.g.,\nusers (id, name, email, created_at)\norders (id, user_id, total, status, created_at)\nproducts (id, name, price, category)"}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-600 mb-1.5">What query do you need?</label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="textarea-warm text-sm"
              rows={4}
              placeholder="e.g., Find the top 10 customers by total order value in the last 30 days"
            />
          </div>
          <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full">
            {loading ? 'Generating...' : 'Generate SQL'}
          </button>
        </div>

        {/* Output */}
        <div className="space-y-4">
          {loading && <LoadingSpinner text="Writing your SQL query..." />}
          {result && !loading && (
            <div className="space-y-4 animate-fade-in-up">
              {/* Main Query */}
              <div className="card-warm p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-ink-700">Generated Query</h3>
                  <button onClick={() => copyText(result.query)} className="btn-secondary text-xs py-1 px-3 flex items-center gap-1">
                    <HiOutlineClipboardCopy className="w-3.5 h-3.5" /> Copy
                  </button>
                </div>
                <pre className="bg-ink-900 text-cream-100 rounded-xl p-4 text-sm overflow-x-auto font-mono leading-relaxed">
                  {result.query}
                </pre>
              </div>

              {/* Explanation */}
              {result.explanation && (
                <div className="card-warm p-5">
                  <h3 className="font-semibold text-ink-700 mb-2">How it works</h3>
                  <p className="text-sm text-ink-600 leading-relaxed whitespace-pre-wrap">{result.explanation}</p>
                </div>
              )}

              {/* Optimization */}
              {result.optimization && (
                <div className="card-warm p-5 bg-sage-50/50 border-sage-100">
                  <h3 className="font-semibold text-sage-700 mb-2">💡 Optimization Tips</h3>
                  <p className="text-sm text-ink-600 leading-relaxed whitespace-pre-wrap">{result.optimization}</p>
                </div>
              )}

              {/* Warnings */}
              {result.warnings?.length > 0 && (
                <div className="card-warm p-5 bg-warm-50/50 border-warm-100">
                  <h3 className="font-semibold text-warm-700 flex items-center gap-2 mb-2">
                    <HiOutlineExclamation className="w-4 h-4" />
                    Things to Watch
                  </h3>
                  <ul className="space-y-1.5">
                    {result.warnings.map((w, i) => (
                      <li key={i} className="text-sm text-ink-600 flex items-start gap-2">
                        <span className="text-warm-400 mt-1">•</span> {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Related Queries */}
              {result.relatedQueries?.length > 0 && (
                <div className="card-warm p-5">
                  <h3 className="font-semibold text-ink-700 mb-3">Related Queries</h3>
                  <div className="space-y-3">
                    {result.relatedQueries.map((rq, i) => (
                      <div key={i} className="p-3 bg-cream-50 rounded-xl">
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-sm font-medium text-ink-600">{rq.description}</p>
                          <button onClick={() => copyText(rq.query)} className="text-ink-400 hover:text-warm-500 transition-colors">
                            <HiOutlineClipboardCopy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <pre className="text-xs font-mono text-ink-500 bg-white p-2 rounded-lg overflow-x-auto">{rq.query}</pre>
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
              <HiOutlineDatabase className="w-12 h-12 mb-3" />
              <p className="text-sm">Your SQL query will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SqlGenerator;
