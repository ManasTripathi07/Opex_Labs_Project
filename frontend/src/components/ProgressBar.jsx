import { motion } from 'framer-motion';
import './ProgressBar.css';

function ProgressBar({ current, total, showLabel = true }) {
  const percentage = total > 0 ? Math.min((current / total) * 100, 100) : 0;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div className="progress-container">
      {showLabel && (
        <div className="progress-label">
          {current} / {total}
        </div>
      )}
      <div className="progress-track">
        <motion.div
          className="progress-fill"
          initial={prefersReducedMotion ? { width: `${percentage}%` } : { width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
