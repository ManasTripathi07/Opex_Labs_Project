import { useState, useEffect } from 'react';
import { api } from '../api/client';
import './MasterData.css';

function MasterData() {
  const [activeTab, setActiveTab] = useState('clients');
  const [clients, setClients] = useState([]);
  const [designs, setDesigns] = useState([]);
  const [machines, setMachines] = useState([]);
  const [operators, setOperators] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      switch (activeTab) {
        case 'clients':
          const clientsRes = await api.clients.list();
          setClients(clientsRes.data);
          break;
        case 'designs':
          const designsRes = await api.designs.list();
          setDesigns(designsRes.data);
          break;
        case 'machines':
          const machinesRes = await api.machines.list();
          setMachines(machinesRes.data);
          break;
        case 'operators':
          const operatorsRes = await api.operators.list();
          setOperators(operatorsRes.data);
          break;
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      switch (activeTab) {
        case 'clients':
          await api.clients.create(formData);
          break;
        case 'designs':
          await api.designs.create({
            identifier: formData.identifier,
            stitchesPerPiece: parseInt(formData.stitchesPerPiece),
            ratePerStitch: formData.ratePerStitch ? parseFloat(formData.ratePerStitch) : null,
          });
          break;
        case 'machines':
          await api.machines.create(formData);
          break;
        case 'operators':
          await api.operators.create(formData);
          break;
      }

      setSuccess('Created successfully!');
      setFormData({});
      setShowForm(false);
      loadData();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create');
    }
  };

  const renderForm = () => {
    switch (activeTab) {
      case 'clients':
        return (
          <div className="grid grid-cols-2">
            <div>
              <label className="label">Name *</label>
              <input
                type="text"
                className="input"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Phone</label>
              <input
                type="tel"
                className="input"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>
        );

      case 'designs':
        return (
          <div className="grid grid-cols-3">
            <div>
              <label className="label">Identifier *</label>
              <input
                type="text"
                className="input"
                value={formData.identifier || ''}
                onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Stitches per Piece *</label>
              <input
                type="number"
                className="input"
                value={formData.stitchesPerPiece || ''}
                onChange={(e) => setFormData({ ...formData, stitchesPerPiece: e.target.value })}
                required
                min="1"
              />
            </div>
            <div>
              <label className="label">Rate per Stitch</label>
              <input
                type="number"
                className="input"
                step="0.0001"
                value={formData.ratePerStitch || ''}
                onChange={(e) => setFormData({ ...formData, ratePerStitch: e.target.value })}
              />
            </div>
          </div>
        );

      case 'machines':
        return (
          <div className="grid grid-cols-2">
            <div>
              <label className="label">Identifier *</label>
              <input
                type="text"
                className="input"
                value={formData.identifier || ''}
                onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Name *</label>
              <input
                type="text"
                className="input"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
          </div>
        );

      case 'operators':
        return (
          <div className="grid grid-cols-2">
            <div>
              <label className="label">Name *</label>
              <input
                type="text"
                className="input"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Phone</label>
              <input
                type="tel"
                className="input"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>
        );
    }
  };

  const renderTable = () => {
    switch (activeTab) {
      case 'clients':
        return (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id}>
                  <td>{client.name}</td>
                  <td>{client.phone || '-'}</td>
                  <td>{new Date(client.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'designs':
        return (
          <table className="table">
            <thead>
              <tr>
                <th>Identifier</th>
                <th>Stitches/Piece</th>
                <th>Rate/Stitch</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {designs.map((design) => (
                <tr key={design.id}>
                  <td>{design.identifier}</td>
                  <td>{design.stitches_per_piece.toLocaleString()}</td>
                  <td>{design.rate_per_stitch || '-'}</td>
                  <td>{new Date(design.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'machines':
        return (
          <table className="table">
            <thead>
              <tr>
                <th>Identifier</th>
                <th>Name</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {machines.map((machine) => (
                <tr key={machine.id}>
                  <td>{machine.identifier}</td>
                  <td>{machine.name}</td>
                  <td>{new Date(machine.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'operators':
        return (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {operators.map((operator) => (
                <tr key={operator.id}>
                  <td>{operator.name}</td>
                  <td>{operator.phone || '-'}</td>
                  <td>{new Date(operator.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
    }
  };

  const getDataLength = () => {
    switch (activeTab) {
      case 'clients':
        return clients.length;
      case 'designs':
        return designs.length;
      case 'machines':
        return machines.length;
      case 'operators':
        return operators.length;
      default:
        return 0;
    }
  };

  return (
    <div className="master-data">
      <h1>Master Data Management</h1>

      <div className="tabs">
        {['clients', 'designs', 'machines', 'operators'].map((tab) => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(tab);
              setShowForm(false);
              setFormData({});
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Add New'}
          </button>
        </div>

        {showForm && (
          <div className="form-section">
            <form onSubmit={handleSubmit}>
              {renderForm()}
              <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                Create
              </button>
            </form>
          </div>
        )}

        {getDataLength() === 0 ? (
          <p style={{ color: 'var(--color-text-secondary)' }}>No data found</p>
        ) : (
          renderTable()
        )}
      </div>
    </div>
  );
}

export default MasterData;
