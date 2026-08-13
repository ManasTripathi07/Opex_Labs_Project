import express from 'express';
import Design from '../models/Design.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    const designs = await Design.findAll(search);
    res.json(designs);
  } catch (error) {
    console.error('Error fetching designs:', error);
    res.status(500).json({ error: 'Failed to fetch designs' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design) {
      return res.status(404).json({ error: 'Design not found' });
    }
    res.json(design);
  } catch (error) {
    console.error('Error fetching design:', error);
    res.status(500).json({ error: 'Failed to fetch design' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { identifier, stitchesPerPiece, ratePerStitch } = req.body;

    if (!identifier || !stitchesPerPiece) {
      return res.status(400).json({ error: 'Identifier and stitchesPerPiece are required' });
    }

    if (stitchesPerPiece <= 0) {
      return res.status(400).json({ error: 'Stitches per piece must be positive' });
    }

    const design = await Design.create({ identifier, stitchesPerPiece, ratePerStitch });
    res.status(201).json(design);
  } catch (error) {
    console.error('Error creating design:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Design identifier already exists' });
    }
    res.status(500).json({ error: 'Failed to create design' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { identifier, stitchesPerPiece, ratePerStitch } = req.body;

    if (!identifier || !stitchesPerPiece) {
      return res.status(400).json({ error: 'Identifier and stitchesPerPiece are required' });
    }

    if (stitchesPerPiece <= 0) {
      return res.status(400).json({ error: 'Stitches per piece must be positive' });
    }

    const design = await Design.update(req.params.id, { identifier, stitchesPerPiece, ratePerStitch });
    if (!design) {
      return res.status(404).json({ error: 'Design not found' });
    }
    res.json(design);
  } catch (error) {
    console.error('Error updating design:', error);
    res.status(500).json({ error: 'Failed to update design' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const design = await Design.delete(req.params.id);
    if (!design) {
      return res.status(404).json({ error: 'Design not found' });
    }
    res.json({ message: 'Design deleted successfully' });
  } catch (error) {
    console.error('Error deleting design:', error);
    res.status(500).json({ error: 'Failed to delete design' });
  }
});

export default router;
