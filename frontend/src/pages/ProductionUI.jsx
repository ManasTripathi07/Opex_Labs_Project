import { useState, useEffect } from 'react';
import { api } from '../api/client';
import './ProductionUI.css';

function ProductionUI() {
  const [assignments, setAssignments] = useState([]);
  const [sublots, setSublots] = useState([]);
  const [machines, setMachines] = useState([]);
  const [showNewAssignment, setShowNewAssignment] = useState(false);
  const [formData, setFormData] = useState({
    machineId: '',
    subLotId: '',
    piecesIssued: '',
  });
  const [operators, setOperators] = useState([]);
  const [selectedOperator, setSelectedOperator] = useState('');
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [assignmentsRes, sublotsRes, machinesRes, operatorsRes] = await Promise.all([
        api.assignments.list({}),
        api.sublots.list({ state: 'allocated' }),
        api.machines.list(),
        api.operators.list(),
      ]);
      setAssignments(assignmentsRes.data);
      setSublots(sublotsRes.data);
      setMachines(machinesRes.data);
      setOperators(operatorsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.assignments.create({
        machineId: parseInt(formData.machineId),
        subLotId: parseInt(formData.subLotId),
        piecesIssued: parseInt(formData.piecesIssued),
      });

      setSuccess('Assignment created successfully!');
      setFormData({ machineId: '', subLotId: '', piecesIssued: '' });
      setShowNewAssignment(false);
      loadData();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create assignment');
    }
  };

  const handleStateChange = async (subLotId, newState) => {
    try {
      await api.sublots.updateState(subLotId, newState);
      setSuccess('State updated successfully!');
      loadData();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update state');
    }
  };

  const loadSalaryReport = async () => {
    if (!selectedOperator) return;

    try {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const fromDate = firstDay.toISOString().split('T')[0];
      const toDate = today.toISOString().split('T')[0];

      const res = await api.shiftLogs.getSalaryReport(selectedOperator, fromDate, toDate);
      setReportData(res.data);
    } catch (error) {
      setError('Failed to load salary report');
    }
  };

  return (
    <div className="production-ui">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Production Management</h1>
        <button className="btn btn-primary" onClick={() => setShowNewAssignment(!showNewAssignment)}>
          {showNewAssignment ? 'Cancel' : 'New Assignment'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showNewAssignment && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2>Create Machine Assignment</h2>
          <form onSubmit={handleCreateAssignment}>
            <div className="grid grid-cols-3">
              <div>
                <label className="label">Machine *</label>
                <select
                  className="select"
                  value={formData.machineId}
                  onChange={(e) => setFormData({ ...formData, machineId: e.target.value })}
                  required
                >
                  <option value="">Select Machine</option>
                  {machines.map((machine) => (
                    <option key={machine.id} value={machine.id}>
                      {machine.identifier} - {machine.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Sub-Lot *</label>
                <select
                  className="select"
                  value={formData.subLotId}
                  onChange={(e) => setFormData({ ...formData, subLotId: e.target.value })}
                  required
                >
                  <option value="">Select Sub-Lot</option>
                  {sublots.map((sublot) => (
                    <option key={sublot.id} value={sublot.id}>
                      {sublot.sub_lot_number} - {sublot.design_identifier}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Pieces Issued *</label>
                <input
                  type="number"
                  className="input"
                  value={formData.piecesIssued}
                  onChange={(e) => setFormData({ ...formData, piecesIssued: e.target.value })}
                  required
                  min="1"
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Create Assignment
            </button>
          </form>
        </div>
      )}

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2>Active Assignments</h2>
        {assignments.filter((a) => a.status === 'active').length === 0 ? (
          <p style={{ color: 'var(--color-text-secondary)' }}>No active assignments</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Machine</th>
                <th>Sub-Lot</th>
                <th>Design</th>
                <th>Issued</th>
                <th>Completed</th>
                <th>Progress</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {assignments
                .filter((a) => a.status === 'active')
                .map((assignment) => {
                  const progress = (assignment.pieces_completed / assignment.pieces_issued) * 100;
                  return (
                    <tr key={assignment.id}>
                      <td>{assignment.machine_identifier}</td>
                      <td>{assignment.sub_lot_number}</td>
                      <td>{assignment.design_identifier}</td>
                      <td>{assignment.pieces_issued}</td>
                      <td>{assignment.pieces_completed}</td>
                      <td>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                          {progress.toFixed(0)}%
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-warning">Active</span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <h2>Salary Report</h2>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label className="label">Operator</label>
            <select
              className="select"
              value={selectedOperator}
              onChange={(e) => setSelectedOperator(e.target.value)}
            >
              <option value="">Select Operator</option>
              {operators.map((op) => (
                <option key={op.id} value={op.id}>
                  {op.name}
                </option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary" onClick={loadSalaryReport} disabled={!selectedOperator}>
            Generate Report
          </button>
        </div>

        {reportData && (
          <div>
            <table className="table">
              <thead>
                <tr>
                  <th>Design</th>
                  <th>Total Stitches</th>
                  <th>Rate/Stitch</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {reportData.designs.map((design) => (
                  <tr key={design.design_identifier}>
                    <td>{design.design_identifier}</td>
                    <td>{parseInt(design.total_stitches).toLocaleString()}</td>
                    <td>{design.rate_per_stitch || 'N/A'}</td>
                    <td>{design.amount ? `₹${parseFloat(design.amount).toFixed(2)}` : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td><strong>Total</strong></td>
                  <td><strong>{reportData.totalStitches.toLocaleString()}</strong></td>
                  <td></td>
                  <td>
                    <strong>
                      {reportData.grandTotal !== null
                        ? `₹${reportData.grandTotal.toFixed(2)}`
                        : 'Incomplete rates'}
                    </strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductionUI;
