import './ErrorState.css';

function ErrorState({ title = 'Something went wrong', description, action, onRetry }) {
  return (
    <div className="error-state">
      <div className="error-state-icon">⚠️</div>
      <h3 className="error-state-title">{title}</h3>
      {description && <p className="error-state-description">{description}</p>}
      <div className="error-state-actions">
        {onRetry && (
          <button className="btn btn-primary" onClick={onRetry}>
            Try Again
          </button>
        )}
        {action}
      </div>
    </div>
  );
}

export default ErrorState;
