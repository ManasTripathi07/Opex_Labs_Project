import './WizardProgress.css';

function WizardProgress({ steps, currentStep }) {
  return (
    <div className="wizard-progress">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;

        return (
          <div
            key={index}
            className={`wizard-step ${isActive ? 'wizard-step-active' : ''} ${isCompleted ? 'wizard-step-completed' : ''}`}
          >
            <div className="wizard-step-indicator">
              {isCompleted ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <span>{stepNumber}</span>
              )}
            </div>
            <div className="wizard-step-label">{step}</div>
          </div>
        );
      })}
    </div>
  );
}

export default WizardProgress;
