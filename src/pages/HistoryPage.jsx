import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { HiOutlineClock, HiOutlineTrash, HiOutlineCode, HiOutlineDocumentSearch, HiOutlinePencilAlt, HiOutlineDocumentText, HiOutlineDatabase } from 'react-icons/hi';
import Navigation from '../components/Landing/Navigation';
import FooterSection from '../components/Landing/FooterSection';

const toolMeta = {
  'code-review': { label: 'Code Review', icon: HiOutlineCode, badge: 'badge-warm' },
  'resume-optimize': { label: 'Resume', icon: HiOutlineDocumentSearch, badge: 'badge-sage' },
  'content-generate': { label: 'Content', icon: HiOutlinePencilAlt, badge: 'badge-earth' },
  'content-studio': { label: 'Content Studio', icon: HiOutlinePencilAlt, badge: 'badge-earth' },
  'summarize': { label: 'Summary', icon: HiOutlineDocumentText, badge: 'badge-warm' },
  'sql-generate': { label: 'SQL', icon: HiOutlineDatabase, badge: 'badge-sage' },
};

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [expandedData, setExpandedData] = useState(null);
  const navigate = useNavigate();

  const fetchHistory = async () => {
    try {
      const params = filter ? { toolType: filter } : {};
      const res = await api.get('/history', { params });
      setHistory(res.data.history);
    } catch (err) {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, [filter]);

  const handleExpand = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      setExpandedData(null);
      return;
    }
    try {
      const res = await api.get(`/history/${id}`);
      setExpandedId(id);
      setExpandedData(res.data.item);
    } catch {
      toast.error('Failed to load details');
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Delete this history item?')) return;
    try {
      await api.delete(`/history/${id}`);
      setHistory(prev => prev.filter(h => h._id !== id));
      if (expandedId === id) { setExpandedId(null); setExpandedData(null); }
      toast.success('Deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const filters = [
    { value: '', label: 'All' },
    ...Object.entries(toolMeta).map(([k, v]) => ({ value: k, label: v.label }))
  ];

  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden font-sans flex flex-col">
      <Navigation />
      
      <div className="flex-1 pt-24 lg:pt-32 pb-20 px-6 lg:px-8 max-w-5xl mx-auto w-full">
        {loading ? (
          <LoadingSpinner text="Loading history..." />
        ) : (
          <div className="space-y-6 animate-fade-in-up">
            <div>
              <h1 className="font-display text-2xl font-semibold text-foreground flex items-center gap-2">
                <HiOutlineClock className="w-6 h-6 text-foreground/70" />
                History
              </h1>
              <p className="text-foreground/50 mt-1 text-sm">Browse and revisit your past AI generations.</p>
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
              {filters.map(f => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`px-4 py-2 rounded-sm text-sm font-medium transition-all border ${
                    filter === f.value
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-background border-foreground/10 text-foreground/70 hover:border-foreground/30 hover:text-foreground'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* List */}
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-foreground/30 border border-foreground/10 bg-foreground/[0.02]">
                <HiOutlineClock className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-medium text-foreground/70">No history yet</p>
                <p className="text-sm mt-1">Start using the AI tools and your results will show up here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((item) => {
                  const meta = toolMeta[item.toolType] || {};
                  const Icon = meta.icon || HiOutlineClock;
                  const isExpanded = expandedId === item._id;

                  return (
                    <div key={item._id} className="border border-foreground/10 bg-foreground/[0.02] overflow-hidden">
                      <div
                        onClick={() => handleExpand(item._id)}
                        className="p-4 flex items-center gap-3 cursor-pointer hover:bg-foreground/[0.04] transition-colors"
                      >
                        <div className="w-9 h-9 rounded-sm bg-foreground/[0.06] border border-foreground/5 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4.5 h-4.5 text-foreground/70" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-mono px-2 py-0.5 border border-foreground/10 bg-foreground/[0.05] text-foreground/60">{meta.label}</span>
                            <span className="text-[10px] font-mono text-foreground/40">
                              {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleDelete(item._id, e)}
                          className="p-2 text-foreground/30 hover:text-red-400 hover:bg-red-400/10 transition-colors flex-shrink-0 cursor-pointer"
                        >
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Expanded detail */}
                      {isExpanded && expandedData && (
                        <div className="border-t border-foreground/10 p-5 bg-background">
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <p className="text-[10px] font-mono text-foreground/40 uppercase tracking-wider mb-2">Input</p>
                              <pre className="text-xs text-foreground/70 bg-foreground/[0.03] border border-foreground/10 p-4 overflow-auto max-h-64 font-mono">
                                {JSON.stringify(expandedData.input, null, 2)}
                              </pre>
                            </div>
                            <div>
                              <p className="text-[10px] font-mono text-foreground/40 uppercase tracking-wider mb-2">Output</p>
                              <pre className="text-xs text-foreground/70 bg-foreground/[0.03] border border-foreground/10 p-4 overflow-auto max-h-64 font-mono">
                                {JSON.stringify(expandedData.output, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <FooterSection />
    </main>
  );
};

export default HistoryPage;
