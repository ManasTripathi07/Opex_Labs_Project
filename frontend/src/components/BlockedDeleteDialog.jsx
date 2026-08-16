import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './BlockedDeleteDialog.css';

function BlockedDeleteDialog({
  isOpen,
  onClose,
  entityType,
  entityName,
  dependencies
}) {
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
              className="blocked-dialog"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="blocked-dialog-title"
            >
              <div className="blocked-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>

              <h3 id="blocked-dialog-title" className="blocked-title">Cannot Delete {entityType}</h3>

              <div className="blocked-entity">{entityName}</div>

              <p className="blocked-message">
                This {entityType.toLowerCase()} cannot be deleted because it is currently associated with production records.
              </p>

              {dependencies && (
                <div className="blocked-dependencies">
                  <p className="blocked-dependencies-label">Production records associated:</p>
                  <ul className="blocked-dependencies-list">
                    {dependencies.lots > 0 && (
                      <li>• {dependencies.lots} Lot{dependencies.lots !== 1 ? 's' : ''}</li>
                    )}
                    {dependencies.subLots > 0 && (
                      <li>• {dependencies.subLots} Sub-Lot{dependencies.subLots !== 1 ? 's' : ''}</li>
                    )}
                    {dependencies.assignments > 0 && (
                      <li>• {dependencies.assignments} Assignment{dependencies.assignments !== 1 ? 's' : ''}</li>
                    )}
                    {dependencies.shiftLogs > 0 && (
                      <li>• {dependencies.shiftLogs} Shift Log{dependencies.shiftLogs !== 1 ? 's' : ''}</li>
                    )}
                  </ul>
                </div>
              )}

              <div className="blocked-warning">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p>
                  Deleting this {entityType.toLowerCase()} would affect production history and could impact the application's functionality.
                </p>
              </div>

              <p className="blocked-instruction">
                Production-level data cannot be deleted from this interface. Please remove or archive the appropriate records through the proper production workflow before attempting to remove this master-data record.
              </p>

              <div className="blocked-actions">
                <button
                  className="btn btn-primary"
                  onClick={onClose}
                  autoFocus
                >
                  Understood
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export default BlockedDeleteDialog;
