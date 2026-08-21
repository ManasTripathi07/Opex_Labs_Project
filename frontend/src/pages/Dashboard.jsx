import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../api/client';
import { format } from 'date-fns';
import { Status, Loading, EmptyState, ErrorState } from '../components/ui';
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
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, [selectedDate]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [productionRes, assignmentsRes, sublotsRes] = await Promise.all([
        api.shiftLogs.getDailyProduction(selectedDate),
        api.assignments.list({ status: 'active' }),
        api.sublots.list({}),
      ]);

      setDailyProduction(productionRes.data);
      setAssignments(assignmentsRes.data);
      setSublots(sublotsRes.data);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const stateCounts = sublots.reduce((acc, sl) => {
    acc[sl.state] = (acc[sl.state] || 0) + 1;
    return acc;
  }, {});

  const waitingCount = (stateCounts.received || 0);
  const readyCount = (stateCounts.allocated || 0);
  const workingCount = (stateCounts.in_production || 0);
  const completedCount = (stateCounts.completed || 0);

  if (loading) {
    return (
      <div className="dashboard">
        <PageHeader
          title="Production Tracker"
          description="Factory production overview"
        />
        <Loading message="Loading dashboard data..." size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <PageHeader
          title="Production Tracker"
          description="Factory production overview"
        />
        <ErrorState
          title="Unable to load dashboard"
          description="There was a problem loading production data. Please try again."
          onRetry={loadDashboardData}
        />
      </div>
    );
  }

  return (
    <div className="dashboard">
      <PageHeader
        title="Production Tracker"
        description="Factory production overview"
      />

      {/* Key Production Summary */}
      <div className="dashboard-summary">
        <motion.div
          className="card summary-card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0 }}
        >
          <div className="summary-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          </div>
          <div className="summary-content">
            <div className="summary-label">Active Machines</div>
            <div className="summary-value">{assignments.length}</div>
            <div className="summary-context">Currently running</div>
          </div>
        </motion.div>

        <motion.div
          className="card summary-card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.05 }}
        >
          <div className="summary-icon summary-icon-warning">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="summary-content">
            <div className="summary-label">Working</div>
            <div className="summary-value">{workingCount}</div>
            <div className="summary-context">In production now</div>
          </div>
        </motion.div>

        <motion.div
          className="card summary-card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
        >
          <div className="summary-icon summary-icon-info">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
          <div className="summary-content">
            <div className="summary-label">Ready</div>
            <div className="summary-value">{readyCount}</div>
            <div className="summary-context">Allocated for work</div>
          </div>
        </motion.div>

        <motion.div
          className="card summary-card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.15 }}
        >
          <div className="summary-icon summary-icon-success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="summary-content">
            <div className="summary-label">Completed</div>
            <div className="summary-value">{completedCount}</div>
            <div className="summary-context">Finished work</div>
          </div>
        </motion.div>
      </div>

      {/* Attention Section */}
      {waitingCount > 0 && (
        <motion.div
          className="card attention-card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.2 }}
        >
          <div className="attention-content">
            <div className="attention-icon">⏱️</div>
            <div className="attention-text">
              <div className="attention-title">{waitingCount} order{waitingCount !== 1 ? 's' : ''} waiting</div>
              <div className="attention-description">Orders received and ready to be allocated to machines</div>
            </div>
          </div>
          <Link to="/inbound" className="btn btn-primary">
            View Orders
          </Link>
        </motion.div>
      )}

      {/* Active Machine Assignments */}
      <PageSection title="Active Machines">
        {assignments.length === 0 ? (
          <EmptyState
            icon="🏭"
            title="No active machines"
            description="There are no machines currently running. Start a new shift to begin production."
            action={
              <Link to="/production" className="btn btn-primary">
                View Production
              </Link>
            }
          />
        ) : (
          <div className="assignments-grid">
            {assignments.map((assignment, index) => (
              <motion.div
                key={assignment.id}
                className="card assignment-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
              >
                <div className="assignment-header">
                  <div className="assignment-machine">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                    {assignment.machine_identifier}
                  </div>
                  <Status status="in_production" size="sm" />
                </div>
                <div className="assignment-details">
                  <div className="assignment-detail">
                    <span className="detail-label">Sub-Lot</span>
                    <span className="detail-value">{assignment.sub_lot_number}</span>
                  </div>
                  <div className="assignment-detail">
                    <span className="detail-label">Design</span>
                    <span className="detail-value">{assignment.design_identifier}</span>
                  </div>
                </div>
                <div className="assignment-progress">
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
              </motion.div>
            ))}
          </div>
        )}
      </PageSection>

      {/* Daily Production Report */}
      <PageSection
        title="Daily Production"
        action={
          <input
            type="date"
            className="input date-input"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            aria-label="Select date for daily production report"
          />
        }
      >
        {dailyProduction.length === 0 ? (
          <EmptyState
            icon="📅"
            title="No production data"
            description={`No production recorded for ${format(new Date(selectedDate), 'MMMM d, yyyy')}`}
          />
        ) : (
          <div className="production-table-container">
            <table className="production-table">
              <thead>
                <tr>
                  <th>Machine</th>
                  <th>Design</th>
                  <th>Operators</th>
                  <th>Total Stitches</th>
                  <th>Pieces</th>
                </tr>
              </thead>
              <tbody>
                {dailyProduction.map((prod, idx) => (
                  <motion.tr
                    key={idx}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.02 }}
                  >
                    <td>
                      <div className="table-cell-primary">{prod.machine_identifier}</div>
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

      {/* Work Status Overview */}
      <PageSection title="Work Status">
        {sublots.length === 0 ? (
          <EmptyState
            icon="📦"
            title="No orders found"
            description="There are no orders in the system yet."
            action={
              <Link to="/inbound" className="btn btn-primary">
                Create Order
              </Link>
            }
          />
        ) : (
          <div className="status-grid">
            {waitingCount > 0 && (
              <motion.div
                className="card status-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Status status="received" size="lg" showIcon={true} />
                <div className="status-count">{waitingCount}</div>
              </motion.div>
            )}
            {readyCount > 0 && (
              <motion.div
                className="card status-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: 0.05 }}
              >
                <Status status="allocated" size="lg" showIcon={true} />
                <div className="status-count">{readyCount}</div>
              </motion.div>
            )}
            {workingCount > 0 && (
              <motion.div
                className="card status-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              >
                <Status status="in_production" size="lg" showIcon={true} />
                <div className="status-count">{workingCount}</div>
              </motion.div>
            )}
            {completedCount > 0 && (
              <motion.div
                className="card status-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: 0.15 }}
              >
                <Status status="completed" size="lg" showIcon={true} />
                <div className="status-count">{completedCount}</div>
              </motion.div>
            )}
            {(stateCounts.dispatched || 0) > 0 && (
              <motion.div
                className="card status-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: 0.2 }}
              >
                <Status status="dispatched" size="lg" showIcon={true} />
                <div className="status-count">{stateCounts.dispatched}</div>
              </motion.div>
            )}
          </div>
        )}
      </PageSection>
    </div>
  );
}

export default Dashboard;
