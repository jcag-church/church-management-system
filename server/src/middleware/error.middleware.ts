import { Request, Response, NextFunction } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { ZodError } from 'zod';

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = () => {
  return (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);

    if (err instanceof AppError) {
      return res.status(err.statusCode).json({
        status: 'error',
        message: err.message,
      });
    }

    if (err instanceof ZodError) {
      return res.status(400).json({
        status: 'fail',
        message: 'Validation Error',
        errors: err.issues,
      });
    }

    if (err instanceof JsonWebTokenError || err instanceof TokenExpiredError) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid or expired token',
      });
    }

    // SuperTokens errors might be handled before this, but just in case
    if (err.type === 'UNAUTHORISED') {
        return res.status(401).json({ message: err.message });
    }

    return res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
    });
  };
};
