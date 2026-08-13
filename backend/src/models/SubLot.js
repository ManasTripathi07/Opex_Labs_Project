import { query, getClient } from '../db/connection.js';

const VALID_STATES = ['received', 'allocated', 'in_production', 'completed', 'dispatched'];
const STATE_TRANSITIONS = {
  received: ['allocated'],
  allocated: ['in_production'],
  in_production: ['completed'],
  completed: ['dispatched'],
  dispatched: [],
};

export class SubLot {
  static async findAll({ state = null, designId = null } = {}) {
    let sql = `
      SELECT sl.*, d.identifier as design_identifier, d.stitches_per_piece,
             l.lot_number, c.name as client_name
      FROM sub_lots sl
      JOIN designs d ON sl.design_id = d.id
      JOIN lots l ON sl.lot_id = l.id
      JOIN clients c ON l.client_id = c.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (state) {
      sql += ` AND sl.state = $${paramCount}`;
      params.push(state);
      paramCount++;
    }

    if (designId) {
      sql += ` AND sl.design_id = $${paramCount}`;
      params.push(designId);
      paramCount++;
    }

    sql += ' ORDER BY sl.created_at DESC';

    const result = await query(sql, params);
    return result.rows;
  }

  static async findById(id) {
    const result = await query(
      `SELECT sl.*, d.identifier as design_identifier, d.stitches_per_piece,
              l.lot_number, l.client_id, c.name as client_name
       FROM sub_lots sl
       JOIN designs d ON sl.design_id = d.id
       JOIN lots l ON sl.lot_id = l.id
       JOIN clients c ON l.client_id = c.id
       WHERE sl.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async updateState(id, newState) {
    const subLot = await this.findById(id);
    if (!subLot) {
      throw new Error('Sub-lot not found');
    }

    const currentState = subLot.state;

    if (!VALID_STATES.includes(newState)) {
      throw new Error(`Invalid state: ${newState}`);
    }

    const allowedTransitions = STATE_TRANSITIONS[currentState];
    if (!allowedTransitions.includes(newState)) {
      throw new Error(`Invalid state transition from ${currentState} to ${newState}`);
    }

    const client = await getClient();

    try {
      await client.query('BEGIN');

      const result = await client.query(
        'UPDATE sub_lots SET state = $1 WHERE id = $2 RETURNING *',
        [newState, id]
      );

      await client.query(
        'INSERT INTO sub_lot_state_transitions (sub_lot_id, from_state, to_state) VALUES ($1, $2, $3)',
        [id, currentState, newState]
      );

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getStateHistory(id) {
    const result = await query(
      'SELECT * FROM sub_lot_state_transitions WHERE sub_lot_id = $1 ORDER BY transitioned_at ASC',
      [id]
    );
    return result.rows;
  }

  static async delete(id) {
    const result = await query('DELETE FROM sub_lots WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
}

export default SubLot;
