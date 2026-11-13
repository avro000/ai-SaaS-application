import { useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../UI/LoadingSpinner';
import { HiOutlinePencilAlt, HiOutlineClipboardCopy, HiOutlineHashtag } from 'react-icons/hi';

const tones = ['Professional', 'Casual', 'Witty', 'Inspirational', 'Academic', 'Friendly', 'Persuasive'];
const platforms = ['Blog Post', 'Email', 'Twitter/X', 'LinkedIn', 'Instagram Caption', 'Newsletter', 'Product Description'];

const ContentStudio = () => {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('Professional');
  const [platform, setPlatform] = useState('Blog Post');
  const [audience, setAudience] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async () => {
    if (!topic.trim()) return toast.error('Please provide a topic');
    setLoading(true);
    try {
      const res = await api.post('/tools/content-generate', { topic, tone, platform, audience: audience || 'general', additionalNotes });
      setResult(res.data.output);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied!');
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-900 flex items-center gap-2">
          <HiOutlinePencilAlt className="w-6 h-6 text-earth-500" />
          Content Studio
        </h1>
        <p className="text-ink-400 mt-1">Generate polished content for any platform with the right tone and audience.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-600 mb-1.5">Topic / Subject</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="input-warm"
              placeholder="e.g., Benefits of remote work for developers"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-ink-600 mb-1.5">Tone</label>
              <select value={tone} onChange={(e) => setTone(e.target.value)} className="input-warm">
                {tones.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-600 mb-1.5">Platform</label>
              <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="input-warm">
                {platforms.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-600 mb-1.5">Target Audience</label>
            <input
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="input-warm"
              placeholder="e.g., Tech professionals, startup founders"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-600 mb-1.5">Additional Notes <span className="text-ink-300">(optional)</span></label>
            <textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              className="textarea-warm text-sm"
              rows={3}
              placeholder="Any specific points to include, keywords, etc."
            />
          </div>
          <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full">
            {loading ? 'Generating...' : 'Generate Content'}
          </button>
        </div>

        {/* Output */}
        <div className="space-y-4">
          {loading && <LoadingSpinner text="Crafting your content..." />}
          {result && !loading && (
            <div className="space-y-4 animate-fade-in-up">
              {/* Headline */}
              {result.headline && (
                <div className="card-warm p-5">
                  <p className="text-xs font-medium text-ink-400 uppercase tracking-wider mb-1">Headline</p>
                  <p className="font-display text-lg font-semibold text-ink-800">{result.headline}</p>
                </div>
              )}

              {/* Content */}
              <div className="card-warm p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-ink-700">Generated Content</h3>
                    <span className="badge badge-earth">{result.wordCount || '?'} words</span>
                    {result.readingTime && <span className="text-xs text-ink-400">{result.readingTime}</span>}
                  </div>
                  <button onClick={() => copyText(result.content)} className="btn-secondary text-xs py-1 px-3 flex items-center gap-1">
                    <HiOutlineClipboardCopy className="w-3.5 h-3.5" /> Copy
                  </button>
                </div>
                <div className="prose prose-sm max-w-none text-ink-600 leading-relaxed whitespace-pre-wrap">
                  {result.content}
                </div>
              </div>

              {/* Hashtags */}
              {result.hashtags?.length > 0 && (
                <div className="card-warm p-5">
                  <h3 className="font-semibold text-ink-700 flex items-center gap-2 mb-3">
                    <HiOutlineHashtag className="w-4 h-4 text-warm-500" />
                    Suggested Hashtags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.hashtags.map((tag, i) => (
                      <button key={i} onClick={() => copyText(tag)} className="badge badge-warm cursor-pointer hover:bg-warm-200 transition-colors">
                        {tag.startsWith('#') ? tag : `#${tag}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA + SEO */}
              <div className="grid grid-cols-2 gap-4">
                {result.callToAction && (
                  <div className="card-warm p-4">
                    <p className="text-xs font-medium text-ink-400 mb-1">Call to Action</p>
                    <p className="text-sm font-medium text-warm-700">{result.callToAction}</p>
                  </div>
                )}
                {result.seoKeywords?.length > 0 && (
                  <div className="card-warm p-4">
                    <p className="text-xs font-medium text-ink-400 mb-1">SEO Keywords</p>
                    <p className="text-xs text-ink-500">{result.seoKeywords.join(', ')}</p>
                  </div>
                )}
              </div>

              {result.rawText && (
                <div className="card-warm p-5">
                  <p className="text-sm text-ink-600 whitespace-pre-wrap leading-relaxed">{result.rawText}</p>
                </div>
              )}
            </div>
          )}
          {!result && !loading && (
            <div className="flex flex-col items-center justify-center h-64 text-ink-300">
              <HiOutlinePencilAlt className="w-12 h-12 mb-3" />
              <p className="text-sm">Your content will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentStudio;
