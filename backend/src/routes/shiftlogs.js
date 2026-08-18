import express from 'express';
import ShiftLog from '../models/ShiftLog.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { machineId, operatorId, designId, fromDate, toDate } = req.query;
    const shiftLogs = await ShiftLog.findAll({
      machineId,
      operatorId,
      designId,
      fromDate,
      toDate,
    });
    res.json(shiftLogs);
  } catch (error) {
    console.error('Error fetching shift logs:', error);
    res.status(500).json({ error: 'Failed to fetch shift logs' });
  }
});

router.get('/previous-running', async (req, res) => {
  try {
    const { machineId, designId, beforeDate, beforeShiftType } = req.query;

    console.log('📊 Previous running request (raw):', { machineId, designId, beforeDate, beforeShiftType });

    if (!machineId || !designId) {
      return res.status(400).json({ error: 'Machine ID and design ID are required' });
    }

    // Convert to integers to ensure proper comparison
    const previousRunning = await ShiftLog.getPreviousRunningStitches(
      parseInt(machineId),
      parseInt(designId),
      beforeDate,
      beforeShiftType
    );

    console.log('📊 Previous running result:', previousRunning);
    res.json({ previousRunningStitches: previousRunning });
  } catch (error) {
    console.error('Error fetching previous running stitches:', error);
    res.status(500).json({ error: 'Failed to fetch previous running stitches' });
  }
});

router.get('/daily-production', async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    const production = await ShiftLog.getDailyProduction(date);
    res.json(production);
  } catch (error) {
    console.error('Error fetching daily production:', error);
    res.status(500).json({ error: 'Failed to fetch daily production' });
  }
});

router.get('/salary-report/:operatorId', async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;

    if (!fromDate || !toDate) {
      return res.status(400).json({ error: 'From date and to date are required' });
    }

    const report = await ShiftLog.getOperatorSalaryReport(
      req.params.operatorId,
      fromDate,
      toDate
    );
    res.json(report);
  } catch (error) {
    console.error('Error fetching salary report:', error);
    res.status(500).json({ error: 'Failed to fetch salary report' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const shiftLog = await ShiftLog.findById(req.params.id);
    if (!shiftLog) {
      return res.status(404).json({ error: 'Shift log not found' });
    }
    res.json(shiftLog);
  } catch (error) {
    console.error('Error fetching shift log:', error);
    res.status(500).json({ error: 'Failed to fetch shift log' });
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      machineId,
      operatorId,
      designId,
      assignmentId,
      shiftDate,
      shiftType,
      currentRunningStitches,
      roundsCompleted,
    } = req.body;

    if (
      !machineId ||
      !operatorId ||
      !designId ||
      !shiftDate ||
      !shiftType ||
      currentRunningStitches === undefined ||
      roundsCompleted === undefined
    ) {
      return res.status(400).json({
        error: 'All required fields must be provided',
      });
    }

    const shiftLog = await ShiftLog.create({
      machineId,
      operatorId,
      designId,
      assignmentId,
      shiftDate,
      shiftType,
      currentRunningStitches,
      roundsCompleted,
    });

    res.status(201).json(shiftLog);
  } catch (error) {
    console.error('Error creating shift log:', error);
    if (error.message.includes('Validation failed')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create shift log' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const shiftLog = await ShiftLog.delete(req.params.id);
    if (!shiftLog) {
      return res.status(404).json({ error: 'Shift log not found' });
    }
    res.json({ message: 'Shift log deleted successfully' });
  } catch (error) {
    console.error('Error deleting shift log:', error);
    res.status(500).json({ error: 'Failed to delete shift log' });
  }
});

export default router;
