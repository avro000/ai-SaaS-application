import { useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../UI/LoadingSpinner';
import { HiOutlineDocumentSearch, HiOutlineCheckCircle, HiOutlineExclamation, HiOutlineStar } from 'react-icons/hi';

const ResumeOptimizer = () => {
  const [resume, setResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async () => {
    if (!resume.trim() || !jobDescription.trim()) return toast.error('Please provide both resume and job description');
    setLoading(true);
    try {
      const res = await api.post('/tools/resume-optimize', { resume, jobDescription });
      setResult(res.data.output);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Optimization failed');
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (score) => {
    if (score >= 75) return 'text-sage-600';
    if (score >= 50) return 'text-warm-600';
    return 'text-berry-500';
  };

  const scoreBg = (score) => {
    if (score >= 75) return 'from-sage-400 to-sage-600';
    if (score >= 50) return 'from-warm-400 to-warm-600';
    return 'from-berry-400 to-berry-600';
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-900 flex items-center gap-2">
          <HiOutlineDocumentSearch className="w-6 h-6 text-sage-500" />
          Resume Optimizer
        </h1>
        <p className="text-ink-400 mt-1">Paste your resume and a job description to get ATS compatibility analysis.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-600 mb-1.5">Your Resume</label>
            <textarea
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              className="textarea-warm text-sm"
              rows={10}
              placeholder="Paste your resume text here..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-600 mb-1.5">Job Description</label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="textarea-warm text-sm"
              rows={8}
              placeholder="Paste the job description you're targeting..."
            />
          </div>
          <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full">
            {loading ? 'Analyzing...' : 'Optimize Resume'}
          </button>
        </div>

        {/* Output */}
        <div className="space-y-4">
          {loading && <LoadingSpinner text="Analyzing your resume..." />}
          {result && !loading && (
            <div className="space-y-4 animate-fade-in-up">
              {/* ATS Score */}
              <div className="card-warm p-6 text-center">
                <p className="text-sm font-medium text-ink-400 mb-2">ATS Compatibility Score</p>
                <div className="relative inline-flex items-center justify-center w-28 h-28">
                  <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" stroke="#EDE9E3" strokeWidth="8" fill="none" />
                    <circle cx="50" cy="50" r="42" 
                      stroke="url(#scoreGrad)" strokeWidth="8" fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${(result.atsScore || 0) * 2.64} 264`}
                    />
                    <defs>
                      <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={result.atsScore >= 75 ? '#5D8163' : result.atsScore >= 50 ? '#F09254' : '#EF4444'} />
                        <stop offset="100%" stopColor={result.atsScore >= 75 ? '#49684E' : result.atsScore >= 50 ? '#EB7A3A' : '#DC2626'} />
                      </linearGradient>
                    </defs>
                  </svg>
                  <span className={`absolute font-display text-2xl font-bold ${scoreColor(result.atsScore || 0)}`}>
                    {result.atsScore || 0}
                  </span>
                </div>
                {result.overallFeedback && (
                  <p className="text-sm text-ink-500 mt-3 leading-relaxed">{result.overallFeedback}</p>
                )}
              </div>

              {/* Strengths */}
              {result.strengths?.length > 0 && (
                <div className="card-warm p-5">
                  <h3 className="font-semibold text-ink-700 flex items-center gap-2 mb-3">
                    <HiOutlineStar className="w-4 h-4 text-warm-500" />
                    Strengths
                  </h3>
                  <div className="space-y-2">
                    {result.strengths.map((s, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <HiOutlineCheckCircle className="w-4 h-4 text-sage-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-ink-600">{s}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Keyword Gaps */}
              {result.keywordGaps?.length > 0 && (
                <div className="card-warm p-5">
                  <h3 className="font-semibold text-ink-700 flex items-center gap-2 mb-3">
                    <HiOutlineExclamation className="w-4 h-4 text-warm-500" />
                    Missing Keywords
                  </h3>
                  <div className="space-y-2">
                    {result.keywordGaps.map((gap, i) => (
                      <div key={i} className="p-3 bg-cream-50 rounded-xl">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm font-semibold text-warm-700">{gap.keyword}</span>
                          <span className={`badge ${gap.importance === 'critical' ? 'badge-berry' : 'badge-warm'}`}>{gap.importance}</span>
                        </div>
                        {gap.suggestion && <p className="text-xs text-ink-500">{gap.suggestion}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rewritten Bullets */}
              {result.rewrittenBullets?.length > 0 && (
                <div className="card-warm p-5">
                  <h3 className="font-semibold text-ink-700 mb-3">✍️ Improved Bullet Points</h3>
                  <div className="space-y-4">
                    {result.rewrittenBullets.map((b, i) => (
                      <div key={i} className="space-y-1.5">
                        <p className="text-xs text-ink-400 line-through">{b.original}</p>
                        <p className="text-sm text-sage-700 font-medium">{b.rewritten}</p>
                        {b.improvement && <p className="text-xs text-ink-400 italic">{b.improvement}</p>}
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
              <HiOutlineDocumentSearch className="w-12 h-12 mb-3" />
              <p className="text-sm">Your optimization results will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeOptimizer;
