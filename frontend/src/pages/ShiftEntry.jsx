import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client';
import { format } from 'date-fns';
import './ShiftEntry.css';

function ShiftEntry() {
  const { machineId } = useParams();
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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      await api.shiftLogs.create({
        machineId: parseInt(machineId),
        operatorId: parseInt(formData.operatorId),
        designId: assignment.design_id,
        assignmentId: assignment.id,
        shiftDate: formData.shiftDate,
        shiftType: formData.shiftType,
        currentRunningStitches: parseInt(formData.currentRunningStitches),
        roundsCompleted: parseInt(formData.roundsCompleted),
      });

      setSuccess(true);
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
      <div className="shift-entry">
        <div className="shift-loading">Loading...</div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="shift-entry">
        <div className="shift-card">
          <h1>No Active Assignment</h1>
          <p>Machine {machine?.identifier} has no active assignment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="shift-entry">
      <div className="shift-header">
        <h1>{machine.identifier}</h1>
        <div className="shift-subtitle">{machine.name}</div>
      </div>

      <div className="shift-card">
        <div className="shift-info">
          <div className="info-label">Design</div>
          <div className="info-value">{assignment.design_identifier}</div>
        </div>
        <div className="shift-info">
          <div className="info-label">Sub-Lot</div>
          <div className="info-value">{assignment.sub_lot_number}</div>
        </div>
      </div>

      {success && (
        <div className="shift-success">
          ✓ Shift logged successfully!
        </div>
      )}

      {error && (
        <div className="shift-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="shift-form">
        <div className="shift-card">
          <label className="shift-label">Operator</label>
          <select
            className="shift-select"
            value={formData.operatorId}
            onChange={(e) => setFormData({ ...formData, operatorId: e.target.value })}
            required
          >
            <option value="">Select Operator</option>
            {operators.map((op) => (
              <option key={op.id} value={op.id}>
                {op.name}
              </option>
            ))}
          </select>
        </div>

        <div className="shift-card">
          <label className="shift-label">Date</label>
          <input
            type="date"
            className="shift-input"
            value={formData.shiftDate}
            onChange={(e) => setFormData({ ...formData, shiftDate: e.target.value })}
            required
          />
        </div>

        <div className="shift-card">
          <label className="shift-label">Shift</label>
          <div className="shift-tabs">
            {['morning', 'afternoon', 'night'].map((shift) => (
              <button
                key={shift}
                type="button"
                className={`shift-tab ${formData.shiftType === shift ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, shiftType: shift })}
              >
                {shift.charAt(0).toUpperCase() + shift.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="shift-card">
          <div className="shift-info">
            <div className="info-label">Previous Counter</div>
            <div className="info-value previous-value">{previousRunning.toLocaleString()}</div>
          </div>
        </div>

        <div className="shift-card">
          <label className="shift-label">Current Counter *</label>
          <input
            type="number"
            className="shift-input large"
            value={formData.currentRunningStitches}
            onChange={(e) => setFormData({ ...formData, currentRunningStitches: e.target.value })}
            required
            min="0"
            placeholder="Enter counter reading"
          />
        </div>

        <div className="shift-card">
          <label className="shift-label">Rounds Completed</label>
          <input
            type="number"
            className="shift-input large"
            value={formData.roundsCompleted}
            onChange={(e) => setFormData({ ...formData, roundsCompleted: e.target.value })}
            required
            min="0"
          />
        </div>

        <button
          type="submit"
          className="shift-submit"
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : 'Submit Shift Log'}
        </button>
      </form>
    </div>
  );
}

export default ShiftEntry;
