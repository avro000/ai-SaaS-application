import { useEffect, useState, useRef, useCallback } from 'react';
import toast, { resolveValue } from 'react-hot-toast';
import { CheckCircle2, XCircle, Info, AlertTriangle } from 'lucide-react';

export function showToast(message, type = 'success') {
  toast(message, { type });
}

export function warningToast(message) {
  toast.custom((t) => (
    <CustomToast t={{ ...t, type: 'warning', message, duration: 4000 }} />
  ), { duration: Infinity });
}

export default function CustomToast({ t }) {
  const [progress, setProgress] = useState(100);
  const [exiting, setExiting] = useState(false);
  const [entered, setEntered] = useState(false);
  const containerRef = useRef(null);
  const intervalRef = useRef(null);
  const hasDismissedRef = useRef(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setEntered(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      let el = containerRef.current.parentElement;
      while (el) {
        el.style.animation = 'none';
        el.style.transition = 'none';
        el = el.parentElement;
        if (el && el.tagName === 'BODY') break;
      }
    }
  });

  const triggerDismiss = useCallback(() => {
    if (hasDismissedRef.current) return;
    hasDismissedRef.current = true;
    setExiting(true);
    setTimeout(() => {
      toast.dismiss(t.id);
    }, 350);
  }, [t.id]);

  useEffect(() => {
    if (t.type === 'loading' || exiting) return;

    const duration = t.duration || 4000;
    const stepMs = 16;
    const stepPercent = 100 / (duration / stepMs);

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const next = prev - stepPercent;
        if (next <= 0) {
          clearInterval(intervalRef.current);
          setTimeout(() => triggerDismiss(), 0);
          return 0;
        }
        return next;
      });
    }, stepMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [t.type, t.duration, exiting, triggerDismiss]);

  useEffect(() => {
    if (!t.visible && !exiting && !hasDismissedRef.current) {
      triggerDismiss();
    }
  }, [t.visible, exiting, triggerDismiss]);

  const getIcon = () => {
    switch (t.type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'loading':
        return (
          <div className="w-5 h-5 rounded-full border-2 border-foreground/20 border-t-foreground animate-spin" />
        );
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getBarColor = () => {
    switch (t.type) {
      case 'success': return 'bg-green-400';
      case 'error': return 'bg-red-400';
      case 'warning': return 'bg-yellow-400';
      case 'loading': return 'bg-foreground/50';
      default: return 'bg-blue-400';
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        opacity: exiting ? 0 : (entered ? 1 : 0),
        transform: exiting ? 'translateX(120%)' : (entered ? 'translateX(0)' : 'translateX(120%)'),
        transition: 'transform 350ms cubic-bezier(0.4, 0, 0.2, 1), opacity 350ms ease-out',
      }}
      className="max-w-sm w-[360px] bg-background/95 backdrop-blur-xl border border-foreground/10 shadow-2xl flex flex-col overflow-hidden relative rounded-sm pointer-events-auto"
    >
      <div className="flex items-start gap-3 p-4">
        <div className="flex-shrink-0 mt-0.5">
          {t.icon || getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground/90 font-medium leading-relaxed">
            {resolveValue(t.message, t)}
          </p>
        </div>
        <button
          onClick={() => triggerDismiss()}
          className="flex-shrink-0 text-foreground/40 hover:text-foreground/80 transition-colors focus:outline-none"
        >
          <XCircle className="w-4 h-4" />
        </button>
      </div>

      {t.type !== 'loading' && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground/5">
          <div
            className={`h-full ${getBarColor()}`}
            style={{
              width: `${progress}%`,
              transition: 'width 16ms linear',
            }}
          />
        </div>
      )}
    </div>
  );
}
