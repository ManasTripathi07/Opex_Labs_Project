import { query } from '../db/connection.js';

export class Client {
  static async findAll(searchTerm = null) {
    let sql = 'SELECT * FROM clients';
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
    const result = await query('SELECT * FROM clients WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async create({ name, phone }) {
    const result = await query(
      'INSERT INTO clients (name, phone) VALUES ($1, $2) RETURNING *',
      [name, phone]
    );
    return result.rows[0];
  }

  static async update(id, { name, phone }) {
    const result = await query(
      'UPDATE clients SET name = $1, phone = $2 WHERE id = $3 RETURNING *',
      [name, phone, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await query('DELETE FROM clients WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
}

export default Client;
