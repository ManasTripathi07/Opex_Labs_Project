import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { format } from 'date-fns';
import { Loading, EmptyState } from '../components/ui';
import './ShiftEntry.css';

function ShiftEntry() {
  const { machineId } = useParams();
  const navigate = useNavigate();
  const [machine, setMachine] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [operators, setOperators] = useState([]);
  const [previousRunning, setPreviousRunning] = useState(0);
  const [formData, setFormData] = useState({
    operatorId: '',
    shiftDate: format(new Date(), 'yyyy-MM-dd'),
    shiftType: 'morning',
    currentRunningStitches: '',
    roundsCompleted: '0',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [machineId]);

  useEffect(() => {
    if (assignment && formData.shiftDate && formData.shiftType) {
      loadPreviousRunning();
    }
  }, [assignment, formData.shiftDate, formData.shiftType]);

  const loadData = async () => {
    try {
      const [machineRes, assignmentRes, operatorsRes] = await Promise.all([
        api.machines.get(machineId),
        api.assignments.getActiveForMachine(machineId).catch(() => ({ data: null })),
        api.operators.list(),
      ]);

      setMachine(machineRes.data);
      setAssignment(assignmentRes.data);
      setOperators(operatorsRes.data);
    } catch (error) {
      setError('Failed to load machine data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadPreviousRunning = async () => {
    try {
      const res = await api.shiftLogs.getPreviousRunning({
        machineId,
        designId: assignment.design_id,
        beforeDate: formData.shiftDate,
        beforeShiftType: formData.shiftType,
      });

      setPreviousRunning(res.data.previousRunningStitches);
    } catch (error) {
      console.error('Failed to load previous running:', error);
      setPreviousRunning(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);

    const submittedCounter = parseInt(formData.currentRunningStitches);

    try {
      await api.shiftLogs.create({
        machineId: parseInt(machineId),
        operatorId: parseInt(formData.operatorId),
        designId: assignment.design_id,
        assignmentId: assignment.id,
        shiftDate: formData.shiftDate,
        shiftType: formData.shiftType,
        currentRunningStitches: submittedCounter,
        roundsCompleted: parseInt(formData.roundsCompleted),
      });

      setSuccess(true);

      await loadPreviousRunning();

      setFormData({
        ...formData,
        currentRunningStitches: '',
        roundsCompleted: '0',
      });

      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to submit shift log');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="shift-container">
        <Loading message="Loading machine data..." size="lg" />
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="shift-container">
        <button
          className="btn btn-ghost shift-back"
          onClick={() => navigate('/dashboard')}
          type="button"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back
        </button>
        <EmptyState
          icon="🏭"
          title="No active assignment"
          description={`Machine ${machine?.identifier} has no active work. Assign work from the Production screen to begin logging shifts.`}
          action={
            <button className="btn btn-primary" onClick={() => navigate('/production')}>
              View Production
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="shift-container">
      <button
        className="btn btn-ghost shift-back"
        onClick={() => navigate('/dashboard')}
        type="button"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Back
      </button>

      <div className="shift-header">
        <h1>{machine.identifier}</h1>
        <p className="shift-subtitle">{machine.name}</p>
      </div>

      <div className="card shift-work-info">
        <h2 className="work-info-title">Current Work</h2>
        <div className="work-info-grid">
          <div className="work-info-item">
            <span className="work-info-label">Design</span>
            <span className="work-info-value">{assignment.design_identifier}</span>
          </div>
          <div className="work-info-item">
            <span className="work-info-label">Sub-Lot</span>
            <span className="work-info-value">{assignment.sub_lot_number}</span>
          </div>
        </div>
      </div>

      {success && (
        <div className="shift-alert shift-alert-success">
          ✓ Shift logged successfully
        </div>
      )}

      {error && (
        <div className="shift-alert shift-alert-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="shift-form">
        <div className="card">
          <label className="form-label" htmlFor="operator-select">
            Operator <span className="required">*</span>
          </label>
          <select
            id="operator-select"
            className="select"
            value={formData.operatorId}
            onChange={(e) => setFormData({ ...formData, operatorId: e.target.value })}
            required
          >
            <option value="">Select operator</option>
            {operators.map((op) => (
              <option key={op.id} value={op.id}>
                {op.name}
              </option>
            ))}
          </select>
        </div>

        <div className="card shift-date-shift">
          <div className="form-field">
            <label className="form-label" htmlFor="shift-date">
              Date <span className="required">*</span>
            </label>
            <input
              id="shift-date"
              type="date"
              className="input"
              value={formData.shiftDate}
              onChange={(e) => setFormData({ ...formData, shiftDate: e.target.value })}
              required
            />
          </div>

          <div className="form-field">
            <label className="form-label">
              Shift <span className="required">*</span>
            </label>
            <div className="shift-type-buttons">
              {['morning', 'afternoon', 'night'].map((shift) => (
                <button
                  key={shift}
                  type="button"
                  className={`btn ${formData.shiftType === shift ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFormData({ ...formData, shiftType: shift })}
                >
                  {shift.charAt(0).toUpperCase() + shift.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="card shift-previous-counter">
          <h3 className="counter-title">Previous Counter Reading</h3>
          <div className="counter-value">{previousRunning.toLocaleString()}</div>
          <p className="counter-hint">
            {previousRunning === 0
              ? 'No previous shift found. This will be the starting counter.'
              : 'This is the last counter reading. Enter your current reading below.'}
          </p>
        </div>

        <div className="card">
          <label className="form-label" htmlFor="current-counter">
            Current Counter <span className="required">*</span>
          </label>
          <input
            id="current-counter"
            type="number"
            className="input input-large"
            value={formData.currentRunningStitches}
            onChange={(e) => setFormData({ ...formData, currentRunningStitches: e.target.value })}
            required
            min="0"
            placeholder="Enter counter reading"
          />
        </div>

        <div className="card">
          <label className="form-label" htmlFor="rounds-completed">
            Rounds Completed <span className="required">*</span>
          </label>
          <input
            id="rounds-completed"
            type="number"
            className="input input-large"
            value={formData.roundsCompleted}
            onChange={(e) => setFormData({ ...formData, roundsCompleted: e.target.value })}
            required
            min="0"
            placeholder="Enter rounds"
          />
        </div>

        <button
          type="submit"
          className={`btn btn-success shift-submit ${submitting ? 'btn-loading' : ''}`}
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : 'Submit Shift Log'}
        </button>
      </form>
    </div>
  );
}

export default ShiftEntry;
