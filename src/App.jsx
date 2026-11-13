import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import LandingPage from './pages/LandingPage';
import ToolsPage from './pages/ToolsPage';
import CodeReviewerPage from './pages/CodeReviewerPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HistoryPage from './pages/HistoryPage';
import ResumeOptimizerPage from './pages/ResumeOptimizerPage';
import ContentStudioPage from './pages/ContentStudioPage';
import SmartSummarizerPage from './pages/SmartSummarizerPage';
import SqlGeneratorPage from './pages/SqlGeneratorPage';
import ReportIssuePage from './pages/ReportIssuePage';
import CustomToast from './components/UI/CustomToast';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-foreground/20 border-t-[#eca8d6] rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  // If we try to access login/register while logged in, go to home
  if (user) return <Navigate to="/" replace />;
  return children;
};

const App = () => {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <AuthProvider>
        <Toaster 
          position="bottom-right"
          toastOptions={{
            duration: Infinity,
            style: { background: 'transparent', boxShadow: 'none', padding: 0, border: 'none' },
          }}
          containerStyle={{ zIndex: 99999 }}
        >
          {(t) => {
            const toastWithDuration = { ...t, duration: t.duration === Infinity ? 4000 : t.duration };
            return <CustomToast t={toastWithDuration} />;
          }}
        </Toaster>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/tools/code-reviewer" element={<CodeReviewerPage />} />
          <Route path="/tools/resume-optimizer" element={<ResumeOptimizerPage />} />
          <Route path="/tools/content-studio" element={<ContentStudioPage />} />
          <Route path="/tools/smart-summarizer" element={<SmartSummarizerPage />} />
          <Route path="/tools/sql-generator" element={<SqlGeneratorPage />} />
          <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
          <Route path="/report" element={<ReportIssuePage />} />
          <Route path="/report-issue" element={<ReportIssuePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
};

export default App;
