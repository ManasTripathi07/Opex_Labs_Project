import express from 'express';
import SubLot from '../models/SubLot.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { state, designId } = req.query;
    const subLots = await SubLot.findAll({ state, designId });
    res.json(subLots);
  } catch (error) {
    console.error('Error fetching sub-lots:', error);
    res.status(500).json({ error: 'Failed to fetch sub-lots' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const subLot = await SubLot.findById(req.params.id);
    if (!subLot) {
      return res.status(404).json({ error: 'Sub-lot not found' });
    }
    res.json(subLot);
  } catch (error) {
    console.error('Error fetching sub-lot:', error);
    res.status(500).json({ error: 'Failed to fetch sub-lot' });
  }
});

router.put('/:id/state', async (req, res) => {
  try {
    const { state } = req.body;

    if (!state) {
      return res.status(400).json({ error: 'State is required' });
    }

    const subLot = await SubLot.updateState(req.params.id, state);
    res.json(subLot);
  } catch (error) {
    console.error('Error updating sub-lot state:', error);
    if (error.message.includes('Invalid state')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update sub-lot state' });
  }
});

router.get('/:id/history', async (req, res) => {
  try {
    const history = await SubLot.getStateHistory(req.params.id);
    res.json(history);
  } catch (error) {
    console.error('Error fetching sub-lot history:', error);
    res.status(500).json({ error: 'Failed to fetch sub-lot history' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const subLot = await SubLot.delete(req.params.id);
    if (!subLot) {
      return res.status(404).json({ error: 'Sub-lot not found' });
    }
    res.json({ message: 'Sub-lot deleted successfully' });
  } catch (error) {
    console.error('Error deleting sub-lot:', error);
    res.status(500).json({ error: 'Failed to delete sub-lot' });
  }
});

export default router;
