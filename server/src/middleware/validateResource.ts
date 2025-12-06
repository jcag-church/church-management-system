import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validateResource = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: error.issues.map((e) => ({
          field: e.path[1], // path[0] is 'body', 'query', or 'params'
          message: e.message,
        })),
      });
    }
    return res.status(500).send('Internal server error');
  }
};
