import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { format } from 'date-fns';
import './Dashboard.css';

function Dashboard() {
  const [dailyProduction, setDailyProduction] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [sublots, setSublots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [selectedDate]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [productionRes, assignmentsRes, sublotsRes] = await Promise.all([
        api.shiftLogs.getDailyProduction(selectedDate),
        api.assignments.list({ status: 'active' }),
        api.sublots.list({}),
      ]);

      setDailyProduction(productionRes.data);
      setAssignments(assignmentsRes.data);
      setSublots(sublotsRes.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStateBadgeClass = (state) => {
    const classes = {
      received: 'badge-secondary',
      allocated: 'badge-info',
      in_production: 'badge-warning',
      completed: 'badge-success',
      dispatched: 'badge-success',
    };
    return classes[state] || 'badge-secondary';
  };

  const stateCounts = sublots.reduce((acc, sl) => {
    acc[sl.state] = (acc[sl.state] || 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Factory Overview</h1>

      <div className="dashboard-stats grid grid-cols-4">
        <div className="stat-card card">
          <div className="stat-label">Active Machines</div>
          <div className="stat-value">{assignments.length}</div>
        </div>
        <div className="stat-card card">
          <div className="stat-label">In Production</div>
          <div className="stat-value">{stateCounts.in_production || 0}</div>
        </div>
        <div className="stat-card card">
          <div className="stat-label">Allocated</div>
          <div className="stat-value">{stateCounts.allocated || 0}</div>
        </div>
        <div className="stat-card card">
          <div className="stat-label">Completed Today</div>
          <div className="stat-value">{stateCounts.completed || 0}</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Active Machine Assignments</h2>
        </div>
        {assignments.length === 0 ? (
          <p style={{ color: 'var(--color-text-secondary)' }}>No active assignments</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Machine</th>
                <th>Sub-Lot</th>
                <th>Design</th>
                <th>Progress</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((assignment) => (
                <tr key={assignment.id}>
                  <td>{assignment.machine_identifier}</td>
                  <td>{assignment.sub_lot_number}</td>
                  <td>{assignment.design_identifier}</td>
                  <td>
                    {assignment.pieces_completed} / {assignment.pieces_issued}
                  </td>
                  <td>
                    <span className="badge badge-warning">Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Daily Production Report</h2>
          <input
            type="date"
            className="input"
            style={{ width: 'auto' }}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
        {dailyProduction.length === 0 ? (
          <p style={{ color: 'var(--color-text-secondary)' }}>No production data for this date</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Machine</th>
                <th>Design</th>
                <th>Operators</th>
                <th>Total Stitches</th>
                <th>Piece Equivalents</th>
              </tr>
            </thead>
            <tbody>
              {dailyProduction.map((prod, idx) => (
                <tr key={idx}>
                  <td>{prod.machine_identifier}</td>
                  <td>{prod.design_identifier}</td>
                  <td>{prod.operators}</td>
                  <td>{parseInt(prod.total_stitches).toLocaleString()}</td>
                  <td>{parseFloat(prod.total_piece_equivalents).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h2>Sub-Lot Status Overview</h2>
        <div className="grid grid-cols-4" style={{ marginTop: '1rem' }}>
          {Object.entries(stateCounts).map(([state, count]) => (
            <div key={state} className="status-item">
              <span className={`badge ${getStateBadgeClass(state)}`}>
                {state.replace('_', ' ').toUpperCase()}
              </span>
              <div style={{ fontSize: '1.5rem', fontWeight: '600', marginTop: '0.5rem' }}>{count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
