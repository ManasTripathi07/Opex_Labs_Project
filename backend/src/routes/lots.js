import express from 'express';
import Lot from '../models/Lot.js';
import { query } from '../db/connection.js';

const router = express.Router();

// Get next available lot number (Phase 1: Input Standardization)
router.get('/next-lot-number', async (req, res) => {
  try {
    const nextLotNumber = await Lot.generateLotNumber();
    res.json({ nextLotNumber });
  } catch (error) {
    console.error('Error generating next lot number:', error);
    res.status(500).json({ error: 'Failed to generate lot number' });
  }
});

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

    // Phase 1: Reject manual lot number specification
    if (lotNumber !== undefined) {
      return res.status(400).json({
        error: 'Lot number cannot be manually specified. It is generated automatically.',
      });
    }

    // Phase 1: Reject manual sub-lot number specification
    if (subLots && subLots.some(sl => sl.subLotNumber !== undefined)) {
      return res.status(400).json({
        error: 'Sub-lot numbers cannot be manually specified. They are generated automatically.',
      });
    }

    if (!clientId || !totalPieces || !receivedDate) {
      return res.status(400).json({
        error: 'Client ID, total pieces, and received date are required',
      });
    }

    if (totalPieces <= 0) {
      return res.status(400).json({ error: 'Total pieces must be positive' });
    }

    const lot = await Lot.create({
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

// Check dependencies before deleting lot
router.get('/:id/dependencies', async (req, res) => {
  try {
    // Get sub-lots count
    const subLotResult = await query(
      'SELECT COUNT(*) as sublot_count FROM sub_lots WHERE lot_id = $1',
      [req.params.id]
    );

    // Get assignments count for this lot's sub-lots
    const assignmentResult = await query(
      `SELECT COUNT(*) as assignment_count
       FROM assignments a
       JOIN sub_lots sl ON a.sub_lot_id = sl.id
       WHERE sl.lot_id = $1`,
      [req.params.id]
    );

    // Get shift logs count
    const shiftLogResult = await query(
      `SELECT COUNT(*) as shift_log_count
       FROM shift_logs slog
       JOIN assignments a ON slog.assignment_id = a.id
       JOIN sub_lots sl ON a.sub_lot_id = sl.id
       WHERE sl.lot_id = $1`,
      [req.params.id]
    );

    const subLotCount = parseInt(subLotResult.rows[0].sublot_count);
    const assignmentCount = parseInt(assignmentResult.rows[0].assignment_count);
    const shiftLogCount = parseInt(shiftLogResult.rows[0].shift_log_count);

    res.json({
      hasDependencies: subLotCount > 0 || assignmentCount > 0 || shiftLogCount > 0,
      dependencies: {
        subLots: subLotCount,
        assignments: assignmentCount,
        shiftLogs: shiftLogCount
      }
    });
  } catch (error) {
    console.error('Error checking lot dependencies:', error);
    res.status(500).json({ error: 'Failed to check dependencies' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    // Check for assignments (will prevent deletion)
    const assignmentCheck = await query(
      `SELECT COUNT(*) as count
       FROM assignments a
       JOIN sub_lots sl ON a.sub_lot_id = sl.id
       WHERE sl.lot_id = $1`,
      [req.params.id]
    );

    const assignmentCount = parseInt(assignmentCheck.rows[0].count);

    if (assignmentCount > 0) {
      return res.status(409).json({
        error: 'Lot has existing assignments',
        details: `Cannot delete lot because it has ${assignmentCount} associated assignment(s). This lot is currently in production.`,
        dependencyCount: assignmentCount
      });
    }

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
