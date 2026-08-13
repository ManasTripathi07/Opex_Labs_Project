import { query, getClient } from '../db/connection.js';
import StitchCalculator from '../services/stitchCalculator.js';

export class ShiftLog {
  static async findAll({ machineId = null, operatorId = null, designId = null, fromDate = null, toDate = null } = {}) {
    let sql = `
      SELECT sl.*, m.identifier as machine_identifier, m.name as machine_name,
             o.name as operator_name, d.identifier as design_identifier,
             d.stitches_per_piece
      FROM shift_logs sl
      JOIN machines m ON sl.machine_id = m.id
      JOIN operators o ON sl.operator_id = o.id
      JOIN designs d ON sl.design_id = d.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (machineId) {
      sql += ` AND sl.machine_id = $${paramCount}`;
      params.push(machineId);
      paramCount++;
    }

    if (operatorId) {
      sql += ` AND sl.operator_id = $${paramCount}`;
      params.push(operatorId);
      paramCount++;
    }

    if (designId) {
      sql += ` AND sl.design_id = $${paramCount}`;
      params.push(designId);
      paramCount++;
    }

    if (fromDate) {
      sql += ` AND sl.shift_date >= $${paramCount}`;
      params.push(fromDate);
      paramCount++;
    }

    if (toDate) {
      sql += ` AND sl.shift_date <= $${paramCount}`;
      params.push(toDate);
      paramCount++;
    }

    sql += ' ORDER BY sl.shift_date DESC, sl.created_at DESC';

    const result = await query(sql, params);
    return result.rows;
  }

  static async findById(id) {
    const result = await query(
      `SELECT sl.*, m.identifier as machine_identifier, m.name as machine_name,
              o.name as operator_name, d.identifier as design_identifier,
              d.stitches_per_piece
       FROM shift_logs sl
       JOIN machines m ON sl.machine_id = m.id
       JOIN operators o ON sl.operator_id = o.id
       JOIN designs d ON sl.design_id = d.id
       WHERE sl.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async getPreviousRunningStitches(machineId, designId, beforeDate = null, beforeShiftType = null) {
    let sql = `
      SELECT current_running_stitches
      FROM shift_logs
      WHERE machine_id = $1 AND design_id = $2
    `;
    const params = [machineId, designId];
    let paramCount = 3;

    if (beforeDate && beforeShiftType) {
      const shiftOrder = { morning: 1, afternoon: 2, night: 3 };
      const currentShiftOrder = shiftOrder[beforeShiftType];

      sql += ` AND (
        shift_date < $${paramCount}
        OR (shift_date = $${paramCount} AND CASE
          WHEN shift_type = 'morning' THEN 1
          WHEN shift_type = 'afternoon' THEN 2
          WHEN shift_type = 'night' THEN 3
        END < ${currentShiftOrder})
      )`;
      params.push(beforeDate);
      paramCount++;
    }

    sql += ' ORDER BY shift_date DESC, created_at DESC LIMIT 1';

    const result = await query(sql, params);
    return result.rows[0]?.current_running_stitches || 0;
  }

  static async create({
    machineId,
    operatorId,
    designId,
    assignmentId = null,
    shiftDate,
    shiftType,
    currentRunningStitches,
    roundsCompleted,
  }) {
    const previousRunningStitches = await this.getPreviousRunningStitches(
      machineId,
      designId,
      shiftDate,
      shiftType
    );

    const designResult = await query('SELECT stitches_per_piece FROM designs WHERE id = $1', [designId]);
    const design = designResult.rows[0];
    if (!design) {
      throw new Error('Design not found');
    }

    const rotationResult = await query(
      'SELECT pieces_per_round FROM machine_design_rotations WHERE machine_id = $1 AND design_id = $2',
      [machineId, designId]
    );
    const rotation = rotationResult.rows[0];
    const piecesPerRound = rotation?.pieces_per_round || 1;

    const validation = StitchCalculator.validate({
      currentRunning: currentRunningStitches,
      previousRunning: previousRunningStitches,
      roundsCompleted,
      stitchesPerPiece: design.stitches_per_piece,
    });

    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    const calculation = StitchCalculator.calculate({
      currentRunning: currentRunningStitches,
      previousRunning: previousRunningStitches,
      roundsCompleted,
      stitchesPerPiece: design.stitches_per_piece,
      piecesPerRound,
    });

    const result = await query(
      `INSERT INTO shift_logs (
        machine_id, operator_id, design_id, assignment_id,
        shift_date, shift_type,
        previous_running_stitches, current_running_stitches, rounds_completed,
        total_stitches, piece_equivalents,
        has_warning, has_error, warning_message, error_message
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        machineId,
        operatorId,
        designId,
        assignmentId,
        shiftDate,
        shiftType,
        previousRunningStitches,
        currentRunningStitches,
        roundsCompleted,
        calculation.totalStitches,
        calculation.pieceEquivalents,
        calculation.hasWarning,
        calculation.hasError,
        calculation.warningMessage,
        calculation.errorMessage,
      ]
    );

    return await this.findById(result.rows[0].id);
  }

  static async getDailyProduction(date) {
    const result = await query(
      `SELECT
        m.identifier as machine_identifier,
        m.name as machine_name,
        d.identifier as design_identifier,
        STRING_AGG(DISTINCT o.name, ', ') as operators,
        SUM(sl.total_stitches) as total_stitches,
        SUM(sl.piece_equivalents) as total_piece_equivalents
      FROM shift_logs sl
      JOIN machines m ON sl.machine_id = m.id
      JOIN operators o ON sl.operator_id = o.id
      JOIN designs d ON sl.design_id = d.id
      WHERE sl.shift_date = $1
      GROUP BY m.id, m.identifier, m.name, d.id, d.identifier
      ORDER BY m.identifier, d.identifier`,
      [date]
    );
    return result.rows;
  }

  static async getOperatorSalaryReport(operatorId, fromDate, toDate) {
    const result = await query(
      `SELECT
        d.identifier as design_identifier,
        d.rate_per_stitch,
        SUM(sl.total_stitches) as total_stitches,
        CASE
          WHEN d.rate_per_stitch IS NOT NULL
          THEN SUM(sl.total_stitches) * d.rate_per_stitch
          ELSE NULL
        END as amount
      FROM shift_logs sl
      JOIN designs d ON sl.design_id = d.id
      WHERE sl.operator_id = $1
        AND sl.shift_date >= $2
        AND sl.shift_date <= $3
      GROUP BY d.id, d.identifier, d.rate_per_stitch
      ORDER BY d.identifier`,
      [operatorId, fromDate, toDate]
    );

    const designs = result.rows;
    const totalStitches = designs.reduce((sum, d) => sum + parseInt(d.total_stitches), 0);
    const hasAllRates = designs.every((d) => d.rate_per_stitch !== null);
    const grandTotal = hasAllRates
      ? designs.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0)
      : null;

    return {
      designs,
      totalStitches,
      grandTotal,
      hasAllRates,
    };
  }

  static async delete(id) {
    const result = await query('DELETE FROM shift_logs WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
}

export default ShiftLog;
