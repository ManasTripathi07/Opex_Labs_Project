import { query, getClient } from '../db/connection.js';

export class Machine {
  static async findAll(searchTerm = null) {
    let sql = 'SELECT * FROM machines';
    const params = [];

    if (searchTerm) {
      sql += ' WHERE identifier ILIKE $1 OR name ILIKE $1';
      params.push(`%${searchTerm}%`);
    }

    sql += ' ORDER BY identifier ASC';

    const result = await query(sql, params);
    return result.rows;
  }

  static async findById(id) {
    const result = await query('SELECT * FROM machines WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async findByIdWithRotations(id) {
    const machine = await this.findById(id);
    if (!machine) return null;

    const rotations = await query(
      `SELECT mdr.*, d.identifier as design_identifier, d.stitches_per_piece
       FROM machine_design_rotations mdr
       JOIN designs d ON mdr.design_id = d.id
       WHERE mdr.machine_id = $1`,
      [id]
    );

    machine.rotations = rotations.rows;
    return machine;
  }

  static async create({ identifier, name, rotations = [] }) {
    const client = await getClient();

    try {
      await client.query('BEGIN');

      const machineResult = await client.query(
        'INSERT INTO machines (identifier, name) VALUES ($1, $2) RETURNING *',
        [identifier, name]
      );
      const machine = machineResult.rows[0];

      if (rotations && rotations.length > 0) {
        for (const rotation of rotations) {
          await client.query(
            'INSERT INTO machine_design_rotations (machine_id, design_id, pieces_per_round) VALUES ($1, $2, $3)',
            [machine.id, rotation.designId, rotation.piecesPerRound]
          );
        }
      }

      await client.query('COMMIT');
      return await this.findByIdWithRotations(machine.id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async update(id, { identifier, name }) {
    const result = await query(
      'UPDATE machines SET identifier = $1, name = $2 WHERE id = $3 RETURNING *',
      [identifier, name, id]
    );
    return result.rows[0];
  }

  static async updateRotations(machineId, rotations) {
    const client = await getClient();

    try {
      await client.query('BEGIN');

      await client.query('DELETE FROM machine_design_rotations WHERE machine_id = $1', [machineId]);

      for (const rotation of rotations) {
        await client.query(
          'INSERT INTO machine_design_rotations (machine_id, design_id, pieces_per_round) VALUES ($1, $2, $3)',
          [machineId, rotation.designId, rotation.piecesPerRound]
        );
      }

      await client.query('COMMIT');
      return await this.findByIdWithRotations(machineId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async delete(id) {
    const result = await query('DELETE FROM machines WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  static async getRotationForDesign(machineId, designId) {
    const result = await query(
      'SELECT * FROM machine_design_rotations WHERE machine_id = $1 AND design_id = $2',
      [machineId, designId]
    );
    return result.rows[0];
  }
}

export default Machine;
