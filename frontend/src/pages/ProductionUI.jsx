import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { Loading, EmptyState, ErrorState, Status } from '../components/ui';
import ProgressBar from '../components/ProgressBar';
import './ProductionUI.css';

function ProductionUI() {
  const [assignments, setAssignments] = useState([]);
  const [sublots, setSublots] = useState([]);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [showNewAssignment, setShowNewAssignment] = useState(false);
  const [formData, setFormData] = useState({
    machineId: '',
    subLotId: '',
    piecesIssued: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [assignmentsRes, sublotsRes, machinesRes] = await Promise.all([
        api.assignments.list({}),
        api.sublots.list({ state: 'allocated' }),
        api.machines.list(),
      ]);
      setAssignments(assignmentsRes.data);
      setSublots(sublotsRes.data);
      setMachines(machinesRes.data);
    } catch (err) {
      console.error('Error loading data:', err);
      setLoadError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await api.assignments.create({
        machineId: parseInt(formData.machineId),
        subLotId: parseInt(formData.subLotId),
        piecesIssued: parseInt(formData.piecesIssued),
      });

      setSuccess('Assignment created successfully');
      setFormData({ machineId: '', subLotId: '', piecesIssued: '' });
      setShowNewAssignment(false);
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const activeAssignments = assignments.filter((a) => a.status === 'active');
  const waitingSubLots = sublots.filter((sl) => sl.state === 'allocated');

  if (loading) {
    return (
      <div className="production-container">
        <div className="production-header">
          <div>
            <h1>Factory Floor</h1>
            <p className="page-subtitle">Manage machine assignments and production</p>
          </div>
        </div>
        <Loading message="Loading production data..." size="lg" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="production-container">
        <div className="production-header">
          <div>
            <h1>Factory Floor</h1>
            <p className="page-subtitle">Manage machine assignments and production</p>
          </div>
        </div>
        <ErrorState
          title="Unable to load production data"
          description="There was a problem loading production information. Please try again."
          onRetry={loadData}
        />
      </div>
    );
  }

  return (
    <div className="production-container">
      <div className="production-header">
        <div>
          <h1>Factory Floor</h1>
          <p className="page-subtitle">Manage machine assignments and production</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowNewAssignment(!showNewAssignment)}
        >
          {showNewAssignment ? 'Cancel' : 'New Assignment'}
        </button>
      </div>

      {success && (
        <div className="production-alert production-alert-success">
          ✓ {success}
        </div>
      )}

      {error && (
        <div className="production-alert production-alert-error">
          {error}
        </div>
      )}

      {showNewAssignment && (
        <div className="card assignment-form-card">
          <h2 className="form-card-title">Create Machine Assignment</h2>
          <form onSubmit={handleCreateAssignment} className="assignment-form">
            <div className="form-field">
              <label className="form-label">
                Machine <span className="required">*</span>
              </label>
              <select
                className="select"
                value={formData.machineId}
                onChange={(e) => setFormData({ ...formData, machineId: e.target.value })}
                required
              >
                <option value="">Select machine</option>
                {machines.map((machine) => (
                  <option key={machine.id} value={machine.id}>
                    {machine.identifier} - {machine.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label className="form-label">
                Sub-Lot <span className="required">*</span>
              </label>
              <select
                className="select"
                value={formData.subLotId}
                onChange={(e) => setFormData({ ...formData, subLotId: e.target.value })}
                required
              >
                <option value="">Select sub-lot</option>
                {waitingSubLots.map((sublot) => (
                  <option key={sublot.id} value={sublot.id}>
                    {sublot.sub_lot_number} - {sublot.design_identifier}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label className="form-label">
                Pieces to Issue <span className="required">*</span>
              </label>
              <input
                type="number"
                className="input"
                value={formData.piecesIssued}
                onChange={(e) => setFormData({ ...formData, piecesIssued: e.target.value })}
                required
                min="1"
                placeholder="Enter quantity"
              />
            </div>

            <button
              type="submit"
              className={`btn btn-primary ${submitting ? 'btn-loading' : ''}`}
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Create Assignment'}
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <h2 className="section-title">Active Machines</h2>
        {activeAssignments.length === 0 ? (
          <EmptyState
            icon="🏭"
            title="No active machines"
            description="No machines are currently running. Create an assignment to start production."
            action={
              waitingSubLots.length > 0 && (
                <button className="btn btn-primary" onClick={() => setShowNewAssignment(true)}>
                  Create Assignment
                </button>
              )
            }
          />
        ) : (
          <div className="machines-grid">
            {activeAssignments.map((assignment) => (
              <div key={assignment.id} className="machine-card">
                <div className="machine-header">
                  <div className="machine-name">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                    {assignment.machine_identifier}
                  </div>
                  <Status status="in_production" size="sm" />
                </div>
                <div className="machine-work">
                  <div className="work-detail">
                    <span className="work-label">Sub-Lot</span>
                    <span className="work-value">{assignment.sub_lot_number}</span>
                  </div>
                  <div className="work-detail">
                    <span className="work-label">Design</span>
                    <span className="work-value">{assignment.design_identifier}</span>
                  </div>
                </div>
                <div className="machine-progress">
                  <ProgressBar
                    current={assignment.pieces_completed}
                    total={assignment.pieces_issued}
                  />
                </div>
                <Link
                  to={`/shift/${assignment.machine_id}`}
                  className="btn btn-secondary"
                >
                  Log Shift
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="section-title">Waiting for Assignment</h2>
        {waitingSubLots.length === 0 ? (
          <EmptyState
            icon="📦"
            title="No sub-lots waiting"
            description="All allocated sub-lots have been assigned to machines."
          />
        ) : (
          <div className="waiting-list">
            {waitingSubLots.map((sublot) => (
              <div key={sublot.id} className="waiting-item">
                <div className="waiting-info">
                  <div className="waiting-number">{sublot.sub_lot_number}</div>
                  <div className="waiting-details">
                    <div className="waiting-design">{sublot.design_identifier}</div>
                    <div className="waiting-quantity">{sublot.piece_count} pieces</div>
                  </div>
                </div>
                <Status status="allocated" size="sm" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductionUI;
