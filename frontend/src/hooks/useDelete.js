import { useState } from 'react';

export function useDelete() {
  const [deleteState, setDeleteState] = useState({
    isOpen: false,
    isLoading: false,
    item: null,
    onConfirm: null,
  });

  const openDialog = (item, onConfirm) => {
    setDeleteState({
      isOpen: true,
      isLoading: false,
      item,
      onConfirm,
    });
  };

  const closeDialog = () => {
    if (!deleteState.isLoading) {
      setDeleteState({
        isOpen: false,
        isLoading: false,
        item: null,
        onConfirm: null,
      });
    }
  };

  const executeDelete = async () => {
    if (!deleteState.onConfirm) return;

    setDeleteState((prev) => ({ ...prev, isLoading: true }));

    try {
      await deleteState.onConfirm();
      closeDialog();
      return { success: true };
    } catch (error) {
      setDeleteState((prev) => ({ ...prev, isLoading: false }));
      return { success: false, error };
    }
  };

  return {
    deleteState,
    openDialog,
    closeDialog,
    executeDelete,
  };
}
