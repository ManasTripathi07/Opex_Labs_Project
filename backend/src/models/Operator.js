import { query } from '../db/connection.js';

export class Operator {
  static async findAll(searchTerm = null) {
    let sql = 'SELECT * FROM operators';
    const params = [];

    if (searchTerm) {
      sql += ' WHERE name ILIKE $1 OR phone ILIKE $1';
      params.push(`%${searchTerm}%`);
    }

    sql += ' ORDER BY name ASC';

    const result = await query(sql, params);
    return result.rows;
  }

  static async findById(id) {
    const result = await query('SELECT * FROM operators WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async create({ name, phone }) {
    const result = await query(
      'INSERT INTO operators (name, phone) VALUES ($1, $2) RETURNING *',
      [name, phone]
    );
    return result.rows[0];
  }

  static async update(id, { name, phone }) {
    const result = await query(
      'UPDATE operators SET name = $1, phone = $2 WHERE id = $3 RETURNING *',
      [name, phone, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await query('DELETE FROM operators WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
}

export default Operator;
