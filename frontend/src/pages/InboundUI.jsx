import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { format } from 'date-fns';
import { Loading, EmptyState, ErrorState } from '../components/ui';
import WizardProgress from '../components/WizardProgress';
import DeleteButton from '../components/DeleteButton';
import ConfirmDialog from '../components/ConfirmDialog';
import BlockedDeleteDialog from '../components/BlockedDeleteDialog';
import Notification from '../components/Notification';
import { useDelete } from '../hooks/useDelete';
import './InboundUI.css';

const WIZARD_STEPS = ['Order Details', 'Production Details', 'Review', 'Complete'];

function InboundUI() {
  // Existing lots list state
  const [lots, setLots] = useState([]);
  const [clients, setClients] = useState([]);
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Wizard state
  const [showWizard, setShowWizard] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdLot, setCreatedLot] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    clientId: '',
    totalPieces: '',
    receivedDate: format(new Date(), 'yyyy-MM-dd'),
    subLots: [],
  });

  // Validation errors
  const [errors, setErrors] = useState({});

  // Preview lot number
  const [nextLotNumber, setNextLotNumber] = useState('');

  // Notification state
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

  useEffect(() => {
    if (showWizard) {
      loadNextLotNumber();
    }
  }, [showWizard]);

  const loadData = async () => {
    setLoading(true);
    setLoadError(null);
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
      setLoadError(error);
    } finally {
      setLoading(false);
    }
  };

  const loadNextLotNumber = async () => {
    try {
      const response = await api.lots.getNextLotNumber();
      setNextLotNumber(response.data.nextLotNumber);
    } catch (error) {
      console.error('Error loading next lot number:', error);
    }
  };

  const startNewOrder = () => {
    setShowWizard(true);
    setCurrentStep(1);
    setFormData({
      clientId: '',
      totalPieces: '',
      receivedDate: format(new Date(), 'yyyy-MM-dd'),
      subLots: [],
    });
    setErrors({});
    setCreatedLot(null);
  };

  const cancelWizard = () => {
    setShowWizard(false);
    setCurrentStep(1);
    setFormData({
      clientId: '',
      totalPieces: '',
      receivedDate: format(new Date(), 'yyyy-MM-dd'),
      subLots: [],
    });
    setErrors({});
    setCreatedLot(null);
  };

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.clientId) {
      newErrors.clientId = 'Please select a customer';
    }

    if (!formData.totalPieces || parseInt(formData.totalPieces) <= 0) {
      newErrors.totalPieces = 'Enter a quantity greater than 0';
    }

    if (!formData.receivedDate) {
      newErrors.receivedDate = 'Please select a date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (formData.subLots.length === 0) {
      newErrors.subLots = 'Add at least one sub-lot';
    }

    formData.subLots.forEach((subLot, index) => {
      if (!subLot.designId) {
        newErrors[`subLot${index}Design`] = 'Select a design';
      }
      if (!subLot.pieceCount || parseInt(subLot.pieceCount) <= 0) {
        newErrors[`subLot${index}Pieces`] = 'Enter quantity greater than 0';
      }
    });

    const totalPieces = parseInt(formData.totalPieces);
    const subLotTotal = formData.subLots.reduce((sum, sl) => sum + parseInt(sl.pieceCount || 0), 0);

    if (subLotTotal !== totalPieces) {
      newErrors.subLotTotal = `Sub-lot total (${subLotTotal}) must equal order quantity (${totalPieces})`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) {
      return;
    }

    if (currentStep === 2 && !validateStep2()) {
      return;
    }

    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const addSubLot = () => {
    setFormData({
      ...formData,
      subLots: [...formData.subLots, { designId: '', pieceCount: '' }],
    });
  };

  const updateSubLot = (index, field, value) => {
    const updatedSubLots = [...formData.subLots];
    updatedSubLots[index][field] = value;
    setFormData({ ...formData, subLots: updatedSubLots });

    // Clear error for this field when user starts typing
    const errorKey = `subLot${index}${field === 'designId' ? 'Design' : 'Pieces'}`;
    if (errors[errorKey]) {
      const newErrors = { ...errors };
      delete newErrors[errorKey];
      setErrors(newErrors);
    }
  };

  const removeSubLot = (index) => {
    const updatedSubLots = formData.subLots.filter((_, i) => i !== index);
    setFormData({ ...formData, subLots: updatedSubLots });
  };

  const handleCreateOrder = async () => {
    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await api.lots.create({
        clientId: parseInt(formData.clientId),
        totalPieces: parseInt(formData.totalPieces),
        receivedDate: formData.receivedDate,
        subLots: formData.subLots.map((sl) => ({
          designId: parseInt(sl.designId),
          pieceCount: parseInt(sl.pieceCount),
        })),
      });

      setCreatedLot(response.data);
      setCurrentStep(4);
      loadData();
    } catch (error) {
      console.error('Error creating lot:', error);
      const errorMessage = error.response?.data?.error || 'Failed to create order. Please try again.';
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
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

      setNotification({
        visible: true,
        message: 'Sub-lots allocated successfully',
        type: 'success',
      });
      loadData();
    } catch (error) {
      setNotification({
        visible: true,
        message: error.response?.data?.error || 'Failed to allocate sub-lots',
        type: 'error',
      });
    }
  };

  const handleDeleteLot = async (lot) => {
    try {
      const depCheck = await api.lots.checkDependencies(lot.id);

      if (depCheck.data.hasDependencies) {
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
            message: `Lot '${lot.lot_number}' deleted successfully`,
            type: 'success',
          });

          loadData();
        } catch (error) {
          const errorMessage = error.response?.data?.error || error.message || 'Failed to delete';
          const errorDetails = error.response?.data?.details || '';

          let userFriendlyMessage = `Unable to delete lot '${lot.lot_number}'`;

          if (errorDetails) {
            userFriendlyMessage = errorDetails;
          } else if (errorMessage.toLowerCase().includes('foreign key') ||
              errorMessage.toLowerCase().includes('constraint') ||
              errorMessage.toLowerCase().includes('referenced') ||
              errorMessage.toLowerCase().includes('assignments')) {
            userFriendlyMessage = `Cannot delete lot '${lot.lot_number}' because it is associated with production records`;
          } else if (errorMessage.toLowerCase().includes('not found')) {
            userFriendlyMessage = `Lot '${lot.lot_number}' not found`;
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
    await executeDelete();
  };

  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === parseInt(clientId));
    return client ? client.name : '';
  };

  const getDesignName = (designId) => {
    const design = designs.find(d => d.id === parseInt(designId));
    return design ? design.identifier : '';
  };

  if (loading) {
    return (
      <div className="inbound-container">
        <div className="inbound-header">
          <div>
            <h1>New Order</h1>
            <p className="page-subtitle">Create production orders</p>
          </div>
        </div>
        <Loading message="Loading order data..." size="lg" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="inbound-container">
        <div className="inbound-header">
          <div>
            <h1>New Order</h1>
            <p className="page-subtitle">Create production orders</p>
          </div>
        </div>
        <ErrorState
          title="Unable to load order data"
          description="There was a problem loading required data. Please try again."
          onRetry={loadData}
        />
      </div>
    );
  }

  return (
    <div className="inbound-container">
      {!showWizard ? (
        <>
          <div className="inbound-header">
            <div>
              <h1>New Order</h1>
              <p className="page-subtitle">Create and manage production orders</p>
            </div>
            <button className="btn btn-primary" onClick={startNewOrder}>
              Create Order
            </button>
          </div>

          <div className="card">
            <h2 className="section-title">Recent Orders</h2>
            {lots.length === 0 ? (
              <EmptyState
                icon="📦"
                title="No orders yet"
                description="Create your first production order to get started"
                action={
                  <button className="btn btn-primary" onClick={startNewOrder}>
                    Create Order
                  </button>
                }
              />
            ) : (
              <div className="lots-table-container">
                <table className="lots-table">
                  <thead>
                    <tr>
                      <th>Lot Number</th>
                      <th>Customer</th>
                      <th>Total Pieces</th>
                      <th>Received</th>
                      <th>Sub-Lots</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lots.map((lot) => (
                      <tr key={lot.id}>
                        <td>
                          <div className="table-cell-primary">{lot.lot_number}</div>
                        </td>
                        <td>
                          <div className="table-cell-secondary">{lot.client_name}</div>
                        </td>
                        <td>
                          <div className="table-cell-number">{lot.total_pieces}</div>
                        </td>
                        <td>
                          <div className="table-cell-secondary">
                            {format(new Date(lot.received_date), 'MMM dd, yyyy')}
                          </div>
                        </td>
                        <td>
                          <div className="table-cell-number">{lot.sublot_count || 0}</div>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button
                              className="btn btn-primary btn-sm"
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
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="wizard-container">
          <div className="wizard-header">
            <div>
              <h1>Create New Order</h1>
              <p className="page-subtitle">Follow the steps to create a production order</p>
            </div>
            {currentStep < 4 && (
              <button className="btn btn-ghost" onClick={cancelWizard}>
                Cancel
              </button>
            )}
          </div>

          {currentStep < 4 && (
            <WizardProgress steps={WIZARD_STEPS} currentStep={currentStep} />
          )}

          <div className="wizard-content">
            {/* Step 1: Order Details */}
            {currentStep === 1 && (
              <div className="wizard-step">
                <div className="wizard-step-header">
                  <h2>Order Details</h2>
                  <p className="step-description">Enter the basic information for this production order</p>
                </div>

                <div className="card wizard-card">
                  <div className="form-field">
                    <label className="form-label">Lot Number</label>
                    <div className="lot-preview">
                      <span className="lot-preview-value">{nextLotNumber || 'Loading...'}</span>
                      <span className="lot-preview-hint">Generated automatically</span>
                    </div>
                  </div>

                  <div className="form-field">
                    <label className="form-label">
                      Customer <span className="required">*</span>
                    </label>
                    <select
                      className={`select ${errors.clientId ? 'input-error' : ''}`}
                      value={formData.clientId}
                      onChange={(e) => {
                        setFormData({ ...formData, clientId: e.target.value });
                        if (errors.clientId) {
                          const newErrors = { ...errors };
                          delete newErrors.clientId;
                          setErrors(newErrors);
                        }
                      }}
                    >
                      <option value="">Select customer</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.name}
                        </option>
                      ))}
                    </select>
                    {errors.clientId && <div className="error-message">{errors.clientId}</div>}
                  </div>

                  <div className="form-row">
                    <div className="form-field">
                      <label className="form-label">
                        Order Quantity <span className="required">*</span>
                      </label>
                      <input
                        type="number"
                        className={`input ${errors.totalPieces ? 'input-error' : ''}`}
                        value={formData.totalPieces}
                        onChange={(e) => {
                          setFormData({ ...formData, totalPieces: e.target.value });
                          if (errors.totalPieces) {
                            const newErrors = { ...errors };
                            delete newErrors.totalPieces;
                            setErrors(newErrors);
                          }
                        }}
                        placeholder="Enter total pieces"
                        min="1"
                      />
                      {errors.totalPieces && <div className="error-message">{errors.totalPieces}</div>}
                    </div>

                    <div className="form-field">
                      <label className="form-label">
                        Received Date <span className="required">*</span>
                      </label>
                      <input
                        type="date"
                        className={`input ${errors.receivedDate ? 'input-error' : ''}`}
                        value={formData.receivedDate}
                        onChange={(e) => {
                          setFormData({ ...formData, receivedDate: e.target.value });
                          if (errors.receivedDate) {
                            const newErrors = { ...errors };
                            delete newErrors.receivedDate;
                            setErrors(newErrors);
                          }
                        }}
                      />
                      {errors.receivedDate && <div className="error-message">{errors.receivedDate}</div>}
                    </div>
                  </div>
                </div>

                <div className="wizard-actions">
                  <button className="btn btn-secondary" onClick={cancelWizard}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={handleNext}>
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Production Details */}
            {currentStep === 2 && (
              <div className="wizard-step">
                <div className="wizard-step-header">
                  <h2>Production Details</h2>
                  <p className="step-description">Break down the order into production sub-lots</p>
                </div>

                <div className="card wizard-card">
                  <div className="sublots-header">
                    <div>
                      <h3>Sub-Lots</h3>
                      {formData.subLots.length > 0 && (
                        <p className="sublots-hint">
                          Sub-lot numbers will be generated automatically
                        </p>
                      )}
                    </div>
                    <button type="button" className="btn btn-secondary" onClick={addSubLot}>
                      Add Sub-Lot
                    </button>
                  </div>

                  {errors.subLots && (
                    <div className="error-message">{errors.subLots}</div>
                  )}

                  {formData.subLots.length === 0 ? (
                    <EmptyState
                      icon="📋"
                      title="No sub-lots yet"
                      description="Add sub-lots to divide the order into production batches"
                      action={
                        <button className="btn btn-primary" onClick={addSubLot}>
                          Add Sub-Lot
                        </button>
                      }
                    />
                  ) : (
                    <div className="sublots-list">
                      {formData.subLots.map((subLot, index) => (
                        <div key={index} className="sublot-item">
                          <div className="sublot-number">
                            {nextLotNumber ? `${nextLotNumber}-SL-${index + 1}` : 'Loading...'}
                          </div>
                          <div className="sublot-fields">
                            <div className="form-field">
                              <label className="form-label">
                                Design <span className="required">*</span>
                              </label>
                              <select
                                className={`select ${errors[`subLot${index}Design`] ? 'input-error' : ''}`}
                                value={subLot.designId}
                                onChange={(e) => updateSubLot(index, 'designId', e.target.value)}
                              >
                                <option value="">Select design</option>
                                {designs.map((design) => (
                                  <option key={design.id} value={design.id}>
                                    {design.identifier}
                                  </option>
                                ))}
                              </select>
                              {errors[`subLot${index}Design`] && (
                                <div className="error-message">{errors[`subLot${index}Design`]}</div>
                              )}
                            </div>
                            <div className="form-field">
                              <label className="form-label">
                                Quantity <span className="required">*</span>
                              </label>
                              <input
                                type="number"
                                className={`input ${errors[`subLot${index}Pieces`] ? 'input-error' : ''}`}
                                placeholder="Pieces"
                                value={subLot.pieceCount}
                                onChange={(e) => updateSubLot(index, 'pieceCount', e.target.value)}
                                min="1"
                              />
                              {errors[`subLot${index}Pieces`] && (
                                <div className="error-message">{errors[`subLot${index}Pieces`]}</div>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            className="btn btn-ghost sublot-remove"
                            onClick={() => removeSubLot(index)}
                            aria-label="Remove sub-lot"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {errors.subLotTotal && (
                    <div className="error-message error-highlight">{errors.subLotTotal}</div>
                  )}

                  {formData.subLots.length > 0 && (
                    <div className="sublot-summary">
                      <div className="summary-item">
                        <span>Order Quantity:</span>
                        <strong>{formData.totalPieces || 0} pieces</strong>
                      </div>
                      <div className="summary-item">
                        <span>Sub-Lot Total:</span>
                        <strong>
                          {formData.subLots.reduce((sum, sl) => sum + parseInt(sl.pieceCount || 0), 0)} pieces
                        </strong>
                      </div>
                    </div>
                  )}
                </div>

                <div className="wizard-actions">
                  <button className="btn btn-secondary" onClick={handleBack}>
                    Back
                  </button>
                  <button className="btn btn-primary" onClick={handleNext}>
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {currentStep === 3 && (
              <div className="wizard-step">
                <div className="wizard-step-header">
                  <h2>Review Order</h2>
                  <p className="step-description">Confirm all details before creating the order</p>
                </div>

                <div className="card wizard-card">
                  <div className="review-section">
                    <h3 className="review-section-title">Order Information</h3>
                    <div className="review-grid">
                      <div className="review-item">
                        <span className="review-label">Lot Number</span>
                        <span className="review-value">{nextLotNumber || 'Will be generated'}</span>
                      </div>
                      <div className="review-item">
                        <span className="review-label">Customer</span>
                        <span className="review-value">{getClientName(formData.clientId)}</span>
                      </div>
                      <div className="review-item">
                        <span className="review-label">Order Quantity</span>
                        <span className="review-value">{formData.totalPieces} pieces</span>
                      </div>
                      <div className="review-item">
                        <span className="review-label">Received Date</span>
                        <span className="review-value">
                          {format(new Date(formData.receivedDate), 'MMMM dd, yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="review-section">
                    <h3 className="review-section-title">Production Sub-Lots</h3>
                    <div className="review-sublots">
                      {formData.subLots.map((subLot, index) => (
                        <div key={index} className="review-sublot">
                          <div className="review-sublot-number">
                            {nextLotNumber ? `${nextLotNumber}-SL-${index + 1}` : 'Will be generated'}
                          </div>
                          <div className="review-sublot-details">
                            <div className="review-sublot-item">
                              <span className="review-label">Design:</span>
                              <span>{getDesignName(subLot.designId)}</span>
                            </div>
                            <div className="review-sublot-item">
                              <span className="review-label">Quantity:</span>
                              <span>{subLot.pieceCount} pieces</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {errors.submit && (
                    <div className="error-message error-highlight">{errors.submit}</div>
                  )}
                </div>

                <div className="wizard-actions">
                  <button className="btn btn-secondary" onClick={handleBack} disabled={isSubmitting}>
                    Back
                  </button>
                  <button
                    className={`btn btn-primary ${isSubmitting ? 'btn-loading' : ''}`}
                    onClick={handleCreateOrder}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating...' : 'Create Order'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Success */}
            {currentStep === 4 && createdLot && (
              <div className="wizard-step">
                <div className="success-state">
                  <div className="success-icon">✓</div>
                  <h2>Order Created Successfully</h2>
                  <p className="success-description">
                    Your production order has been created and is ready for allocation
                  </p>

                  <div className="card success-card">
                    <div className="success-details">
                      <div className="success-detail-item">
                        <span className="success-detail-label">Lot Number</span>
                        <span className="success-detail-value">{createdLot.lot_number}</span>
                      </div>
                      <div className="success-detail-item">
                        <span className="success-detail-label">Customer</span>
                        <span className="success-detail-value">{getClientName(formData.clientId)}</span>
                      </div>
                      <div className="success-detail-item">
                        <span className="success-detail-label">Total Quantity</span>
                        <span className="success-detail-value">{createdLot.total_pieces} pieces</span>
                      </div>
                    </div>

                    {createdLot.subLots && createdLot.subLots.length > 0 && (
                      <>
                        <div className="success-divider"></div>
                        <div className="success-sublots">
                          <h4>Sub-Lots Created</h4>
                          {createdLot.subLots.map((subLot) => (
                            <div key={subLot.id} className="success-sublot">
                              <span className="success-sublot-number">{subLot.sub_lot_number}</span>
                              <span className="success-sublot-design">{getDesignName(subLot.design_id)}</span>
                              <span className="success-sublot-quantity">{subLot.piece_count} pieces</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="success-actions">
                    <button className="btn btn-secondary" onClick={cancelWizard}>
                      View Orders
                    </button>
                    <button className="btn btn-primary" onClick={startNewOrder}>
                      Create Another Order
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
