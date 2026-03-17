import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

/**
 * Generic middleware factory that validates req.body against any Zod schema.
 * On failure, returns 400 with a list of { field, message } errors.
 */
export const validate =
    (schema: ZodSchema) =>
        (req: Request, res: Response, next: NextFunction): void => {
            const result = schema.safeParse(req.body);

            if (!result.success) {
                const errors = result.error.issues.map((issue) => ({
                    field: issue.path.join('.'),
                    message: issue.message,
                }));

                res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors,
                });
                return;
            }

            // Attach parsed (trimmed/coerced) data back to req.body
            req.body = result.data;
            next();
        };
