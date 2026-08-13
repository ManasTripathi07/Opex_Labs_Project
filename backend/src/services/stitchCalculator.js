/**
 * Stitch Calculator Service
 *
 * Implements the core business logic for calculating total stitches produced
 * in a shift based on machine counter readings and rounds completed.
 *
 * Formula: total_stitches = current_running - previous_running + (rounds_completed × stitches_per_piece)
 */

export class StitchCalculator {
  /**
   * Calculate total stitches for a shift
   *
   * @param {Object} params
   * @param {number} params.currentRunning - Current counter reading
   * @param {number} params.previousRunning - Previous counter reading
   * @param {number} params.roundsCompleted - Number of complete rounds/rotations
   * @param {number} params.stitchesPerPiece - Stitches in one complete piece
   * @param {number} params.piecesPerRound - Pieces completed per round (for warnings)
   * @returns {Object} Calculation result with stitches, warnings, and errors
   */
  static calculate({ currentRunning, previousRunning, roundsCompleted, stitchesPerPiece, piecesPerRound = 1 }) {
    const result = {
      totalStitches: 0,
      pieceEquivalents: 0,
      hasError: false,
      hasWarning: false,
      errorMessage: null,
      warningMessage: null,
    };

    // Calculate base stitches from counter difference
    const counterDifference = currentRunning - previousRunning;

    // Calculate stitches from completed rounds
    const roundStitches = roundsCompleted * stitchesPerPiece;

    // Total stitches
    result.totalStitches = counterDifference + roundStitches;

    // Validation: Check for negative total
    if (result.totalStitches < 0) {
      result.hasError = true;
      result.errorMessage = `Negative stitch count detected (${result.totalStitches}). ` +
        `Current reading (${currentRunning}) is less than previous (${previousRunning}) ` +
        `without sufficient rounds completed (${roundsCompleted}).`;
      return result;
    }

    // Calculate piece equivalents
    result.pieceEquivalents = result.totalStitches / stitchesPerPiece;

    // Warning: Check if output exceeds 50-piece equivalent
    const maxReasonablePieces = 50;
    if (result.pieceEquivalents > maxReasonablePieces) {
      result.hasWarning = true;
      result.warningMessage = `Output (${result.pieceEquivalents.toFixed(2)} pieces) ` +
        `exceeds ${maxReasonablePieces} piece equivalents. Please verify readings.`;
    }

    // Warning: Check if counter exceeds design stitch count without rounds
    if (currentRunning > stitchesPerPiece && roundsCompleted === 0) {
      result.hasWarning = true;
      const existingWarning = result.warningMessage || '';
      result.warningMessage = existingWarning
        ? `${existingWarning} | Counter reading (${currentRunning}) exceeds design stitch count (${stitchesPerPiece}). Rounds may need to be documented.`
        : `Counter reading (${currentRunning}) exceeds design stitch count (${stitchesPerPiece}). Rounds may need to be documented.`;
    }

    return result;
  }

  /**
   * Validate shift log inputs
   *
   * @param {Object} params
   * @returns {Object} Validation result
   */
  static validate(params) {
    const errors = [];

    if (params.currentRunning === undefined || params.currentRunning === null) {
      errors.push('Current running stitches is required');
    }

    if (params.previousRunning === undefined || params.previousRunning === null) {
      errors.push('Previous running stitches is required');
    }

    if (params.roundsCompleted === undefined || params.roundsCompleted === null) {
      errors.push('Rounds completed is required');
    }

    if (params.stitchesPerPiece === undefined || params.stitchesPerPiece === null) {
      errors.push('Stitches per piece is required');
    }

    if (params.currentRunning < 0) {
      errors.push('Current running stitches cannot be negative');
    }

    if (params.previousRunning < 0) {
      errors.push('Previous running stitches cannot be negative');
    }

    if (params.roundsCompleted < 0) {
      errors.push('Rounds completed cannot be negative');
    }

    if (params.stitchesPerPiece <= 0) {
      errors.push('Stitches per piece must be positive');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export default StitchCalculator;
