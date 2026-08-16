import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { format } from 'date-fns';
import DeleteButton from '../components/DeleteButton';
import ConfirmDialog from '../components/ConfirmDialog';
import BlockedDeleteDialog from '../components/BlockedDeleteDialog';
import Notification from '../components/Notification';
import { useDelete } from '../hooks/useDelete';
import './InboundUI.css';

function InboundUI() {
  const [lots, setLots] = useState([]);
  const [clients, setClients] = useState([]);
  const [designs, setDesigns] = useState([]);
  const [showNewLotForm, setShowNewLotForm] = useState(false);
  const [formData, setFormData] = useState({
    lotNumber: '',
    clientId: '',
    totalPieces: '',
    receivedDate: format(new Date(), 'yyyy-MM-dd'),
    subLots: [],
  });
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
  }, []);

  const loadData = async () => {
    try {
      const [lotsRes, clientsRes, designsRes] = await Promise.all([
        api.lots.list({}),
        api.clients.list(),
        api.designs.list(),
      ]);
      setLots(lotsRes.data);
      setClients(clientsRes.data);
      setDesigns(designsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleAllocateSubLot = async (lotId) => {
    try {
      const lotDetails = await api.lots.get(lotId);

      for (const subLot of lotDetails.data.subLots) {
        if (subLot.state === 'received') {
          await api.sublots.updateState(subLot.id, 'allocated');
        }
      }

      setSuccess('Sub-lots allocated successfully!');
      loadData();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to allocate sub-lots');
    }
  };

  const addSubLot = () => {
    setFormData({
      ...formData,
      subLots: [...formData.subLots, { subLotNumber: '', designId: '', pieceCount: '' }],
    });
  };

  const updateSubLot = (index, field, value) => {
    const updatedSubLots = [...formData.subLots];
    updatedSubLots[index][field] = value;
    setFormData({ ...formData, subLots: updatedSubLots });
  };

  const removeSubLot = (index) => {
    const updatedSubLots = formData.subLots.filter((_, i) => i !== index);
    setFormData({ ...formData, subLots: updatedSubLots });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const totalPieces = parseInt(formData.totalPieces);
    const subLotTotal = formData.subLots.reduce((sum, sl) => sum + parseInt(sl.pieceCount || 0), 0);

    if (subLotTotal !== totalPieces) {
      setError(`Sub-lot pieces (${subLotTotal}) must equal total pieces (${totalPieces})`);
      return;
    }

    try {
      await api.lots.create({
        lotNumber: formData.lotNumber,
        clientId: parseInt(formData.clientId),
        totalPieces,
        receivedDate: formData.receivedDate,
        subLots: formData.subLots.map((sl) => ({
          subLotNumber: sl.subLotNumber,
          designId: parseInt(sl.designId),
          pieceCount: parseInt(sl.pieceCount),
        })),
      });

      setSuccess('Lot created successfully!');
      setFormData({
        lotNumber: '',
        clientId: '',
        totalPieces: '',
        receivedDate: format(new Date(), 'yyyy-MM-dd'),
        subLots: [],
      });
      setShowNewLotForm(false);
      loadData();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create lot');
    }
  };

  const handleDeleteLot = async (lot) => {
    // Check for dependencies first
    try {
      const depCheck = await api.lots.checkDependencies(lot.id);

      if (depCheck.data.hasDependencies) {
        // BLOCK deletion - show informational dialog
        setBlockedDeleteDialog({
          isOpen: true,
          entityType: 'Lot',
          entityName: lot.lot_number,
          dependencies: depCheck.data.dependencies
        });
        return;
      }
    } catch (error) {
      console.error('Error checking lot dependencies:', error);
    }

    // No dependencies - show confirmation dialog for safe deletion
    openDialog(
      {
        id: lot.id,
        name: lot.lot_number,
        type: 'Lot',
      },
      async () => {
        try {
          await api.lots.delete(lot.id);

          setNotification({
            visible: true,
            message: `Lot '${lot.lot_number}' deleted successfully.`,
            type: 'success',
          });

          loadData();
        } catch (error) {
          const errorMessage = error.response?.data?.error || error.message || 'Failed to delete';
          const errorDetails = error.response?.data?.details || '';

          let userFriendlyMessage = `Unable to delete lot '${lot.lot_number}'.`;

          if (errorDetails) {
            userFriendlyMessage = errorDetails;
          } else if (errorMessage.toLowerCase().includes('foreign key') ||
              errorMessage.toLowerCase().includes('constraint') ||
              errorMessage.toLowerCase().includes('referenced') ||
              errorMessage.toLowerCase().includes('assignments')) {
            userFriendlyMessage = `Cannot delete lot '${lot.lot_number}' because it is associated with production records. Production-level data cannot be deleted from this interface.`;
          } else if (errorMessage.toLowerCase().includes('not found')) {
            userFriendlyMessage = `Lot '${lot.lot_number}' not found.`;
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
      // Error notification already set in handleDeleteLot
    }
  };

  return (
    <div className="inbound-ui">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Inbound - Lot Receipt</h1>
        <button className="btn btn-primary" onClick={() => setShowNewLotForm(!showNewLotForm)}>
          {showNewLotForm ? 'Cancel' : 'New Lot'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showNewLotForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2>New Lot Receipt</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2" style={{ marginBottom: '1.5rem' }}>
              <div>
                <label className="label">Lot Number *</label>
                <input
                  type="text"
                  className="input"
                  value={formData.lotNumber}
                  onChange={(e) => setFormData({ ...formData, lotNumber: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Client *</label>
                <select
                  className="select"
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  required
                >
                  <option value="">Select Client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Total Pieces *</label>
                <input
                  type="number"
                  className="input"
                  value={formData.totalPieces}
                  onChange={(e) => setFormData({ ...formData, totalPieces: e.target.value })}
                  required
                  min="1"
                />
              </div>
              <div>
                <label className="label">Received Date *</label>
                <input
                  type="date"
                  className="input"
                  value={formData.receivedDate}
                  onChange={(e) => setFormData({ ...formData, receivedDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Sub-Lots</h3>
              <button type="button" className="btn btn-secondary" onClick={addSubLot}>
                Add Sub-Lot
              </button>
            </div>

            {formData.subLots.map((subLot, index) => (
              <div key={index} className="sublot-row">
                <input
                  type="text"
                  className="input"
                  placeholder="Sub-Lot Number"
                  value={subLot.subLotNumber}
                  onChange={(e) => updateSubLot(index, 'subLotNumber', e.target.value)}
                  required
                />
                <select
                  className="select"
                  value={subLot.designId}
                  onChange={(e) => updateSubLot(index, 'designId', e.target.value)}
                  required
                >
                  <option value="">Select Design</option>
                  {designs.map((design) => (
                    <option key={design.id} value={design.id}>
                      {design.identifier}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  className="input"
                  placeholder="Piece Count"
                  value={subLot.pieceCount}
                  onChange={(e) => updateSubLot(index, 'pieceCount', e.target.value)}
                  required
                  min="1"
                />
                <button type="button" className="btn btn-danger" onClick={() => removeSubLot(index)}>
                  Remove
                </button>
              </div>
            ))}

            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Create Lot
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <h2>Recent Lots</h2>
        {lots.length === 0 ? (
          <p style={{ color: 'var(--color-text-secondary)' }}>No lots found</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Lot Number</th>
                <th>Client</th>
                <th>Total Pieces</th>
                <th>Received Date</th>
                <th>Sub-Lots</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {lots.map((lot) => (
                <tr key={lot.id}>
                  <td>{lot.lot_number}</td>
                  <td>{lot.client_name}</td>
                  <td>{lot.total_pieces}</td>
                  <td>{format(new Date(lot.received_date), 'MMM dd, yyyy')}</td>
                  <td>{lot.subLots?.length || 0}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <button
                        className="btn btn-primary"
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                        onClick={() => handleAllocateSubLot(lot.id)}
                      >
                        Allocate
                      </button>
                      <DeleteButton
                        onClick={() => handleDeleteLot(lot)}
                        ariaLabel={`Delete lot ${lot.lot_number}`}
                        title={`Delete ${lot.lot_number}`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

export default InboundUI;
