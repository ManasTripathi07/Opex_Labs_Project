import { query, getClient } from '../db/connection.js';

export class Lot {
  /**
   * Generate next available lot number in format: LOT-YYYY-NNN
   * Thread-safe implementation using database-level locking
   */
  static async generateLotNumber(client = null) {
    const shouldReleaseClient = !client;
    const shouldManageTransaction = !client;

    if (!client) {
      client = await getClient();
    }

    try {
      const year = new Date().getFullYear();

      // Start transaction if we're managing it
      if (shouldManageTransaction) {
        await client.query('BEGIN');
      }

      // Lock the table to prevent concurrent lot creation race conditions
      await client.query('LOCK TABLE lots IN SHARE ROW EXCLUSIVE MODE');

      // Find the highest sequence number for this year
      const result = await client.query(
        `SELECT lot_number FROM lots
         WHERE lot_number LIKE $1
         ORDER BY lot_number DESC
         LIMIT 1`,
        [`LOT-${year}-%`]
      );

      let sequence = 1;
      if (result.rows.length > 0) {
        const lastLotNumber = result.rows[0].lot_number;
        const match = lastLotNumber.match(/LOT-\d{4}-(\d{3})/);
        if (match) {
          sequence = parseInt(match[1]) + 1;
        }
      }

      const lotNumber = `LOT-${year}-${String(sequence).padStart(3, '0')}`;

      // Commit transaction if we're managing it
      if (shouldManageTransaction) {
        await client.query('COMMIT');
      }

      return lotNumber;
    } catch (error) {
      // Rollback transaction if we're managing it
      if (shouldManageTransaction) {
        await client.query('ROLLBACK');
      }
      throw error;
    } finally {
      if (shouldReleaseClient) {
        client.release();
      }
    }
  }

  /**
   * Generate sub-lot numbers for a parent lot
   * Format: {PARENT_LOT}-SL-{N}
   */
  static generateSubLotNumbers(parentLotNumber, count) {
    const subLotNumbers = [];
    for (let i = 1; i <= count; i++) {
      subLotNumbers.push(`${parentLotNumber}-SL-${i}`);
    }
    return subLotNumbers;
  }

  static async findAll({ clientId = null, fromDate = null, toDate = null } = {}) {
    let sql = `
      SELECT l.*, c.name as client_name, COUNT(sl.id) as sublot_count
      FROM lots l
      JOIN clients c ON l.client_id = c.id
      LEFT JOIN sub_lots sl ON sl.lot_id = l.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (clientId) {
      sql += ` AND l.client_id = $${paramCount}`;
      params.push(clientId);
      paramCount++;
    }

    if (fromDate) {
      sql += ` AND l.received_date >= $${paramCount}`;
      params.push(fromDate);
      paramCount++;
    }

    if (toDate) {
      sql += ` AND l.received_date <= $${paramCount}`;
      params.push(toDate);
      paramCount++;
    }

    sql += ' GROUP BY l.id, c.name ORDER BY l.received_date DESC, l.lot_number DESC';

    const result = await query(sql, params);
    return result.rows;
  }

  static async findById(id) {
    const result = await query(
      `SELECT l.*, c.name as client_name
       FROM lots l
       JOIN clients c ON l.client_id = c.id
       WHERE l.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async findByIdWithSubLots(id) {
    const lot = await this.findById(id);
    if (!lot) return null;

    const subLots = await query(
      `SELECT sl.*, d.identifier as design_identifier, d.stitches_per_piece
       FROM sub_lots sl
       JOIN designs d ON sl.design_id = d.id
       WHERE sl.lot_id = $1
       ORDER BY sl.sub_lot_number ASC`,
      [id]
    );

    lot.subLots = subLots.rows;
    return lot;
  }

  static async create({ clientId, totalPieces, receivedDate, subLots = [] }) {
    const client = await getClient();

    try {
      await client.query('BEGIN');

      // Always auto-generate lot number (Phase 1: Input Standardization)
      const lotNumber = await this.generateLotNumber(client);

      const lotResult = await client.query(
        'INSERT INTO lots (lot_number, client_id, total_pieces, received_date) VALUES ($1, $2, $3, $4) RETURNING *',
        [lotNumber, clientId, totalPieces, receivedDate]
      );
      const lot = lotResult.rows[0];

      if (subLots && subLots.length > 0) {
        const totalSubLotPieces = subLots.reduce((sum, sl) => sum + sl.pieceCount, 0);
        if (totalSubLotPieces !== totalPieces) {
          throw new Error(`Sub-lot pieces (${totalSubLotPieces}) must equal lot total pieces (${totalPieces})`);
        }

        // Auto-generate sub-lot numbers (Phase 1: Input Standardization)
        const subLotNumbers = this.generateSubLotNumbers(lot.lot_number, subLots.length);

        for (let i = 0; i < subLots.length; i++) {
          const subLot = subLots[i];
          // Always use generated number (no manual override)
          const subLotNumber = subLotNumbers[i];

          await client.query(
            'INSERT INTO sub_lots (lot_id, sub_lot_number, design_id, piece_count) VALUES ($1, $2, $3, $4)',
            [lot.id, subLotNumber, subLot.designId, subLot.pieceCount]
          );
        }
      }

      await client.query('COMMIT');
      return await this.findByIdWithSubLots(lot.id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async update(id, { lotNumber, clientId, totalPieces, receivedDate }) {
    const result = await query(
      'UPDATE lots SET lot_number = $1, client_id = $2, total_pieces = $3, received_date = $4 WHERE id = $5 RETURNING *',
      [lotNumber, clientId, totalPieces, receivedDate, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await query('DELETE FROM lots WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
}

export default Lot;
