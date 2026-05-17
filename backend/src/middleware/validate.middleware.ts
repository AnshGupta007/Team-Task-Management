// ─── Validation Middleware ─────────────────────────────────
// Uses express-validator to validate incoming request data

import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';

/**
 * Middleware that runs an array of validation chains
 * and returns 400 with errors if validation fails
 */
export function validate(validations: ValidationChain[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Run all validations
    for (const validation of validations) {
      await validation.run(req);
    }

    // Check for errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        message: 'Validation failed',
        errors: errors.array().map((err) => ({
          field: (err as any).path || (err as any).param,
          message: err.msg,
        })),
      });
      return;
    }

    next();
  };
}
