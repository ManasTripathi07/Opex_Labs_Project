import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../api/client';
import { format } from 'date-fns';
import KPICard from '../components/KPICard';
import ProgressBar from '../components/ProgressBar';
import PageHeader from '../components/PageHeader';
import PageSection from '../components/PageSection';
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
    return (
      <div className="dashboard-loading">
        <div className="skeleton skeleton-card" style={{ height: '140px', marginBottom: 'var(--space-4)' }} />
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton skeleton-card" style={{ height: '140px' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <PageHeader
        title="Factory Overview"
        description="Real-time production metrics and active operations"
      />

      <div className="kpi-grid">
        <KPICard
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          }
          label="Active Machines"
          value={assignments.length}
          delay={0}
          accentColor="primary"
        />
        <KPICard
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          }
          label="In Production"
          value={stateCounts.in_production || 0}
          delay={0.05}
          accentColor="warning"
        />
        <KPICard
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          }
          label="Allocated"
          value={stateCounts.allocated || 0}
          delay={0.1}
          accentColor="info"
        />
        <KPICard
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          }
          label="Completed Today"
          value={stateCounts.completed || 0}
          delay={0.15}
          accentColor="success"
        />
      </div>

      <PageSection title="Active Machine Assignments">
        {assignments.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p>No active assignments</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table enhanced-table">
              <thead>
                <tr>
                  <th>Machine</th>
                  <th>Sub-Lot</th>
                  <th>Design</th>
                  <th>Progress</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment, index) => (
                  <motion.tr
                    key={assignment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                  >
                    <td>
                      <div className="table-cell-main">{assignment.machine_identifier}</div>
                    </td>
                    <td>
                      <div className="table-cell-secondary">{assignment.sub_lot_number}</div>
                    </td>
                    <td>
                      <div className="table-cell-secondary">{assignment.design_identifier}</div>
                    </td>
                    <td>
                      <ProgressBar
                        current={assignment.pieces_completed}
                        total={assignment.pieces_issued}
                      />
                    </td>
                    <td>
                      <span className="badge badge-warning">Active</span>
                    </td>
                    <td>
                      <Link
                        to={`/shift/${assignment.machine_id}`}
                        className="btn btn-sm btn-primary"
                        title="Log shift for this machine"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Log Shift
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PageSection>

      <PageSection
        title="Daily Production Report"
        action={
          <input
            type="date"
            className="input date-input"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        }
      >
        {dailyProduction.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            <p>No production data for {format(new Date(selectedDate), 'MMMM d, yyyy')}</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table enhanced-table">
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
                  <motion.tr
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.03 }}
                  >
                    <td>
                      <div className="table-cell-main">{prod.machine_identifier}</div>
                    </td>
                    <td>
                      <div className="table-cell-secondary">{prod.design_identifier}</div>
                    </td>
                    <td>
                      <div className="table-cell-secondary">{prod.operators}</div>
                    </td>
                    <td>
                      <div className="table-cell-number">{parseInt(prod.total_stitches).toLocaleString()}</div>
                    </td>
                    <td>
                      <div className="table-cell-number">{parseFloat(prod.total_piece_equivalents).toFixed(2)}</div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PageSection>

      <PageSection title="Sub-Lot Status Overview">
        <div className="status-overview-grid">
          {Object.entries(stateCounts).length === 0 ? (
            <div className="empty-state">
              <p>No sub-lots found</p>
            </div>
          ) : (
            Object.entries(stateCounts).map(([state, count], index) => (
              <motion.div
                key={state}
                className="status-overview-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <span className={`badge ${getStateBadgeClass(state)}`}>
                  {state.replace('_', ' ').toUpperCase()}
                </span>
                <div className="status-overview-count">{count}</div>
              </motion.div>
            ))
          )}
        </div>
      </PageSection>
    </div>
  );
}

export default Dashboard;
