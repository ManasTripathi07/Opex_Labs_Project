import express from 'express';
import Assignment from '../models/Assignment.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { machineId, status } = req.query;
    const assignments = await Assignment.findAll({ machineId, status });
    res.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

router.get('/machine/:machineId/active', async (req, res) => {
  try {
    const assignment = await Assignment.getActiveAssignmentForMachine(req.params.machineId);
    if (!assignment) {
      return res.status(404).json({ error: 'No active assignment for this machine' });
    }
    res.json(assignment);
  } catch (error) {
    console.error('Error fetching active assignment:', error);
    res.status(500).json({ error: 'Failed to fetch active assignment' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    res.json(assignment);
  } catch (error) {
    console.error('Error fetching assignment:', error);
    res.status(500).json({ error: 'Failed to fetch assignment' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { machineId, subLotId, piecesIssued } = req.body;

    if (!machineId || !subLotId || !piecesIssued) {
      return res.status(400).json({
        error: 'Machine ID, sub-lot ID, and pieces issued are required',
      });
    }

    if (piecesIssued <= 0) {
      return res.status(400).json({ error: 'Pieces issued must be positive' });
    }

    const assignment = await Assignment.create({ machineId, subLotId, piecesIssued });
    res.status(201).json(assignment);
  } catch (error) {
    console.error('Error creating assignment:', error);
    if (error.message.includes('already has an active assignment')) {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create assignment' });
  }
});

router.put('/:id/progress', async (req, res) => {
  try {
    const { piecesCompleted } = req.body;

    if (piecesCompleted === undefined || piecesCompleted === null) {
      return res.status(400).json({ error: 'Pieces completed is required' });
    }

    const assignment = await Assignment.updateProgress(req.params.id, piecesCompleted);
    res.json(assignment);
  } catch (error) {
    console.error('Error updating assignment progress:', error);
    if (error.message.includes('cannot exceed')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update assignment progress' });
  }
});

router.put('/:id/complete', async (req, res) => {
  try {
    const assignment = await Assignment.complete(req.params.id);
    res.json(assignment);
  } catch (error) {
    console.error('Error completing assignment:', error);
    res.status(500).json({ error: 'Failed to complete assignment' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const assignment = await Assignment.delete(req.params.id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({ error: 'Failed to delete assignment' });
  }
});

export default router;
