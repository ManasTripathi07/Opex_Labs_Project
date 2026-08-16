import { useState, useEffect } from 'react';
import { api } from '../api/client';
import DeleteButton from '../components/DeleteButton';
import ConfirmDialog from '../components/ConfirmDialog';
import BlockedDeleteDialog from '../components/BlockedDeleteDialog';
import Notification from '../components/Notification';
import { useDelete } from '../hooks/useDelete';
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
  const [notification, setNotification] = useState({ visible: false, message: '', type: 'success' });
  const [blockedDeleteDialog, setBlockedDeleteDialog] = useState({
    isOpen: false,
    entityType: '',
    entityName: '',
    dependencies: null
  });
  const { deleteState, openDialog, closeDialog, executeDelete } = useDelete();

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

  const handleDelete = async (item, type) => {
    const entityNames = {
      clients: 'Client',
      designs: 'Design',
      machines: 'Machine',
      operators: 'Operator',
    };

    const displayNames = {
      clients: item.name,
      designs: item.identifier,
      machines: item.identifier,
      operators: item.name,
    };

    // Check for dependencies first (only clients have this endpoint currently)
    if (type === 'clients') {
      try {
        const depCheck = await api.clients.checkDependencies(item.id);

        if (depCheck.data.hasDependencies) {
          // BLOCK deletion - show informational dialog
          setBlockedDeleteDialog({
            isOpen: true,
            entityType: entityNames[type],
            entityName: displayNames[type],
            dependencies: depCheck.data.dependencies
          });
          return;
        }
      } catch (error) {
        console.error('Error checking dependencies:', error);
      }
    }

    // No dependencies or not a client - show confirmation dialog for safe deletion
    openDialog(
      {
        id: item.id,
        name: displayNames[type],
        type: entityNames[type],
      },
      async () => {
        try {
          switch (type) {
            case 'clients':
              await api.clients.delete(item.id);
              break;
            case 'designs':
              await api.designs.delete(item.id);
              break;
            case 'machines':
              await api.machines.delete(item.id);
              break;
            case 'operators':
              await api.operators.delete(item.id);
              break;
          }

          setNotification({
            visible: true,
            message: `${entityNames[type]} '${displayNames[type]}' deleted successfully.`,
            type: 'success',
          });

          loadData();
        } catch (error) {
          const errorMessage = error.response?.data?.error || error.message || 'Failed to delete';
          const errorDetails = error.response?.data?.details || '';

          let userFriendlyMessage = `Unable to delete '${displayNames[type]}'.`;

          if (errorDetails) {
            userFriendlyMessage = errorDetails;
          } else if (errorMessage.toLowerCase().includes('foreign key') ||
              errorMessage.toLowerCase().includes('constraint') ||
              errorMessage.toLowerCase().includes('referenced') ||
              errorMessage.toLowerCase().includes('existing lots')) {
            userFriendlyMessage = `Cannot delete '${displayNames[type]}' because it is associated with production records. Production-level data cannot be deleted from this interface.`;
          } else if (errorMessage.toLowerCase().includes('not found')) {
            userFriendlyMessage = `${entityNames[type]} '${displayNames[type]}' not found.`;
          }

          setNotification({
            visible: true,
            message: userFriendlyMessage,
            type: 'error',
          });

          throw error;
        }
      }
    );
  };

  const confirmDelete = async () => {
    const result = await executeDelete();
    if (!result.success && result.error) {
      // Error notification already set in handleDelete
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
                <th style={{ width: '80px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id}>
                  <td>{client.name}</td>
                  <td>{client.phone || '-'}</td>
                  <td>{new Date(client.created_at).toLocaleDateString()}</td>
                  <td style={{ textAlign: 'center' }}>
                    <DeleteButton
                      onClick={() => handleDelete(client, 'clients')}
                      ariaLabel={`Delete client ${client.name}`}
                      title={`Delete ${client.name}`}
                    />
                  </td>
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
                <th style={{ width: '80px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {designs.map((design) => (
                <tr key={design.id}>
                  <td>{design.identifier}</td>
                  <td>{design.stitches_per_piece.toLocaleString()}</td>
                  <td>{design.rate_per_stitch || '-'}</td>
                  <td>{new Date(design.created_at).toLocaleDateString()}</td>
                  <td style={{ textAlign: 'center' }}>
                    <DeleteButton
                      onClick={() => handleDelete(design, 'designs')}
                      ariaLabel={`Delete design ${design.identifier}`}
                      title={`Delete ${design.identifier}`}
                    />
                  </td>
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
                <th style={{ width: '80px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {machines.map((machine) => (
                <tr key={machine.id}>
                  <td>{machine.identifier}</td>
                  <td>{machine.name}</td>
                  <td>{new Date(machine.created_at).toLocaleDateString()}</td>
                  <td style={{ textAlign: 'center' }}>
                    <DeleteButton
                      onClick={() => handleDelete(machine, 'machines')}
                      ariaLabel={`Delete machine ${machine.identifier}`}
                      title={`Delete ${machine.identifier}`}
                    />
                  </td>
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
                <th style={{ width: '80px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {operators.map((operator) => (
                <tr key={operator.id}>
                  <td>{operator.name}</td>
                  <td>{operator.phone || '-'}</td>
                  <td>{new Date(operator.created_at).toLocaleDateString()}</td>
                  <td style={{ textAlign: 'center' }}>
                    <DeleteButton
                      onClick={() => handleDelete(operator, 'operators')}
                      ariaLabel={`Delete operator ${operator.name}`}
                      title={`Delete ${operator.name}`}
                    />
                  </td>
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

      <ConfirmDialog
        isOpen={deleteState.isOpen}
        onClose={closeDialog}
        onConfirm={confirmDelete}
        title={`Delete ${deleteState.item?.type}?`}
        message="Are you sure you want to delete:"
        entityName={deleteState.item?.name}
        isLoading={deleteState.isLoading}
      />

      <BlockedDeleteDialog
        isOpen={blockedDeleteDialog.isOpen}
        onClose={() => setBlockedDeleteDialog({ ...blockedDeleteDialog, isOpen: false })}
        entityType={blockedDeleteDialog.entityType}
        entityName={blockedDeleteDialog.entityName}
        dependencies={blockedDeleteDialog.dependencies}
      />

      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.visible}
        onClose={() => setNotification({ ...notification, visible: false })}
      />
    </div>
  );
}

export default MasterData;
