const LoadingSpinner = ({ size = 'md', text }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-[3px]',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div
        className={`${sizeClasses[size]} border-[var(--border-subtle)] border-t-[var(--accent)] rounded-full animate-spin`}
      />
      {text && <p className="text-sm text-[var(--text-muted)] animate-pulse">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
