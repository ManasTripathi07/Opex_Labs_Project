import { StitchCalculator } from '../services/stitchCalculator.js';

describe('StitchCalculator', () => {
  describe('calculate', () => {
    test('calculates stitches correctly for basic scenario', () => {
      const result = StitchCalculator.calculate({
        currentRunning: 100000,
        previousRunning: 50000,
        roundsCompleted: 0,
        stitchesPerPiece: 200000,
      });

      expect(result.totalStitches).toBe(50000);
      expect(result.pieceEquivalents).toBe(0.25);
      expect(result.hasError).toBe(false);
      expect(result.hasWarning).toBe(false);
    });

    test('calculates stitches correctly with rounds completed', () => {
      const result = StitchCalculator.calculate({
        currentRunning: 348963,
        previousRunning: 564117,
        roundsCompleted: 1,
        stitchesPerPiece: 578293,
      });

      expect(result.totalStitches).toBe(363139);
      expect(result.hasError).toBe(false);
    });

    test('detects negative stitch count error', () => {
      const result = StitchCalculator.calculate({
        currentRunning: 50000,
        previousRunning: 100000,
        roundsCompleted: 0,
        stitchesPerPiece: 200000,
      });

      expect(result.hasError).toBe(true);
      expect(result.totalStitches).toBe(-50000);
      expect(result.errorMessage).toContain('Negative stitch count');
    });

    test('warns when output exceeds 50 pieces', () => {
      const result = StitchCalculator.calculate({
        currentRunning: 10000000,
        previousRunning: 0,
        roundsCompleted: 0,
        stitchesPerPiece: 100000,
      });

      expect(result.hasWarning).toBe(true);
      expect(result.pieceEquivalents).toBe(100);
      expect(result.warningMessage).toContain('exceeds 50 piece equivalents');
    });

    test('warns when counter exceeds design stitch count without rounds', () => {
      const result = StitchCalculator.calculate({
        currentRunning: 300000,
        previousRunning: 100000,
        roundsCompleted: 0,
        stitchesPerPiece: 200000,
      });

      expect(result.hasWarning).toBe(true);
      expect(result.warningMessage).toContain('exceeds design stitch count');
    });

    test('handles first shift (previous running = 0)', () => {
      const result = StitchCalculator.calculate({
        currentRunning: 150000,
        previousRunning: 0,
        roundsCompleted: 0,
        stitchesPerPiece: 200000,
      });

      expect(result.totalStitches).toBe(150000);
      expect(result.pieceEquivalents).toBe(0.75);
      expect(result.hasError).toBe(false);
    });
  });

  describe('validate', () => {
    test('validates correct inputs', () => {
      const validation = StitchCalculator.validate({
        currentRunning: 100000,
        previousRunning: 50000,
        roundsCompleted: 0,
        stitchesPerPiece: 200000,
      });

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('detects missing required fields', () => {
      const validation = StitchCalculator.validate({});

      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    test('detects negative values', () => {
      const validation = StitchCalculator.validate({
        currentRunning: -100,
        previousRunning: 50000,
        roundsCompleted: 0,
        stitchesPerPiece: 200000,
      });

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Current running stitches cannot be negative');
    });
  });
});
