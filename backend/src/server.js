import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import clientsRouter from './routes/clients.js';
import designsRouter from './routes/designs.js';
import machinesRouter from './routes/machines.js';
import operatorsRouter from './routes/operators.js';
import lotsRouter from './routes/lots.js';
import sublotsRouter from './routes/sublots.js';
import assignmentsRouter from './routes/assignments.js';
import shiftlogsRouter from './routes/shiftlogs.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/clients', clientsRouter);
app.use('/api/designs', designsRouter);
app.use('/api/machines', machinesRouter);
app.use('/api/operators', operatorsRouter);
app.use('/api/lots', lotsRouter);
app.use('/api/sublots', sublotsRouter);
app.use('/api/assignments', assignmentsRouter);
app.use('/api/shiftlogs', shiftlogsRouter);

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Production Tracker API running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health\n`);
});

export default app;
