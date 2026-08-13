import { query } from '../db/connection.js';

export class Design {
  static async findAll(searchTerm = null) {
    let sql = 'SELECT * FROM designs';
    const params = [];

    if (searchTerm) {
      sql += ' WHERE identifier ILIKE $1';
      params.push(`%${searchTerm}%`);
    }

    sql += ' ORDER BY identifier ASC';

    const result = await query(sql, params);
    return result.rows;
  }

  static async findById(id) {
    const result = await query('SELECT * FROM designs WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async findByIdentifier(identifier) {
    const result = await query('SELECT * FROM designs WHERE identifier = $1', [identifier]);
    return result.rows[0];
  }

  static async create({ identifier, stitchesPerPiece, ratePerStitch = null }) {
    const result = await query(
      'INSERT INTO designs (identifier, stitches_per_piece, rate_per_stitch) VALUES ($1, $2, $3) RETURNING *',
      [identifier, stitchesPerPiece, ratePerStitch]
    );
    return result.rows[0];
  }

  static async update(id, { identifier, stitchesPerPiece, ratePerStitch }) {
    const result = await query(
      'UPDATE designs SET identifier = $1, stitches_per_piece = $2, rate_per_stitch = $3 WHERE id = $4 RETURNING *',
      [identifier, stitchesPerPiece, ratePerStitch, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await query('DELETE FROM designs WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
}

export default Design;
