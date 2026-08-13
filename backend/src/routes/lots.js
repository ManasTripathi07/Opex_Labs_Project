import express from 'express';
import Lot from '../models/Lot.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { clientId, fromDate, toDate } = req.query;
    const lots = await Lot.findAll({ clientId, fromDate, toDate });
    res.json(lots);
  } catch (error) {
    console.error('Error fetching lots:', error);
    res.status(500).json({ error: 'Failed to fetch lots' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const lot = await Lot.findByIdWithSubLots(req.params.id);
    if (!lot) {
      return res.status(404).json({ error: 'Lot not found' });
    }
    res.json(lot);
  } catch (error) {
    console.error('Error fetching lot:', error);
    res.status(500).json({ error: 'Failed to fetch lot' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { lotNumber, clientId, totalPieces, receivedDate, subLots } = req.body;

    if (!lotNumber || !clientId || !totalPieces || !receivedDate) {
      return res.status(400).json({
        error: 'Lot number, client ID, total pieces, and received date are required',
      });
    }

    if (totalPieces <= 0) {
      return res.status(400).json({ error: 'Total pieces must be positive' });
    }

    const lot = await Lot.create({
      lotNumber,
      clientId,
      totalPieces,
      receivedDate,
      subLots,
    });
    res.status(201).json(lot);
  } catch (error) {
    console.error('Error creating lot:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Lot number already exists' });
    }
    if (error.message.includes('Sub-lot pieces')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create lot' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { lotNumber, clientId, totalPieces, receivedDate } = req.body;

    if (!lotNumber || !clientId || !totalPieces || !receivedDate) {
      return res.status(400).json({
        error: 'Lot number, client ID, total pieces, and received date are required',
      });
    }

    if (totalPieces <= 0) {
      return res.status(400).json({ error: 'Total pieces must be positive' });
    }

    const lot = await Lot.update(req.params.id, {
      lotNumber,
      clientId,
      totalPieces,
      receivedDate,
    });
    if (!lot) {
      return res.status(404).json({ error: 'Lot not found' });
    }
    res.json(lot);
  } catch (error) {
    console.error('Error updating lot:', error);
    res.status(500).json({ error: 'Failed to update lot' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const lot = await Lot.delete(req.params.id);
    if (!lot) {
      return res.status(404).json({ error: 'Lot not found' });
    }
    res.json({ message: 'Lot deleted successfully' });
  } catch (error) {
    console.error('Error deleting lot:', error);
    res.status(500).json({ error: 'Failed to delete lot' });
  }
});

export default router;
