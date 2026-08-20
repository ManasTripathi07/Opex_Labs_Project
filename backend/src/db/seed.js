import pool from './connection.js';
import Client from '../models/Client.js';
import Design from '../models/Design.js';
import Machine from '../models/Machine.js';
import Operator from '../models/Operator.js';
import Lot from '../models/Lot.js';

async function seed() {
  console.log('🌱 Starting database seeding...\n');

  try {
    console.log('Creating clients...');
    const clients = await Promise.all([
      Client.create({ name: 'ABC Textiles', phone: '+91 98765 43210' }),
      Client.create({ name: 'XYZ Exports', phone: '+91 98765 43211' }),
      Client.create({ name: 'Fashion House Inc', phone: '+91 98765 43212' }),
    ]);
    console.log(`✓ Created ${clients.length} clients\n`);

    console.log('Creating designs...');
    const designs = await Promise.all([
      Design.create({
        identifier: 'ROSE-001',
        stitchesPerPiece: 578293,
        ratePerStitch: 0.0015,
      }),
      Design.create({
        identifier: 'LOTUS-002',
        stitchesPerPiece: 423156,
        ratePerStitch: 0.0018,
      }),
      Design.create({
        identifier: 'PEACOCK-003',
        stitchesPerPiece: 892340,
        ratePerStitch: 0.0020,
      }),
      Design.create({
        identifier: 'BUTTERFLY-004',
        stitchesPerPiece: 234567,
        ratePerStitch: 0.0012,
      }),
    ]);
    console.log(`✓ Created ${designs.length} designs\n`);

    console.log('Creating operators...');
    const operators = await Promise.all([
      Operator.create({ name: 'Rajesh Kumar', phone: '+91 98765 00001' }),
      Operator.create({ name: 'Priya Sharma', phone: '+91 98765 00002' }),
      Operator.create({ name: 'Amit Patel', phone: '+91 98765 00003' }),
      Operator.create({ name: 'Sunita Devi', phone: '+91 98765 00004' }),
      Operator.create({ name: 'Vijay Singh', phone: '+91 98765 00005' }),
    ]);
    console.log(`✓ Created ${operators.length} operators\n`);

    console.log('Creating machines...');
    const machines = await Promise.all([
      Machine.create({
        identifier: 'M-001',
        name: 'Tajima TMEX-C1501',
        rotations: [
          { designId: designs[0].id, piecesPerRound: 6 },
          { designId: designs[1].id, piecesPerRound: 8 },
        ],
      }),
      Machine.create({
        identifier: 'M-002',
        name: 'Barudan BENSAI-YS',
        rotations: [
          { designId: designs[0].id, piecesPerRound: 6 },
          { designId: designs[2].id, piecesPerRound: 4 },
        ],
      }),
      Machine.create({
        identifier: 'M-003',
        name: 'Tajima TMEF-H620',
        rotations: [
          { designId: designs[1].id, piecesPerRound: 8 },
          { designId: designs[3].id, piecesPerRound: 12 },
        ],
      }),
      Machine.create({
        identifier: 'M-004',
        name: 'Barudan BEAT-S901',
        rotations: [
          { designId: designs[2].id, piecesPerRound: 4 },
          { designId: designs[3].id, piecesPerRound: 12 },
        ],
      }),
    ]);
    console.log(`✓ Created ${machines.length} machines\n`);

    console.log('Creating sample lots...');
    const today = new Date().toISOString().split('T')[0];
    const lots = await Promise.all([
      Lot.create({
        clientId: clients[0].id,
        totalPieces: 1000,
        receivedDate: today,
        subLots: [
          {
            designId: designs[0].id,
            pieceCount: 600,
          },
          {
            designId: designs[1].id,
            pieceCount: 400,
          },
        ],
      }),
      Lot.create({
        clientId: clients[1].id,
        totalPieces: 1500,
        receivedDate: today,
        subLots: [
          {
            designId: designs[2].id,
            pieceCount: 800,
          },
          {
            designId: designs[3].id,
            pieceCount: 700,
          },
        ],
      }),
    ]);
    console.log(`✓ Created ${lots.length} lots\n`);

    console.log('✅ Database seeding completed successfully!\n');
    console.log('Summary:');
    console.log(`  - ${clients.length} clients`);
    console.log(`  - ${designs.length} designs`);
    console.log(`  - ${operators.length} operators`);
    console.log(`  - ${machines.length} machines`);
    console.log(`  - ${lots.length} lots`);
    console.log('\nYou can now start using the application with sample data.');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

seed();
