import express from 'express';
import Machine from '../models/Machine.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    const machines = await Machine.findAll(search);
    res.json(machines);
  } catch (error) {
    console.error('Error fetching machines:', error);
    res.status(500).json({ error: 'Failed to fetch machines' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const machine = await Machine.findByIdWithRotations(req.params.id);
    if (!machine) {
      return res.status(404).json({ error: 'Machine not found' });
    }
    res.json(machine);
  } catch (error) {
    console.error('Error fetching machine:', error);
    res.status(500).json({ error: 'Failed to fetch machine' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { identifier, name, rotations } = req.body;

    if (!identifier || !name) {
      return res.status(400).json({ error: 'Identifier and name are required' });
    }

    const machine = await Machine.create({ identifier, name, rotations });
    res.status(201).json(machine);
  } catch (error) {
    console.error('Error creating machine:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Machine identifier already exists' });
    }
    res.status(500).json({ error: 'Failed to create machine' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { identifier, name } = req.body;

    if (!identifier || !name) {
      return res.status(400).json({ error: 'Identifier and name are required' });
    }

    const machine = await Machine.update(req.params.id, { identifier, name });
    if (!machine) {
      return res.status(404).json({ error: 'Machine not found' });
    }
    res.json(machine);
  } catch (error) {
    console.error('Error updating machine:', error);
    res.status(500).json({ error: 'Failed to update machine' });
  }
});

router.put('/:id/rotations', async (req, res) => {
  try {
    const { rotations } = req.body;

    if (!Array.isArray(rotations)) {
      return res.status(400).json({ error: 'Rotations must be an array' });
    }

    const machine = await Machine.updateRotations(req.params.id, rotations);
    res.json(machine);
  } catch (error) {
    console.error('Error updating machine rotations:', error);
    res.status(500).json({ error: 'Failed to update machine rotations' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const machine = await Machine.delete(req.params.id);
    if (!machine) {
      return res.status(404).json({ error: 'Machine not found' });
    }
    res.json({ message: 'Machine deleted successfully' });
  } catch (error) {
    console.error('Error deleting machine:', error);
    res.status(500).json({ error: 'Failed to delete machine' });
  }
});

export default router;
