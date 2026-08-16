import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ConfirmDialog.css';

function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, entityName, confirmText = 'Delete', isLoading = false }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="dialog-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <div className="dialog-container">
            <motion.div
              className="dialog"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="dialog-title"
            >
              <div className="dialog-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>

              <h3 id="dialog-title" className="dialog-title">{title}</h3>

              <p className="dialog-message">{message}</p>

              {entityName && (
                <div className="dialog-entity">{entityName}</div>
              )}

              <p className="dialog-warning">This action cannot be undone.</p>

              <div className="dialog-actions">
                <button
                  className="btn btn-secondary"
                  onClick={onClose}
                  disabled={isLoading}
                  autoFocus
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={onConfirm}
                  disabled={isLoading}
                >
                  {isLoading ? 'Deleting...' : confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ConfirmDialog;
