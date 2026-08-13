import { query, getClient } from '../db/connection.js';

export class Assignment {
  static async findAll({ machineId = null, status = null } = {}) {
    let sql = `
      SELECT a.*, m.identifier as machine_identifier, m.name as machine_name,
             sl.sub_lot_number, sl.piece_count as sub_lot_total_pieces,
             d.identifier as design_identifier, d.stitches_per_piece
      FROM assignments a
      JOIN machines m ON a.machine_id = m.id
      JOIN sub_lots sl ON a.sub_lot_id = sl.id
      JOIN designs d ON sl.design_id = d.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (machineId) {
      sql += ` AND a.machine_id = $${paramCount}`;
      params.push(machineId);
      paramCount++;
    }

    if (status) {
      sql += ` AND a.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    sql += ' ORDER BY a.assigned_at DESC';

    const result = await query(sql, params);
    return result.rows;
  }

  static async findById(id) {
    const result = await query(
      `SELECT a.*, m.identifier as machine_identifier, m.name as machine_name,
              sl.sub_lot_number, sl.piece_count as sub_lot_total_pieces,
              d.identifier as design_identifier, d.stitches_per_piece
       FROM assignments a
       JOIN machines m ON a.machine_id = m.id
       JOIN sub_lots sl ON a.sub_lot_id = sl.id
       JOIN designs d ON sl.design_id = d.id
       WHERE a.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async getActiveAssignmentForMachine(machineId) {
    const result = await query(
      `SELECT a.*, m.identifier as machine_identifier, m.name as machine_name,
              sl.sub_lot_number, sl.piece_count as sub_lot_total_pieces,
              d.identifier as design_identifier, d.stitches_per_piece, d.id as design_id
       FROM assignments a
       JOIN machines m ON a.machine_id = m.id
       JOIN sub_lots sl ON a.sub_lot_id = sl.id
       JOIN designs d ON sl.design_id = d.id
       WHERE a.machine_id = $1 AND a.status = 'active'
       LIMIT 1`,
      [machineId]
    );
    return result.rows[0];
  }

  static async create({ machineId, subLotId, piecesIssued }) {
    const activeAssignment = await this.getActiveAssignmentForMachine(machineId);
    if (activeAssignment) {
      throw new Error(`Machine already has an active assignment (Assignment ID: ${activeAssignment.id})`);
    }

    const result = await query(
      'INSERT INTO assignments (machine_id, sub_lot_id, pieces_issued) VALUES ($1, $2, $3) RETURNING *',
      [machineId, subLotId, piecesIssued]
    );
    return await this.findById(result.rows[0].id);
  }

  static async updateProgress(id, piecesCompleted) {
    const assignment = await this.findById(id);
    if (!assignment) {
      throw new Error('Assignment not found');
    }

    if (piecesCompleted < 0) {
      throw new Error('Pieces completed cannot be negative');
    }

    if (piecesCompleted > assignment.pieces_issued) {
      throw new Error(`Pieces completed (${piecesCompleted}) cannot exceed pieces issued (${assignment.pieces_issued})`);
    }

    const client = await getClient();

    try {
      await client.query('BEGIN');

      let status = assignment.status;
      let completedAt = assignment.completed_at;

      if (piecesCompleted >= assignment.pieces_issued && status === 'active') {
        status = 'completed';
        completedAt = new Date();
      }

      const result = await client.query(
        'UPDATE assignments SET pieces_completed = $1, status = $2, completed_at = $3 WHERE id = $4 RETURNING *',
        [piecesCompleted, status, completedAt, id]
      );

      await client.query('COMMIT');
      return await this.findById(result.rows[0].id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async complete(id) {
    const assignment = await this.findById(id);
    if (!assignment) {
      throw new Error('Assignment not found');
    }

    const result = await query(
      'UPDATE assignments SET status = $1, completed_at = $2, pieces_completed = pieces_issued WHERE id = $3 RETURNING *',
      ['completed', new Date(), id]
    );
    return await this.findById(result.rows[0].id);
  }

  static async delete(id) {
    const result = await query('DELETE FROM assignments WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
}

export default Assignment;
