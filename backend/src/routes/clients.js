import express from 'express';
import Client from '../models/Client.js';
import { query } from '../db/connection.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    const clients = await Client.findAll(search);
    res.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({ error: 'Failed to fetch client' });
  }
});

// Check dependencies before deleting
router.get('/:id/dependencies', async (req, res) => {
  try {
    const result = await query(
      `SELECT COUNT(*) as lot_count FROM lots WHERE client_id = $1`,
      [req.params.id]
    );

    const lotCount = parseInt(result.rows[0].lot_count);

    // If lots exist, get sub-lot count too
    let subLotCount = 0;
    if (lotCount > 0) {
      const subLotResult = await query(
        `SELECT COUNT(*) as sublot_count
         FROM sub_lots sl
         JOIN lots l ON sl.lot_id = l.id
         WHERE l.client_id = $1`,
        [req.params.id]
      );
      subLotCount = parseInt(subLotResult.rows[0].sublot_count);
    }

    res.json({
      hasDependencies: lotCount > 0,
      dependencies: {
        lots: lotCount,
        subLots: subLotCount
      }
    });
  } catch (error) {
    console.error('Error checking dependencies:', error);
    res.status(500).json({ error: 'Failed to check dependencies' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const client = await Client.create({ name, phone });
    res.status(201).json(client);
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ error: 'Failed to create client' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const client = await Client.update(req.params.id, { name, phone });
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ error: 'Failed to update client' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    // Check if client has lots (which will cause FK constraint error)
    const lotCheck = await query(
      'SELECT COUNT(*) as count FROM lots WHERE client_id = $1',
      [req.params.id]
    );

    const lotCount = parseInt(lotCheck.rows[0].count);

    if (lotCount > 0) {
      return res.status(409).json({
        error: 'Client has existing lots',
        details: `Cannot delete client because it has ${lotCount} associated lot(s). Delete those lots first.`,
        dependencyCount: lotCount
      });
    }

    const client = await Client.delete(req.params.id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ error: 'Failed to delete client' });
  }
});

export default router;
