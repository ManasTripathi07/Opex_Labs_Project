import './Status.css';

const statusConfig = {
  received: {
    label: 'Waiting',
    icon: '⏱️',
    variant: 'secondary',
  },
  allocated: {
    label: 'Ready',
    icon: '📋',
    variant: 'info',
  },
  in_production: {
    label: 'Working',
    icon: '⚙️',
    variant: 'warning',
  },
  completed: {
    label: 'Done',
    icon: '✓',
    variant: 'success',
  },
  dispatched: {
    label: 'Sent',
    icon: '📦',
    variant: 'dispatched',
  },
  active: {
    label: 'Active',
    icon: '●',
    variant: 'success',
  },
};

function Status({ status, size = 'md', showIcon = true }) {
  const config = statusConfig[status] || {
    label: status,
    icon: '●',
    variant: 'secondary',
  };

  return (
    <span className={`status status-${config.variant} status-${size}`}>
      {showIcon && <span className="status-icon">{config.icon}</span>}
      <span className="status-label">{config.label}</span>
    </span>
  );
}

export default Status;
